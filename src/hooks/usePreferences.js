const PREFS_KEY = 'softmurmur-preferences'

export function savePreferences(state) {
  const soundVolumes = {}
  for (const [id, s] of Object.entries(state.sounds)) {
    if (s.volume > 0) {
      soundVolumes[id] = s.volume
    }
  }

  const prefs = {
    soundVolumes,
    masterVolume: state.masterVolume,
    meanderActive: state.meanderActive,
  }

  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch (e) {
    // localStorage full or unavailable — ignore
  }
}

export function loadPreferences() {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return null
    const prefs = JSON.parse(raw)
    // Basic validation
    if (typeof prefs !== 'object' || prefs === null) return null
    return {
      soundVolumes: prefs.soundVolumes || {},
      masterVolume: typeof prefs.masterVolume === 'number' ? prefs.masterVolume : 80,
      meanderActive: !!prefs.meanderActive,
    }
  } catch (e) {
    return null
  }
}
