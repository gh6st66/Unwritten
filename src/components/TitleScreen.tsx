import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  onNewRun: () => void;
  onContinue?: () => void;
  onOpenGlossary: () => void;
  onOpenChronicle: () => void;
  onOpenSettings: () => void;
  onOpenTester: () => void;
  canContinue?: boolean;
  version?: string;
  className?: string;
};

const TitleScreen: React.FC<Props> = ({
  onNewRun,
  onContinue,
  onOpenGlossary,
  onOpenChronicle,
  onOpenSettings,
  onOpenTester,
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
    <div ref={rootRef} className={["TitleScreen_root", className].filter(Boolean).join(" ")}>
      <div aria-hidden className="TitleScreen_bg" />
      <div aria-hidden className="TitleScreen_vignette" />
      <div aria-hidden className="TitleScreen_inkDrift" />

      <header className="TitleScreen_centerBlock">
        <div className="TitleScreen_markIcon" aria-hidden />
        <h1 className="TitleScreen_title" aria-label="Unwritten">
          <span className="TitleScreen_titleLineAccent">Unwritten</span>
        </h1>
      </header>

      <nav className="TitleScreen_menu" aria-label="Main">
        <ul role="menu" className="TitleScreen_menuList">
          <li role="none">
            <button
              role="menuitem"
              className="TitleScreen_menuBtn"
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
              className="TitleScreen_menuBtn"
              onClick={handleStart}
              data-focus-target="new-run"
            >
              New Run
            </button>
          </li>
          <li role="none">
            <button role="menuitem" className="TitleScreen_menuBtn" onClick={onOpenChronicle}>
              Chronicle
            </button>
          </li>
          <li role="none">
            <button role="menuitem" className="TitleScreen_menuBtn" onClick={onOpenGlossary}>
              Glossary
            </button>
          </li>
          <li role="none">
            <button role="menuitem" className="TitleScreen_menuBtn" onClick={onOpenTester}>
              Generation Tester
            </button>
          </li>
          <li role="none">
            <button role="menuitem" className="TitleScreen_menuBtn" onClick={onOpenSettings}>
              Settings
            </button>
          </li>
        </ul>
      </nav>

      <div className="TitleScreen_footer">
        <span className="TitleScreen_hint" aria-hidden>
          ↵ Enter to select • ↑↓ to move
        </span>
        {version ? <span className="TitleScreen_version">v{version}</span> : null}
      </div>

      <div
        aria-hidden
        className={[
          "TitleScreen_inkTransition",
          transitioning ? "TitleScreen_inkTransitionActive" : "",
        ].join(" ")}
      />
    </div>
  );
};

export default TitleScreen;