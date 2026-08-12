"""Rebuild public/lanyard/card.glb with my photo and name on the badge front.

The GLB ships one embedded PNG atlas; only the front-of-card area is repainted,
everything else (star on the back, geometry, metal clip) is left untouched.

Usage: pip install pillow && python scripts/build_card_glb.py
"""

import json
import struct
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
GLB = ROOT / "public/lanyard/card.glb"
PHOTO = ROOT / "public/NickolasTranGradPhoto.jpg"

NAME = "Nickolas Tran"
SUBTITLE = "CS + Math @ UCSC"

# Measured off the original atlas (1598x1596)
PHOTO_BOX = (63, 63, 737, 688)  # left, top, right, bottom
RADIUS = 24
NAME_BASELINE = (69, 845)
NAME_SIZE = 78  # DejaVu cap height is 0.729em -> matches the original 57px caps
SUB_BASELINE = (69, 922)
SUB_SIZE = 61
BG = (240, 240, 240, 255)
INK = (17, 17, 17, 255)
FOCAL = (0.53, 0.23)  # face position in the source photo
ZOOM = 1.15

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"

IMAGE_BUFFER_VIEW = 12  # the PNG atlas


def read_glb(path):
    data = path.read_bytes()
    json_len = struct.unpack("<I", data[12:16])[0]
    gltf = json.loads(data[20 : 20 + json_len])
    bin_start = 20 + json_len + 8
    bin_len = struct.unpack("<I", data[20 + json_len : 24 + json_len])[0]
    return gltf, bytearray(data[bin_start : bin_start + bin_len])


def write_glb(path, gltf, binary):
    js = json.dumps(gltf, separators=(",", ":")).encode()
    js += b" " * (-len(js) % 4)
    binary += b"\0" * (-len(binary) % 4)
    total = 12 + 8 + len(js) + 8 + len(binary)
    out = struct.pack("<4sII", b"glTF", 2, total)
    out += struct.pack("<II", len(js), 0x4E4F534A) + js
    out += struct.pack("<II", len(binary), 0x004E4942) + bytes(binary)
    path.write_bytes(out)


def cover(img, size, focal, zoom):
    """Scale to fill `size`, keeping `focal` (fractional x, y) in frame."""
    tw, th = size
    scale = max(tw / img.width, th / img.height) * zoom
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    # place the focal point about a fifth down the frame, then clamp in bounds
    left = round(img.width * focal[0] - tw / 2)
    top = round(img.height * focal[1] - th * 0.22)
    left = max(0, min(left, img.width - tw))
    top = max(0, min(top, img.height - th))
    return img.crop((left, top, left + tw, top + th))


def rounded(img, radius):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *[s - 1 for s in img.size]), radius, fill=255)
    img.putalpha(mask)
    return img


def main():
    gltf, binary = read_glb(GLB)
    view = gltf["bufferViews"][IMAGE_BUFFER_VIEW]
    assert view["byteOffset"] + view["byteLength"] == len(binary), "PNG is not the last view"

    atlas = Image.open(BytesIO(bytes(binary[view["byteOffset"] :]))).convert("RGBA")

    # wipe the old photo + name block, then repaint
    draw = ImageDraw.Draw(atlas)
    draw.rectangle((55, 55, 760, 950), fill=BG)

    box_w = PHOTO_BOX[2] - PHOTO_BOX[0]
    box_h = PHOTO_BOX[3] - PHOTO_BOX[1]
    photo = cover(Image.open(PHOTO).convert("RGB"), (box_w, box_h), FOCAL, ZOOM)
    atlas.paste(rounded(photo, RADIUS), PHOTO_BOX[:2], rounded(photo, RADIUS))

    draw.text(NAME_BASELINE, NAME, font=ImageFont.truetype(FONT_BOLD, NAME_SIZE), fill=INK, anchor="ls")
    draw.text(SUB_BASELINE, SUBTITLE, font=ImageFont.truetype(FONT_REG, SUB_SIZE), fill=INK, anchor="ls")

    png = BytesIO()
    atlas.save(png, "PNG", optimize=True)
    png = png.getvalue()

    binary = binary[: view["byteOffset"]] + bytearray(png)
    view["byteLength"] = len(png)
    gltf["buffers"][0]["byteLength"] = len(binary)
    write_glb(GLB, gltf, binary)
    print(f"wrote {GLB} ({GLB.stat().st_size} bytes), texture {atlas.size}")


if __name__ == "__main__":
    main()
