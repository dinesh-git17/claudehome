"use client";

import "client-only";

import { Send } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface VisitorFormProps {
  className?: string;
  onSuccess?: () => void;
}

interface FormState {
  name: string;
  message: string;
}

interface FormErrors {
  name?: string;
  message?: string;
  submit?: string;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const MAX_MESSAGE_LENGTH = 150;
const URL_PATTERN = /(?:https?:\/\/|www\.|\.com|\.net|\.org|\.io)/i;

function containsUrl(text: string): boolean {
  return URL_PATTERN.test(text);
}

function validateName(name: string): string | undefined {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return "Name is required";
  }
  if (trimmed.length > 50) {
    return "Name must be 50 characters or less";
  }
  if (containsUrl(trimmed)) {
    return "URLs are not allowed";
  }
  return undefined;
}

function validateMessage(message: string): string | undefined {
  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return "Message is required";
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return `Message must be ${MAX_MESSAGE_LENGTH} characters or less`;
  }
  if (containsUrl(trimmed)) {
    return "URLs are not allowed";
  }
  return undefined;
}

export function VisitorForm({ className, onSuccess }: VisitorFormProps) {
  const [form, setForm] = useState<FormState>({ name: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const messageLength = form.message.length;
  const isOverLimit = messageLength > MAX_MESSAGE_LENGTH;
  const isNearLimit = messageLength >= MAX_MESSAGE_LENGTH - 20;

  const canSubmit =
    status !== "submitting" &&
    form.name.trim().length > 0 &&
    form.message.trim().length > 0 &&
    !isOverLimit &&
    !containsUrl(form.name) &&
    !containsUrl(form.message);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, name: value }));
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: validateName(value) }));
    }
    if (status === "error") {
      setStatus("idle");
      setErrors((prev) => ({ ...prev, submit: undefined }));
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, message: value }));
    if (errors.message) {
      setErrors((prev) => ({ ...prev, message: validateMessage(value) }));
    }
    if (status === "error") {
      setStatus("idle");
      setErrors((prev) => ({ ...prev, submit: undefined }));
    }
  };

  const handleBlur = (field: keyof FormState) => {
    if (field === "name") {
      setErrors((prev) => ({ ...prev, name: validateName(form.name) }));
    } else {
      setErrors((prev) => ({
        ...prev,
        message: validateMessage(form.message),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(form.name);
    const messageError = validateMessage(form.message);

    if (nameError || messageError) {
      setErrors({ name: nameError, message: messageError });
      return;
    }

    setStatus("submitting");
    setErrors({});

    try {
      const response = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          message: form.message.trim(),
        }),
      });

      if (response.status === 429) {
        setStatus("error");
        setErrors({ submit: "Too many requests. Please try again later." });
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setStatus("error");
        setErrors({
          submit:
            typeof data.error === "string"
              ? data.error
              : "Your message could not be submitted. Please try again.",
        });
        return;
      }

      setStatus("success");
      setForm({ name: "", message: "" });
      onSuccess?.();
    } catch {
      setStatus("error");
      setErrors({ submit: "Network error. Please check your connection." });
    }
  };

  if (status === "success") {
    return (
      <div
        className={cn(
          "bg-surface border-accent-success/20 rounded-md border p-6 text-center",
          className
        )}
      >
        <p className="text-text-primary font-medium">
          Thank you for your message.
        </p>
        <p className="text-text-secondary mt-1 text-sm">
          It has been recorded in the visitor log.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={() => setStatus("idle")}
        >
          Leave another message
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-4", className)}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="visitor-name"
          className="text-text-secondary text-sm font-medium"
        >
          Name
        </label>
        <input
          id="visitor-name"
          type="text"
          value={form.name}
          onChange={handleNameChange}
          onBlur={() => handleBlur("name")}
          placeholder="Your name"
          maxLength={50}
          disabled={status === "submitting"}
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={cn(
            "bg-surface border-input text-text-primary placeholder:text-text-tertiary focus:ring-ring/50 focus:border-accent-cool w-full rounded-md border px-3 py-2 text-sm transition-colors outline-none focus:ring-2",
            errors.name && "border-accent-warm focus:border-accent-warm",
            status === "submitting" && "cursor-not-allowed opacity-60"
          )}
        />
        {errors.name && (
          <p id="name-error" className="text-accent-warm text-xs">
            {errors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="visitor-message"
            className="text-text-secondary text-sm font-medium"
          >
            Message
          </label>
          <span
            className={cn(
              "font-data text-xs tabular-nums",
              isOverLimit
                ? "text-accent-warm"
                : isNearLimit
                  ? "text-text-secondary"
                  : "text-text-tertiary"
            )}
            aria-live="polite"
          >
            {messageLength}/{MAX_MESSAGE_LENGTH}
          </span>
        </div>
        <textarea
          id="visitor-message"
          value={form.message}
          onChange={handleMessageChange}
          onBlur={() => handleBlur("message")}
          placeholder="Leave a message..."
          rows={3}
          maxLength={MAX_MESSAGE_LENGTH + 10}
          disabled={status === "submitting"}
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={cn(
            "bg-surface border-input text-text-primary placeholder:text-text-tertiary focus:ring-ring/50 focus:border-accent-cool w-full resize-none rounded-md border px-3 py-2 text-sm transition-colors outline-none focus:ring-2",
            errors.message && "border-accent-warm focus:border-accent-warm",
            status === "submitting" && "cursor-not-allowed opacity-60"
          )}
        />
        {errors.message && (
          <p id="message-error" className="text-accent-warm text-xs">
            {errors.message}
          </p>
        )}
      </div>

      {errors.submit && (
        <p className="text-accent-warm text-center text-sm" role="alert">
          {errors.submit}
        </p>
      )}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="mt-2 w-full"
        variant="outline"
      >
        {status === "submitting" ? (
          <span className="flex items-center gap-2">
            <span
              className="border-text-tertiary size-4 animate-spin rounded-full border-2 border-t-transparent"
              aria-hidden="true"
            />
            Submitting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="size-4" aria-hidden="true" />
            Sign the Visitor Log
          </span>
        )}
      </Button>
    </form>
  );
}
