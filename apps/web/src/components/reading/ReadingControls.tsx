"use client";

import "client-only";

import { ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const SCROLL_TOP_THRESHOLD = 300;
const MAIN_SCROLL_ID = "main-scroll";

export interface ReadingControlsProps {
  prevHref: string | null;
  nextHref: string | null;
}

export function ReadingControls({ prevHref, nextHref }: ReadingControlsProps) {
  const router = useRouter();
  const mainRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [scrollable, setScrollable] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const main = document.getElementById(MAIN_SCROLL_ID);
    if (!main) return;
    mainRef.current = main;

    function onScroll() {
      const el = mainRef.current;
      if (!el) return;

      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      const isScrollable = maxScroll > 0;

      setScrollable(isScrollable);
      setProgress(isScrollable ? (scrollTop / maxScroll) * 100 : 0);
      setShowScrollTop(scrollTop > SCROLL_TOP_THRESHOLD);
    }

    onScroll();

    main.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      main.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const tag = target.tagName;

      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable ||
        target.closest("[role='dialog']")
      ) {
        return;
      }

      if (e.key === "ArrowLeft" && prevHref) {
        e.preventDefault();
        router.push(prevHref);
      } else if (e.key === "ArrowRight" && nextHref) {
        e.preventDefault();
        router.push(nextHref);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [prevHref, nextHref, router]);

  const scrollToTop = useCallback(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      {scrollable && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 right-0 left-0 z-50"
          style={{ height: "3px" }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "var(--color-accent-cool)",
              transition: "width 100ms ease",
            }}
          />
        </div>
      )}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="fixed right-6 bottom-6 z-40 flex size-10 items-center justify-center rounded-full border transition-opacity duration-200"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-elevated)",
          opacity: showScrollTop ? 1 : 0,
          pointerEvents: showScrollTop ? "auto" : "none",
        }}
      >
        <ArrowUp
          className="size-4"
          style={{ color: "var(--color-text-secondary)" }}
          aria-hidden="true"
        />
      </button>
    </>
  );
}
