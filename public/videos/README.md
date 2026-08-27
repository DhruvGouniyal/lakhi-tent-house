# Drop clips here

The film reads these filenames. A missing file is fine — the scene falls back
to its procedural placeholder automatically. Replacing a placeholder with the
real thing means dropping the file in and reloading. Nothing else to change.

| Scene | Expected file |
|-------|---------------|
| 01 The table      | `hero-table.mp4` |
| 02 Welcome drink  | `drinks.mp4` |
| 03 Breakfast      | `breakfast.mp4` |
| 04 Live counters  | `live-counters.mp4` |
| 05 Starters       | `starters.mp4` |
| 06 Main course    | `main-course.mp4` |
| 07 Breads & rice  | `breads-rice.mp4` |
| 08 Asian / wok    | `asian.mp4` |
| 09 Desserts       | `desserts.mp4` |
| 10 Celebration    | `final-celebration.mp4` |

Filenames are defined in `src/lib/scenes.ts` — change them there if you prefer
different names.

## Encoding notes

Scrubbing needs frequent keyframes or seeking will feel sticky. Re-encode
generated clips with:

    ffmpeg -i in.mp4 -c:v libx264 -crf 22 -g 12 -keyint_min 12 \
           -sc_threshold 0 -movflags +faststart -an out.mp4

`-g 12` puts a keyframe every ~0.5s at 24fps, which is what makes
`currentTime` scrubbing land instantly instead of decoding a long GOP.
Strip audio (`-an`) — the film never plays sound.
