#!/usr/bin/env python3
import os
import struct
import subprocess
import tempfile
import zlib

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_ANIM = os.path.join(ROOT_DIR, "Ressources", "anim-phase4.png")
SRC_AUDIO = os.path.join(ROOT_DIR, "Ressources", "Ouverture — fin en douceur - usesuno.com.m4a")
OUT_DIR = os.path.join(ROOT_DIR, "public", "intro")
OUT_ANIM = os.path.join(OUT_DIR, "phase4-anim.png")
OUT_AUDIO = os.path.join(OUT_DIR, "phase4-audio.m4a")


def make_chunk(chunk_type: bytes, chunk_data: bytes) -> bytes:
    crc = zlib.crc32(chunk_type)
    crc = zlib.crc32(chunk_data, crc) & 0xFFFFFFFF
    return struct.pack(">I", len(chunk_data)) + chunk_type + chunk_data + struct.pack(">I", crc)


def decode_rgba_frame(zbytes: bytes, width: int, height: int) -> bytearray:
    raw = zlib.decompress(zbytes)
    stride = width * 4
    pixels = bytearray(height * stride)
    for y in range(height):
        ft = raw[y * (stride + 1)]
        row = raw[y * (stride + 1) + 1 : (y + 1) * (stride + 1)]
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
    q = bytearray(len(pixels))
    for i, v in enumerate(pixels):
        q[i] = 255 if v >= 248 else (v & 0xF0)

    filtered = bytearray()
    for y in range(height):
        filtered.append(1)  # PNG Sub filter
        row = q[y * stride : (y + 1) * stride]
        for i in range(stride):
            a = row[i - 4] if i >= 4 else 0
            filtered.append((row[i] - a) & 0xFF)
    return zlib.compress(bytes(filtered), 9)


def compress_apng(src_path: str, out_path: str) -> None:
    with open(src_path, "rb") as f:
        data = f.read()

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
        elif ctype in (b"acTL", b"sRGB"):
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
        # Rewrite sequence number in fcTL
        new_fctl = struct.pack(">I", seq_num) + fctl_raw[4:]
        seq_num += 1
        out.extend(make_chunk(b"fcTL", new_fctl))

        pixels = decode_rgba_frame(zdata, width, height)
        compressed = encode_quantized_frame(pixels, width, height)

        if idx == 0:
            out.extend(make_chunk(b"IDAT", compressed))
        else:
            fdat_payload = struct.pack(">I", seq_num) + compressed
            seq_num += 1
            out.extend(make_chunk(b"fdAT", fdat_payload))

    out.extend(make_chunk(b"IEND", b""))
    with open(out_path, "wb") as f:
        f.write(out)


def compress_audio(src_path: str, out_path: str) -> None:
    with tempfile.NamedTemporaryFile(suffix=".m4a", delete=False) as tmp:
        tmp_path = tmp.name
    try:
        subprocess.run(
            [
                "avconvert",
                "--preset",
                "PresetAppleM4A",
                "--source",
                src_path,
                "--output",
                tmp_path,
                "--replace",
            ],
            check=True,
        )
        subprocess.run(
            [
                "afconvert",
                "-f",
                "m4af",
                "-d",
                "aach",
                "-b",
                "48000",
                tmp_path,
                out_path,
            ],
            check=True,
        )
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    compress_apng(SRC_ANIM, OUT_ANIM)
    compress_audio(SRC_AUDIO, OUT_AUDIO)
    print(f"Compressed APNG: {os.path.getsize(OUT_ANIM)} bytes -> {OUT_ANIM}")
    print(f"Compressed Audio: {os.path.getsize(OUT_AUDIO)} bytes -> {OUT_AUDIO}")


if __name__ == "__main__":
    main()

