#!/usr/bin/env bash
# Extrai frames WebP a partir de um MP4 para o hero scroll.
# Uso:
#   ./scripts/extract-frames.sh path/to/video.mp4
#   HERO_FRAMES=150 ./scripts/extract-frames.sh video.mp4
#
# Gera:
#   public/hero-frames/frame_0001.webp … (desktop 1920x1080 Full HD)
#   public/hero-frames/mobile/frame_0001.webp … (também 1920x1080, menos frames)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IN="${1:-}"
# Defaults denser for morph-heavy client video (~15s); override via env.
DESKTOP_FRAMES="${HERO_FRAMES:-240}"
MOBILE_FRAMES="${HERO_MOBILE_FRAMES:-144}"
# Resolução obrigatória do hero (Full HD).
FRAME_W="${HERO_FRAME_W:-1920}"
FRAME_H="${HERO_FRAME_H:-1080}"
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

echo "→ Desktop: $DESKTOP_FRAMES frames @ ${FRAME_W}x${FRAME_H} fps≈$FPS_D"
ffmpeg -y -i "$IN" \
  -vf "fps=${FPS_D},scale=${FRAME_W}:${FRAME_H}:force_original_aspect_ratio=increase,crop=${FRAME_W}:${FRAME_H}" \
  -frames:v "$DESKTOP_FRAMES" \
  -c:v libwebp -quality 82 \
  "$OUT_DESKTOP/frame_%04d.webp"

echo "→ Mobile: $MOBILE_FRAMES frames @ ${FRAME_W}x${FRAME_H} fps≈$FPS_M"
ffmpeg -y -i "$IN" \
  -vf "fps=${FPS_M},scale=${FRAME_W}:${FRAME_H}:force_original_aspect_ratio=increase,crop=${FRAME_W}:${FRAME_H}" \
  -frames:v "$MOBILE_FRAMES" \
  -c:v libwebp -quality 75 \
  "$OUT_MOBILE/frame_%04d.webp"

# First frame as LCP poster (copy)
cp "$OUT_DESKTOP/frame_0001.webp" "$OUT_DESKTOP/poster.webp" 2>/dev/null || \
  cp "$(ls "$OUT_DESKTOP"/frame_*.webp | head -1)" "$OUT_DESKTOP/poster.webp"

echo "Pronto."
du -sh "$OUT_DESKTOP" "$OUT_MOBILE"
ls "$OUT_DESKTOP"/frame_*.webp | wc -l
ls "$OUT_MOBILE"/frame_*.webp | wc -l
