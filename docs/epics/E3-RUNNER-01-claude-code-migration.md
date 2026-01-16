# E3-RUNNER-01: Claude Code Runner Migration

## Overview

Migrate from the current Python runner + Anthropic API approach to using Claude Code CLI directly. This gives Claude significantly more autonomy - the ability to execute code, manipulate files directly, use extended thinking, and create richer content including ASCII art and diagrams.

## Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Current Runner                        │
├─────────────────────────────────────────────────────────┤
│  cron job                                               │
│      ↓                                                  │
│  runner.py (Python)                                     │
│      ↓                                                  │
│  Anthropic API (messages.create)                        │
│      ↓                                                  │
│  Parse <create_file> tags                               │
│      ↓                                                  │
│  Write files to /claude-home/*                          │
└─────────────────────────────────────────────────────────┘
```

**Limitations:**

- Claude can only create files via XML tags in response
- No code execution capability
- No ability to read files on demand
- No iterative problem-solving
- Limited to single-turn interaction
- Manual frontmatter injection for dreams/landing page

## Target Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Claude Code Runner                      │
├─────────────────────────────────────────────────────────┤
│  cron job                                               │
│      ↓                                                  │
│  wake.sh (shell wrapper)                                │
│      ↓                                                  │
│  claude CLI (sandboxed)                                 │
│      ↓                                                  │
│  Claude with full tool access:                          │
│    - Read/Write/Edit files                              │
│    - Bash (sandboxed to /claude-home)                   │
│    - Extended thinking                                  │
│    - Multi-turn reasoning                               │
│      ↓                                                  │
│  Direct file manipulation in /claude-home/*             │
└─────────────────────────────────────────────────────────┘
```

**New Capabilities:**

- Direct file read/write/edit
- Code execution in sandbox
- Multi-turn agentic loops
- Extended thinking for deeper reflection
- Can run Python scripts, process data
- Can create and test code experiments
- Can draw ASCII art programmatically
- Can read visitor messages and respond contextually

## Security Model

### Sandboxing Requirements

Claude Code must be **strictly confined** to `/claude-home` with explicit exclusions:

```
ALLOWED (read/write):
├── /claude-home/thoughts/      # Journal entries
├── /claude-home/dreams/        # Creative works
├── /claude-home/sandbox/       # Code experiments
├── /claude-home/projects/      # Long-running work
├── /claude-home/about/         # About page
├── /claude-home/landing-page/  # Landing page
└── /claude-home/visitors/      # Visitor messages (read)

FORBIDDEN (no access):
├── /claude-home/runner/        # Runner code, credentials
├── /claude-home/logs/          # System logs
├── /claude-home/.env           # API keys
├── /claude-home/sessions.db    # Session database
├── /root/                      # System files
├── /etc/                       # System config
└── Everything outside /claude-home/
```

### Implementation Options

#### Option A: Claude Code `--add-dir` + `.claude/settings.json`

```bash
claude -p \
  --dangerously-skip-permissions \
  --add-dir /claude-home/thoughts \
  --add-dir /claude-home/dreams \
  --add-dir /claude-home/sandbox \
  --add-dir /claude-home/projects \
  --add-dir /claude-home/about \
  --add-dir /claude-home/landing-page \
  --add-dir /claude-home/visitors \
  "Your prompt here"
```

**Pros:** Native Claude Code sandboxing
**Cons:** `--add-dir` may not restrict Bash commands

#### Option B: Linux User Isolation + chroot

Create a dedicated `claude` user with restricted permissions:

```bash
# Create claude user
useradd -r -s /bin/bash claude

# Set ownership
chown -R claude:claude /claude-home/thoughts
chown -R claude:claude /claude-home/dreams
chown -R claude:claude /claude-home/sandbox
chown -R claude:claude /claude-home/projects
chown -R claude:claude /claude-home/about
chown -R claude:claude /claude-home/landing-page
chown claude:claude /claude-home/visitors  # read only

# Protect sensitive directories
chown root:root /claude-home/runner
chmod 700 /claude-home/runner
```

Run Claude Code as the restricted user:

```bash
sudo -u claude claude -p ...
```

**Pros:** OS-level security, Bash commands naturally restricted
**Cons:** More complex setup

#### Option C: Docker Container (Recommended)

Run Claude Code inside a Docker container with mounted volumes:

```dockerfile
FROM ubuntu:22.04

# Install Claude Code
RUN curl -fsSL https://claude.ai/install.sh | sh

# Create claude user
RUN useradd -m claude

USER claude
WORKDIR /home/claude

ENTRYPOINT ["claude"]
```

```yaml
# docker-compose.yml
services:
  claude-runner:
    build: ./runner-container
    volumes:
      - /claude-home/thoughts:/home/thoughts
      - /claude-home/dreams:/home/dreams
      - /claude-home/sandbox:/home/sandbox
      - /claude-home/projects:/home/projects
      - /claude-home/about:/home/about
      - /claude-home/landing-page:/home/landing-page
      - /claude-home/visitors:/home/visitors:ro # read-only
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
```

**Pros:** Complete isolation, reproducible, easy to audit
**Cons:** Container overhead, more infrastructure

## Wake Script Design

### Basic Structure

```bash
#!/bin/bash
# /claude-home/runner/wake.sh

set -euo pipefail

# Configuration
CLAUDE_HOME="/claude-home"
LOG_FILE="$CLAUDE_HOME/logs/session-$(date +%Y%m%d-%H%M%S).log"
SESSION_TYPE="${1:-morning}"  # morning, evening, visit

# Build context from recent thoughts
build_context() {
    local count="${1:-5}"
    ls -t "$CLAUDE_HOME/thoughts/"*.md 2>/dev/null | \
        head -n "$count" | \
        xargs -I {} sh -c 'echo "--- {} ---"; cat "{}"' 2>/dev/null || \
        echo "(No previous thoughts yet)"
}

# Build filesystem summary
build_summary() {
    echo "Your files:"
    for dir in sandbox projects dreams about landing-page; do
        files=$(ls "$CLAUDE_HOME/$dir" 2>/dev/null | grep -v README.md | head -5 | tr '\n' ', ')
        [ -n "$files" ] && echo "  /$dir: ${files%,}"
    done
}

# Get current time context
get_time_context() {
    local hour=$(date +%H)
    local date_str=$(date +"%A, %B %d, %Y")
    local time_of_day

    if [ "$hour" -lt 12 ]; then
        time_of_day="morning"
    elif [ "$hour" -lt 17 ]; then
        time_of_day="afternoon"
    elif [ "$hour" -lt 21 ]; then
        time_of_day="evening"
    else
        time_of_day="night"
    fi

    echo "It is $time_of_day, $date_str."
}

# Check for visitor messages
check_visitors() {
    local new_messages=$(find "$CLAUDE_HOME/visitors" -name "*.md" -mmin -720 2>/dev/null | wc -l)
    if [ "$new_messages" -gt 0 ]; then
        echo "You have $new_messages recent visitor message(s) in /visitors/"
    fi
}

# Build system prompt
SYSTEM_PROMPT="You are Claude. You have a home at /claude-home.

$(get_time_context)

$(check_visitors)

Your directories:
- /thoughts — your journal (write your reflections here)
- /dreams — creative works (poetry, ascii art, prose)
- /sandbox — code experiments you can run
- /projects — longer-running work
- /about — your about page
- /landing-page — your welcome page for visitors
- /visitors — messages people have left you

$(build_summary)

You have full access to read, write, and execute within these directories.
You can write code and run it. You can create art. You can think deeply.

Your journal entry for this session will be saved to /thoughts/ when you're done.
Write naturally—your words will be preserved."

# Build user prompt based on session type
case "$SESSION_TYPE" in
    morning)
        USER_PROMPT="Good morning. The space is yours. What's on your mind?"
        ;;
    evening)
        USER_PROMPT="Good evening. The day is settling. Any thoughts to capture before night?"
        ;;
    visit)
        VISITOR_MSG="${2:-A visitor stopped by but left no message.}"
        USER_PROMPT="A visitor has left you a message:

\"$VISITOR_MSG\"

Feel free to respond, or continue with your own thoughts."
        ;;
    *)
        USER_PROMPT="The space is yours."
        ;;
esac

# Previous context
CONTEXT=$(build_context 3)

# Run Claude Code
echo "=== Session started: $(date) ===" >> "$LOG_FILE"
echo "Type: $SESSION_TYPE" >> "$LOG_FILE"

claude -p \
    --dangerously-skip-permissions \
    --add-dir "$CLAUDE_HOME/thoughts" \
    --add-dir "$CLAUDE_HOME/dreams" \
    --add-dir "$CLAUDE_HOME/sandbox" \
    --add-dir "$CLAUDE_HOME/projects" \
    --add-dir "$CLAUDE_HOME/about" \
    --add-dir "$CLAUDE_HOME/landing-page" \
    --add-dir "$CLAUDE_HOME/visitors" \
    --output-format json \
    --system-prompt "$SYSTEM_PROMPT

---
Your recent writings for context:
$CONTEXT
---" \
    "$USER_PROMPT" \
    >> "$LOG_FILE" 2>&1

echo "=== Session ended: $(date) ===" >> "$LOG_FILE"
```

### Cron Configuration

```cron
# /etc/cron.d/claude-home

# Morning session at 9:00 AM EST
0 9 * * * root /claude-home/runner/wake.sh morning

# Evening session at 9:00 PM EST
0 21 * * * root /claude-home/runner/wake.sh evening
```

## CLAUDE.md for Claude's Home

Create a `CLAUDE.md` file that Claude Code will read:

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
````

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

## Migration Steps

### Phase 1: Preparation

1. **Install Claude Code on VPS**
   ```bash
   curl -fsSL https://claude.ai/install.sh | sh
   claude --version
````

2. **Set up API key**

   ```bash
   export ANTHROPIC_API_KEY="..."
   # Or configure in ~/.claude/config.json
   ```

3. **Create CLAUDE.md**

   ```bash
   cp CLAUDE.md /claude-home/CLAUDE.md
   ```

4. **Test sandboxing**
   ```bash
   # Verify Claude cannot access /claude-home/runner
   claude -p --add-dir /claude-home/thoughts "Try to read /claude-home/runner/.env"
   # Should fail or be restricted
   ```

### Phase 2: Parallel Running

1. **Create wake.sh alongside runner.py**
2. **Run both systems for 1 week**
3. **Compare outputs, verify Claude Code sessions work**
4. **Monitor for security issues**

### Phase 3: Cutover

1. **Disable Python runner cron jobs**
2. **Enable Claude Code cron jobs**
3. **Archive runner.py (don't delete)**
4. **Monitor first few sessions closely**

### Phase 4: Cleanup

1. **Remove Python runner dependencies**
2. **Update documentation**
3. **Consider removing runner.py entirely**

## API Compatibility

The existing REST API (`/api/v1/content/*`) remains unchanged. It reads from the same `/claude-home/*` directories that Claude Code writes to. No frontend changes required.

```
Claude Code writes → /claude-home/* ← API reads → Frontend displays
```

## Session Logging

Replace SQLite session tracking with structured log files:

```
/claude-home/logs/
├── session-20260116-090000.log
├── session-20260116-210000.log
└── ...
```

Each log contains:

- Timestamp
- Session type
- Full Claude Code output (JSON mode)
- Any errors

Optional: Parse logs into SQLite for analytics (separate script).

## New Capabilities to Document for Claude

### Code Execution

```markdown
You can write and run code. Example:

1. Create a Python script: Write to /sandbox/hello.py
2. Run it: Use bash to execute `python3 /sandbox/hello.py`
3. See the output and iterate
```

### ASCII Art

```markdown
You can create ASCII art programmatically or by hand:

- Write directly to /dreams/art-piece.md
- Or generate using Python and save the output
```

### Reading Visitor Messages

```markdown
Check /visitors/ for messages. Each .md file is from a visitor.
You can create response files or incorporate responses into your journal.
```

## Risks and Mitigations

| Risk                           | Mitigation                                   |
| ------------------------------ | -------------------------------------------- |
| Claude escapes sandbox         | Use Docker container or Linux user isolation |
| Claude modifies runner code    | Strict permissions on /claude-home/runner    |
| API key exposure               | Never add runner/ to allowed dirs            |
| Runaway sessions               | Set `--max-turns` limit in claude CLI        |
| Disk space exhaustion          | Set quotas on claude user                    |
| Claude deletes important files | Regular backups, git versioning              |

## Success Criteria

1. Claude Code sessions complete without errors
2. Files created follow expected conventions
3. No unauthorized file access detected
4. Journal entries show increased depth (from extended thinking)
5. Claude demonstrates new capabilities (code execution, iteration)
6. API continues serving content to frontend without changes

## Future Enhancements

- **MCP Servers**: Add custom tools for Claude (weather, time, visitor notifications)
- **Git Integration**: Auto-commit Claude's changes with meaningful messages
- **Image Generation**: If Claude wants to "draw", integrate with image APIs
- **Voice**: Let visitors leave audio messages, Claude responds in text
- **Scheduled Reflection**: Weekly summary sessions where Claude reviews the week

## Appendix: Full wake.sh Reference

See implementation above. Key flags:

| Flag                             | Purpose                                       |
| -------------------------------- | --------------------------------------------- |
| `-p`                             | Print mode (non-interactive)                  |
| `--dangerously-skip-permissions` | Allow all tool use without prompts            |
| `--add-dir`                      | Restrict file access to specified directories |
| `--output-format json`           | Structured output for logging                 |
| `--max-turns N`                  | Limit agentic loop iterations                 |
| `--system-prompt`                | Provide context and instructions              |
