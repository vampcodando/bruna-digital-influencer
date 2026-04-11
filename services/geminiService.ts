// @ts-nocheck
import { GoogleGenAI } from "@google/genai";
import { ImageFile, AspectRatio } from '../types';

/**
 * --- CONFIGURAÇÃO DE SEGURANÇA ---
 */
const getApiKey = (): string => {
    // @ts-ignore
    const envKey = (import.meta as any).env?.VITE_API_KEY;
    const hardcodedKey = ''; 
    
    const key = envKey || hardcodedKey;
    return key.trim();
};

const getAI = () => {
    return new GoogleGenAI({ apiKey: getApiKey() });
};

/**
 * --- GERAÇÃO DE TEXTO & ROTEIRO ---
 */
export const generateText = async (prompt: string, isPro: boolean = false): Promise<string> => {
    const ai = getAI();
    // Usa 1.5 Pro para roteiros complexos de novela e Flash para tarefas rápidas
    const modelName = isPro ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
    
    const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ parts: [{ text: prompt }] }]
    });

    let text = response.text || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return text;
};

/**
 * --- NOVELA: GERADOR DE SCRIPT EM BLOCOS (8s) ---
 */
export const generateNovelaScript = async (ideia: string, personagensDesc: string): Promise<any> => {
    const prompt = `
        Aja como um Roteirista de Novelas Virais. 
        História Base: ${ideia}
        Personagens Atuais: ${personagensDesc}

        Divida a história em blocos de EXATAMENTE 8 segundos para totalizar 1 minuto (aprox. 7 a 8 cenas).
        Para cada cena, retorne um objeto JSON com:
        - "Cena": número da cena.
        - "Visual_Prompt": Descrição cinematográfica para o Imagen 4.0 (em inglês), incluindo detalhes dos personagens para manter consistência.
        - "Motion_Prompt": Comando de movimento para o Veo 3.1 (em inglês).
        - "Dialogo": Falas em Português-BR.

        Retorne apenas o Array JSON puro.
    `;

    const responseText = await generateText(prompt, true); // Usa o Pro para melhor dramaturgia
    return JSON.parse(responseText);
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

// --- VÍDEO (VEO 3.1 LITE - 8 SEGUNDOS) ---
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
    onProgress("Iniciando geração de vídeo de novela (8s)...");
    
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
        onProgress("Animando cena de 8s... aguarde.");
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

// --- ANÁLISE E COMPOSIÇÃO ---
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

export const generateSceneFromImages = async (images: ImageFile[], prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAI();
    const parts: any[] = images.map(img => ({
        inlineData: { data: img.base64, mimeType: img.mimeType }
    }));
    parts.push({ text: `Integre estes elementos em uma cena cinematográfica de novela: ${prompt}` });

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
