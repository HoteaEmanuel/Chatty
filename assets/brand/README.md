# Chatty — conversation weave

Approved direction: two interlocking off-white and lime speech forms on black.
The master was prepared using the built-in image generation tool, then exported
with Sharp. PNG is the source format; these are not editable vector assets.

## Files

- `conversation-weave-master.png`: transparent high-resolution source.
- `app-icon-1024.png`: opaque square iOS/store master.
- `google-play-icon-512.png`: opaque Google Play icon.
- `../../src/assets/chatty-icon*.png`: 1x, 2x, 3x in-app icon.
- Android resources: legacy square/round icons, adaptive foregrounds,
  Android 13 monochrome layers, and splash images at each density.
- iOS asset catalogs: iPhone/iPad/App Store icons and 1x/2x/3x splash images.
- `../bootsplash`: matching JavaScript splash assets; 100pt logo on black.

Regenerate from the repository root:

```sh
node scripts/generate-brand-assets.cjs
```

The generator uses Sharp from the installed BootSplash tooling. Launcher icons
use platform masking; in-app icons have rounded corners in `AppIcon.tsx`.

## Final generation prompt

Background extraction of the attached approved logo. Preserve logo geometry and
colors exactly. Output RGBA PNG with alpha=0 outside the two colored shapes and
in the gap between them. Remove the dark halo. IMPORTANT real alpha transparency,
NEVER draw checkerboard squares or any representation of transparency. Only two
smooth solid shapes, upper left ivory and lower right lime. Clean flat logo, no
texture, no glow. The whole image background is transparent.

## Platform references

- [Android adaptive icons](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive)
- [Apple icon asset catalogs](https://developer.apple.com/documentation/xcode/configuring-your-app-icon)
