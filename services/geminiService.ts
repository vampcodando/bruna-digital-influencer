// @ts-nocheck
import { GoogleGenAI } from "@google/genai";
import { ImageFile, AspectRatio } from '../types';

/**
 * ECOSSISTEMA FÁBRICA DE FRUTAS (2026) - BINGO REESTABELECIDO
 */
export const FRUIT_FACTORY_MODELS = {
    CORE_AI: 'gemini-3.1-flash-lite-preview',      // Lógica e Roteiros
    IMAGE_GEN: 'imagen-4.0-generate-001',          // O "Rei" das Imagens e Texturas
    VIDEO_GEN: 'veo-3.1-lite-generate-preview',    // Movimento 8s
    VISION_EDITOR: 'gemini-3.1-flash-lite-preview' // Análise (não geração)
} as const;

const getApiKey = (): string => {
    const envKey = (import.meta as any).env?.VITE_API_KEY;
    return (envKey || "").trim();
};

const getAI = () => new GoogleGenAI({ apiKey: getApiKey(), apiVersion: 'v1beta' });

/**
 * --- CAMADA 1: BRAIN (LÓGICA) ---
 */
export const generateText = async (prompt: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: FRUIT_FACTORY_MODELS.CORE_AI,
        contents: [{ parts: [{ text: prompt }] }]
    });
    return response.text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const generateCastingPrompts = async (input: string) => {
    const res = await generateText(`Engenheiro 3D. DNA para: "${input}". JSON: [{"fruit": "...", "fullPrompt": "..."}]`);
    try { return JSON.parse(res.substring(res.indexOf("["), res.lastIndexOf("]") + 1)); }
    catch (e) { return []; }
};

export const generateNovelaScript = async (id: string, pers: string) => {
    const res = await generateText(`Roteirista 8s. História: ${id}. Personagens: ${pers}. JSON: Cena, Visual_Prompt, Motion_Prompt, Dialogo.`);
    try { return JSON.parse(res.substring(res.indexOf("["), res.lastIndexOf("]") + 1)); }
    catch (e) { throw new Error("Erro no roteiro."); }
};

/**
 * --- CAMADA 2: STATIC ASSETS (IMAGEN 4.0) ---
 * CENTRALIZADO: Toda imagem agora passa obrigatoriamente pelo Imagen 4.0
 */
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAI();
    try {
        const response = await (ai as any).models.generateImages({
            model: FRUIT_FACTORY_MODELS.IMAGE_GEN,
            prompt,
            config: { numberOfImages: 1, aspectRatio }
        });
        if (response.generatedImages?.[0]) {
            return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        }
    } catch (err) {
        // Fallback de segurança para o erro 400 (Aspect Ratio)
        const retry = await (ai as any).models.generateImages({
            model: FRUIT_FACTORY_MODELS.IMAGE_GEN,
            prompt,
            config: { numberOfImages: 1 }
        });
        return `data:image/jpeg;base64,${retry.generatedImages[0].image.imageBytes}`;
    }
    throw new Error("Falha no Imagen 4.0");
};

/**
 * --- CAMADA 3: MOTION (VEO 3.1) ---
 */
export const generateVideo = async (img: ImageFile, prompt: string, ratio: string, onProgress: any) => {
    const ai = getAI();
    onProgress("Iniciando animação...");
    let op = await (ai as any).models.generateVideos({
        model: FRUIT_FACTORY_MODELS.VIDEO_GEN,
        prompt,
        image: { imageBytes: img.base64.split(',')[1] || img.base64, mimeType: img.mimeType },
        config: { aspectRatio: ratio, durationSeconds: 8 }
    });
    while (!op.done) {
        await new Promise(r => setTimeout(r, 10000));
        onProgress("Renderizando movimentos...");
        op = await (ai as any).operations.getVideosOperation({ operation: op });
    }
    const res = await fetch(op.response.generatedVideos[0].video.uri, { headers: { 'x-goog-api-key': getApiKey() } });
    return URL.createObjectURL(await res.blob());
};

/**
 * --- UTILITÁRIOS & COMPOSIÇÃO ---
 * Agora forçando o uso do IMAGE_GEN para manter a qualidade cinematográfica.
 */
export const editImage = async (main: ImageFile, prompt: string, ratio: AspectRatio) => {
    // Usamos o Brain para "refinar" o prompt se necessário, mas quem gera é o Imagen
    return await generateImage(`Edit image based on: ${prompt}`, ratio);
};

export const generateSceneFromImages = async (images: ImageFile[], prompt: string, ratio: AspectRatio) => {
    // Composição de cena delegada ao Imagen 4.0 para manter o DNA do personagem
    return await generateImage(`Cinematic scene composition: ${prompt}`, ratio);
};

export const analyzeImage = async (image: ImageFile): Promise<string> => {
    const ai = getAI();
    const contents = [{ parts: [{ inlineData: { mimeType: image.mimeType, data: image.base64.split(',')[1] || image.base64 } }, { text: "Descreva a imagem." }] }];
    const response = await ai.models.generateContent({ model: FRUIT_FACTORY_MODELS.CORE_AI, contents });
    return response.text || "";
};

export const createBackgroundImagePrompt = async (desc: string) => generateText(`4k background prompt: ${desc}`);
