import type { DeepgramVoice } from '@/types/voice'

export const PREVIEW_TEXT =
  'Take a slow, deep breath in. Feel the air filling your lungs. Now gently exhale, releasing any tension.'

export const deepgramVoices: DeepgramVoice[] = [
  // Recommended voices for meditation (calm, smooth, soothing)
  { id: 'aura-2-athena-en', name: 'Athena', gender: 'female', accent: 'American', traits: 'Calm, warm, wise', recommended: true },
  { id: 'aura-2-pandora-en', name: 'Pandora', gender: 'female', accent: 'American', traits: 'Soft, gentle, soothing', recommended: true },
  { id: 'aura-2-harmonia-en', name: 'Harmonia', gender: 'female', accent: 'American', traits: 'Balanced, peaceful, melodic', recommended: true },
  { id: 'aura-2-cora-en', name: 'Cora', gender: 'female', accent: 'American', traits: 'Serene, steady, nurturing', recommended: true },
  { id: 'aura-2-luna-en', name: 'Luna', gender: 'female', accent: 'American', traits: 'Ethereal, dreamy, soft', recommended: true },
  { id: 'aura-2-pluto-en', name: 'Pluto', gender: 'male', accent: 'American', traits: 'Deep, grounding, calm', recommended: true },
  { id: 'aura-2-odysseus-en', name: 'Odysseus', gender: 'male', accent: 'American', traits: 'Warm, reassuring, steady', recommended: true },
  { id: 'aura-2-orion-en', name: 'Orion', gender: 'male', accent: 'American', traits: 'Smooth, composed, clear', recommended: true },

  // Other female voices
  { id: 'aura-2-andromeda-en', name: 'Andromeda', gender: 'female', accent: 'American', traits: 'Bright, clear, engaging', recommended: false },
  { id: 'aura-2-asteria-en', name: 'Asteria', gender: 'female', accent: 'American', traits: 'Lively, articulate, warm', recommended: false },
  { id: 'aura-2-aurora-en', name: 'Aurora', gender: 'female', accent: 'American', traits: 'Fresh, upbeat, friendly', recommended: false },
  { id: 'aura-2-callista-en', name: 'Callista', gender: 'female', accent: 'American', traits: 'Elegant, refined, poised', recommended: false },
  { id: 'aura-2-calypso-en', name: 'Calypso', gender: 'female', accent: 'American', traits: 'Enchanting, expressive, rich', recommended: false },
  { id: 'aura-2-cassandra-en', name: 'Cassandra', gender: 'female', accent: 'American', traits: 'Confident, insightful, clear', recommended: false },
  { id: 'aura-2-circe-en', name: 'Circe', gender: 'female', accent: 'American', traits: 'Mysterious, captivating, deep', recommended: false },
  { id: 'aura-2-daphne-en', name: 'Daphne', gender: 'female', accent: 'American', traits: 'Light, natural, flowing', recommended: false },
  { id: 'aura-2-electra-en', name: 'Electra', gender: 'female', accent: 'American', traits: 'Energetic, bold, dynamic', recommended: false },
  { id: 'aura-2-gaia-en', name: 'Gaia', gender: 'female', accent: 'American', traits: 'Earthy, grounded, maternal', recommended: false },
  { id: 'aura-2-hera-en', name: 'Hera', gender: 'female', accent: 'American', traits: 'Authoritative, regal, commanding', recommended: false },
  { id: 'aura-2-io-en', name: 'Io', gender: 'female', accent: 'American', traits: 'Youthful, curious, bright', recommended: false },
  { id: 'aura-2-lyra-en', name: 'Lyra', gender: 'female', accent: 'American', traits: 'Musical, harmonious, sweet', recommended: false },
  { id: 'aura-2-medusa-en', name: 'Medusa', gender: 'female', accent: 'American', traits: 'Intense, striking, powerful', recommended: false },
  { id: 'aura-2-nova-en', name: 'Nova', gender: 'female', accent: 'American', traits: 'Modern, crisp, vibrant', recommended: false },
  { id: 'aura-2-nyx-en', name: 'Nyx', gender: 'female', accent: 'American', traits: 'Dark, silky, mysterious', recommended: false },
  { id: 'aura-2-ophelia-en', name: 'Ophelia', gender: 'female', accent: 'American', traits: 'Poetic, tender, delicate', recommended: false },
  { id: 'aura-2-phoebe-en', name: 'Phoebe', gender: 'female', accent: 'American', traits: 'Radiant, cheerful, warm', recommended: false },
  { id: 'aura-2-selene-en', name: 'Selene', gender: 'female', accent: 'American', traits: 'Mystical, tranquil, moonlit', recommended: false },
  { id: 'aura-2-siren-en', name: 'Siren', gender: 'female', accent: 'American', traits: 'Alluring, smooth, deep', recommended: false },
  { id: 'aura-2-thalia-en', name: 'Thalia', gender: 'female', accent: 'American', traits: 'Joyful, comedic, light', recommended: false },
  { id: 'aura-2-venus-en', name: 'Venus', gender: 'female', accent: 'American', traits: 'Lovely, graceful, charming', recommended: false },
  { id: 'aura-2-vesta-en', name: 'Vesta', gender: 'female', accent: 'American', traits: 'Steady, devoted, focused', recommended: false },

  // Other male voices
  { id: 'aura-2-arcas-en', name: 'Arcas', gender: 'male', accent: 'American', traits: 'Bold, resonant, strong', recommended: false },
  { id: 'aura-2-draco-en', name: 'Draco', gender: 'male', accent: 'American', traits: 'Commanding, sharp, powerful', recommended: false },
  { id: 'aura-2-helios-en', name: 'Helios', gender: 'male', accent: 'American', traits: 'Bright, warm, radiant', recommended: false },
  { id: 'aura-2-hermes-en', name: 'Hermes', gender: 'male', accent: 'American', traits: 'Quick, articulate, versatile', recommended: false },
  { id: 'aura-2-hyperion-en', name: 'Hyperion', gender: 'male', accent: 'American', traits: 'Grand, expansive, deep', recommended: false },
  { id: 'aura-2-janus-en', name: 'Janus', gender: 'male', accent: 'American', traits: 'Dual-toned, adaptable, thoughtful', recommended: false },
  { id: 'aura-2-mars-en', name: 'Mars', gender: 'male', accent: 'American', traits: 'Strong, grounded, determined', recommended: false },
  { id: 'aura-2-neptune-en', name: 'Neptune', gender: 'male', accent: 'American', traits: 'Flowing, deep, aquatic', recommended: false },
  { id: 'aura-2-orpheus-en', name: 'Orpheus', gender: 'male', accent: 'American', traits: 'Musical, emotive, lyrical', recommended: false },
  { id: 'aura-2-phoenix-en', name: 'Phoenix', gender: 'male', accent: 'American', traits: 'Rising, energetic, renewed', recommended: false },
  { id: 'aura-2-prometheus-en', name: 'Prometheus', gender: 'male', accent: 'American', traits: 'Visionary, bold, innovative', recommended: false },
  { id: 'aura-2-saturn-en', name: 'Saturn', gender: 'male', accent: 'American', traits: 'Measured, wise, patient', recommended: false },
  { id: 'aura-2-titan-en', name: 'Titan', gender: 'male', accent: 'American', traits: 'Massive, powerful, commanding', recommended: false },
  { id: 'aura-2-zeus-en', name: 'Zeus', gender: 'male', accent: 'American', traits: 'Authoritative, thunderous, regal', recommended: false },
]

export function getVoiceById(id: string): DeepgramVoice | undefined {
  return deepgramVoices.find((v) => v.id === id)
}
