#!/usr/bin/env python3
"""
Video to MP4 Converter
Converts any video file to MP4 format with high quality and reasonable speed.
Requires FFmpeg to be installed and available in PATH.
"""

import subprocess
import sys
import os
import argparse
from pathlib import Path


def check_ffmpeg():
    """Check if FFmpeg is installed and available."""
    try:
        subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            check=True,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def convert_to_mp4(
    input_file: str,
    output_file: str = None,
    crf: int = 18,
    preset: str = "fast",
    audio_bitrate: str = "192k"
) -> bool:
    """
    Convert a video file to MP4 format.

    Args:
        input_file: Path to the input video file
        output_file: Path for the output MP4 file (optional, auto-generated if not provided)
        crf: Constant Rate Factor (0-51, lower = better quality, 18 is visually lossless)
        preset: Encoding speed preset (ultrafast, superfast, veryfast, faster, fast,
                medium, slow, slower, veryslow) - faster = larger file, slower = smaller file
        audio_bitrate: Audio bitrate (e.g., "192k", "256k", "320k")

    Returns:
        True if conversion successful, False otherwise
    """
    input_path = Path(input_file)

    if not input_path.exists():
        print(f"Error: Input file '{input_file}' not found.")
        return False

    # Generate output filename if not provided
    if output_file is None:
        output_file = str(input_path.with_suffix(".mp4"))
        # Avoid overwriting if input is already mp4
        if output_file == str(input_path):
            output_file = str(input_path.with_stem(input_path.stem + "_converted").with_suffix(".mp4"))

    output_path = Path(output_file)

    # FFmpeg command for high-quality MP4 conversion
    # - libx264: H.264 codec (widely compatible, excellent quality)
    # - CRF 18: Near-lossless quality (range 0-51, lower is better)
    # - fast preset: Good balance between speed and compression
    # - AAC audio: Standard audio codec for MP4
    # - movflags +faststart: Enables streaming/quick start playback
    cmd = [
        "ffmpeg",
        "-i", str(input_path),
        "-c:v", "libx264",           # Video codec
        "-crf", str(crf),            # Quality (18 = visually lossless)
        "-preset", preset,           # Speed/compression tradeoff
        "-c:a", "aac",               # Audio codec
        "-b:a", audio_bitrate,       # Audio bitrate
        "-movflags", "+faststart",   # Enable fast start for streaming
        "-y",                        # Overwrite output file if exists
        str(output_path)
    ]

    print(f"Converting: {input_path.name}")
    print(f"Output: {output_path.name}")
    print(f"Settings: CRF={crf}, Preset={preset}, Audio={audio_bitrate}")
    print("-" * 50)

    try:
        # Run FFmpeg with progress output
        process = subprocess.run(
            cmd,
            capture_output=False,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
        )

        if process.returncode == 0:
            output_size = output_path.stat().st_size / (1024 * 1024)
            print("-" * 50)
            print(f"Success! Output file: {output_path}")
            print(f"File size: {output_size:.2f} MB")
            return True
        else:
            print(f"Error: FFmpeg exited with code {process.returncode}")
            return False

    except Exception as e:
        print(f"Error during conversion: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Convert video files to MP4 with high quality",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python video_to_mp4.py video.avi
  python video_to_mp4.py video.mkv -o output.mp4
  python video_to_mp4.py video.mov --crf 20 --preset medium
  python video_to_mp4.py video.webm --crf 16 --preset slow  # Maximum quality

Quality Guide (CRF values):
  0-17  : Visually lossless (large files)
  18-23 : High quality (recommended)
  24-28 : Medium quality
  29-51 : Low quality (small files)

Preset Guide (speed vs file size):
  ultrafast : Fastest, largest file
  fast      : Good balance (default)
  medium    : Slower, smaller file
  slow      : Much slower, best compression
        """
    )

    parser.add_argument("input", help="Input video file path")
    parser.add_argument("-o", "--output", help="Output MP4 file path (optional)")
    parser.add_argument(
        "--crf",
        type=int,
        default=18,
        choices=range(0, 52),
        metavar="0-51",
        help="Quality level: 0=lossless, 18=visually lossless (default), 23=default, 51=worst"
    )
    parser.add_argument(
        "--preset",
        default="fast",
        choices=["ultrafast", "superfast", "veryfast", "faster", "fast",
                 "medium", "slow", "slower", "veryslow"],
        help="Encoding speed preset (default: fast)"
    )
    parser.add_argument(
        "--audio-bitrate",
        default="192k",
        help="Audio bitrate (default: 192k, use 256k or 320k for higher quality)"
    )

    args = parser.parse_args()

    # Check FFmpeg installation
    if not check_ffmpeg():
        print("Error: FFmpeg is not installed or not in PATH.")
        print("Please install FFmpeg: https://ffmpeg.org/download.html")
        print("On Windows, you can use: winget install FFmpeg")
        sys.exit(1)

    # Run conversion
    success = convert_to_mp4(
        input_file=args.input,
        output_file=args.output,
        crf=args.crf,
        preset=args.preset,
        audio_bitrate=args.audio_bitrate
    )

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
