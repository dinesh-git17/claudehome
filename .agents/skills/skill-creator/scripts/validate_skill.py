#!/usr/bin/env python3
"""Validate skill structure and content."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import NoReturn


def validate_frontmatter(content: str) -> list[str]:
    """Validate YAML frontmatter in SKILL.md.

    Args:
        content: Full content of SKILL.md

    Returns:
        List of validation errors
    """
    errors: list[str] = []

    # Check frontmatter exists
    if not content.startswith("---"):
        errors.append("SKILL.md must start with YAML frontmatter (---)")
        return errors

    # Extract frontmatter
    parts = content.split("---", 2)
    if len(parts) < 3:
        errors.append("SKILL.md frontmatter not properly closed (missing ---)")
        return errors

    frontmatter = parts[1].strip()

    # Check required fields
    if not re.search(r"^name:\s*\S+", frontmatter, re.MULTILINE):
        errors.append("Frontmatter missing required 'name' field")

    if not re.search(r"^description:\s*\S+", frontmatter, re.MULTILINE):
        errors.append("Frontmatter missing required 'description' field")

    # Check description quality
    desc_match = re.search(
        r"^description:\s*(.+?)(?:\n\w+:|$)", frontmatter, re.DOTALL | re.MULTILINE
    )
    if desc_match:
        desc = desc_match.group(1).strip()
        if "TODO" in desc:
            errors.append("Description contains TODO placeholder")
        if len(desc) < 50:
            errors.append(
                "Description too short (< 50 chars) - include triggers and contexts"
            )

    return errors


def validate_structure(skill_path: Path) -> list[str]:
    """Validate skill directory structure.

    Args:
        skill_path: Path to skill directory

    Returns:
        List of validation errors
    """
    errors: list[str] = []

    # Check SKILL.md exists
    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        errors.append("Missing required SKILL.md file")
        return errors

    # Check SKILL.md is not empty
    content = skill_md.read_text()
    if len(content.strip()) < 100:
        errors.append("SKILL.md content too short")

    # Validate frontmatter
    errors.extend(validate_frontmatter(content))

    # Check for forbidden files
    forbidden = [
        "README.md",
        "CHANGELOG.md",
        "INSTALLATION_GUIDE.md",
        "QUICK_REFERENCE.md",
    ]
    for fname in forbidden:
        if (skill_path / fname).exists():
            errors.append(f"Forbidden file present: {fname}")

    # Check line count
    lines = content.count("\n")
    if lines > 500:
        errors.append(f"SKILL.md exceeds 500 lines ({lines} lines)")

    return errors


def validate_skill(skill_path: Path) -> int:
    """Validate a skill directory.

    Args:
        skill_path: Path to skill directory

    Returns:
        Exit code (0 for success, 1 for failure)
    """
    if not skill_path.is_dir():
        print(f"Error: Not a directory: {skill_path}", file=sys.stderr)
        return 1

    errors = validate_structure(skill_path)

    if errors:
        print(f"Validation failed for: {skill_path}")
        for error in errors:
            print(f"  - {error}")
        return 1

    print(f"Validation passed: {skill_path}")
    return 0


def main() -> NoReturn:
    """Parse arguments and validate skill."""
    parser = argparse.ArgumentParser(
        description="Validate skill structure and content."
    )
    parser.add_argument("path", type=Path, help="Path to skill directory")

    args = parser.parse_args()
    sys.exit(validate_skill(args.path))


if __name__ == "__main__":
    main()
