/**
 * Sound Effects Download Guide & Helper Script
 *
 * The BBC Sound Effects API requires browser authentication.
 * This script provides manual download instructions and checks existing files.
 *
 * Usage: node scripts/download-sounds.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'sounds')
const MANIFEST_PATH = path.join(__dirname, '..', 'sounds-manifest.json')

// Sound categories with recommended free sources
const SOUND_SOURCES = [
  {
    id: 'rain',
    name: 'Rain',
    freesound: 'https://freesound.org/search/?q=rain+loop+ambience',
    bbc: 'https://sound-effects.bbcrewind.co.uk/search?q=rain',
    pixabay: 'https://pixabay.com/sound-effects/search/rain%20ambient/'
  },
  {
    id: 'thunder',
    name: 'Thunder',
    freesound: 'https://freesound.org/search/?q=thunder+storm+ambience',
    bbc: 'https://sound-effects.bbcrewind.co.uk/search?q=thunder',
    pixabay: 'https://pixabay.com/sound-effects/search/thunder/'
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    freesound: 'https://freesound.org/search/?q=ocean+waves+loop',
    bbc: 'https://sound-effects.bbcrewind.co.uk/search?q=ocean',
    pixabay: 'https://pixabay.com/sound-effects/search/ocean%20waves/'
  },
  {
    id: 'wind',
    name: 'Wind',
    freesound: 'https://freesound.org/search/?q=wind+ambience+loop',
    bbc: 'https://sound-effects.bbcrewind.co.uk/search?q=wind',
    pixabay: 'https://pixabay.com/sound-effects/search/wind%20ambient/'
  },
  {
    id: 'fire',
    name: 'Fire',
    freesound: 'https://freesound.org/search/?q=fireplace+crackling+loop',
    bbc: 'https://sound-effects.bbcrewind.co.uk/search?q=fire',
    pixabay: 'https://pixabay.com/sound-effects/search/fireplace/'
  },
  {
    id: 'birds',
    name: 'Birds',
    freesound: 'https://freesound.org/search/?q=birds+singing+ambience',
    bbc: 'https://sound-effects.bbcrewind.co.uk/search?q=birds',
    pixabay: 'https://pixabay.com/sound-effects/search/birds%20singing/'
  },
  {
    id: 'crickets',
    name: 'Crickets',
    freesound: 'https://freesound.org/search/?q=crickets+night+ambience',
    bbc: 'https://sound-effects.bbcrewind.co.uk/search?q=crickets',
    pixabay: 'https://pixabay.com/sound-effects/search/crickets/'
  },
  {
    id: 'coffeeshop',
    name: 'Coffee Shop',
    freesound: 'https://freesound.org/search/?q=coffee+shop+cafe+ambience',
    bbc: 'https://sound-effects.bbcrewind.co.uk/search?q=cafe',
    pixabay: 'https://pixabay.com/sound-effects/search/cafe%20ambience/'
  },
  {
    id: 'forest',
    name: 'Forest',
    freesound: 'https://freesound.org/search/?q=forest+nature+ambience',
    bbc: 'https://sound-effects.bbcrewind.co.uk/search?q=forest',
    pixabay: 'https://pixabay.com/sound-effects/search/forest%20ambience/'
  },
  {
    id: 'stream',
    name: 'Stream',
    freesound: 'https://freesound.org/search/?q=stream+brook+water+flowing',
    bbc: 'https://sound-effects.bbcrewind.co.uk/search?q=stream',
    pixabay: 'https://pixabay.com/sound-effects/search/stream%20water/'
  }
]

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function checkExistingSounds() {
  ensureDir(OUTPUT_DIR)
  const existing = []
  const missing = []

  for (const sound of SOUND_SOURCES) {
    const filepath = path.join(OUTPUT_DIR, `${sound.id}.mp3`)
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath)
      if (stats.size > 10000) { // More than 10KB (not a placeholder)
        existing.push({ ...sound, size: stats.size })
      } else {
        missing.push(sound)
      }
    } else {
      missing.push(sound)
    }
  }

  return { existing, missing }
}

function generateManifest(existing) {
  const manifest = {
    sounds: existing.map(s => ({
      id: s.id,
      name: s.name,
      filename: `${s.id}.mp3`,
      source: 'User provided',
      license: 'See source'
    })),
    generatedAt: new Date().toISOString()
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  console.log('\n📄 Manifest written to sounds-manifest.json')
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function printDownloadGuide(missing) {
  if (missing.length === 0) {
    console.log('\n✅ All sound files are present!')
    return
  }

  console.log(`
================================================================================
🎵 SOUND DOWNLOAD GUIDE
================================================================================

You need to download ${missing.length} sound file(s).

📁 Save files to: ${OUTPUT_DIR}
📝 File naming: Use the exact filename shown (e.g., rain.mp3)
⏱️  Duration: Look for sounds > 30 seconds (for seamless looping)
📄 License: Prefer CC0 or CC-BY licensed sounds

================================================================================
FREE SOURCES (No Account Required)
================================================================================

1. 🟢 Pixabay Sound Effects (https://pixabay.com/sound-effects/)
   - Free for commercial use, no attribution required
   - Direct MP3 download

2. 🟢 Mixkit (https://mixkit.co/free-sound-effects/)
   - Free for commercial use, no attribution required

================================================================================
FREE SOURCES (Account Required)
================================================================================

3. 🟡 Freesound.org (https://freesound.org/)
   - Free account required
   - Many CC0/CC-BY sounds, largest variety

4. 🟡 BBC Sound Effects (https://sound-effects.bbcrewind.co.uk/)
   - BBC account required
   - Personal/Educational use, high quality

================================================================================
MISSING SOUNDS (${missing.length})
================================================================================
`)

  for (const sound of missing) {
    console.log(`
📢 ${sound.name} → Save as: ${sound.id}.mp3
   ├─ Pixabay: ${sound.pixabay}
   ├─ Freesound: ${sound.freesound}
   └─ BBC: ${sound.bbc}`)
  }

  console.log(`
================================================================================
💡 TIPS
================================================================================

• After downloading, rename files to match: rain.mp3, thunder.mp3, etc.

• If a file is WAV format, convert to MP3:
  ffmpeg -i input.wav -codec:a libmp3lame -qscale:a 2 output.mp3

• For seamless looping, look for sounds that:
  - Fade in/out naturally
  - Have consistent ambient noise throughout
  - Are at least 30 seconds long

• Run this script again after downloading to update the manifest.

================================================================================
`)
}

function main() {
  console.log('🎧 Ambient Mixer - Sound Download Helper')
  console.log('=========================================\n')

  const { existing, missing } = checkExistingSounds()

  if (existing.length > 0) {
    console.log(`✅ Found ${existing.length} existing sound file(s):`)
    for (const sound of existing) {
      console.log(`   ✓ ${sound.id}.mp3 - ${sound.name} (${formatSize(sound.size)})`)
    }
  }

  if (missing.length > 0) {
    console.log(`\n❌ Missing ${missing.length} sound file(s):`)
    for (const sound of missing) {
      console.log(`   ✗ ${sound.id}.mp3 - ${sound.name}`)
    }
  }

  generateManifest(existing)
  printDownloadGuide(missing)
}

main()
