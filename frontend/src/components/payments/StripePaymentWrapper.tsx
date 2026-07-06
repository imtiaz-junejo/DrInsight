"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { useMemo } from "react";
import { StripeCheckoutForm } from "./StripeCheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);

export interface StripePaymentWrapperProps {
  clientSecret: string;
  providerIntentId: string;
  amountLabel: string;
  onSuccess: (appointmentId: string) => void;
  onError: (message: string) => void;
}

export function StripePaymentWrapper({
  clientSecret,
  providerIntentId,
  amountLabel,
  onSuccess,
  onError,
}: StripePaymentWrapperProps) {
  const options = useMemo<StripeElementsOptions>(
    () => ({
      clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#1a56a0",
          colorBackground: "#ffffff",
          colorText: "#0f172a",
          borderRadius: "10px",
          fontFamily: "inherit",
        },
      },
    }),
    [clientSecret],
  );

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="payment-error-banner">
        Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripeCheckoutForm
        providerIntentId={providerIntentId}
        amountLabel={amountLabel}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
