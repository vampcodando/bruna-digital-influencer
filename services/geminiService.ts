// @ts-nocheck
import { GoogleGenAI } from "@google/genai";
import { ImageFile, AspectRatio } from '../types';

/**
 * DOCUMENTO DE REFERÊNCIA DE MODELOS - FÁBRICA DE FRUTAS (2026)
 */
export const FRUIT_FACTORY_MODELS = {
    CORE_AI: 'gemini-3.1-flash-lite-preview',
    IMAGE_GEN: 'imagen-4.0-generate-001',
    VIDEO_GEN: 'veo-3.1-lite-generate-preview',
    VISION_EDITOR: 'gemini-3.1-flash-lite-preview'
} as const;

/**
 * --- CONFIGURAÇÃO DE SEGURANÇA ---
 */
const getApiKey = (): string => {
    const envKey = (import.meta as any).env?.VITE_API_KEY;
    return (envKey || "").trim();
};

const getAI = () => {
    // IMPORTANTE: v1beta é essencial para os modelos 3.1 e Veo
    return new GoogleGenAI({ apiKey: getApiKey(), apiVersion: 'v1beta' });
};

/**
 * --- GERAÇÃO DE TEXTO & ROTEIRO ---
 */
export const generateText = async (prompt: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: FRUIT_FACTORY_MODELS.CORE_AI,
        contents: [{ parts: [{ text: prompt }] }]
    });

    let text = response.text || "";
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

/**
 * --- NOVELA: CASTING TÉCNICO & SCRIPTS ---
 */
export const generateCastingPrompts = async (inputMassa: string): Promise<any[]> => {
    const prompt = `Engenheiro de Prompts 3D. Personagens: "${inputMassa}". DNA fullPrompt longo em inglês. RETORNE ARRAY JSON: [{"fruit": "...", "fullPrompt": "..."}]`;
    const res = await generateText(prompt);
    try {
        const start = res.indexOf("[");
        const end = res.lastIndexOf("]") + 1;
        return JSON.parse(res.substring(start, end));
    } catch (e) { return []; }
};

export const generateNovelaScript = async (ideia: string, personagensDesc: string): Promise<any> => {
    const prompt = `Roteirista Novelas 8s. História: ${ideia}. Personagens: ${personagensDesc}. Divida em blocos de 8s. Retorne JSON: Cena, Visual_Prompt, Motion_Prompt, Dialogo.`;
    const res = await generateText(prompt);
    try {
        const start = res.indexOf("[");
        const end = res.lastIndexOf("]") + 1;
        return JSON.parse(res.substring(start, end));
    } catch (e) { throw new Error("Erro no roteiro."); }
};

/**
 * --- GERAÇÃO DE IMAGEM (IMAGEN 4.0) ---
 * CORREÇÃO 400: Fallback para falha de Aspect Ratio
 */
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAI();
    try {
        const response = await (ai as any).models.generateImages({
            model: FRUIT_FACTORY_MODELS.IMAGE_GEN,
            prompt: prompt,
            config: { numberOfImages: 1, aspectRatio },
        });
        if (response.generatedImages?.[0]) {
            return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        }
    } catch (err) {
        console.warn("Recusou AspectRatio, tentando fallback 1:1...");
        // Fallback: Tenta sem o aspectRatio para garantir que a imagem saia
        const retry = await (ai as any).models.generateImages({
            model: FRUIT_FACTORY_MODELS.IMAGE_GEN,
            prompt: prompt,
            config: { numberOfImages: 1 }
        });
        return `data:image/jpeg;base64,${retry.generatedImages[0].image.imageBytes}`;
    }
    throw new Error("Falha na geração Imagen 4.0");
};

/**
 * --- VÍDEO (VEO 3.1 LITE - 8s) ---
 */
export const generateVideo = async (image: ImageFile, prompt: string, aspectRatio: string, onProgress: any): Promise<string> => {
    const ai = getAI();
    onProgress("Iniciando animação de 8s...");
    const cleanBase64 = image.base64.split(',')[1] || image.base64;

    let operation = await (ai as any).models.generateVideos({
        model: FRUIT_FACTORY_MODELS.VIDEO_GEN,
        prompt: prompt,
        image: { imageBytes: cleanBase64, mimeType: image.mimeType },
        config: { aspectRatio, durationSeconds: 8 }
    });

    while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        onProgress("Renderizando física e texturas...");
        operation = await (ai as any).operations.getVideosOperation({ operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    const res = await fetch(videoUri, { headers: { 'x-goog-api-key': getApiKey() } });
    return URL.createObjectURL(await res.blob());
};

/**
 * --- EDIÇÃO E ANÁLISE ---
 */
export const editImage = async (main: ImageFile, prompt: string, ratio: AspectRatio, ref?: ImageFile): Promise<string> => {
    const ai = getAI();
    const parts = [{ inlineData: { data: main.base64.split(',')[1] || main.base64, mimeType: main.mimeType } }];
    if (ref) parts.push({ inlineData: { data: ref.base64.split(',')[1] || ref.base64, mimeType: ref.mimeType } });
    parts.push({ text: prompt });

    // Correção de sintaxe: contents deve ser um array de objetos
    const response = await ai.models.generateContent({
        model: FRUIT_FACTORY_MODELS.VISION_EDITOR,
        contents: [{ parts }]
    });

    const candidatePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (candidatePart) return `data:${candidatePart.inlineData.mimeType};base64,${candidatePart.inlineData.data}`;
    return await generateImage(prompt, ratio);
};

export const generateSceneFromImages = async (images: ImageFile[], prompt: string, ratio: AspectRatio): Promise<string> => {
    const ai = getAI();
    const parts = images.map(img => ({ inlineData: { data: img.base64.split(',')[1] || img.base64, mimeType: img.mimeType } }));
    parts.push({ text: `Integre estes elementos: ${prompt}` });

    const response = await ai.models.generateContent({
        model: FRUIT_FACTORY_MODELS.VISION_EDITOR,
        contents: [{ parts }]
    });

    const candidatePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (candidatePart) return `data:${candidatePart.inlineData.mimeType};base64,${candidatePart.inlineData.data}`;
    return await generateImage(prompt, ratio);
};

export const analyzeImage = async (image: ImageFile): Promise<string> => {
    const ai = getAI();
    const contents = [{ parts: [{ inlineData: { mimeType: image.mimeType, data: image.base64.split(',')[1] || image.base64 } }, { text: "Descreva a imagem." }] }];
    const response = await ai.models.generateContent({ model: FRUIT_FACTORY_MODELS.VISION_EDITOR, contents });
    return response.text || "";
};

export const createBackgroundImagePrompt = async (desc: string) => generateText(`Detailed 4k cinematic background prompt: ${desc}`);
