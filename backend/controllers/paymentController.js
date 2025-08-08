const StripeService = require('../services/stripe.service');
const Auction = require('../models/Auction');
const Payment = require('../models/payment');


exports.createPaymentIntent = async (req, res) => {
    try {
      const { auctionId } = req.body;
      const userId = req.user._id; // Get authenticated user
  
      // Check the auction status and ensure the user is the winner
      const auction = await Auction.findOne({
        _id: auctionId,
        winner: userId,
        status: 'ended',
        paymentStatus: 'pending',
      });
  
      if (!auction) {
        return res.status(403).json({
          success: false,
          message: 'Payment not allowed for this auction',
        });
      }
  
      console.log('Auction retrieved:', auction);  // Log the auction details to check highestBid
  
      const winningAmount = auction.highestBid; // Use highestBid as the winning amount
      if (isNaN(winningAmount) || winningAmount <= 0) {
        console.log('Invalid winning amount:', winningAmount);  // Log invalid value
        return res.status(400).json({
          success: false,
          message: 'Winning amount is invalid or zero',
        });
      }
  
      // Create Stripe payment intent
      const paymentIntent = await StripeService.createPaymentIntent(
        winningAmount, // Amount in dollars (Stripe handles conversion to cents)
        { auctionId, userId }
      );
  
      // Create payment record in the database
      await Payment.create({
        auction: auctionId,
        user: userId,
        amount: winningAmount,
        stripePaymentId: paymentIntent.id,
        status: 'pending',
      });
  
      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret, // This is needed on the client-side to confirm the payment
      });
    } catch (err) {
      console.error('Error in createPaymentIntent:', err);
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
};


exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await StripeService.handleWebhook(event);
  res.json({ received: true });
};
