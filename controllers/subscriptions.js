const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

function userDefinedException(message, statusCode) {
  this.message = message;
  this.statusCode = statusCode;
}
function subscription(app, Models) {
  const { Subscription } = Models;

  app.post("/create", async function (req, res) {
    try {
      const { custId, priceId, subscriptionName, planPrice, billingCycle } =
        req.body;
      console.log(custId);
      const stripeInstance = await stripe.subscriptions.create({
        customer: custId,
        items: [
          {
            price: priceId,
          },
        ],
        payment_settings: { save_default_payment_method: "on_subscription" },
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      });
      const subscriptionInstance = await Subscription.create({
        subscriptionName,
        stripeCustomerId: custId,
        priceId,
        planPrice,
        billingCycle,
        subscriptionId: stripeInstance.id,
        clientSecret:
          stripeInstance.latest_invoice.payment_intent.client_secret,
      });
      console.log({ stripeInstance, subscriptionInstance });
      res.status(201).json({
        subscriptionId: stripeInstance.id,
        clientSecret:
          stripeInstance.latest_invoice.payment_intent.client_secret,
      });
    } catch (error) {
      console.log(error);
    }
  });

  app.post("/success", async (req, res) => {
    const { clientSecret } = req.body;
    const subscriptionInstance = await Subscription.findOne({ clientSecret });
    if (!subscriptionInstance) {
      res.status(404).json({ message: "Subscription not found!" });
    }
    subscriptionInstance.active = true;
    await subscriptionInstance.save();

    return res
      .status(200)
      .json({ message: "Subscription started", subscriptionInstance });
  });

  // app.post("/pay", async (req, res) => {
  //   const paymentIntent = await stripe.paymentIntents.create({
  //     amount: 10000, // Amount in cents (for example, $10.00)
  //     currency: "inr",
  //     payment_method_types: ["card"],
  //     description: "Subscription payment",
  //     setup_future_usage: "off_session", // Allows off-session payments
  //     items: [
  //       {
  //         price: "price_1NdZ03SD5dGve2BTq59Obs2R", // Replace with your actual Price ID
  //         quantity: 1,
  //       },
  //     ],
  //   });
  //   console.log(paymentIntent);
  // });
}

module.exports = subscription;
