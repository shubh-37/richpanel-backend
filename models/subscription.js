const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  subscriptionName: {
    type: String,
    required: [true, "Please provide with a name"],
  },
  stripeCustomerId: {
    type: String,
    required: [true, "Please provide with a Stripe customer ID"],
  },
  priceId: {
    type: String,
    required: [true, "Please provide with a stripe price ID"],
  },
  planPrice: {
    type: Number,
    required: [true, "Please provide with a plan price"]
  },
  billingCycle: {
    type: String,
    required: [true, "Please provide with a billing cycle"]
  },
  subscriptionId: {
    type: String,
    required: [true, "Please provide with a subscription ID"],
  },
  active: {
    type: Boolean,
    default: false,
  },
  clientSecret: {
    type: String,
    required: [true, "Please provide with a client secret"],
  }
});

module.exports = subscriptionSchema;
