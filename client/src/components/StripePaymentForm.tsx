import React from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {Elements, useStripe, useElements, CardElement} from '@stripe/react-stripe-js';

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  amount: number;
  promoted: boolean;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      '::placeholder': { color: '#aab7c4' },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ clientSecret, onSuccess, amount, promoted }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;
    const {error, paymentIntent} = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });
    setLoading(false);
    if (error) {
      setError(error.message || 'Payment failed');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    } else {
      setError('Payment not successful.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-2">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      <button className="bg-accent-600 text-white px-4 py-2 rounded" disabled={loading || !stripe}>
        {loading ? 'Processing...' : `Pay €${amount} to list${promoted ? ' as Promoted' : ''}`}
      </button>
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </form>
  );
};

export default StripePaymentForm;
