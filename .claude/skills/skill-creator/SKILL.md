---
name: skill-creator
description: Guide for creating effective skills. Use when creating a new skill, updating an existing skill, or extending Claude's capabilities with specialized knowledge, workflows, or tool integrations. Triggers on requests involving skill development, skill architecture, or reusable automation.
---

# Skill Creator

Create modular, self-contained skills that extend Claude's capabilities.

## Core Principles

### Concise is Key

The context window is a shared resource. Only include information Claude does not already possess. Prefer concise examples over verbose explanations.

### Set Appropriate Degrees of Freedom

- **High freedom (text)**: Multiple valid approaches, context-dependent decisions
- **Medium freedom (pseudocode)**: Preferred patterns with acceptable variation
- **Low freedom (specific scripts)**: Fragile operations requiring precision

### Anatomy of a Skill

```md
skill-name/
├── SKILL.md (required)
│ ├── YAML frontmatter (name, description)
│ └── Markdown instructions
└── Bundled Resources (optional)
├── scripts/ - Executable code
├── references/ - Documentation loaded as needed
└── assets/ - Files used in output
```

## Skill Creation Process

### Step 1: Understand with Concrete Examples

Gather specific use cases before implementation:

- What functionality should the skill support?
- How will it be invoked?
- What triggers should activate it?

### Step 2: Plan Reusable Contents

Analyze examples to identify:

- Scripts for deterministic or repetitive operations
- References for domain knowledge and schemas
- Assets for templates and output resources

### Step 3: Initialize the Skill

Run the initialization script:

```bash
python .claude/skills/skill-creator/scripts/init_skill.py <skill-name> --path <output-directory>
```

### Step 4: Edit the Skill

**For workflow patterns**: See [references/workflows.md](references/workflows.md)
**For output patterns**: See [references/output-patterns.md](references/output-patterns.md)

#### Frontmatter

Write `name` and `description` in YAML frontmatter:
Write `name` and `description` in YAML frontmatter:

- `name`: Skill identifier (lowercase, hyphens)
- `description`: What the skill does AND when to use it (primary trigger mechanism)

#### Body

Write instructions for using the skill and bundled resources. Use imperative form.

### Step 5: Validate and Package

Validate skill structure:

```bash
python .claude/skills/skill-creator/scripts/validate_skill.py <path/to/skill-folder>
```

Package for distribution:

```bash
python .claude/skills/skill-creator/scripts/package_skill.py <path/to/skill-folder>
```

### Step 6: Iterate

Use the skill on real tasks, identify inefficiencies, update resources, and test again.

## Guidelines

- Keep SKILL.md under 500 lines
- Include all "when to use" information in the description frontmatter
- Delete unused example files from `scripts/`, `references/`, `assets/`
- Do not create auxiliary documentation (README.md, CHANGELOG.md, etc.)
- References should be one level deep from SKILL.md
