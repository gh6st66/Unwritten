import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./title/TitleScreen.module.css";

type Props = {
  onNewRun: () => void;
  onContinue?: () => void;
  onOpenGlossary: () => void;
  onOpenSettings: () => void;
  canContinue?: boolean;
  version?: string;
  className?: string;
};

const TitleScreen: React.FC<Props> = ({
  onNewRun,
  onContinue,
  onOpenGlossary,
  onOpenSettings,
  canContinue = false,
  version,
  className,
}) => {
  const [transitioning, setTransitioning] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // Focus the most relevant button for accessibility.
  useEffect(() => {
    const selector = canContinue ? '[data-focus-target="continue"]' : '[data-focus-target="new-run"]';
    const buttonToFocus = rootRef.current?.querySelector<HTMLButtonElement>(selector);
    buttonToFocus?.focus();
  }, [canContinue]);

  const handleStart = () => {
    if (prefersReducedMotion) {
      onNewRun();
      return;
    }
    setTransitioning(true);
    window.setTimeout(() => {
      onNewRun();
    }, 900);
  };

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")}>
      <div aria-hidden className={styles.bg} />
      <div aria-hidden className={styles.vignette} />
      <div aria-hidden className={styles.inkDrift} />

      <header className={styles.centerBlock}>
        <div className={styles.markIcon} aria-hidden />
        <h1 className={styles.title} aria-label="The Unwritten">
          <span className={styles.titleLine}>The</span>
          <span className={styles.titleLineAccent}>Unwritten</span>
        </h1>
      </header>

      <nav className={styles.menu} aria-label="Main">
        <ul role="menu" className={styles.menuList}>
          <li role="none">
            <button
              role="menuitem"
              className={styles.menuBtn}
              onClick={onContinue}
              disabled={!canContinue || !onContinue}
              aria-disabled={!canContinue || !onContinue}
              data-focus-target="continue"
            >
              Continue
            </button>
          </li>
          <li role="none">
            <button
              role="menuitem"
              className={styles.menuBtn}
              onClick={handleStart}
              data-focus-target="new-run"
            >
              New Run
            </button>
          </li>
          <li role="none">
            <button role="menuitem" className={styles.menuBtn} onClick={onOpenGlossary}>
              Glossary
            </button>
          </li>
          <li role="none">
            <button role="menuitem" className={styles.menuBtn} onClick={onOpenSettings}>
              Settings
            </button>
          </li>
        </ul>
      </nav>

      <div className={styles.footer}>
        <span className={styles.hint} aria-hidden>
          ↵ Enter to select • ↑↓ to move
        </span>
        {version ? <span className={styles.version}>v{version}</span> : null}
      </div>

      <div
        aria-hidden
        className={[
          styles.inkTransition,
          transitioning ? styles.inkTransitionActive : "",
        ].join(" ")}
      />
    </div>
  );
};

export default TitleScreen;