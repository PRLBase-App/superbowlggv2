"use client";

import { useEffect, useRef } from "react";

type TelegramWidgetUser = Record<string, string | number | boolean>;

export function TelegramLoginButton({ botUsername, callbackURL, onError }: {
  botUsername: string;
  callbackURL: string;
  onError: (message: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const target = container.current;
    const globalName = "onSuperbowlTelegramAuth";
    const globalWindow = window as unknown as Record<string, unknown>;

    globalWindow[globalName] = async (user: TelegramWidgetUser) => {
      try {
        const response = await fetch("/api/auth/sign-in/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
        const result = await response.json().catch(() => null) as { message?: string; error?: { message?: string } } | null;
        if (!response.ok) {
          onError(result?.message ?? result?.error?.message ?? "Telegram sign-in could not be completed.");
          return;
        }
        window.location.assign(callbackURL);
      } catch {
        onError("Telegram sign-in is temporarily unavailable.");
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "10");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-onauth", `${globalName}(user)`);
    target.appendChild(script);

    return () => {
      target.replaceChildren();
      delete globalWindow[globalName];
    };
  }, [botUsername, callbackURL, onError]);

  return <div ref={container} className="flex min-h-10 justify-center" aria-label="Continue with Telegram" />;
}
