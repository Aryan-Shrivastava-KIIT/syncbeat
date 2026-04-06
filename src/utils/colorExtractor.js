// ============================================================
//  📁 src/utils/colorExtractor.js
//  🎨 Extracts dominant colors from album art using node-vibrant
// ============================================================
//
//  This is what makes the background change colors when a new song plays!
//  Vibrant.js analyzes the album artwork and finds the most prominent colors.
//
//  We extract:
//    - Vibrant  → main background color
//    - DarkVibrant → a darker version for gradients
//    - LightVibrant → for text/accent highlights
//    - Muted → subtle secondary color
// ============================================================

import Vibrant from 'node-vibrant';

/**
 * Given an album art URL, returns a palette of hex color strings.
 * Falls back to dark purple/teal if extraction fails.
 *
 * @param {string} imageUrl - URL of the album artwork
 * @returns {Promise<Object>} - { vibrant, darkVibrant, lightVibrant, muted }
 */
export const extractColors = async (imageUrl) => {
  // Default fallback colors (dark, moody, glass-friendly)
  const fallback = {
    vibrant: '#1a1a2e',
    darkVibrant: '#0d0d1a',
    lightVibrant: '#7b68ee',
    muted: '#2d2d44',
  };

  if (!imageUrl) return fallback;

  try {
    // Use a CORS proxy to load the image if needed.
    // Spotify's CDN usually allows cross-origin so this often works directly.
    const palette = await Vibrant.from(imageUrl)
      .quality(1)       // 1 = fastest (still accurate enough)
      .getPalette();

    return {
      // .getHex() returns a CSS hex string like "#3a7bd5"
      // If a swatch doesn't exist, fall back to the defaults
      vibrant:      palette.Vibrant?.getHex()      ?? fallback.vibrant,
      darkVibrant:  palette.DarkVibrant?.getHex()  ?? fallback.darkVibrant,
      lightVibrant: palette.LightVibrant?.getHex() ?? fallback.lightVibrant,
      muted:        palette.Muted?.getHex()        ?? fallback.muted,
    };
  } catch (err) {
    console.warn('Color extraction failed, using fallback:', err.message);
    return fallback;
  }
};

/**
 * Converts a hex color to rgba string with custom opacity.
 * Useful for creating glass-effect backgrounds.
 *
 * @param {string} hex - e.g. "#3a7bd5"
 * @param {number} alpha - 0.0 to 1.0
 * @returns {string} - e.g. "rgba(58, 123, 213, 0.3)"
 */
export const hexToRgba = (hex, alpha = 1) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
