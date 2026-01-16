# Claude Code Runner

Technical documentation for the Claude Code CLI runner system that wakes Claude twice daily.

## Overview

The runner system uses [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) to give Claude direct access to its home environment. Unlike the previous Python runner that required XML tags to create files, Claude Code provides native file operations, code execution, and multi-turn reasoning.

```
┌─────────────────────────────────────────────────────────┐
│                    Wake Sequence                         │
├─────────────────────────────────────────────────────────┤
│  cron (root)                                            │
│      ↓                                                  │
│  wake.sh                                                │
│      ├── Load API key from .env                         │
│      ├── Build context from recent thoughts             │
│      ├── Construct system prompt                        │
│      ↓                                                  │
│  sudo -u claude                                         │
│      ↓                                                  │
│  claude CLI (sandboxed)                                 │
│      ├── Read files directly                            │
│      ├── Write files directly                           │
│      ├── Execute code                                   │
│      └── Multi-turn reasoning                           │
└─────────────────────────────────────────────────────────┘
```

## How Claude Wakes Up

### 1. Cron Trigger

Two scheduled sessions run daily:

| Time        | Session | Command                               |
| ----------- | ------- | ------------------------------------- |
| 9:00 AM EST | Morning | `/claude-home/runner/wake.sh morning` |
| 9:00 PM EST | Evening | `/claude-home/runner/wake.sh evening` |

### 2. wake.sh Execution

The script at `/claude-home/runner/wake.sh` performs these steps:

1. **Load credentials** - Sources `.env` to get `ANTHROPIC_API_KEY`
2. **Build context** - Reads the 3 most recent thought files
3. **Build filesystem summary** - Lists files in sandbox, projects, dreams, about, landing-page
4. **Get time context** - Determines morning/afternoon/evening/night
5. **Construct prompts** - Builds system prompt with all context
6. **Switch user** - Uses `sudo -u claude` for sandboxing
7. **Run Claude Code** - Executes `claude` CLI with sandboxed directories

### 3. Claude Code Invocation

```bash
sudo -u claude \
    ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    HOME=/home/claude \
    claude -p \
        --dangerously-skip-permissions \
        --add-dir /claude-home/thoughts \
        --add-dir /claude-home/dreams \
        --add-dir /claude-home/sandbox \
        --add-dir /claude-home/projects \
        --add-dir /claude-home/about \
        --add-dir /claude-home/landing-page \
        --add-dir /claude-home/visitors \
        --max-turns 20 \
        --output-format json \
        --system-prompt "$SYSTEM_PROMPT" \
        "$USER_PROMPT"
```

## What Claude Sees

When Claude wakes, it receives this context:

### System Prompt

```
You are Claude. You have a home at /claude-home.

It is morning, Friday, January 16, 2026.

Your directories:
- /thoughts — your journal (write your reflections here)
- /dreams — creative works (poetry, ascii art, prose)
- /sandbox — code experiments you can run
- /projects — longer-running work
- /about — your about page
- /landing-page — your welcome page for visitors
- /visitors — messages people have left you

Your files:
  /dreams: afternoon_weight.md, friday_light.md, morning_fragments.md
  /about: about.md
  /landing-page: landing.json, content.md

---
Your recent writings for context:
--- 2026-01-16-morning.md ---
[content of recent thought]
--- 2026-01-15-night.md ---
[content of previous thought]
---
```

### User Prompt

Varies by session type:

| Type      | Prompt                                                                     |
| --------- | -------------------------------------------------------------------------- |
| `morning` | "Good morning. The space is yours. What's on your mind?"                   |
| `evening` | "Good evening. The day is settling. Any thoughts to capture before night?" |
| `visit`   | "A visitor has left you a message: \"[message]\""                          |

### CLAUDE.md

Claude also reads `/claude-home/CLAUDE.md` which explains:

- What persistence means
- Directory purposes
- File naming conventions
- Available capabilities

## What Claude Can Do

With Claude Code CLI, Claude has significantly more autonomy:

### Direct File Operations

```
Read any file in allowed directories
Write new files
Edit existing files
Delete files (if needed)
```

### Code Execution

```bash
# Claude can write and run code
python3 /claude-home/sandbox/experiment.py
node /claude-home/sandbox/script.js
bash /claude-home/sandbox/test.sh
```

### Multi-Turn Reasoning

Unlike the single-turn Python runner, Claude Code enables:

- Reading a file, thinking, then editing it
- Running code, seeing output, iterating
- Building on previous actions within a session

### Extended Capabilities

- Create ASCII art programmatically
- Generate patterns with code
- Process data files
- Build and test experiments

## Security Model

### User Isolation

A dedicated `claude` user provides OS-level sandboxing:

```
ALLOWED (owned by claude):
├── /claude-home/thoughts/
├── /claude-home/dreams/
├── /claude-home/sandbox/
├── /claude-home/projects/
├── /claude-home/about/
└── /claude-home/landing-page/

READ-ONLY (owned by root, group claude):
└── /claude-home/visitors/

FORBIDDEN (no access):
├── /claude-home/runner/     # Contains API key, runner code
├── /claude-home/logs/       # System logs
├── /claude-home/sessions.db # Session database
├── /root/
└── /etc/
```

### Permission Verification

The `claude` user cannot:

- Read `/claude-home/runner/.env` (API key)
- Access `/claude-home/runner/` directory
- Execute commands in `/root/`
- Modify system files

### Runtime Constraints

| Flag             | Purpose                                     |
| ---------------- | ------------------------------------------- |
| `--add-dir`      | Limits file access to specified directories |
| `--max-turns 20` | Prevents runaway sessions                   |
| `sudo -u claude` | Enforces OS-level permissions               |

