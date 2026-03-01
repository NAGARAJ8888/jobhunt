import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Stripe with the secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
console.log('Initializing Stripe with secret key:', stripeSecretKey);

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// @ts-ignore - Stripe SDK version compatibility
export const stripe = new Stripe(stripeSecretKey || '');

const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  customerId?: string
): Promise<any> {
  let customer;

  if (customerId) {
    customer = await stripe.customers.retrieve(customerId);
  } else {
    customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${CLIENT_URL}/subscribe?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${CLIENT_URL}/subscribe?canceled=true`,
    metadata: {
      userId,
    },
  });

  return session;
}

/**
 * Create a customer portal session for managing subscription
 */
export async function createPortalSession(customerId: string): Promise<any> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${CLIENT_URL}/profile`,
  });

  return session;
}

/**
 * Handle subscription created/updated from webhook
 */
export async function handleSubscriptionChange(subscription: any): Promise<void> {
  const { id: subscriptionId, customer: customerId, status, current_period_start, current_period_end } = subscription;
  
  const customer: any = await stripe.customers.retrieve(customerId as string);
  const userId = customer.metadata?.userId;

  if (!userId) {
    console.error('No userId found in customer metadata');
    return;
  }

  const { User } = await import('../models/User.js');

  const isActive = status === 'active';
  
  await User.findByIdAndUpdate(userId, {
    isSubscribed: isActive,
    subscriptionStartDate: current_period_start ? new Date(current_period_start * 1000) : new Date(),
    subscriptionEndDate: current_period_end ? new Date(current_period_end * 1000) : null,
    stripeCustomerId: customerId as string,
    stripeSubscriptionId: subscriptionId,
  });

  console.log(`Subscription updated for user ${userId}: ${status}`);
}

/**
 * Handle subscription deletion/cancellation from webhook
 */
export async function handleSubscriptionDeleted(subscription: any): Promise<void> {
  const { customer: customerId } = subscription;
  
  const customer: any = await stripe.customers.retrieve(customerId as string);
  const userId = customer.metadata?.userId;

  if (!userId) {
    console.error('No userId found in customer metadata');
    return;
  }

  const { User } = await import('../models/User.js');

  await User.findByIdAndUpdate(userId, {
    isSubscribed: false,
    subscriptionEndDate: new Date(),
  });

  console.log(`Subscription cancelled for user ${userId}`);
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(subscriptionId: string): Promise<any> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Check if user has active subscription
 */
export async function checkUserSubscription(userId: string): Promise<boolean> {
  const { User } = await import('../models/User.js');
  
  const user = await User.findById(userId);
  
  // If user is not marked as subscribed, return false
  if (!user || !user.isSubscribed) {
    return false;
  }

  // If there's no subscription end date but user is marked as subscribed, 
  // check via Stripe for more accurate status
  if (!user.subscriptionEndDate && user.stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const isActive = subscription.status === 'active';
      
      // Update local state if different
      if (!isActive) {
        await User.findByIdAndUpdate(userId, {
          isSubscribed: false,
        });
      }
      
      return isActive;
    } catch (error) {
      console.error('Error checking subscription via Stripe:', error);
      return false;
    }
  }

  // Check if subscription has expired
  if (user.subscriptionEndDate && new Date(user.subscriptionEndDate) < new Date()) {
    await User.findByIdAndUpdate(userId, {
      isSubscribed: false,
    });
    return false;
  }

  return true;
}
