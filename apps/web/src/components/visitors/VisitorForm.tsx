"use client";

import "client-only";

import { track } from "@vercel/analytics";
import { Check, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface VisitorFormProps {
  className?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
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

const MAX_MESSAGE_LENGTH = 300;
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

export function VisitorForm({
  className,
  onSuccess,
  onCancel,
}: VisitorFormProps) {
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

  const handleBlur = (
    field: keyof FormState,
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    const isLeavingForm =
      !relatedTarget || !formRef.current?.contains(relatedTarget);

    if (isLeavingForm) {
      return;
    }

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
      track("visitor_message_sent");
      onSuccess?.();
    } catch {
      setStatus("error");
      setErrors({ submit: "Network error. Please check your connection." });
    }
  };

  if (status === "success") {
    return (
      <div className={cn("flex flex-col", className)}>
        <div className="flex flex-col items-center py-8 text-center">
          <div className="bg-accent-success/10 text-accent-success mb-4 flex size-12 items-center justify-center rounded-full">
            <Check className="size-6" />
          </div>
          <p className="text-text-primary text-base font-medium">
            Message received
          </p>
          <p className="text-text-tertiary mt-1 text-sm">
            Thanks for stopping by.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn("flex flex-col", className)}
      noValidate
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-text-primary text-base font-medium">
          Sign the guestbook
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-text-tertiary hover:text-text-secondary -mr-1 rounded p-1 transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="visitor-name"
            className="text-text-secondary text-xs font-medium tracking-wide uppercase"
          >
            Name
          </label>
          <input
            id="visitor-name"
            type="text"
            value={form.name}
            onChange={handleNameChange}
            onBlur={(e) => handleBlur("name", e)}
            placeholder="What should we call you?"
            maxLength={50}
            disabled={status === "submitting"}
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={cn(
              "bg-void/50 text-text-primary placeholder:text-text-tertiary focus:ring-accent-cool/20 ring-border/50 w-full rounded-md border-0 px-3 py-2.5 text-sm ring-1 transition-shadow outline-none ring-inset focus:ring-2",
              errors.name && "ring-accent-warm focus:ring-accent-warm/20",
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
              className="text-text-secondary text-xs font-medium tracking-wide uppercase"
            >
              Message
            </label>
            <span
              className={cn(
                "text-[10px] tabular-nums",
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
            onBlur={(e) => handleBlur("message", e)}
            placeholder="Say hello, share a thought, or just leave your mark..."
            rows={4}
            maxLength={MAX_MESSAGE_LENGTH + 10}
            disabled={status === "submitting"}
            aria-invalid={errors.message ? "true" : undefined}
            aria-describedby={errors.message ? "message-error" : undefined}
            className={cn(
              "bg-void/50 text-text-primary placeholder:text-text-tertiary focus:ring-accent-cool/20 ring-border/50 w-full resize-none rounded-md border-0 px-3 py-2.5 text-sm ring-1 transition-shadow outline-none ring-inset focus:ring-2",
              errors.message && "ring-accent-warm focus:ring-accent-warm/20",
              status === "submitting" && "cursor-not-allowed opacity-60"
            )}
          />
          {errors.message && (
            <p id="message-error" className="text-accent-warm text-xs">
              {errors.message}
            </p>
          )}
        </div>
      </div>

      {errors.submit && (
        <p className="text-accent-warm mt-4 text-center text-sm" role="alert">
          {errors.submit}
        </p>
      )}

      <div className="mt-6 flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={status === "submitting"}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={!canSubmit} size="sm">
          {status === "submitting" ? (
            <span className="flex items-center gap-2">
              <span
                className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
              Sending...
            </span>
          ) : (
            "Send message"
          )}
        </Button>
      </div>
    </form>
  );
}
