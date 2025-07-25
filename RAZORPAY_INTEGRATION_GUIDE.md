# Razorpay Payment Gateway Integration Guide for ScriptSlap

This guide will walk you through integrating Razorpay payment gateway into your ScriptSlap application.

## Prerequisites

1. **Razorpay Account**: Sign up at [razorpay.com](https://razorpay.com)
2. **API Keys**: Get your Test/Live API keys from Razorpay Dashboard
3. **Webhook Secret**: Configure webhook secret for payment verification

## Step 1: Install Razorpay Dependencies

```bash
# Frontend (React)
npm install razorpay-web

# Backend (if using Node.js)
npm install razorpay crypto
```

## Step 2: Environment Variables

Add these to your `.env` file:

```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# For production, use live keys:
# VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id
```

## Step 3: Create Payment Service

Create `client/lib/razorpay.ts`:

```typescript
import { toast } from "sonner";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayPayment = async (options: {
  amount: number;
  planName: string;
  userEmail: string;
  userName: string;
  onSuccess: (paymentData: any) => void;
  onFailure: (error: any) => void;
}) => {
  const isLoaded = await loadRazorpayScript();
  
  if (!isLoaded) {
    toast.error("Failed to load payment gateway");
    return;
  }

  try {
    // Create order on your backend
    const orderResponse = await fetch("/api/create-payment-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        amount: options.amount,
        currency: "INR",
        planName: options.planName,
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderData.success) {
      throw new Error(orderData.message);
    }

    const razorpayOptions: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: "ScriptSlap",
      description: `${options.planName} Subscription`,
      order_id: orderData.order.id,
      handler: (response) => {
        // Payment successful
        options.onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      prefill: {
        name: options.userName,
        email: options.userEmail,
      },
      theme: {
        color: "#8B5CF6", // Your primary color
      },
      modal: {
        ondismiss: () => {
          options.onFailure({ message: "Payment cancelled by user" });
        },
      },
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();
  } catch (error) {
    console.error("Payment initialization error:", error);
    options.onFailure(error);
  }
};
```

## Step 4: Create Payment API Endpoints

### Create Order Endpoint (`/api/create-payment-order`)

```typescript
// Supabase Edge Function: supabase-functions/create-payment-order/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, currency = "INR", planName } = await req.json();

    // Razorpay order creation
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    const orderData = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: planName,
      },
    };

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const order = await response.json();

    if (!response.ok) {
      throw new Error(order.error?.description || "Failed to create order");
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: order,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

### Verify Payment Endpoint (`/api/verify-payment`)

```typescript
// Supabase Edge Function: supabase-functions/verify-payment/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      planName,
      planCredits 
    } = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the user from the request
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify signature
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const crypto = await import("node:crypto");
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    // Update user's subscription and credits
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        subscription_tier: planName.toLowerCase(),
        credits: planCredits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      throw new Error("Failed to update subscription");
    }

    // Store payment record
    const { error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: user.id,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: amount,
        currency: "INR",
        status: "completed",
        plan_name: planName,
        created_at: new Date().toISOString(),
      });

    if (paymentError) {
      console.error("Failed to store payment record:", paymentError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and subscription updated",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

## Step 5: Update Pricing Page with Payment Integration

Update `client/pages/Pricing.tsx`:

```typescript
import { createRazorpayPayment } from "@/lib/razorpay";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Add this to your Pricing component
const { user } = useAuth();

const handlePlanPurchase = async (plan: any) => {
  if (!user) {
    navigate("/signin");
    return;
  }

  const planCredits = {
    creator: 300,
    pro: 1000,
  };

  await createRazorpayPayment({
    amount: parseInt(plan.price),
    planName: plan.name,
    userEmail: user.email || "",
    userName: user.user_metadata?.full_name || "User",
    onSuccess: async (paymentData) => {
      try {
        // Verify payment on backend
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify({
            ...paymentData,
            planName: plan.name,
            planCredits: planCredits[plan.name.toLowerCase()],
          }),
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Payment successful! Your subscription has been activated.");
          navigate("/dashboard");
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        toast.error("Payment verification failed. Please contact support.");
      }
    },
    onFailure: (error) => {
      toast.error(error.message || "Payment failed. Please try again.");
    },
  });
};

// Update your plan buttons:
<Button onClick={() => handlePlanPurchase(plan)}>
  {plan.buttonText}
</Button>
```

## Step 6: Create Payments Table

Run this SQL in Supabase:

```sql
-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending',
  plan_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Step 7: Testing

1. **Test Mode**: Use Razorpay test cards:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

2. **Webhook Testing**: Use ngrok for local webhook testing:
   ```bash
   ngrok http 3000
   # Use the ngrok URL for webhook endpoints
   ```

## Step 8: Go Live

1. **Generate Live Keys**: Replace test keys with live keys in production
2. **Configure Webhooks**: Set up webhook URLs in Razorpay Dashboard
3. **Test Thoroughly**: Test all payment flows in production

## Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Always verify payments** on the server side
3. **Use HTTPS** for all payment-related requests
4. **Implement rate limiting** for payment endpoints
5. **Log all payment transactions** for audit purposes

## Troubleshooting

- **Payment fails**: Check API keys and network connectivity
- **Signature mismatch**: Verify webhook secret configuration
- **Order creation fails**: Check Razorpay dashboard for error details

This integration provides a complete payment solution with proper security measures and error handling.
