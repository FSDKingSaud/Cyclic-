import mongoose from 'mongoose';

// Define the schema for event data
const eventSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    enum: ['Purchase', 'Referral', 'Transfer'], // Only allow these event types
  },
  user: {
    type: String,
    required: function () {
      return this.event === 'Purchase' || this.event === 'Referral';
    },
  },
  referrer: {
    type: String,
    required: function () {
      return this.event === 'Referral';
    },
  },
  tokenAmount: {
    type: String,
    required: function () {
      return this.event === 'Purchase';
    },
  },
  referralBonus: {
    type: String,
    required: function () {
      return this.event === 'Referral';
    },
  },
  from: {
    type: String,
    required: function () {
      return this.event === 'Transfer';
    },
  },
  to: {
    type: String,
    required: function () {
      return this.event === 'Transfer';
    },
  },
  amount: {
    type: String,
    required: function () {
      return this.event === 'Transfer';
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create the Mongoose model
const Event = mongoose.model('Event', eventSchema);

export default Event;