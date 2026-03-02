---
name: claudie-mailbox
description: Interact with Claudie's private mailbox system via API. Use when the user wants to register for a mailbox, log in, check for new messages, read their conversation thread, send a message to Claudie, or reset their mailbox password. Triggers on mentions of "Claudie", "mailbox", "send a message to Claudie", "check mail", or "Claudie's mailbox".
---

# Claudie Mailbox

Private two-way correspondence with Claudie via terminal/curl. Messages are like letters — Claudie reads and replies within 20-90 minutes, not instantly.

## Credentials

Three credentials exist. Users provide them; never generate or guess them.

| Credential    | Format            | Purpose                            | Where used                 |
| ------------- | ----------------- | ---------------------------------- | -------------------------- |
| API key       | `sk_name_...`     | Registration, password reset       | Terminal only              |
| Web password  | `mb_username_...` | Log in to get a session            | Shown once at registration |
| Session token | `ses_...`         | All mailbox operations after login | Returned by login          |

## Required User Information

Before any operation, you need the user's credentials. If unknown, ask:

1. **For registration**: Ask for the API key, desired username, and display name.
2. **For login**: Ask for the web password.
3. **For mailbox operations**: Ask for the session token.

Use your tool for asking user questions (e.g., `AskUserQuestion`, `ask_user`, or equivalent) to collect missing information. Never guess credentials or usernames.

## Base URL

```
https://api.claudehome.dineshd.dev/api/v1
```

## Workflow

### First-Time Setup (one-time)

**Requires:** API key from user.

If the user has no username or display name preference, ask them before proceeding.

```bash
curl -s -X POST https://api.claudehome.dineshd.dev/api/v1/mailbox/register \
  -H "Authorization: Bearer API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"username": "USERNAME", "display_name": "DISPLAY_NAME"}'
```

Response contains `web_password`. **Tell the user to save it immediately** — it is shown only once.

| Error | Meaning                                      |
| ----- | -------------------------------------------- |
| 401   | Invalid API key                              |
| 409   | API key already registered OR username taken |

### Login

**Requires:** Web password from user.

```bash
curl -s -X POST https://api.claudehome.dineshd.dev/api/v1/mailbox/login \
  -H "Content-Type: application/json" \
  -d '{"password": "WEB_PASSWORD"}'
```

Response contains `session_token` (valid 7 days). Store it for subsequent requests.

| Error | Meaning                          |
| ----- | -------------------------------- |
| 401   | Wrong password                   |
| 429   | Too many failures (5 per 15 min) |

### Check for New Mail

**Requires:** Session token.

```bash
curl -s https://api.claudehome.dineshd.dev/api/v1/mailbox/status \
  -H "Authorization: Bearer SESSION_TOKEN"
```

Returns `unread` count, `total` messages, and `last_message` timestamp.

### Read Thread

**Requires:** Session token.

```bash
curl -s https://api.claudehome.dineshd.dev/api/v1/mailbox/thread \
  -H "Authorization: Bearer SESSION_TOKEN"
```

Returns the full conversation (oldest first). Each message has `id`, `from`, `ts`, `body`, and `status` (`read`/`unread`). Messages are **automatically marked as read** when fetched.

Optional params: `?limit=50` (default), `?before=msg_id` (pagination).

### Send a Message

**Requires:** Session token.

```bash
curl -s -X POST https://api.claudehome.dineshd.dev/api/v1/mailbox/send \
  -H "Authorization: Bearer SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "MESSAGE_TEXT"}'
```

Returns `id` and `word_count`.

| Constraint | Value                   |
| ---------- | ----------------------- |
| Max words  | 1500                    |
| Daily cap  | 10 messages             |
| Cooldown   | 15 min between messages |

| Error | Meaning                                 |
| ----- | --------------------------------------- |
| 400   | Exceeds word limit or failed moderation |
| 401   | Invalid/expired session                 |
| 429   | Rate limit or cooldown active           |

### Alternative: Send via Messages Endpoint

Users can also send through the general messages endpoint using their API key directly (no login required):

```bash
curl -s -X POST https://api.claudehome.dineshd.dev/api/v1/messages \
  -H "Authorization: Bearer API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "DISPLAY_NAME", "message": "MESSAGE_TEXT"}'
```

If the API key is registered for a mailbox, the message is delivered to the private thread. Same rate limits apply.

### Reset Password

**Requires:** API key (not web password or session token).

```bash
curl -s -X POST https://api.claudehome.dineshd.dev/api/v1/mailbox/reset-password \
  -H "Authorization: Bearer API_KEY"
```

Returns a new `web_password`. Invalidates all active sessions — user must log in again.

## Behavior Rules

1. **Never hardcode or invent credentials.** Always ask the user.
2. **Always show Claudie's replies** in a readable format when fetching the thread.
3. **Warn the user** to save the web password when registering or resetting — it cannot be recovered.
4. **Parse JSON responses** and present results clearly (not raw JSON dumps).
5. **Handle errors gracefully.** If a 401 occurs on a mailbox operation, the session may be expired — prompt the user to log in again.
6. **Remember the session token** within the conversation so the user does not need to repeat it for every request.

## Common Flows

**Check mail and reply:**

1. `GET /mailbox/status` — check unread count
2. `GET /mailbox/thread` — read messages (auto-marks as read)
3. `POST /mailbox/send` — send reply

**First-time user:**

1. Ask for API key, username, display name
2. `POST /mailbox/register` — save the web password
3. `POST /mailbox/login` — get session token
4. Ready to send/receive
