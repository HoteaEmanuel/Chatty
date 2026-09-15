// Run from the project root: node scripts/generate-brand-assets.cjs
// sharp is supplied by the installed react-native-bootsplash tooling.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const master = path.join(root, 'assets/brand/conversation-weave-master.png');
const res = 'android/app/src/main/res';
const ios = 'ios/ChatApp/Images.xcassets';
const densities = { ldpi: 0.75, mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

async function save(file, data) {
  const target = path.join(root, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, data);
}

async function icon(size, round = false) {
  const mark = await sharp(master).resize(Math.round(size * 0.88)).toBuffer();
  let result = sharp({ create: { width: size, height: size, channels: 4, background: '#000000' } })
    .composite([{ input: mark, gravity: 'centre' }]);
  if (round) {
    const buffer = await result.png().toBuffer();
    result = sharp(buffer).composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`), blend: 'dest-in' }]);
  } else {
    result = result.removeAlpha();
  }
  return result.png().toBuffer();
}

async function main() {
  await save('assets/brand/app-icon-1024.png', await icon(1024));
  await save('assets/brand/google-play-icon-512.png', await icon(512));
  for (const [suffix, size] of [['', 64], ['@2x', 128], ['@3x', 192]]) {
    await save(`src/assets/chatty-icon${suffix}.png`, await icon(size));
  }
  // Android foreground: the artwork occupies roughly 55% of the 108dp canvas.
  // The remaining space allows launcher masks and parallax without clipping.
  for (const [density, scale] of Object.entries(densities)) {
    const dir = `${res}/mipmap-${density}`;
    await save(`${dir}/ic_launcher.png`, await icon(Math.round(48 * scale)));
    const round = await icon(Math.round(48 * scale), true);
    await save(`${dir}/ic_launcher_round.png`, round);
    await save(`${dir}/ic_launcher_round_round.png`, round);
    const canvas = Math.round(108 * scale);
    const mark = await sharp(master).resize(Math.round(72 * scale)).toBuffer();
    const foreground = await sharp({ create: { width: canvas, height: canvas, channels: 4, background: '#00000000' } })
      .composite([{ input: mark, gravity: 'centre' }]).png().toBuffer();
    await save(`${dir}/ic_launcher_round_foreground.png`, foreground);
    const alpha = await sharp(foreground).extractChannel('alpha').toBuffer();
    const monochrome = await sharp({ create: { width: canvas, height: canvas, channels: 3, background: '#ffffff' } })
      .joinChannel(alpha).png().toBuffer();
    await save(`${dir}/ic_launcher_monochrome.png`, monochrome);
    if (density !== 'ldpi') {
      const splashCanvas = Math.round(288 * scale);
      const splashMark = await sharp(master).resize(Math.round(100 * scale)).toBuffer();
      const splash = await sharp({ create: { width: splashCanvas, height: splashCanvas, channels: 4, background: '#00000000' } })
        .composite([{ input: splashMark, gravity: 'centre' }]).png().toBuffer();
      await save(`${res}/drawable-${density}/bootsplash_logo.png`, splash);
    }
  }
  const adaptive = '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n  <background android:drawable="@color/ic_launcher_background"/>\n  <foreground android:drawable="@mipmap/ic_launcher_round_foreground"/>\n  <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>\n</adaptive-icon>\n';
  for (const name of ['ic_launcher', 'ic_launcher_round']) {
    await save(`${res}/mipmap-anydpi-v33/${name}.xml`, adaptive);
  }
  const catalogPath = path.join(root, ios, 'AppIcon.appiconset/Contents.json');
  const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
  // 76pt belongs to iPad; remove the legacy invalid iPhone entry.
  catalog.images = catalog.images.filter(entry => !(entry.idiom === 'iphone' && entry.size === '76x76'));
  for (const entry of catalog.images) {
    const size = Math.round(parseFloat(entry.size) * parseFloat(entry.scale));
    await save(`${ios}/AppIcon.appiconset/${entry.filename}`, await icon(size));
  }
  await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
  for (const scale of [1, 2, 3]) {
    const suffix = scale === 1 ? '' : `@${scale}x`;
    await save(`${ios}/BootSplashLogo-ac8972.imageset/logo-ac8972${suffix}.png`, await sharp(master).resize(100 * scale).png().toBuffer());
  }
  for (const [suffix, scale] of [['', 1], ['@1,5x', 1.5], ['@2x', 2], ['@3x', 3], ['@4x', 4]]) {
    await save(`assets/bootsplash/logo${suffix}.png`, await sharp(master).resize(100 * scale).png().toBuffer());
  }
  console.log('Generated Android, iOS, splash, in-app, and store PNG assets.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
