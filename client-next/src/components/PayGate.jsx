import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Login wall — shown when user is not signed in
export function LoginWall({ message = 'Sign in to continue' }) {
  return (
    <div className="paygate-wall">
      <div className="paygate-icon">ॐ</div>
      <h3>{message}</h3>
      <p>This feature is available to signed-in users.</p>
      <p className="paygate-hint">Use the Login button in the top navigation to sign in with Google.</p>
    </div>
  );
}

// Payment gate — shown when feature requires payment
// props: title, price, priceDisplay, description, orderEndpoint, onSuccess, onClose, razorpayKeyId
export function PaymentGate({ title, price, priceDisplay, description, orderEndpoint, onSuccess, user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handlePay = async () => {
    if (!window.Razorpay) {
      setError('Payment system loading, please refresh the page.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const orderRes = await fetch(`${API_URL}${orderEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!orderRes.ok) throw new Error('Order failed');
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error('Order failed');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Astravedam',
        description: title,
        order_id: orderData.order_id,
        prefill: { name: user?.displayName || '', email: user?.email || '' },
        theme: { color: '#8B0000' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              onSuccess(response.razorpay_payment_id);
            } else {
              setError('Payment verification failed. Contact support.');
            }
          } catch {
            setError('Payment verification failed. Contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };
      new window.Razorpay(options).open();
    } catch {
      setLoading(false);
      setError('Could not initialize payment. Please try again.');
    }
  };

  return (
    <div className="paygate-wall">
      <div className="paygate-icon">✦</div>
      <h3>{title}</h3>
      <p className="paygate-desc">{description}</p>
      <div className="paygate-price">
        <span className="price-amount">{priceDisplay}</span>
        <span className="price-note">one-time · secure payment</span>
      </div>
      {error && <p className="paygate-error">{error}</p>}
      <button className="paygate-btn" onClick={handlePay} disabled={loading}>
        {loading ? 'Processing...' : `Pay ${priceDisplay} to Continue`}
      </button>
    </div>
  );
}
