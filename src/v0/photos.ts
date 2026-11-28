import type { InstrumentId } from './model'
import guitare160 from '../assets/photos/guitare-160.webp'
import guitare640 from '../assets/photos/guitare-640.webp'
import piano160 from '../assets/photos/piano-160.webp'
import piano640 from '../assets/photos/piano-640.webp'
import voix160 from '../assets/photos/voix-160.webp'
import voix640 from '../assets/photos/voix-640.webp'

/**
 * Sonique V2 · finition esthétique — visuels de famille instrumentale (pack Product Design du 27/11/2026).
 * Images générées (OpenAI ImageGen), proposées à validation interne : arbitrage de la fondatrice requis avant
 * toute intégration définitive (docs/LICENCES.md). Décoratives : le titre et l’instrument sont toujours écrits.
 * Seules les familles Piano, Guitare et Voix ont une image approuvable ; les autres gardent le pictogramme.
 * Associées à l’instrument du morceau, jamais à son titre.
 */
export type InstrumentPhoto = { small: string; large: string; position: string }

export const INSTRUMENT_PHOTO: Partial<Record<InstrumentId, InstrumentPhoto>> = {
  guitar: { small: guitare160, large: guitare640, position: '50% 52%' },
  piano: { small: piano160, large: piano640, position: '50% 53%' },
  voice: { small: voix160, large: voix640, position: '62% 48%' },
}

export function instrumentPhoto(instrument?: InstrumentId) {
  return instrument ? INSTRUMENT_PHOTO[instrument] : undefined
}
