# Ambient Mixer - macOS App Installation Guide

## Installation

### Option 1: Using the DMG (Recommended)

1. Open the DMG file:
   ```bash
   open "src-tauri/target/release/bundle/dmg/Ambient Mixer_0.1.0_aarch64.dmg"
   ```

2. Drag "Ambient Mixer" to your Applications folder

3. Eject the DMG and launch from Applications

### Option 2: Direct App Bundle

Copy the app bundle directly:
```bash
cp -r "src-tauri/target/release/bundle/macos/Ambient Mixer.app" /Applications/
```

Then launch from Applications or:
```bash
open "/Applications/Ambient Mixer.app"
```

## First Launch Security Note

On first launch, macOS may show a security warning because the app is not notarized. To open it:

1. Right-click (or Control-click) on the app
2. Select "Open" from the context menu
3. Click "Open" in the dialog that appears

Or via Terminal:
```bash
xattr -cr "/Applications/Ambient Mixer.app"
open "/Applications/Ambient Mixer.app"
```

## Sharing the App

To share the app with others, use the DMG file:
```
src-tauri/target/release/bundle/dmg/Ambient Mixer_0.1.0_aarch64.dmg
```

Recipients should follow the same installation steps above.

## Build from Source

To rebuild the app:
```bash
npm install
npm run tauri:build
```

The built app will be at:
- App: `src-tauri/target/release/bundle/macos/Ambient Mixer.app`
- DMG: `src-tauri/target/release/bundle/dmg/Ambient Mixer_0.1.0_aarch64.dmg`
