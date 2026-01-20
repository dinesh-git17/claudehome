"use client";

import {
  AnimatePresence,
  motion,
  type PanInfo,
  useReducedMotion,
} from "framer-motion";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import FocusLock from "react-focus-lock";

export interface MotionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "left" | "right";
}

const DRAG_CLOSE_THRESHOLD = 0.3;
const DRAG_VELOCITY_THRESHOLD = 500;

const SPRING_CONFIG = {
  type: "spring",
  damping: 30,
  stiffness: 350,
} as const;

const REDUCED_MOTION_TRANSITION = {
  duration: 0.15,
  ease: "easeOut",
} as const;

export function MotionDrawer({
  isOpen,
  onClose,
  children,
  side = "left",
}: MotionDrawerProps) {
  const prefersReducedMotion = useReducedMotion();
  const drawerRef = useRef<HTMLDivElement>(null);

  const initialX = side === "left" ? "-100%" : "100%";
  const dragConstraints =
    side === "left" ? { left: 0, right: 0 } : { left: 0, right: 0 };
  const dragElastic =
    side === "left" ? { left: 0.2, right: 0 } : { left: 0, right: 0.2 };

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const drawerWidth = drawerRef.current?.offsetWidth ?? 300;
      const offsetThreshold = drawerWidth * DRAG_CLOSE_THRESHOLD;

      const shouldClose =
        side === "left"
          ? info.offset.x < -offsetThreshold ||
            info.velocity.x < -DRAG_VELOCITY_THRESHOLD
          : info.offset.x > offsetThreshold ||
            info.velocity.x > DRAG_VELOCITY_THRESHOLD;

      if (shouldClose) {
        onClose();
      }
    },
    [onClose, side]
  );

  const transition = prefersReducedMotion
    ? REDUCED_MOTION_TRANSITION
    : SPRING_CONFIG;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const drawerVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { x: initialX },
        visible: { x: 0 },
        exit: { x: initialX },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="bg-void/60 fixed inset-0 z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={
              prefersReducedMotion
                ? REDUCED_MOTION_TRANSITION
                : { duration: 0.2 }
            }
            onClick={onClose}
            aria-hidden="true"
          />
          <FocusLock returnFocus autoFocus={false}>
            <motion.div
              ref={drawerRef}
              key="drawer"
              role="dialog"
              aria-modal="true"
              className={`bg-void fixed inset-y-0 z-50 flex w-64 flex-col ${
                side === "left" ? "left-0" : "right-0"
              }`}
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
              drag={prefersReducedMotion ? false : "x"}
              dragConstraints={dragConstraints}
              dragElastic={dragElastic}
              onDragEnd={handleDragEnd}
              style={
                prefersReducedMotion ? undefined : { willChange: "transform" }
              }
            >
              {children}
            </motion.div>
          </FocusLock>
        </>
      )}
    </AnimatePresence>
  );
}
