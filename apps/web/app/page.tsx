"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ExperienceKey = "eat-in" | "takeaway" | "delivery" | "book" | "menu";

type ExperienceOption = {
  key: ExperienceKey;
  title: string;
  description: string;
  cta: string;
  href: string;
};

type QrContext = {
  isQr: boolean;
  table: string | null;
  query: string;
};

const STORAGE_KEY = "grst.preferredExperience";

const EXPERIENCE_KEYS: ExperienceKey[] = [
  "eat-in",
  "takeaway",
  "delivery",
  "book",
  "menu"
];

const OPTIONS: ExperienceOption[] = [
  {
    key: "eat-in",
    title: "Eat-in ordering",
    description: "Scan the table QR to start a session and order from your seat.",
    cta: "Start table session",
    href: "/eat-in"
  },
  {
    key: "takeaway",
    title: "Takeaway pickup",
    description: "Order ahead and choose a pickup time that fits your schedule.",
    cta: "Order for pickup",
    href: "/takeaway"
  },
  {
    key: "delivery",
    title: "Delivery",
    description: "Get your favorites delivered with live order status updates.",
    cta: "Order delivery",
    href: "/delivery"
  },
  {
    key: "book",
    title: "Book a table",
    description: "Reserve a table in seconds with smart availability rules.",
    cta: "Reserve a table",
    href: "/book"
  },
  {
    key: "menu",
    title: "Browse the menu",
    description: "Explore the latest menu, dietary tags, and specials.",
    cta: "View the menu",
    href: "/menu"
  }
];

const MENU_OPTION =
  OPTIONS.find((option) => option.key === "menu") ?? OPTIONS[0];

const isExperienceKey = (value: string | null): value is ExperienceKey =>
  !!value && EXPERIENCE_KEYS.includes(value as ExperienceKey);

const readStoredPreference = (): ExperienceKey | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isExperienceKey(stored) ? stored : null;
  } catch {
    return null;
  }
};

const writeStoredPreference = (value: ExperienceKey) => {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage may be disabled; ignore and continue.
  }
};

const detectQrContext = (): QrContext => {
  const params = new URLSearchParams(window.location.search);
  const isQr =
    params.has("table") || params.has("session") || params.get("qr") === "1";
  const table = params.get("table");
  const query = isQr && params.toString().length ? `?${params.toString()}` : "";

  return { isQr, table, query };
};

export default function LandingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<ExperienceKey | null>(null);
  const [lastSelection, setLastSelection] = useState<ExperienceKey | null>(null);
  const [qrContext, setQrContext] = useState<QrContext>({
    isQr: false,
    table: null,
    query: ""
  });

  useEffect(() => {
    const stored = readStoredPreference();
    const qr = detectQrContext();

    if (stored) {
      setLastSelection(stored);
    }

    if (qr.isQr) {
      writeStoredPreference("eat-in");
      setSelected("eat-in");
    } else {
      setSelected(stored);
    }

    setQrContext(qr);
  }, []);

  const selectedOption = useMemo(
    () => OPTIONS.find((option) => option.key === selected) || null,
    [selected]
  );

  const handleSelect = (option: ExperienceOption) => {
    const href =
      option.key === "eat-in" && qrContext.query
        ? `${option.href}${qrContext.query}`
        : option.href;

    writeStoredPreference(option.key);
    setSelected(option.key);
    router.push(href);
  };

  return (
    <main className="page">
      <header className="nav">
        <div className="brand">
          Guachinche
          <span>Restaurant OS</span>
        </div>
      </header>

      <section className="hero">
        {qrContext.isQr && (
          <div className="callout">
            <span className="callout-tag">QR ready</span>
            <span>
              {qrContext.table
                ? `Table ${qrContext.table} session detected.`
                : "Table session detected."}
            </span>
          </div>
        )}
        <h1 className="hero-title">Choose how you want to dine today.</h1>
        <p className="hero-subtitle">
          Your experience stays smooth for guests and staff. Pick a path to book,
          order, or explore the menu.
        </p>
        <div className="hero-actions">
          {selectedOption ? (
            <button
              className="primary-button"
              type="button"
              onClick={() => handleSelect(selectedOption)}
            >
              Continue as {selectedOption.title}
            </button>
          ) : (
            <span className="hero-hint">Select an experience below.</span>
          )}
          <button
            className="secondary-button"
            type="button"
            onClick={() => handleSelect(MENU_OPTION)}
          >
            View menu
          </button>
        </div>
        {lastSelection && !qrContext.isQr ? (
          <div className="hero-hint">
            Last time you chose {lastSelection.replace("-", " ")}.
          </div>
        ) : null}
      </section>

      <section className="options-grid">
        {OPTIONS.map((option, index) => (
          <button
            key={option.key}
            className="card"
            type="button"
            data-active={selected === option.key}
            onClick={() => handleSelect(option)}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <h2 className="card-title">{option.title}</h2>
            <p className="card-text">{option.description}</p>
            <span className="card-cta">{option.cta}</span>
          </button>
        ))}
      </section>

      <section className="info">
        <div className="info-block">
          <h3 className="info-title">QR and table aware</h3>
          <p className="info-text">
            When a table QR is detected, eat-in ordering is ready instantly.
          </p>
        </div>
        <div className="info-block">
          <h3 className="info-title">Inventory smart</h3>
          <p className="info-text">
            Menu availability stays accurate across eat-in, takeaway, and delivery.
          </p>
        </div>
        <div className="info-block">
          <h3 className="info-title">Allergen safe</h3>
          <p className="info-text">
            Clear allergen visibility keeps every order safe and compliant.
          </p>
        </div>
      </section>

      <footer className="footer">
        <span>Guachinche Restaurant OS</span>
        <span>Need help? Ask a waiter or manager for assistance.</span>
      </footer>
    </main>
  );
}
