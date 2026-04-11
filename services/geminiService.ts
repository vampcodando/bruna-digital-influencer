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
 * --- GERAÇÃO DE TEXTO & ROTEIRO ---
 * Modelo: gemini-3.1-flash-lite-preview
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
        Transforme esta ideia em um DNA estruturado para cada personagem: "${inputMassa}"
        Retorne APENAS um array JSON:
        [{"fruit": "nome", "gender": "m/f", "age": "X", "style": "profissão", "fullPrompt": "prompt em inglês para 3d render"}]
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
        Aja como um Roteirista de Novelas Virais. 
        História Base: ${ideia}
        Personagens Atuais: ${personagensDesc}
        Divida em blocos de 8 segundos. Retorne apenas JSON com: Cena, Visual_Prompt, Motion_Prompt, Dialogo.
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
    onProgress(`Iniciando animação de ${durationSeconds}s com Veo 3.1...`);
    
    const base64Data = image.preview ? image.preview.split(',')[1] : image.base64;

    let operation = await (ai as any).models.generateVideos({
        model: 'veo-3.1-lite-generate-preview', 
        prompt,
        image: { imageBytes: base64Data, mimeType: 'image/png' },
        config: { resolution: '720p', aspectRatio, durationSeconds }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        onProgress("Processando frames da Fábrica de Frutas...");
        operation = await (ai as any).operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const videoResponse = await fetch(downloadLink, { headers: { 'x-goog-api-key': getApiKey() } });
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

/**
 * --- COMPOSIÇÃO DE CENA (USADO NO SCENECOLLAGE) ---
 */
export const generateSceneFromImages = async (images: ImageFile[], prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAI();
    const parts = images.map(img => ({
        inlineData: { 
            data: img.preview ? img.preview.split(',')[1] : img.base64, 
            mimeType: 'image/png' 
        }
    }));
    
    parts.push({ text: `Integre estes elementos em uma cena única coerente: ${prompt}. Mantenha o estilo visual.` });

    const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: [{ parts }],
    });

    const resultPart = response.candidates[0].content.parts.find(p => p.inlineData);
    if (resultPart) return `data:${resultPart.inlineData.mimeType};base64,${resultPart.inlineData.data}`;
    
    // Se não retornar imagem direta, usamos o prompt para gerar uma nova via Imagen
    return await generateImage(prompt, aspectRatio);
};

/**
 * --- EDIÇÃO E ANÁLISE ---
 */
export const editImage = async (mainImage: ImageFile, prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    return await generateSceneFromImages([mainImage], prompt, aspectRatio);
};

export const analyzeImage = async (image: ImageFile): Promise<string> => {
    const ai = getAI();
    const base64Data = image.preview ? image.preview.split(',')[1] : image.base64;
    const contents = {
        parts: [
            { inlineData: { mimeType: 'image/png', data: base64Data } }, 
            { text: "Descreva esta imagem para um prompt de vídeo ultra-realista." }
        ]
    };
    const response = await ai.models.generateContent({ model: 'gemini-3.1-flash-lite-preview', contents });
    return response.text;
};

export const createBackgroundImagePrompt = async (description: string, reference?: ImageFile): Promise<string> => {
    const ai = getAI();
    let promptText = `Crie um prompt detalhado em inglês para background: "${description}".`;
    const parts = [{ text: promptText }];
    
    if (reference) {
        const base64Data = reference.preview ? reference.preview.split(',')[1] : reference.base64;
        parts.unshift({ inlineData: { mimeType: 'image/png', data: base64Data } });
    }
    
    const response = await ai.models.generateContent({ model: 'gemini-3.1-flash-lite-preview', contents: [{ parts }] });
    return response.text || "";
};
