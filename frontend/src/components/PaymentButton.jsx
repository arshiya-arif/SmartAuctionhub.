import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useState } from 'react';

const stripePromise = loadStripe('pk_test_51RKxnUCEh2pcLN9xtooYDgE2oTrT75Hn3Qk0ax9AWKQ9HaMVmW8z0xSJxWy9gq7E0WG3Kwmn38xfNs0fYxYprqk500guTJg0TJ');

export default function PaymentButton({ auctionId, amount, disabled }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
    
      const { data } = await axios.post('http://localhost:3000/api/payments/create-payment-intent', {
        auctionId
      });

    
      const stripe = await stripePromise;
      const { error } = await stripe.confirmCardPayment(data.clientSecret);

      if (error) throw error;
 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-section">
      {error && <div className="error-message">{error}</div>}
      <button
        onClick={handlePayment}
        disabled={disabled || loading}
        className="pay-button"
      >
        {loading ? 'Processing...' : `Pay $${amount}`}
      </button>
    </div>
  );
}