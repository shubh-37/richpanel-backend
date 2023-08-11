const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

const auth = require("../middleware/authentication");

function userDefinedException(message, statusCode) {
  this.message = message;
  this.statusCode = statusCode;
}
function subscription(app, Models) {
  const { Subscription } = Models;

  app.post("/create", auth, async function (req, res) {
    try {
      const { custId, priceId, subscriptionName, planPrice, billingCycle } =
        req.body;
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

      if (!subscriptionInstance) {
        res.status(424).json({ message: "Couldn't create a subscription." });
      }
      res.status(201).json({
        subscriptionId: stripeInstance.id,
        clientSecret:
          stripeInstance.latest_invoice.payment_intent.client_secret,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/success", auth, async (req, res) => {
    try {
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
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/cancel", async (req, res) => {
    const { subscriptionId } = req.body;
    try {
      const canceledSubscription = await stripe.subscriptions.del(
        subscriptionId
      );
      let subscriptionInstance;
      if (canceledSubscription.status === "canceled") {
        subscriptionInstance = await Subscription.findOne({ subscriptionId });

        subscriptionInstance.active = false;

        await subscriptionInstance.save();
        return res
          .status(200)
          .json({
            message: "Subscription cancelled successfully",
            subscriptionInstance,
          });
      }
      return res
        .status(400)
        .json({
          message:
            "Subscription cancellation request unsuccessfully. Please try again.",
        });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
}

module.exports = subscription;
