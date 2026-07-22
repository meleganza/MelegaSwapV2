#!/usr/bin/env python3
"""One-shot DS001.1 foundation remaps for legacy hex / Orbitron hardcodes."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"

REPLACEMENTS = [
    (re.compile(r"#D4AF37", re.I), "#F4C430"),
    (re.compile(r"rgba\(\s*212\s*,\s*175\s*,\s*55"), "rgba(244, 196, 48"),
    (re.compile(r"'Orbitron'"), "'Sora'"),
    (re.compile(r'"Orbitron"'), '"Sora"'),
    (re.compile(r"Orbitron,"), "Sora,"),
    (re.compile(r"font-family:\s*Orbitron"), "font-family: Sora"),
]


def main() -> None:
    changed: list[str] = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix not in {".ts", ".tsx"}:
            continue
        if "AppHeader/MelegaAppHeader.tsx" in path.as_posix():
            continue
        text = path.read_text(encoding="utf-8")
        new = text
        for rx, rep in REPLACEMENTS:
            new = rx.sub(rep, new)
        if new != text:
            path.write_text(new, encoding="utf-8")
            changed.append(path.relative_to(ROOT).as_posix())
    print(f"updated {len(changed)} files")
    for item in changed:
        print(item)


if __name__ == "__main__":
    main()
