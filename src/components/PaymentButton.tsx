import React, { useState } from 'react';

interface PaymentButtonProps {
  amount: number; // Amount in INR
  description: string;
  onSuccess?: (paymentData: RazorpayPaymentData) => void;
  onFailure?: (error: any) => void;
  buttonText?: string;
  className?: string;
  notes?: Record<string, string>;
}

interface RazorpayPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentData) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  onSuccess,
  onFailure,
  buttonText = 'Pay Now',
  className = '',
  notes = {},
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // Get Razorpay Key ID from environment
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!keyId) {
        throw new Error('Razorpay not configured. Please contact support.');
      }

      // Create order on backend
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Backend not configured. Please contact support.');
      }

      const orderResponse = await fetch(
        `${supabaseUrl}/functions/v1/create-razorpay-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            amount,
            currency: 'INR',
            notes,
          }),
        }
      );

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency,
        name: 'Sudharsan Builds',
        description,
        order_id: orderData.orderId,
        handler: async (response: RazorpayPaymentData) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(
              `${supabaseUrl}/functions/v1/verify-razorpay-payment`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseAnonKey}`,
                },
                body: JSON.stringify(response),
              }
            );

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();

            if (verifyData.verified) {
              onSuccess?.(response);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Verification error:', verifyError);
            onFailure?.(verifyError);
            setError('Payment verification failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes,
        theme: {
          color: '#3B82F6', // Blue color
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            console.log('Payment cancelled by user');
          },
        },
      };

      // Open Razorpay checkout
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        setError(response.error.description || 'Payment failed');
        onFailure?.(response.error);
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment');
      onFailure?.(err);
      setLoading(false);
    }
  };

  return (
    <div className="payment-button-container">
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`payment-button ${className} ${loading ? 'loading' : ''}`}
      >
        {loading ? 'Processing...' : buttonText}
      </button>
      {error && <p className="payment-error">{error}</p>}
    </div>
  );
};

export default PaymentButton;
