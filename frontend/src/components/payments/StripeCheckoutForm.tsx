"use client";

import { useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { api } from "@/lib/api";

function stripeErrorMessage(code?: string, message?: string): string {
  const map: Record<string, string> = {
    card_declined: "Your card was declined. Please try a different card.",
    expired_card: "Your card has expired. Please use a valid card.",
    incorrect_cvc: "The CVC code is incorrect. Please check and try again.",
    processing_error: "A processing error occurred. Please try again.",
    insufficient_funds: "Insufficient funds. Please use a different card.",
    authentication_required: "Additional authentication is required. Please complete 3D Secure verification.",
  };
  if (code && map[code]) return map[code];
  if (message?.toLowerCase().includes("network")) {
    return "Network error. Please check your connection and try again.";
  }
  return message ?? "Payment failed. Please try again.";
}

export interface StripeCheckoutFormProps {
  providerIntentId: string;
  amountLabel: string;
  onSuccess: (appointmentId: string) => void;
  onError: (message: string) => void;
}

export function StripeCheckoutForm({
  providerIntentId,
  amountLabel,
  onSuccess,
  onError,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const pollForConfirmation = async (): Promise<string | null> => {
    for (let i = 0; i < 15; i++) {
      try {
        const { data } = await api.post(`/payments/intents/${providerIntentId}/verify`);
        if (data.appointmentId) return data.appointmentId as string;
      } catch {
        // retry
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    onError("");

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onError(stripeErrorMessage(submitError.code, submitError.message));
        setProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        onError(stripeErrorMessage(error.code, error.message));
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "processing") {
        setConfirming(true);
        const appointmentId = await pollForConfirmation();
        if (appointmentId) {
          onSuccess(appointmentId);
        } else {
          onError("Payment received but confirmation is delayed. Check your dashboard shortly.");
        }
      }
    } catch {
      onError("Server unavailable. Please try again in a moment.");
    } finally {
      setProcessing(false);
      setConfirming(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-checkout-form">
      <PaymentElement
        options={{
          layout: "tabs",
          fields: { billingDetails: { name: "auto", email: "auto" } },
        }}
      />

      <button
        type="submit"
        className="btn-pay-now"
        disabled={!stripe || processing || confirming}
      >
        {confirming ? (
          <>
            <span className="pay-spinner" aria-hidden="true" />
            Confirming appointment...
          </>
        ) : processing ? (
          <>
            <span className="pay-spinner" aria-hidden="true" />
            Processing payment...
          </>
        ) : (
          <>
            <i className="ti ti-lock" aria-hidden="true" /> Pay Now — {amountLabel}
          </>
        )}
      </button>
    </form>
  );
}
