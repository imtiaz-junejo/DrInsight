"use client";

import { cn } from "@/lib/utils";
import { oauthProviderLabel, type OAuthProviderName } from "@/lib/oauth";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px] shrink-0">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px] shrink-0">
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

const PROVIDERS: OAuthProviderName[] = ["google", "facebook"];

const ICONS = {
  google: GoogleIcon,
  facebook: FacebookIcon,
} as const;

type AuthSocialButtonsProps = {
  onOAuth: (provider: OAuthProviderName) => void;
  oauthLoading: OAuthProviderName | null;
  disabled?: boolean;
  className?: string;
};

export function AuthSocialButtons({ onOAuth, oauthLoading, disabled, className }: AuthSocialButtonsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2.5", className)}>
      {PROVIDERS.map((provider) => {
        const Icon = ICONS[provider];
        const isLoading = oauthLoading === provider;

        return (
          <button
            key={provider}
            type="button"
            onClick={() => onOAuth(provider)}
            disabled={Boolean(oauthLoading) || disabled}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-400 bg-white text-sm font-semibold text-gray-700 transition hover:border-blue hover:bg-gray-200 hover:text-blue disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon />
            {isLoading ? "Connecting..." : oauthProviderLabel(provider)}
          </button>
        );
      })}
    </div>
  );
}
