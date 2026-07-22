"use client";

import { useCallback, useEffect, useState } from "react";
import { useNewsletterSubscribe } from "@/services/api-hooks";
import { useAuthStore } from "@/store/auth.store";

export const NEWSLETTER_ALREADY_EXISTS_MSG = "Email already exist";
export const NEWSLETTER_SUCCESS_MSG = "Subscribed successfully!";
export const NEWSLETTER_ERROR_MSG = "Subscription failed. Please try again.";

export type NewsletterMessageTone = "success" | "exists" | "error";

type UseNewsletterFormOptions = {
  hideSuccessMessage?: boolean;
  clearEmailOnSuccess?: boolean;
};

export function useNewsletterForm(source: string, options: UseNewsletterFormOptions = {}) {
  const user = useAuthStore((s) => s.user);
  const newsletter = useNewsletterSubscribe();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<NewsletterMessageTone | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail((current) => current.trim() || user.email);
    }
  }, [user?.email]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || completed) return;

      setMessage("");
      setMessageTone(null);

      try {
        const result = await newsletter.mutateAsync({ email: email.trim(), source });
        setCompleted(true);

        if (result.alreadySubscribed) {
          setMessage(NEWSLETTER_ALREADY_EXISTS_MSG);
          setMessageTone("exists");
          return;
        }

        if (!options.hideSuccessMessage) {
          setMessage(NEWSLETTER_SUCCESS_MSG);
          setMessageTone("success");
        }

        if (options.clearEmailOnSuccess !== false) {
          setEmail("");
        }
      } catch {
        setCompleted(false);
        setMessage(NEWSLETTER_ERROR_MSG);
        setMessageTone("error");
      }
    },
    [completed, email, newsletter, options.clearEmailOnSuccess, options.hideSuccessMessage, source],
  );

  return {
    email,
    setEmail,
    message,
    messageTone,
    completed,
    isPending: newsletter.isPending,
    handleSubmit,
  };
}
