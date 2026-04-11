// @ts-nocheck
import { GoogleGenAI } from "@google/genai";
import { ImageFile, AspectRatio } from '../types';

/**
 * --- CONFIGURAÇÃO DE SEGURANÇA ---
 * O código prioriza a chave do arquivo .env (VITE_API_KEY).
 */
const getApiKey = (): string => {
    // @ts-ignore
    const envKey = (import.meta as any).env?.VITE_API_KEY;
    const hardcodedKey = ''; // Mantendo seu padrão
    
    const key = envKey || hardcodedKey;
    return key.trim();
};

const getAI = () => {
    return new GoogleGenAI({ apiKey: getApiKey() });
};

/**
 * --- NOVA: GERAÇÃO DE TEXTO (NECESSÁRIA PARA O DIRETOR IA) ---
 * Esta função permite que o Diretor IA crie os roteiros de Gancho, Dor e CTA.
 */
export const generateText = async (prompt: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ parts: [{ text: prompt }] }]
    });

    let text = response.text || "";
    // Limpeza de markdown json para evitar erros no Diretor IA
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return text;
};

// --- GERAÇÃO DE IMAGEM (IMAGEN 4.0) ---
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAI();
    const response = await (ai as any).models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("Falha na geração da imagem.");
};

// --- EDIÇÃO DE IMAGEM (GEMINI 2.5 FLASH) ---
export const editImage = async (
    mainImage: ImageFile, 
    prompt: string, 
    aspectRatio: AspectRatio, 
    referenceImage?: ImageFile
): Promise<string> => {
    const ai = getAI();
    const parts: any[] = [{ inlineData: { data: mainImage.base64, mimeType: mainImage.mimeType } }];
    
    if (referenceImage) {
        parts.push({ inlineData: { data: referenceImage.base64, mimeType: referenceImage.mimeType } });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: { imageConfig: { aspectRatio } } as any,
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Falha ao editar imagem.");
};

// --- VÍDEO (RESTAURADO PARA 8 SEGUNDOS COM VEO 3.1) ---
export const generateVideo = async (
    image: ImageFile, 
    prompt: string, 
    aspectRatio: '16:9' | '9:16', 
    onProgress: (message: string) => void,
    apiKey?: string, 
    durationSeconds: 4 | 6 | 8 = 8 
): Promise<string> => {
    
    const ai = getAI();
    const currentKey = getApiKey();
    onProgress("Iniciando geração de vídeo...");
    
    let operation = await (ai as any).models.generateVideos({
        model: 'veo-3.1-lite-generate-preview', 
        prompt,
        image: { imageBytes: image.base64, mimeType: image.mimeType },
        config: { 
            numberOfVideos: 1, 
            resolution: '720p', 
            aspectRatio,
            durationSeconds 
        }
    });

    while (!operation.done) {
        onProgress("Processando vídeo (8s)... aguarde.");
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await (ai as any).operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Link do vídeo não gerado.");

    const videoResponse = await fetch(downloadLink, {
        method: 'GET',
        headers: { 'x-goog-api-key': currentKey },
    });

    if (!videoResponse.ok) throw new Error("Erro ao baixar o vídeo gerado.");

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

// --- FUNÇÕES AUXILIARES ---
export const analyzeImage = async (image: ImageFile): Promise<string> => {
    const ai = getAI();
    const contents = {
        parts: [
            { inlineData: { mimeType: image.mimeType, data: image.base64 } },
            { text: "Descreva esta imagem para fins de acessibilidade e contexto." }
        ]
    };
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents
    });
    return response.text;
};

export const createBackgroundImagePrompt = async (description: string, reference?: ImageFile): Promise<string> => {
    const ai = getAI();
    let promptText = `Crie um prompt para geração de imagem de fundo. Tema: "${description}". Estética limpa, sem textos.`;
    const parts: any[] = [{ text: promptText }];
    if (reference) {
        parts.unshift({ inlineData: { mimeType: reference.mimeType, data: reference.base64 } });
    }
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ parts }]
    });
    return response.text;
};

export const generateSceneFromImages = async (images: ImageFile[], prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAI();
    const parts: any[] = images.map(img => ({
        inlineData: { data: img.base64, mimeType: img.mimeType }
    }));
    parts.push({ text: `Integre estes elementos em uma cena cinematográfica: ${prompt}` });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: { imageConfig: { aspectRatio } } as any,
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Falha ao gerar cena.");
};
