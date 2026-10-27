#!/usr/bin/env python3
"""AEGIS PRIME v0.8 — local speech-to-text helper (Vosk, offline, no cloud).

Usage: python stt_transcribe.py --model <model-dir> --wav <16kHz-mono-16bit-wav>
Prints exactly one JSON line to stdout: {"text": "..."}.
Exits non-zero with a plain error on stderr for: missing vosk, missing model,
missing wav, or a wav that is not 16 kHz / mono / 16-bit PCM.

The renderer records the microphone at 16 kHz mono and encodes a WAV; this
script only transcribes that file. It never uploads audio anywhere.
"""
import argparse
import json
import sys
import wave


def fail(msg):
    print("STT error: " + msg, file=sys.stderr)
    sys.exit(2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--wav", required=True)
    args = ap.parse_args()

    try:
        from vosk import KaldiRecognizer, Model
    except ImportError:
        fail("vosk Python package nahi mila — pip install vosk chalao (README dekho)")

    try:
        model = Model(args.model)
    except Exception as e:  # model dir missing / corrupt
        fail("Vosk model load nahi hua (%s) — stt-models/ folder check karo" % args.model)

    try:
        wf = wave.open(args.wav, "rb")
    except Exception:
        fail("WAV file khol nahi paya: %s" % args.wav)
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
        fail("WAV format galat hai — 16 kHz, mono, 16-bit PCM chahiye (mila: %d ch, %d bytes, %d Hz)"
             % (wf.getnchannels(), wf.getsampwidth(), wf.getframerate()))

    rec = KaldiRecognizer(model, wf.getframerate())
    parts = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            parts.append(json.loads(rec.Result()).get("text", ""))
    parts.append(json.loads(rec.FinalResult()).get("text", ""))
    print(json.dumps({"text": " ".join(p for p in parts if p).strip()}))


if __name__ == "__main__":
    main()
