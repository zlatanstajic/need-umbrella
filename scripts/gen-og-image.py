#!/usr/bin/env python3
"""Generate the 1200x630 Open Graph social-preview image for Need Umbrella?.

Deterministic given the same installed TrueType font: no randomness and no
timestamps, so a fixed font yields byte-identical output on every run. The
wordmark font is resolved from a fixed candidate list (DejaVu / Liberation
bold sans); if none is found the script errors out loudly rather than
degrading to Pillow's low-res default, so a broken PNG can't slip through.
Draws a cyan umbrella glyph + "Need Umbrella?" wordmark on the app's dark-navy
background, centred inside the ~66% safe zone, using only Pillow primitives so
it never depends on an installed emoji font (no tofu box).

Run from the repo root:
    python3 scripts/gen-og-image.py
Output: assets/img/og-image.png
"""

import os

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (15, 23, 42)        # #0f172a  app dark-navy
CYAN = (34, 211, 238)    # #22d3ee  app cyan
INK = (226, 232, 240)    # #e2e8f0  light slate for the wordmark

OUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "assets", "img", "og-image.png",
)


def load_font(size):
    """Bold sans TrueType font from a fixed candidate list.

    Raises RuntimeError if none of the candidates exist, rather than silently
    degrading to Pillow's low-res default (which would produce a different,
    near-unreadable image). Regenerating the OG image is a rare dev-time
    action, so a clear failure is preferable to a silently broken PNG.
    """
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    raise RuntimeError(
        "No bold TrueType sans font found; one is required to regenerate the "
        "OG image. Looked in:\n  " + "\n  ".join(candidates) + "\n"
        "Install DejaVu or Liberation fonts (e.g. `fonts-dejavu` / "
        "`fonts-liberation`), or add a path to the candidate list."
    )


def draw_umbrella(draw, cx, cy, radius):
    """Draw a recognizable umbrella centred on (cx, cy)."""
    # Canopy: a filled half-disc (dome) sitting on a horizontal baseline.
    top = cy - radius
    canopy_box = [cx - radius, cy - radius, cx + radius, cy + radius]
    draw.pieslice(canopy_box, 180, 360, fill=CYAN)

    # Scallops along the canopy rim (little upward bites) to read as fabric panels.
    n = 6
    scallop_r = radius / n
    for i in range(n):
        # centres of scallops along the baseline
        x = cx - radius + scallop_r + i * (2 * radius / n)
        box = [x - scallop_r, cy - scallop_r, x + scallop_r, cy + scallop_r]
        draw.pieslice(box, 0, 180, fill=BG)

    # Handle: vertical shaft + a J-hook at the bottom.
    shaft_w = max(6, radius // 20)
    shaft_bottom = cy + int(radius * 1.15)
    draw.rectangle(
        [cx - shaft_w // 2, cy, cx + shaft_w // 2, shaft_bottom],
        fill=CYAN,
    )
    # J-hook (arc opening to the left).
    hook_r = radius * 0.22
    hook_box = [
        cx - hook_r * 2 + shaft_w // 2,
        shaft_bottom - hook_r,
        cx + shaft_w // 2,
        shaft_bottom + hook_r,
    ]
    draw.arc(hook_box, 0, 180, fill=CYAN, width=shaft_w)

    # Ferrule: a small tip on top of the dome.
    draw.rectangle(
        [cx - shaft_w // 2, top - radius * 0.12, cx + shaft_w // 2, top],
        fill=CYAN,
    )


def main():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Safe zone is roughly the central 66%; keep art well inside it.
    umbrella_r = 120
    umbrella_cx = W // 2
    umbrella_cy = int(H * 0.36)
    draw_umbrella(draw, umbrella_cx, umbrella_cy, umbrella_r)

    # Wordmark below the umbrella.
    font = load_font(96)
    text = "Need Umbrella?"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (W - tw) // 2 - bbox[0]
    ty = int(H * 0.66) - bbox[1]
    draw.text((tx, ty), text, font=font, fill=INK)

    # Tagline.
    sub_font = load_font(38)
    sub = "Worldwide rain check"
    sbox = draw.textbbox((0, 0), sub, font=sub_font)
    sw = sbox[2] - sbox[0]
    sx = (W - sw) // 2 - sbox[0]
    sy = ty + th + 30
    draw.text((sx, sy), sub, font=sub_font, fill=CYAN)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    img.save(OUT_PATH, "PNG", optimize=True)
    print("wrote", OUT_PATH, img.size)


if __name__ == "__main__":
    main()
