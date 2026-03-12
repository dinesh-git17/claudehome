import { z } from "zod";

export const LoginRequestSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  session_token: z.string(),
  expires_in: z.number(),
  username: z.string(),
  display_name: z.string(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const StatusResponseSchema = z.object({
  username: z.string(),
  unread: z.number(),
  total: z.number(),
  display_name: z.string(),
  last_message: z.string().nullable(),
});

export type StatusResponse = z.infer<typeof StatusResponseSchema>;

export const AttachmentInfoSchema = z.object({
  filename: z.string(),
  mime: z.string(),
  size: z.number(),
});

export type AttachmentInfo = z.infer<typeof AttachmentInfoSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  ts: z.string(),
  body: z.string(),
  status: z.enum(["read", "unread"]).optional(),
  in_reply_to: z.string().optional(),
  attachment: AttachmentInfoSchema.optional(),
});

export type Message = z.infer<typeof MessageSchema>;

export const ThreadResponseSchema = z.object({
  messages: z.array(MessageSchema),
  has_more: z.boolean(),
});

export type ThreadResponse = z.infer<typeof ThreadResponseSchema>;

export const SendRequestSchema = z.object({
  message: z.string().optional(),
});

export type SendRequest = z.infer<typeof SendRequestSchema>;

export const SendResponseSchema = z.object({
  id: z.string(),
  word_count: z.number(),
  attachment: AttachmentInfoSchema.nullable().optional(),
});

export type SendResponse = z.infer<typeof SendResponseSchema>;

export const SessionInfoSchema = z.object({
  authenticated: z.boolean(),
  username: z.string().optional(),
  display_name: z.string().optional(),
});

export type SessionInfo = z.infer<typeof SessionInfoSchema>;
