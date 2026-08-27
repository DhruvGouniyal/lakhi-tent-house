# Video prompts — Lakhi scroll film

Ten clips, one per scene. Generate them however you like (Higgsfield/Kling,
Runway, Veo, Sora — the prompts are written to work with any of them), drop the
folder path to me, and I'll wire them in.

---

## Read this first — it decides whether the scrubbing feels good

Scroll position maps directly onto `video.currentTime`. That makes three things
matter far more than they would for a normal marketing video:

**1. Lock the camera.** The website already supplies camera movement — each
scene dollies, pulls back, travels or orbits in GSAP. If the clip *also* moves,
the two compound and it reads as drift and seasickness. Every prompt below says
`locked static camera`. Keep it. (If you'd rather have real camera motion in a
clip, say which one and I'll reduce the site-side move for that scene.)

**2. One continuous, one-directional change.** No cuts, no loops, no returning
to the start. The clip must progress from a clear opening state to a clear
closing state, because scrolling backwards plays it in reverse and anything
cyclical turns to mush. Each prompt names its start state and end state — those
two sentences are the important part, not the adjectives.

**3. First and last frames are hero stills.** The site holds frame 0 while the
scene arrives and the final frame while it leaves. Both get looked at for a
long time. If the last frame is a mess, the transition is a mess.

**Format:** 16:9, 1920×1080, no audio. Durations are per-clip below.

**No text anywhere.** Generators love inventing fake logos and menu boards.
Any lettering in frame will look like a mistake on a real business's site.

**After generating, re-encode every clip** — this is not optional, seeking is
only as precise as the keyframe interval:

```bash
ffmpeg -i raw.mp4 -c:v libx264 -crf 22 -g 12 -keyint_min 12 \
       -sc_threshold 0 -movflags +faststart -an final.mp4
```

**Universal negative prompt** — paste into every generation:

```
camera movement, camera zoom, camera pan, camera shake, cuts, scene change,
people, faces, hands, text, lettering, signage, logo, watermark, subtitles,
duplicate objects, extra objects appearing, morphing, warping, flickering,
lighting change, background change, cartoon, illustration, oversaturated
```

**House style** — every prompt already contains this, but if you rewrite one,
keep it: *photorealistic cinematic food cinematography, shallow depth of field,
soft volumetric light, fine film grain, luxury Indian wedding catering,
warm ivory and deep burgundy and muted gold palette.*

**Chaining.** Scenes 1→2→3 share the same table and 5→6→7 share the same
banquet. If your tool supports image-to-video, feed the **last frame of the
previous clip** in as the starting image for those. It's what stops the room
changing character between courses. Marked below where it matters.

---

## 01 · `hero-table.mp4` — the empty table
**10 seconds.** Dark room, near-black. This is the opening frame of the whole
site, so it carries the most weight.

> An elegant empty banquet table in a dark atmospheric event hall, deep
> near-black background, a long ivory linen runner catching a soft pool of warm
> golden light from above, two unlit brass candle holders and empty crystal
> glassware arranged with generous empty space. Over the shot, the warm light
> slowly blooms brighter and richer as the candles softly ignite and begin to
> glow, faint dust motes drifting through the light beam. By the final frame the
> table is warmly lit and alive with candlelight, still completely empty of food.
> Locked static camera, no camera movement. Photorealistic cinematic food
> cinematography, shallow depth of field, fine film grain, muted gold and deep
> charcoal palette.

*Start:* dark, dormant table. *End:* same table, warmly glowing, still empty.

---

## 02 · `drinks.mp4` — the welcome pour
**10 seconds.** The most important clip after the hero. Chain from 01's last frame.

> A single tall crystal glass stands centred on the dark banquet table. A slow
> steady stream of chilled saffron-golden kesar milk pours down into the empty
> glass and gradually fills it to the top, the liquid swirling with fine threads
> of saffron, condensation beading on the cold glass, a few slivers of pistachio
> and rose petal settling on the surface. By the final frame the glass is
> completely full and still, garnished, catching a warm gold rim light. Locked
> static camera, no camera movement. Photorealistic cinematic beverage
> cinematography, shallow depth of field, dark warm background, fine film grain.

*Start:* empty glass. *End:* full, garnished, settled.

---

## 03 · `breakfast.mp4` — the day begins
**5 seconds.** ⚠️ **This scene is the one bright room in the whole film** — pale
ivory, morning daylight. Do not make it dark or it will fight the site's
environment cross-fade.

> A clean white ceramic plate on a pale ivory linen table in soft bright morning
> daylight, airy cream-coloured room, gauzy window light. One after another,
> breakfast dishes appear and settle onto the table around the plate — golden
> aloo poori, a small copper bowl of chole, idli with coconut chutney, a glass
> cup of masala chai with steam curling upward. By the final frame a complete
> generous breakfast spread fills the frame, steam still rising. Locked static
> camera, no camera movement. Photorealistic cinematic food cinematography,
> bright high-key lighting, soft shadows, shallow depth of field, fine film grain.

*Start:* one bare plate. *End:* full spread. *Bright throughout.*

---

## 04 · `live-counters.mp4` — counters alive
**10 seconds.** Warm amber, the most energetic beat. Widest shot in the film.

> A long live catering counter in a warm amber-lit banquet hall, a row of
> polished brass chafing stations and a glowing clay tandoor receding into soft
> focus, copper pans and fresh garnishes laid out. Over the shot the counters
> come to life — flames rise under the pans, steam billows upward from the
> chafing dishes, the tandoor mouth glows hotter and brighter, sizzling oil
> catches the light. By the final frame the entire counter line is fully alive
> with fire, steam and heat haze. Locked static camera, no camera movement. No
> people. Photorealistic cinematic food cinematography, warm amber and gold
> palette, deep shadows, volumetric light through steam, fine film grain.

*Start:* dormant counters. *End:* fully alive with fire and steam.

---

## 05 · `starters.mp4` — the platter
**5 seconds.** Back to dark warm. Chain into 06.

> A large dark slate serving platter centred on a dark table under a warm pool
> of light. One by one, tandoor starters appear and arrange themselves across
> the platter — charred paneer tikka, seekh kebabs, hara bhara kebab, chicken
> tikka with a wedge of lime and rings of red onion, faint smoke curling from the
> charred edges. By the final frame the platter is completely full and
> beautifully arranged, smoke still drifting. Locked static camera, no camera
> movement. Photorealistic cinematic food cinematography, dark warm background,
> dramatic side light, shallow depth of field, fine film grain.

*Start:* empty platter. *End:* full, arranged, smoking gently.

---

## 06 · `main-course.mp4` — the centrepiece
**10 seconds.** Deepest, richest scene — burgundy and copper.

> A large ornate copper handi sits closed on a deep burgundy cloth in rich
> low light, hammered metal catching warm gold highlights. The domed lid slowly
> lifts and rises away, releasing a thick billow of fragrant steam, revealing
> a deep red butter-chicken curry inside with a swirl of cream and a scattering
> of fresh coriander, the surface glistening. By the final frame the handi stands
> fully open and steaming, the curry rich and glossy. Locked static camera, no
> camera movement. Photorealistic cinematic food cinematography, deep burgundy
> and copper palette, dramatic chiaroscuro lighting, volumetric steam, fine
> film grain.

*Start:* closed handi. *End:* open, steaming, revealed.

---

## 07 · `breads-rice.mp4` — from the tandoor
**5 seconds.** Fire amber, shortest clip.

> The glowing mouth of a clay tandoor oven from above, orange embers and flame
> light pulsing from within, freshly baked naan breads stuck to the hot clay
> walls, blistered and golden. One after another the breads lift up and out of
> the oven and come to rest stacked on a brass platter beside it, brushed with
> melting butter, alongside a mound of saffron rice. By the final frame the
> platter is stacked with breads and the oven glows behind. Locked static camera,
> no camera movement. Photorealistic cinematic food cinematography, intense warm
> orange firelight, deep shadows, fine film grain.

*Start:* breads in the oven. *End:* stacked on the platter.

---

## 08 · `asian.mp4` — the wok
**10 seconds.** ⚠️ **Deliberately breaks the wedding palette** — cold near-black
kitchen, the only cool scene. Fire is the sole warm element.

> A black carbon-steel wok on a burner in a dark professional kitchen, cold
> near-black background, single hard light source. The empty wok begins to smoke,
> then a burst of orange flame erupts beneath it, vegetables and noodles drop in
> and are tossed high in an arc, flames licking up the sides, steam and wok hei
> smoke billowing. By the final frame the dish is complete and glossy in the wok,
> smoke still rising. Locked static camera, no camera movement. No people, no
> hands. Photorealistic cinematic food cinematography, cold dark background with
> hot orange firelight, high contrast, fine film grain.

*Start:* empty cold wok. *End:* finished dish, smoke rising.

---

## 09 · `desserts.mp4` — a sweet finish
**5 seconds.** Warm, soft, rose-cream. The gentlest clip in the film.

> A single elegant dessert plated on fine bone china in soft warm light —
> a quenelle of kulfi beside warm golden jalebi, with a scattering of crushed
> pistachio and dried rose petals. A slow ribbon of warm rabri is drizzled over
> the top, pooling gently on the plate, silver leaf catching the light. By the
> final frame the dessert is fully plated and still, glistening. Locked static
> camera, no camera movement. Photorealistic cinematic dessert cinematography,
> soft warm rose and cream palette, delicate diffused lighting, shallow depth
> of field, fine film grain.

*Start:* plated dessert. *End:* finished with drizzle.

---

## 10 · `final-celebration.mp4` — the payoff
**10 seconds.** The reveal the whole film builds to. ⚠️ **The one clip where
camera movement is wanted** — a slow pull back. Tell me if you generate it
locked instead and I'll add the retreat in GSAP.

> A grand Indian wedding banquet hall at night, seen from a long fully-laid
> celebration table in the foreground glittering with brass, candlelight,
> crystal and marigold garlands. The view slowly and smoothly pulls back to
> reveal the entire hall — row after row of laid tables, hanging warm string
> lights, draped fabric canopies, everything golden and alive. By the final
> frame the whole vast celebration is visible. Slow steady dolly back, smooth
> and continuous, no shake. Photorealistic cinematic event cinematography,
> golden hour warmth, deep rich shadows, volumetric light, fine film grain,
> luxury Indian wedding.

*Start:* tight on one table. *End:* the entire hall.

---

---
---

# Part 2 — the transformation clips

Your brief called out five moments that are *transitions*, not scenes:
drink→breakfast (03), breakfast→counters (05), counters→starters (07),
starters→main course (08), wok→dessert (11).

Right now those are done in GSAP — scale, blur, clip-path wipes, camera moves.
That works, but a real filmed transformation is the single biggest upgrade
available to this site, because the transitions are where "one long shot" is
either believed or not.

**Status: all six are generated and wired in.** The film is now sixteen beats —
ten scenes and six filmed transitions — and these clips are live. To replace
one, overwrite the file and reload.

A transformation clip has one extra rule on top of the three above: **its first
frame must match the previous scene's last frame, and its last frame must match
the next scene's first frame.** That is the entire job. If your tool does
image-to-video, feed in the previous clip's final frame; if it supports an end
frame too, give it the next clip's opening frame.

---

## T1 · `transition-drink-breakfast.mp4` — dark table into morning
**5 seconds.** The hardest and most valuable one: it crosses from the dark
room into the single bright scene in the film.

> A full glass of saffron milk on a dark banquet table in warm candlelight. The
> view slowly draws back from the glass as the light in the room shifts and
> lifts — the darkness lifting into pale bright morning daylight, the linen
> turning from shadowed gold to clean ivory, the glass drifting out of focus at
> the edge of frame while a clean white breakfast plate settles into the centre.
> By the final frame the room is fully bright, airy and cream-coloured, with an
> empty plate centred on ivory linen in soft morning light. Slow continuous
> transformation, no cuts. Photorealistic cinematic food cinematography, shallow
> depth of field, fine film grain.

*Start:* dark, glass. *End:* bright, empty plate. **Light must fully change.**

---

## T2 · `transition-breakfast-counters.mp4` — morning into service
**5 seconds.** Bright and calm becoming warm and energetic.

> A bright ivory breakfast table in soft morning daylight. The scene transforms
> as the daylight warms and deepens into rich amber service lighting, the quiet
> table giving way to a long live catering counter — brass chafing stations and
> a clay tandoor rising into place, burners catching flame, the first wisps of
> steam beginning to lift. By the final frame the frame is a warm amber-lit live
> counter line, alive and steaming. Slow continuous transformation, no cuts. No
> people. Photorealistic cinematic food cinematography, fine film grain.

*Start:* bright breakfast. *End:* amber counters alive.

---

## T3 · `transition-counters-starters.mp4` — through the counter to the platter
**5 seconds.** The one place a forward camera move is right.

> A warm amber live catering counter alive with steam and flame. The view moves
> slowly and steadily forward through the counter line, the stations sliding
> past and falling away into soft focus on either side, until it comes to rest
> on a large empty dark slate serving platter waiting under a pool of warm light.
> By the final frame the platter fills the centre of the frame, empty and lit,
> the counters gone into darkness behind. Slow steady forward dolly, smooth and
> continuous, no shake, no cuts. Photorealistic cinematic food cinematography,
> deep shadows, fine film grain.

*Start:* wide counters. *End:* tight on an empty platter.

---

## T4 · `transition-starters-main.mp4` — platter into copper
**5 seconds.** The heaviest, richest transition in the film.

> A dark slate platter of tandoor starters under warm light. The scene grows
> deeper and richer as the light shifts from warm gold toward deep burgundy, the
> platter receding and giving way to a large ornate hammered copper handi rising
> into the centre of the frame, closed and gleaming, set on deep burgundy cloth.
> By the final frame the copper handi stands closed and centred in rich low
> light. Slow continuous transformation, no cuts. Photorealistic cinematic food
> cinematography, dramatic chiaroscuro lighting, deep burgundy and copper
> palette, fine film grain.

*Start:* starters platter. *End:* closed copper handi.

---

## T5 · `transition-wok-dessert.mp4` — through darkness into sweetness
**5 seconds.** The brief asked for this one to be dramatic.

> A finished dish smoking in a black wok in a cold dark kitchen. The frame falls
> away into near-total darkness as the smoke thins and disperses, holding on
> black for a beat. Then a soft warm light blooms from above and a single
> elegant dessert on fine bone china emerges gently out of the darkness into
> view — kulfi, jalebi, crushed pistachio, rose petals. By the final frame the
> dessert sits plated and still in soft warm rose light. Slow continuous
> transformation, no cuts. Photorealistic cinematic dessert cinematography,
> shallow depth of field, fine film grain.

*Start:* dark wok. *End:* plated dessert in warm light.

---

### Optional sixth

`transition-tandoor-wok.mp4` — the film's other big palette break, from amber
firelight into the cold black kitchen. Not in your brief, but it is the one
remaining boundary where the environment changes hard:

> The glowing orange mouth of a clay tandoor with stacked naan beside it. The
> warm firelight drains away and cools as the frame darkens to near-black, the
> tandoor receding, until a black carbon-steel wok sits empty on a burner in a
> cold dark professional kitchen lit by one hard light. Slow continuous
> transformation, no cuts. Photorealistic cinematic food cinematography, warm to
> cold colour shift, high contrast, fine film grain.

---

## When you're done

Name the files exactly as the headings above, put them in one folder, and give
me the path. I'll re-encode for scrubbing, QC each one with a contact sheet
(checking for morphing, drift and lighting jumps), drop them in and retune each
scene's scroll length to its actual clip duration.

Any clip that disappoints is independently regenerable — one bad clip never
means redoing the set. Send what you have even if some are missing; scenes
without a file keep their current placeholder and the site still works.
