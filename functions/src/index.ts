import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";

const deepgramApiKey = defineString("DEEPGRAM_API_KEY");

// Whitelist of known Aura-2 voice models
const ALLOWED_MODELS = new Set([
  "aura-2-andromeda-en",
  "aura-2-arcas-en",
  "aura-2-asteria-en",
  "aura-2-athena-en",
  "aura-2-cora-en",
  "aura-2-harmonia-en",
  "aura-2-helios-en",
  "aura-2-hera-en",
  "aura-2-hermes-en",
  "aura-2-hyperion-en",
  "aura-2-luna-en",
  "aura-2-mars-en",
  "aura-2-neptune-en",
  "aura-2-odysseus-en",
  "aura-2-ophelia-en",
  "aura-2-orion-en",
  "aura-2-orpheus-en",
  "aura-2-pandora-en",
  "aura-2-pluto-en",
  "aura-2-saturn-en",
  "aura-2-selene-en",
  "aura-2-thalia-en",
  "aura-2-titan-en",
  "aura-2-venus-en",
  "aura-2-zeus-en",
  "aura-2-aurora-en",
  "aura-2-callista-en",
  "aura-2-calypso-en",
  "aura-2-cassandra-en",
  "aura-2-circe-en",
  "aura-2-daphne-en",
  "aura-2-draco-en",
  "aura-2-electra-en",
  "aura-2-gaia-en",
  "aura-2-io-en",
  "aura-2-janus-en",
  "aura-2-lyra-en",
  "aura-2-medusa-en",
  "aura-2-nova-en",
  "aura-2-nyx-en",
  "aura-2-phoebe-en",
  "aura-2-phoenix-en",
  "aura-2-prometheus-en",
  "aura-2-siren-en",
  "aura-2-vesta-en",
]);

const MAX_TEXT_LENGTH = 500;

export const ttsSynthesize = onCall(
  { maxInstances: 10, cors: true },
  async (request) => {
    const { text, voiceModel } = request.data as {
      text?: string;
      voiceModel?: string;
    };

    if (!text || typeof text !== "string" || text.length === 0) {
      throw new HttpsError("invalid-argument", "Text is required");
    }

    if (text.length > MAX_TEXT_LENGTH) {
      throw new HttpsError(
        "invalid-argument",
        `Text must be ${MAX_TEXT_LENGTH} characters or fewer`
      );
    }

    if (!voiceModel || !ALLOWED_MODELS.has(voiceModel)) {
      throw new HttpsError("invalid-argument", "Invalid voice model");
    }

    const apiKey = deepgramApiKey.value();
    if (!apiKey) {
      throw new HttpsError("internal", "TTS service not configured");
    }

    try {
      const url = `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(voiceModel)}&encoding=mp3`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Deepgram API error:", response.status, errorBody);
        throw new HttpsError("internal", "TTS synthesis failed");
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBase64 = Buffer.from(arrayBuffer).toString("base64");

      // Estimate duration from MP3 size (rough: ~16kbps for speech)
      const estimatedDurationMs = Math.round(
        (arrayBuffer.byteLength * 8) / 16
      );

      return { audioBase64, durationMs: estimatedDurationMs };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error("TTS synthesis error:", error);
      throw new HttpsError("internal", "TTS synthesis failed");
    }
  }
);
