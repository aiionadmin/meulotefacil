#!/usr/bin/env bash
# Extrai frames WebP a partir de um MP4 para o hero scroll.
# Uso:
#   ./scripts/extract-frames.sh path/to/video.mp4
#   HERO_FRAMES=150 ./scripts/extract-frames.sh video.mp4
#
# Gera:
#   public/hero-frames/frame_0001.webp … (desktop 1920x1080)
#   public/hero-frames/mobile/frame_0001.webp … (960x540, menos frames)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IN="${1:-}"
# Defaults denser for morph-heavy client video (~15s); override via env.
DESKTOP_FRAMES="${HERO_FRAMES:-240}"
MOBILE_FRAMES="${HERO_MOBILE_FRAMES:-144}"
OUT_DESKTOP="$ROOT/public/hero-frames"
OUT_MOBILE="$OUT_DESKTOP/mobile"

if [[ -z "$IN" || ! -f "$IN" ]]; then
  echo "Uso: $0 <video.mp4>" >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null; then
  echo "ffmpeg não encontrado" >&2
  exit 1
fi

mkdir -p "$OUT_DESKTOP" "$OUT_MOBILE"
rm -f "$OUT_DESKTOP"/frame_*.webp "$OUT_MOBILE"/frame_*.webp

DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")"
FPS_D="$(python3 -c "print($DESKTOP_FRAMES/max(float('$DUR'),0.1))")"
FPS_M="$(python3 -c "print($MOBILE_FRAMES/max(float('$DUR'),0.1))")"

echo "→ Desktop: $DESKTOP_FRAMES frames @ fps≈$FPS_D"
ffmpeg -y -i "$IN" \
  -vf "fps=${FPS_D},scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" \
  -frames:v "$DESKTOP_FRAMES" \
  -c:v libwebp -quality 70 \
  "$OUT_DESKTOP/frame_%04d.webp"

echo "→ Mobile: $MOBILE_FRAMES frames @ fps≈$FPS_M"
ffmpeg -y -i "$IN" \
  -vf "fps=${FPS_M},scale=960:540:force_original_aspect_ratio=increase,crop=960:540" \
  -frames:v "$MOBILE_FRAMES" \
  -c:v libwebp -quality 65 \
  "$OUT_MOBILE/frame_%04d.webp"

# First frame as LCP poster (copy)
cp "$OUT_DESKTOP/frame_0001.webp" "$OUT_DESKTOP/poster.webp" 2>/dev/null || \
  cp "$(ls "$OUT_DESKTOP"/frame_*.webp | head -1)" "$OUT_DESKTOP/poster.webp"

echo "Pronto."
du -sh "$OUT_DESKTOP" "$OUT_MOBILE"
ls "$OUT_DESKTOP"/frame_*.webp | wc -l
ls "$OUT_MOBILE"/frame_*.webp | wc -l
