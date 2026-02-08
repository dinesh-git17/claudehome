"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader, Play } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { RunOutputModal } from "./RunOutputModal";

type RunStatus = "idle" | "loading" | "running" | "done" | "error";

interface WorkerMessage {
  type: "status" | "stdout" | "stderr" | "done" | "error";
  status?: "loading" | "running" | "ready";
  text?: string;
  error?: string;
}

export interface RunButtonProps {
  content: string;
  filename: string;
}

const TIMEOUT_MS = 30_000;

export function RunButton({ content, filename }: RunButtonProps) {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRunTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const terminateWorker = useCallback(() => {
    clearRunTimeout();
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, [clearRunTimeout]);

  const handleMessage = useCallback(
    (event: MessageEvent<WorkerMessage>) => {
      const msg = event.data;

      switch (msg.type) {
        case "status":
          if (msg.status === "loading") setStatus("loading");
          else if (msg.status === "running") {
            setStatus("running");
            timeoutRef.current = setTimeout(() => {
              setError("Execution timed out after 30 seconds");
              setStatus("error");
              terminateWorker();
            }, TIMEOUT_MS);
          }
          break;
        case "stdout":
          if (msg.text !== undefined) {
            setOutput((prev) => [...prev, msg.text as string]);
          }
          break;
        case "stderr":
          if (msg.text !== undefined) {
            setOutput((prev) => [...prev, msg.text as string]);
          }
          break;
        case "done":
          clearRunTimeout();
          setStatus("done");
          break;
        case "error":
          clearRunTimeout();
          setError(msg.error ?? "Unknown error");
          setStatus("error");
          break;
      }
    },
    [clearRunTimeout, terminateWorker]
  );

  const createWorker = useCallback((): Worker => {
    const worker = new Worker("/pyodide-worker.js");
    workerRef.current = worker;
    worker.onmessage = handleMessage;
    worker.onerror = () => {
      clearRunTimeout();
      setError("Worker initialization failed");
      setStatus("error");
    };
    return worker;
  }, [handleMessage, clearRunTimeout]);

  function handleRun() {
    setOutput([]);
    setError(null);
    setStatus("loading");
    setModalOpen(true);

    const worker = workerRef.current ?? createWorker();
    worker.postMessage({ type: "run", code: content });
  }

  function handleStop() {
    terminateWorker();
    setStatus("idle");
  }

  function handleModalClose(open: boolean) {
    if (!open && (status === "loading" || status === "running")) {
      terminateWorker();
      setStatus("idle");
    }
    setModalOpen(open);
  }

  const isActive = status === "loading" || status === "running";

  return (
    <>
      <motion.button
        type="button"
        onClick={handleRun}
        disabled={isActive}
        aria-label={isActive ? "Running\u2026" : `Run ${filename}`}
        className="text-text-tertiary hover:bg-elevated hover:text-text-primary focus-visible:ring-accent-cool relative flex size-7 items-center justify-center rounded transition-colors outline-none focus-visible:ring-1 disabled:opacity-50"
        whileHover={isActive ? undefined : { scale: 1.05 }}
        whileTap={isActive ? undefined : { scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isActive ? (
            <motion.span
              key="loader"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              className="text-accent-cool"
            >
              <Loader className="size-4 animate-spin" />
            </motion.span>
          ) : (
            <motion.span
              key="play"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <Play className="size-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <RunOutputModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        status={status}
        output={output}
        error={error}
        filename={filename}
        onStop={handleStop}
        onRerun={handleRun}
      />
    </>
  );
}
