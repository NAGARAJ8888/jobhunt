import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  salary: { type: String },
  logo: { type: String },
  tags: [{ type: String }],
  postedDate: { type: Date, default: Date.now },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  benefits: [{ type: String }],
  about: { type: String },
  category: { type: String },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  featured: { type: Boolean, default: false },
});

export const Job = mongoose.model('Job', JobSchema);
