#!/usr/bin/env python3
"""Initialize a new skill directory with standard structure."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import NoReturn


def create_skill_md(name: str) -> str:
    """Generate SKILL.md template content."""
    title = name.replace("-", " ").title()
    return f"""---
name: {name}
description: TODO: Describe what this skill does and when to use it. Include specific triggers and contexts for activation.
---

# {title}

TODO: Write instructions for using this skill.

## Overview

TODO: Brief description of the skill's purpose.

## Usage

TODO: Document how to use this skill and its resources.

## Resources

- **Scripts**: See `scripts/` for executable utilities
- **References**: See `references/` for documentation
- **Assets**: See `assets/` for templates and output files
"""


def create_example_script() -> str:
    """Generate example Python script."""
    return '''#!/usr/bin/env python3
"""Example utility script. Replace or delete as needed."""

from __future__ import annotations


def main() -> None:
    """Entry point."""
    print("Example script executed")


if __name__ == "__main__":
    main()
'''


def create_example_reference() -> str:
    """Generate example reference document."""
    return """# Reference Documentation

TODO: Add domain knowledge, API documentation, schemas, or detailed guides here.

## Contents

- Section 1
- Section 2
"""


def create_example_asset() -> str:
    """Generate example asset file."""
    return """# Template

TODO: Replace with actual template content (HTML, config files, etc.)
"""


def init_skill(name: str, path: Path) -> int:
    """Initialize skill directory structure.

    Args:
        name: Skill name (lowercase, hyphens)
        path: Parent directory for the skill

    Returns:
        Exit code (0 for success, 1 for failure)
    """
    skill_dir = path / name

    if skill_dir.exists():
        print(f"Error: Directory already exists: {skill_dir}", file=sys.stderr)
        return 1

    # Create directory structure
    (skill_dir / "scripts").mkdir(parents=True)
    (skill_dir / "references").mkdir(parents=True)
    (skill_dir / "assets").mkdir(parents=True)

    # Create SKILL.md
    (skill_dir / "SKILL.md").write_text(create_skill_md(name))

    # Create example files
    example_script = skill_dir / "scripts" / "example.py"
    example_script.write_text(create_example_script())
    example_script.chmod(0o755)

    (skill_dir / "references" / "example.md").write_text(create_example_reference())
    (skill_dir / "assets" / "template.md").write_text(create_example_asset())

    print(f"Initialized skill: {skill_dir}")
    print()
    print("Next steps:")
    print(f"  1. Edit {skill_dir}/SKILL.md")
    print("  2. Add scripts, references, and assets as needed")
    print("  3. Delete unused example files")
    print("  4. Validate with: python scripts/validate_skill.py {skill_dir}")

    return 0


def main() -> NoReturn:
    """Parse arguments and initialize skill."""
    parser = argparse.ArgumentParser(
        description="Initialize a new skill directory with standard structure."
    )
    parser.add_argument("name", help="Skill name (lowercase, hyphens)")
    parser.add_argument(
        "--path",
        type=Path,
        default=Path(".claude/skills"),
        help="Parent directory for the skill (default: .claude/skills)",
    )

    args = parser.parse_args()

    # Validate name format
    if not args.name.replace("-", "").isalnum() or args.name != args.name.lower():
        print(
            "Error: Skill name must be lowercase alphanumeric with hyphens only",
            file=sys.stderr,
        )
        sys.exit(1)

    sys.exit(init_skill(args.name, args.path))


if __name__ == "__main__":
    main()
