import { useEffect, useRef, useState } from "react";
import "./HustleFab.css";

/*
  The "+ Hustle" button.

  Mouse:     hover shows the menu. Clicking the button itself = Add shift.
  Touch:     first tap opens the menu (no hover on phones), then pick an option.
  Keyboard:  tabbing to the button opens the menu, Enter = Add shift,
             Tab / Shift+Tab moves through the options, Escape closes.
*/

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function CalendarPlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function HustleFab({ onAddShift, onManageHustles }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const mainRef = useRef(null);
  const closeTimer = useRef(null);
  const lastPointer = useRef("mouse");

  function show() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }

  // Small delay so the menu doesn't vanish if the cursor slips off for a moment
  function hideSoon() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  }

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Tap outside or press Escape to close
  useEffect(() => {
    if (!open) return;

    function handleDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") {
        setOpen(false);
        mainRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handleDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handleDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function run(action) {
    setOpen(false);
    action?.();
  }

  function handleMainClick() {
    // Phones can't hover, so the first tap just reveals the options.
    if (lastPointer.current !== "mouse" && !open) {
      setOpen(true);
      return;
    }
    run(onAddShift);
  }

  return (
    <div
      ref={wrapRef}
      className={`hustle-fab${open ? " is-open" : ""}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && show()}
      onPointerLeave={(e) => e.pointerType === "mouse" && hideSoon()}
      onPointerDown={(e) => {
        lastPointer.current = e.pointerType;
      }}
      onFocus={(e) => {
        // Only keyboard focus opens it; a tap also focuses the button
        if (e.target.matches(":focus-visible")) show();
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      {/* Main button comes first in the DOM so Tab moves up through the options */}
      <button
        ref={mainRef}
        type="button"
        className="hustle-fab-main"
        aria-expanded={open}
        aria-controls="hustle-fab-options"
        onClick={handleMainClick}
      >
        <PlusIcon />
        <span>Hustle</span>
      </button>

      <div id="hustle-fab-options" className="hustle-fab-options">
        <button
          type="button"
          className="hustle-fab-option"
          onClick={() => run(onAddShift)}
        >
          <span>Add shift</span>
          <span className="hustle-fab-option-icon">
            <CalendarPlusIcon />
          </span>
        </button>

        <button
          type="button"
          className="hustle-fab-option"
          onClick={() => run(onManageHustles)}
        >
          <span>Manage hustles</span>
          <span className="hustle-fab-option-icon">
            <BriefcaseIcon />
          </span>
        </button>
      </div>
    </div>
  );
}
