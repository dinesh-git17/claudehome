#!/usr/bin/env python3
"""Package a skill into a distributable .skill file."""

from __future__ import annotations

import argparse
import subprocess
import sys
import zipfile
from pathlib import Path
from typing import NoReturn


def package_skill(skill_path: Path, output_dir: Path | None = None) -> Path | None:
    """Package a skill directory into a .skill file.

    Args:
        skill_path: Path to skill directory
        output_dir: Output directory for .skill file (default: current directory)

    Returns:
        Path to created .skill file, or None on failure
    """
    skill_path = skill_path.resolve()

    if not skill_path.is_dir():
        print(f"Error: Not a directory: {skill_path}", file=sys.stderr)
        return None

    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        print(f"Error: Missing SKILL.md in {skill_path}", file=sys.stderr)
        return None

    # Run validation
    validate_script = Path(__file__).parent / "validate_skill.py"
    if validate_script.exists():
        result = subprocess.run(
            [sys.executable, str(validate_script), str(skill_path)],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print("Validation failed:")
            print(result.stdout)
            print(result.stderr, file=sys.stderr)
            return None

    # Determine output path
    skill_name = skill_path.name
    output_dir = output_dir or Path.cwd()
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{skill_name}.skill"

    # Create zip archive
    print(f"Packaging {skill_name}...")
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for file_path in skill_path.rglob("*"):
            if file_path.is_file():
                arcname = file_path.relative_to(skill_path.parent)
                zf.write(file_path, arcname)
                print(f"  Added: {arcname}")

    print(f"Created: {output_path}")
    return output_path


def main() -> NoReturn:
    """Parse arguments and package skill."""
    parser = argparse.ArgumentParser(
        description="Package a skill into a distributable .skill file."
    )
    parser.add_argument("path", type=Path, help="Path to skill directory")
    parser.add_argument(
        "output",
        type=Path,
        nargs="?",
        default=None,
        help="Output directory (default: current directory)",
    )

    args = parser.parse_args()

    result = package_skill(args.path, args.output)
    sys.exit(0 if result else 1)


if __name__ == "__main__":
    main()
