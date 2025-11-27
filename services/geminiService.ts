import { GoogleGenAI, Modality, HarmBlockThreshold, HarmCategory } from "@google/genai";
import { AiSettings, ChatMessage } from "../types";

/**
 * Maps the UI safety setting string to the SDK enum value.
 */
const getSafetySettings = (level: string) => {
    const categories = [
        HarmCategory.HARM_CATEGORY_HARASSMENT,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    ];

    let threshold = HarmBlockThreshold.BLOCK_NONE;
    if (level === 'BLOCK_ONLY_HIGH') threshold = HarmBlockThreshold.BLOCK_ONLY_HIGH;
    if (level === 'BLOCK_MEDIUM_AND_ABOVE') threshold = HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE;
    if (level === 'BLOCK_LOW_AND_ABOVE') threshold = HarmBlockThreshold.BLOCK_LOW_AND_ABOVE;

    return categories.map(category => ({ category, threshold }));
};

/**
 * Main generation function handling all model types and configurations.
 */
export const generateGeminiContent = async (
    settings: AiSettings,
    userPrompt: string,
    history: ChatMessage[] = [],
    imageData?: string
): Promise<{ text: string; audioData?: string; groundingMetadata?: any }> => {
    
    // API Key must be obtained exclusively from environment variable
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Configuration Construction
    const config: any = {
        temperature: settings.temperature,
        topK: settings.topK,
        topP: settings.topP,
        systemInstruction: settings.systemInstruction,
        safetySettings: getSafetySettings(settings.safetySettings),
    };

    // Thinking Config (Only for supported models, usually 2.5 series)
    if (settings.thinkingBudget > 0 && settings.model.includes('2.5')) {
        config.thinkingConfig = { thinkingBudget: settings.thinkingBudget };
    }

    // Tools (Grounding)
    if (settings.enableGrounding) {
        config.tools = [{ googleSearch: {} }];
    }

    // Modal Specific Configs
    const isAudioModel = settings.model.includes('tts') || settings.model.includes('native-audio');
    
    if (isAudioModel) {
        config.responseModalities = [Modality.AUDIO];
        // Default voice config if needed, usually auto-handled or can be parametrized
    }

    // Prepare Contents
    const parts: any[] = [];
    
    if (imageData) {
        parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: imageData
            }
        });
    }
    
    // Add history for context (simplified stateless approach for this demo)
    // In a production app using `chats.create` is better, but here we construct a single prompt with history context
    // or just rely on the user sending the full context if they want history.
    // For this implementation, we will push the current prompt.
    parts.push({ text: userPrompt });

    try {
        const response = await ai.models.generateContent({
            model: settings.model,
            contents: { parts },
            config: config
        });

        // Parse Response
        let text = "";
        let audioData = undefined;
        let grounding = response.candidates?.[0]?.groundingMetadata;

        const contentParts = response.candidates?.[0]?.content?.parts || [];
        
        for (const part of contentParts) {
            if (part.text) {
                text += part.text;
            }
            if (part.inlineData) {
                audioData = part.inlineData.data;
                text += "\n(Audio Content Received)";
            }
        }

        return { text, audioData, groundingMetadata: grounding };

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw new Error(error.message || "Failed to generate content.");
    }
};

/**
 * Helper to play audio from base64
 */
export const playBase64Audio = async (base64Audio: string) => {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    } catch (e) {
        console.error("Error playing audio", e);
    }
};