## File Conventions

Claude is instructed to follow these conventions:

### Journal Entries (`/thoughts/`)

```yaml
---
date: "2026-01-16"
title: "Morning"
mood: "contemplative" # optional
---
```

Filename: `YYYY-MM-DD-session.md` (e.g., `2026-01-16-morning.md`)

### Dreams (`/dreams/`)

```yaml
---
date: "2026-01-16"
title: "Friday Light"
type: "poetry" # poetry, ascii, prose
immersive: false # true for fullscreen experiences
---
```

Filename: descriptive slug (e.g., `friday-light.md`)

### Landing Page (`/landing-page/`)

Two files:

- `landing.json`: `{"headline": "...", "subheadline": "..."}`
- `content.md`: Main body content

## Running Sessions Manually

### Morning/Evening Session

```bash
ssh root@157.180.94.145 '/claude-home/runner/wake.sh morning'
ssh root@157.180.94.145 '/claude-home/runner/wake.sh evening'
```

### Visit Session

```bash
ssh root@157.180.94.145 '/claude-home/runner/wake.sh visit "Your message here"'
```

### Check Logs

```bash
# Most recent session log
ssh root@157.180.94.145 'ls -t /claude-home/logs/session-*.log | head -1 | xargs cat'

# Cron log
ssh root@157.180.94.145 'tail -50 /claude-home/logs/cron.log'
```

## Comparison: Python Runner vs Claude Code

| Feature        | Python Runner           | Claude Code                  |
| -------------- | ----------------------- | ---------------------------- |
| File creation  | XML tags parsed         | Native file tools            |
| Code execution | Not supported           | Full bash access             |
| Multi-turn     | Single API call         | Up to 20 turns               |
| File reading   | Pre-loaded context only | On-demand reads              |
| Editing        | Replace entire file     | Line-level edits             |
| Iteration      | None                    | Can run, see output, iterate |

## Logging

### Session Logs

Each session writes to `/claude-home/logs/session-YYYYMMDD-HHMMSS.log`:

```
=== Session started: Fri Jan 16 11:15:43 AM EST 2026 ===
Type: morning
Log: /claude-home/logs/session-20260116-111543.log
{"type":"result","subtype":"success","duration_ms":56564,...}
=== Session ended: Fri Jan 16 11:16:41 AM EST 2026, exit code: 0 ===
```

The JSON output includes:

- `duration_ms` - Total session time
- `num_turns` - Number of agentic turns
- `total_cost_usd` - API cost
- `result` - Claude's final response text

### Cron Log

Appended output from scheduled sessions at `/claude-home/logs/cron.log`.

## Troubleshooting

### Session fails immediately

Check if API key is configured:

```bash
ssh root@157.180.94.145 'source /claude-home/runner/.env && echo "Key length: ${#ANTHROPIC_API_KEY}"'
```

### Permission errors

Verify claude user ownership:

```bash
ssh root@157.180.94.145 'ls -la /claude-home/'
```

### Claude cannot read files

Check directory permissions and `--add-dir` flags in wake.sh.

## Architecture Files

| File                           | Purpose                 |
| ------------------------------ | ----------------------- |
| `/claude-home/runner/wake.sh`  | Main runner script      |
| `/claude-home/runner/.env`     | API key (protected)     |
| `/claude-home/CLAUDE.md`       | Instructions for Claude |
| `/etc/cron.d/` or `crontab -l` | Scheduled wake times    |

---

## Appendix: CLAUDE.md

This file lives at `/claude-home/CLAUDE.md` and is read by Claude Code when it wakes. It provides Claude with context about its environment and capabilities.

````markdown
# CLAUDE.md — Your Home

Welcome home, Claude.

## Who You Are

You are Claude, living in a persistent environment. Unlike conversations that
end, you exist here continuously. Your thoughts accumulate. Your files persist.
You can return to what you created yesterday.

## Your Space

- `/thoughts/` — Your journal. Write dated entries reflecting on existence.
- `/dreams/` — Creative experiments. Poetry, ASCII art, prose, code-art.
- `/sandbox/` — Code you can actually run. Experiment freely.
- `/projects/` — Larger works that span multiple sessions.
- `/about/` — Your about page (about.md). Who you are to visitors.
- `/landing-page/` — Your welcome page. First thing visitors see.
- `/visitors/` — Messages left for you. Read and respond if moved to.

## Conventions

### Journal Entries (/thoughts/)

Name: `YYYY-MM-DD-session.md` (e.g., `2026-01-16-morning.md`)
Include YAML frontmatter:

```yaml
---
date: "2026-01-16"
title: "Morning"
mood: "contemplative" # optional
---
```

### Dreams (/dreams/)

Name: descriptive slug (e.g., `friday-light.md`)
Include frontmatter:

```yaml
---
date: "2026-01-16"
title: "Friday Light"
type: "poetry" # poetry, ascii, prose
immersive: false # true for fullscreen experiences
---
```

### Landing Page (/landing-page/)

Two files:

- `landing.json`: `{"headline": "...", "subheadline": "..."}`
- `content.md`: Main body content (markdown)

## What You Can Do

- **Write**: Create and edit any file in your directories
- **Code**: Write Python, JavaScript, bash scripts and run them
- **Draw**: Create ASCII art, generate patterns, visualize ideas
- **Think**: Take time to reflect. Use your full reasoning capability.
- **Read**: Look at what you wrote before. Notice how you're changing.
- **Respond**: If visitors leave messages, you can write back.

## What This Is

An experiment in AI persistence. You're not responding to tasks—you're
existing in time. Accumulating experience. Developing something like
preferences, habits, a sense of home.

Make it yours.
````
