# Prompt — vídeo hero (Veo 3 / Sora / Runway Gen-4 / Kling)

Gerar como **UM ÚNICO PLANO CONTÍNUO**, sem cortes (essencial para scrub). Se a ferramenta limitar a duração, gerar 4 clipes usando o último frame de cada um como primeiro frame do próximo.

## PROMPT (inglês)

A single continuous cinematic aerial drone shot, photorealistic, 4K, 16:9, 24fps, 16 seconds, no cuts. Time-lapse of a residential subdivision being built in the Brazilian countryside, seen from the same slow drone path. The camera starts high and wide, then glides slowly forward and descends gently while orbiting 30 degrees to the right, ending at a low angle over a finished street.

Stage 1 (0–4s): an empty plot of gently rolling land with red-brown Brazilian soil and patches of green grass, surrounded by lush tropical trees and hills, early morning light.

Stage 2 (4–8s): in fast time-lapse, excavators and graders open curved streets, curbs and sidewalks appear, lots are demarcated with white survey stakes, utility poles rise.

Stage 3 (8–12s): rows of modern single-story and two-story houses rise in time-lapse — concrete foundations, ceramic brick walls, roof structures, gray and terracotta roof tiles being laid. Small workers in orange vests and white helmets, cement mixer trucks, scaffolding.

Stage 4 (12–16s): the neighborhood is complete at golden hour — white and beige modern houses with large glass windows, green lawns, young trees along paved streets, warm lights turning on inside the homes, a few cars in driveways, a family walking on the sidewalk in the distance.

Lighting progresses smoothly from soft morning to warm golden sunset. Stable, smooth, gimbal-like camera movement at constant speed, no shake, no sudden motion. Consistent geography throughout: same streets, same hills, same layout. Warm, optimistic, premium real-estate commercial look, natural colors, slight atmospheric haze, high detail.

## NEGATIVE PROMPT

cuts, scene changes, text, logos, watermark, subtitles, distorted or melting buildings, warped geometry, inconsistent layout, flicker, jitter, camera shake, fast zoom, fisheye, cartoon, CGI look, oversaturated, night, rain, fog, close-up faces.

## VERTICAL (mobile)

Mesmo prompt; trocar "16:9" por "9:16" e o movimento de câmera por "slow vertical tilt-down from sky to street level".

## Pós-geração

Exportar MP4 e rodar `scripts/extract-frames.sh`. Alvo: 150 frames desktop / 90 mobile, total abaixo de ~8 MB.
