import express from 'express';
import { createCheckoutSession, createPortalSession, checkUserSubscription, handleSubscriptionChange, handleSubscriptionDeleted } from '../services/stripeService.js';
import { User } from '../models/User.js';

const router = express.Router();

// Create checkout session for subscription
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Creating checkout session for user:', userId, 'with customerId:', user.stripeCustomerId);

    const session = await createCheckoutSession(
      userId,
      user.email,
      user.stripeCustomerId || undefined
    );

    console.log('Checkout session created successfully:', session.id);
    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    // Provide more detailed error information
    const errorMessage = error.message || 'Failed to create checkout session';
    const errorCode = error.code || 'unknown_error';
    
    res.status(500).json({ 
      error: errorMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create portal session for managing subscription
router.post('/create-portal-session', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const session = await createPortalSession(user.stripeCustomerId);

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: error.message || 'Failed to create portal session' });
  }
});

// Check user's subscription status
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isSubscribed = await checkUserSubscription(userId);

    res.json({
      isSubscribed: isSubscribed || user.isSubscribed,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      stripeCustomerId: user.stripeCustomerId,
    });
  } catch (error: any) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({ error: error.message || 'Failed to check subscription status' });
  }
});

// Verify checkout session and update subscription (called from frontend after successful payment)
router.post('/verify-session', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const { stripe } = await import('../services/stripeService.js');
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const userId = session.metadata?.userId;
    if (!userId) {
      return res.status(400).json({ error: 'No user ID in session metadata' });
    }

    // Get subscription details
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update user subscription in database
    const startDate = subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : new Date();
    const endDate = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null;
    
    await User.findByIdAndUpdate(userId, {
      isSubscribed: true,
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscriptionId,
    });

    res.json({ 
      success: true, 
      message: 'Subscription verified and updated',
      isSubscribed: true 
    });
  } catch (error: any) {
    console.error('Error verifying session:', error);
    res.status(500).json({ error: error.message || 'Failed to verify session' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not defined');
    return res.status(400).send('Webhook secret not configured');
  }

  let event: any;

  try {
    const { stripe } = await import('../services/stripeService.js');
    
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error: any) {
    console.error('Error processing webhook:', error);
  }

  res.json({ received: true });
});

export default router;
