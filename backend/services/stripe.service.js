const stripe = require('../config/stripe.config');
const Payment = require('../models/payment');
const Auction = require('../models/Auction');
const logger = require('../utils/logger'); // Assuming you have a logger

class StripeService {
  static async createPaymentIntent(amount, metadata) {
    try {
      return await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata,
        description: `Payment for auction ${metadata.auctionId}`,
      });
    } catch (err) {
      logger.error(`Stripe PaymentIntent creation failed: ${err.message}`);
      throw new Error(`Payment processing failed. Please try again.`);
    }
  }

  static async handleWebhook(event) {
    try {
      logger.info(`Received webhook event: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      return { success: true };
    } catch (err) {
      logger.error(`Webhook processing failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  static async handlePaymentSuccess(paymentIntent) {
    try {
      // Check if already processed (idempotency)
      const existingPayment = await Payment.findOne({ 
        stripePaymentId: paymentIntent.id 
      });

      if (existingPayment) {
        logger.info(`Payment ${paymentIntent.id} already processed`);
        return;
      }

      // Update database in transaction
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          // 1. Create payment record
          const payment = new Payment({
            auction: paymentIntent.metadata.auctionId,
            user: paymentIntent.metadata.userId,
            amount: paymentIntent.amount / 100, // Convert back to dollars
            stripePaymentId: paymentIntent.id,
            status: 'succeeded',
            receiptUrl: paymentIntent.charges.data[0].receipt_url
          });
          await payment.save({ session });

          // 2. Update auction status
          await Auction.findByIdAndUpdate(
            paymentIntent.metadata.auctionId,
            { 
              status: 'completed',
              paymentStatus: 'paid',
              winner: paymentIntent.metadata.userId
            },
            { session }
          );

          logger.info(`Payment ${paymentIntent.id} processed successfully`);
        });
      } finally {
        session.endSession();
      }
    } catch (err) {
      logger.error(`Error processing payment success for ${paymentIntent.id}: ${err.message}`);
      throw err; // Propagate error to be handled in the calling function
    }
  }

  static async handlePaymentFailure(paymentIntent) {
    await Payment.findOneAndUpdate(
      { stripePaymentId: paymentIntent.id },
      {
        status: 'failed',
        failureReason: paymentIntent.last_payment_error?.message || 'Unknown error'
      }
    );

    logger.warn(`Payment failed: ${paymentIntent.id}`);
  }
}

module.exports = StripeService;
