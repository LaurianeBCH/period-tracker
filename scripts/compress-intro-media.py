#!/usr/bin/env python3
from concurrent.futures import ProcessPoolExecutor
import os
import struct
import zlib

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES_DIR = os.path.join(ROOT_DIR, "Ressources")
OUT_DIR = os.path.join(ROOT_DIR, "public", "intro")

PHASE_FILES = [
    ("phase1.png", "phase1-anim.png"),
    ("phase2.png", "phase2-anim.png"),
    ("phase3.png", "phase3-anim.png"),
    ("phase4.png", "phase4-anim.png"),
]

LUT = bytes(255 if v >= 248 else (v & 0xF0) for v in range(256))


def make_chunk(chunk_type: bytes, chunk_data: bytes) -> bytes:
    crc = zlib.crc32(chunk_type)
    crc = zlib.crc32(chunk_data, crc) & 0xFFFFFFFF
    return struct.pack(">I", len(chunk_data)) + chunk_type + chunk_data + struct.pack(">I", crc)


def decode_rgba_frame(zbytes: bytes, width: int, height: int) -> bytearray:
    raw = zlib.decompress(zbytes)
    stride = width * 4
    pixels = bytearray(height * stride)
    for y in range(height):
        row_start = y * (stride + 1)
        ft = raw[row_start]
        row = raw[row_start + 1 : row_start + 1 + stride]
        if ft == 0:
            pixels[y * stride : (y + 1) * stride] = row
            continue
        out = bytearray(stride)
        prev_row_offset = (y - 1) * stride
        for i in range(stride):
            a = out[i - 4] if i >= 4 else 0
            b = pixels[prev_row_offset + i] if y > 0 else 0
            c = pixels[prev_row_offset + i - 4] if (y > 0 and i >= 4) else 0
            val = row[i]
            if ft == 1:
                val = (val + a) & 0xFF
            elif ft == 2:
                val = (val + b) & 0xFF
            elif ft == 3:
                val = (val + ((a + b) >> 1)) & 0xFF
            elif ft == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                val = (val + pr) & 0xFF
            out[i] = val
        pixels[y * stride : (y + 1) * stride] = out
    return pixels


def encode_quantized_frame(pixels: bytearray, width: int, height: int) -> bytes:
    stride = width * 4
    q = bytes(pixels).translate(LUT)
    filtered = bytearray(height * (stride + 1))
    for y in range(height):
        out_offset = y * (stride + 1)
        filtered[out_offset] = 1  # PNG Sub filter
        row = q[y * stride : (y + 1) * stride]
        filtered[out_offset + 1 : out_offset + 5] = row[:4]
        for i in range(4, stride):
            filtered[out_offset + 1 + i] = (row[i] - row[i - 4]) & 0xFF
    return zlib.compress(bytes(filtered), 9)


def process_apng(pair: tuple[str, str]) -> str:
    src_name, out_name = pair
    src_path = os.path.join(RES_DIR, src_name)
    out_path = os.path.join(OUT_DIR, out_name)

    with open(src_path, "rb") as f:
        data = f.read()

    need_quantize = len(data) >= 550_000
    pos = 8
    header_chunks = []
    fctl_payloads = []
    frames_z = []
    cur_z = bytearray()
    width = 339
    height = 480

    while pos < len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        ctype = data[pos + 4 : pos + 8]
        cdata = data[pos + 8 : pos + 8 + length]
        if ctype == b"IHDR":
            width, height = struct.unpack(">II", cdata[:8])
            header_chunks.append((ctype, cdata))
        elif ctype == b"acTL":
            num_frames, _ = struct.unpack(">II", cdata)
            # Enforce num_plays = 1 (single play, no loop)
            header_chunks.append((ctype, struct.pack(">II", num_frames, 1)))
        elif ctype == b"sRGB":
            header_chunks.append((ctype, cdata))
        elif ctype == b"fcTL":
            if cur_z:
                frames_z.append(bytes(cur_z))
                cur_z = bytearray()
            fctl_payloads.append(cdata)
        elif ctype == b"IDAT":
            cur_z.extend(cdata)
        elif ctype == b"fdAT":
            cur_z.extend(cdata[4:])
        pos += 12 + length

    if cur_z:
        frames_z.append(bytes(cur_z))

    out = bytearray(b"\x89PNG\r\n\x1a\n")
    for ctype, cdata in header_chunks:
        out.extend(make_chunk(ctype, cdata))

    seq_num = 0
    for idx, (fctl_raw, zdata) in enumerate(zip(fctl_payloads, frames_z)):
        new_fctl = struct.pack(">I", seq_num) + fctl_raw[4:]
        seq_num += 1
        out.extend(make_chunk(b"fcTL", new_fctl))

        if need_quantize and len(zdata) > 20_000:
            pixels = decode_rgba_frame(zdata, width, height)
            candidate = encode_quantized_frame(pixels, width, height)
            compressed = candidate if len(candidate) < len(zdata) else zdata
        else:
            compressed = zdata

        if idx == 0:
            out.extend(make_chunk(b"IDAT", compressed))
        else:
            fdat_payload = struct.pack(">I", seq_num) + compressed
            seq_num += 1
            out.extend(make_chunk(b"fdAT", fdat_payload))

    out.extend(make_chunk(b"IEND", b""))
    with open(out_path, "wb") as f:
        f.write(out)

    return f"{out_name}: {len(data) // 1024}KB -> {len(out) // 1024}KB (frames={len(frames_z)}, num_plays=1)"


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    legacy_audio = os.path.join(OUT_DIR, "phase4-audio.m4a")
    if os.path.exists(legacy_audio):
        os.remove(legacy_audio)

    with ProcessPoolExecutor() as pool:
        for summary in pool.map(process_apng, PHASE_FILES):
            print(summary)


if __name__ == "__main__":
    main()
