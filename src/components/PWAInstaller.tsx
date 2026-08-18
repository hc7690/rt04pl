"use client";

import { useState, useEffect } from "react";
import { IconX } from "./icons";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 3 seconds if not dismissed
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <span className="text-lg">📱</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 text-sm">Install Website RT</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Pasang sebagai aplikasi di HP Anda untuk akses cepat &amp; notifikasi.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="text-xs font-semibold bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                Nanti saja
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
