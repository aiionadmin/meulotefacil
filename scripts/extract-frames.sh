#!/usr/bin/env bash
# Extrai frames WebP a partir de um MP4 para o hero "Da terra ao lar".
# Uso:
#   ./scripts/extract-frames.sh path/to/video.mp4
#   HERO_FRAMES=300 HERO_MOBILE_FRAMES=180 ./scripts/extract-frames.sh video.mp4
#
# Gera:
#   public/hero-frames/desktop/frame_0001.webp … frame_0300.webp (1920x1080)
#   public/hero-frames/mobile/frame_0001.webp  … frame_0180.webp (1080x1920)
#   posters em cada pasta
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IN="${1:-}"
DESKTOP_FRAMES="${HERO_FRAMES:-300}"
MOBILE_FRAMES="${HERO_MOBILE_FRAMES:-180}"
OUT_DESKTOP="$ROOT/public/hero-frames/desktop"
OUT_MOBILE="$ROOT/public/hero-frames/mobile"

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
rm -f "$OUT_DESKTOP"/poster.webp "$OUT_MOBILE"/poster.webp

DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")"
FPS_D="$(python3 -c "print($DESKTOP_FRAMES/max(float('$DUR'),0.1))")"
FPS_M="$(python3 -c "print($MOBILE_FRAMES/max(float('$DUR'),0.1))")"

echo "→ Desktop: $DESKTOP_FRAMES frames @ fps≈$FPS_D (1920x1080)"
ffmpeg -y -i "$IN" \
  -vf "fps=${FPS_D},scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" \
  -frames:v "$DESKTOP_FRAMES" \
  -c:v libwebp -quality 70 \
  "$OUT_DESKTOP/frame_%04d.webp"

echo "→ Mobile: $MOBILE_FRAMES frames @ fps≈$FPS_M (1080x1920)"
ffmpeg -y -i "$IN" \
  -vf "fps=${FPS_M},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" \
  -frames:v "$MOBILE_FRAMES" \
  -c:v libwebp -quality 65 \
  "$OUT_MOBILE/frame_%04d.webp"

cp "$OUT_DESKTOP/frame_0001.webp" "$OUT_DESKTOP/poster.webp"
cp "$OUT_MOBILE/frame_0001.webp" "$OUT_MOBILE/poster.webp"

echo "Pronto."
du -sh "$OUT_DESKTOP" "$OUT_MOBILE"
echo -n "desktop frames: "; ls "$OUT_DESKTOP"/frame_*.webp | wc -l
echo -n "mobile frames:  "; ls "$OUT_MOBILE"/frame_*.webp | wc -l
