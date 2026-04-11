// @ts-nocheck
import { GoogleGenAI } from "@google/genai";
import { ImageFile, AspectRatio } from '../types';

/**
 * --- CONFIGURAÇÃO DE SEGURANÇA ---
 */
const getApiKey = (): string => {
    const envKey = (import.meta as any).env?.VITE_API_KEY;
    const hardcodedKey = ''; 
    const key = envKey || hardcodedKey;
    return key.trim();
};

const getAI = () => {
    return new GoogleGenAI({ apiKey: getApiKey() });
};

/**
 * Helper crucial para extrair base64 limpo
 */
const getCleanBase64 = (image: ImageFile): string => {
    if (!image) return "";
    if (image.preview && image.preview.includes(',')) {
        return image.preview.split(',')[1];
    }
    return image.base64 || "";
};

/**
 * --- GERAÇÃO DE TEXTO & ROTEIRO ---
 */
export const generateText = async (prompt: string): Promise<string> => {
    const ai = getAI();
    const modelName = 'gemini-3.1-flash-lite-preview';
    
    const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ parts: [{ text: prompt }] }]
    });

    let text = response.text || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return text;
};

/**
 * --- NOVELA: CASTING TÉCNICO ---
 */
export const generateCastingPrompts = async (inputMassa: string): Promise<any[]> => {
    const prompt = `
        Aja como um Engenheiro de Prompts especialista em personagens 3D antropomórficos.
        Transforme esta ideia em um DNA estruturado: "${inputMassa}"
        Retorne APENAS um array JSON:
        [{"fruit": "nome", "gender": "m/f", "age": "X", "style": "profissão", "fullPrompt": "prompt em inglês 3D render"}]
    `;
    const responseText = await generateText(prompt);
    try {
        const start = responseText.indexOf("[");
        const end = responseText.lastIndexOf("]") + 1;
        return JSON.parse(responseText.substring(start, end));
    } catch (e) {
        return [];
    }
};

/**
 * --- NOVELA: GERADOR DE SCRIPT ---
 */
export const generateNovelaScript = async (ideia: string, personagensDesc: string): Promise<any> => {
    const prompt = `
        Aja como um Roteirista de Novelas Virais. História: ${ideia}. Personagens: ${personagensDesc}.
        Divida em blocos de 8s. Retorne JSON: [ {Cena, Visual_Prompt, Motion_Prompt, Dialogo} ]
    `;
    const responseText = await generateText(prompt);
    try {
        const start = responseText.indexOf("[");
        const end = responseText.lastIndexOf("]") + 1;
        return JSON.parse(responseText.substring(start, end));
    } catch (e) {
        throw new Error("Falha no roteiro.");
    }
};

/**
 * --- IMAGEM (IMAGEN 4.0) ---
 */
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAI();
    const response = await (ai as any).models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, aspectRatio },
    });
    if (response.generatedImages?.length > 0) {
        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    throw new Error("Falha na imagem.");
};

/**
 * --- VÍDEO (VEO 3.1 LITE) ---
 */
export const generateVideo = async (
    image: ImageFile, 
    prompt: string, 
    aspectRatio: '16:9' | '9:16', 
    onProgress: (message: string) => void,
    durationSeconds: number = 8 
): Promise<string> => {
    const ai = getAI();
    onProgress(`Iniciando animação de ${durationSeconds}s...`);
    
    const base64Data = getCleanBase64(image);

    let operation = await (ai as any).models.generateVideos({
        model: 'veo-3.1-lite-generate-preview', 
        prompt,
        image: { imageBytes: base64Data, mimeType: 'image/png' },
        config: { resolution: '720p', aspectRatio, durationSeconds }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        onProgress("Processando frames cinematográficos...");
        operation = await (ai as any).operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const videoResponse = await fetch(downloadLink, { headers: { 'x-goog-api-key': getApiKey() } });
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

/**
 * --- COMPOSIÇÃO DE CENA (SCENE COLLAGE) ---
 */
export const generateSceneFromImages = async (images: ImageFile[], prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAI();
    const parts = images.map(img => ({
        inlineData: { data: getCleanBase64(img), mimeType: 'image/png' }
    }));
    parts.push({ text: `Integre os elementos em uma cena 3D única, sem textos ou divisões: ${prompt}` });

    const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: [{ parts }]
    });

    const resultPart = response.candidates[0].content.parts.find(p => p.inlineData);
    if (resultPart) return `data:${resultPart.inlineData.mimeType};base64,${resultPart.inlineData.data}`;
    
    return await generateImage(prompt, aspectRatio);
};

/**
 * --- EDIÇÃO DE IMAGEM ---
 */
export const editImage = async (
    mainImage: ImageFile, 
    prompt: string, 
    aspectRatio: AspectRatio, 
    referenceImage?: ImageFile
): Promise<string> => {
    const images = [mainImage];
    if (referenceImage) images.push(referenceImage);
    return await generateSceneFromImages(images, prompt, aspectRatio);
};

/**
 * --- ANÁLISE E BACKDROP ---
 */
export const analyzeImage = async (image: ImageFile): Promise<string> => {
    const ai = getAI();
    const contents = {
        parts: [
            { inlineData: { mimeType: 'image/png', data: getCleanBase64(image) } }, 
            { text: "Descreva esta imagem para prompt de vídeo detalhado." }
        ]
    };
    const response = await ai.models.generateContent({ model: 'gemini-3.1-flash-lite-preview', contents });
    return response.text;
};

/**
 * --- GERADOR DE PROMPT PARA FUNDO (CORREÇÃO DO BUG DE OPÇÕES) ---
 */
export const createBackgroundImagePrompt = async (description: string, reference?: ImageFile): Promise<string> => {
    const ai = getAI();
    
    // SISTEMA DE REGRAS RÍGIDAS: Proíbe "Option 1", "Layouts" e textos
    let systemInstruction = `Act as a professional Prompt Engineer for Imagen 4.0. 
    Transform the user description into a SINGLE, cohesive, highly detailed visual-only prompt in English.
    
    CRITICAL RULES:
    1. Output ONLY the descriptive paragraph. 
    2. DO NOT include "Option 1", "Concept", or list formats.
    3. NO text, letters, or UI elements in the scene.
    4. Focus on cinematic lighting, 8k textures, and atmospheric depth.
    5. The result must be one single continuous scene, not a collage or split screen.
    
    User Description: "${description}"`;

    const parts = [{ text: systemInstruction }];
    if (reference) {
        parts.unshift({ inlineData: { mimeType: 'image/png', data: getCleanBase64(reference) } });
    }
    
    const response = await ai.models.generateContent({ 
        model: 'gemini-3.1-flash-lite-preview', 
        contents: [{ parts }] 
    });

    let result = response.text || "";
    // Limpeza final para garantir que nenhum resíduo de "Option" passe para o Imagen
    return result.replace(/(Option|Choice|Concept|Prompt)\s*#?\d+:?/gi, "").trim();
};
