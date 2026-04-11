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
export const generateText = async (prompt: string, isPro: boolean = false): Promise<string> => {
    const ai = getAI();
    // Usando o modelo solicitado para toda a lógica de texto e JSON
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
 * --- NOVELA: CASTING TÉCNICO (LÓGICA NOTION) ---
 */
export const generateCastingPrompts = async (inputMassa: string): Promise<any[]> => {
    const prompt = `
        Aja como um Engenheiro de Prompts especialista em personagens 3D antropomórficos.
        Transforme esta ideia em um DNA estruturado para cada personagem: "${inputMassa}"

        REGRAS PARA O "fullPrompt":
        Deve ser um texto longo em INGLÊS seguindo exatamente este padrão:
        "A full-body 3D stylized anthropomorphic [fruit] character, designed as a [gender], age [age], with a realistic fruit head blended with a human-like face, expressive eyes, refined eyebrows, soft lips, and a cinematic animated look. Human body proportions with a [body_type] silhouette. Wearing [style] clothing: [outfit_details], with [shoes], [accessories]. The fruit head has rich natural texture and leaf detail on top. Pose: [pose]. Expression: [expression]. Isolated on a pure white background, studio lighting, centered full-body shot, ultra-detailed 3D render."

        RETORNE APENAS UM ARRAY JSON:
        [
          {
            "fruit": "nome da fruta",
            "gender": "homem/mulher",
            "age": "idade",
            "style": "estilo",
            "fullPrompt": "PROMPT LONGO EM INGLÊS"
          }
        ]
    `;
    const responseText = await generateText(prompt, true);
    try {
        const start = responseText.indexOf("[");
        const end = responseText.lastIndexOf("]") + 1;
        const cleanJson = responseText.substring(start, end);
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("Erro no JSON de Casting:", e);
        return [];
    }
};

/**
 * --- NOVELA: GERADOR DE SCRIPT EM BLOCOS (8s) ---
 */
export const generateNovelaScript = async (ideia: string, personagensDesc: string): Promise<any> => {
    const prompt = `
        Aja como um Roteirista de Novelas Virais. 
        História Base: ${ideia}
        Personagens Atuais: ${personagensDesc}
        Divida a história em blocos de EXATAMENTE 8 segundos.
        Retorne apenas um array JSON com: Cena, Visual_Prompt, Motion_Prompt, Dialogo.
    `;

    const responseText = await generateText(prompt, true);
    try {
        const start = responseText.indexOf("[");
        const end = responseText.lastIndexOf("]") + 1;
        const cleanJson = responseText.substring(start, end);
        return JSON.parse(cleanJson);
    } catch (e) {
        throw new Error("Falha ao processar roteiro.");
    }
};

/**
 * --- GERAÇÃO DE IMAGEM ---
 * Modelo: imagen-4.0-generate-001
 */
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAI();
    const response = await (ai as any).models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, aspectRatio },
    });
    if (response.generatedImages && response.generatedImages.length > 0) {
        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    throw new Error("Falha na geração da imagem.");
};

/**
 * --- VÍDEO (8 SEGUNDOS) ---
 * Modelo: veo-3.1-lite-generate-preview
 */
export const generateVideo = async (
    image: ImageFile, 
    prompt: string, 
    aspectRatio: '16:9' | '9:16', 
    onProgress: (message: string) => void,
    durationSeconds: 4 | 6 | 8 = 8 
): Promise<string> => {
    const ai = getAI();
    onProgress("Iniciando animação de 8s com Veo 3.1...");
    let operation = await (ai as any).models.generateVideos({
        model: 'veo-3.1-lite-generate-preview', 
        prompt,
        image: { imageBytes: image.base64, mimeType: image.mimeType },
        config: { resolution: '720p', aspectRatio, durationSeconds }
    });
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await (ai as any).operations.getVideosOperation({ operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const videoResponse = await fetch(downloadLink, { headers: { 'x-goog-api-key': getApiKey() } });
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

/**
 * --- SUPORTE E ANÁLISE ---
 */
export const analyzeImage = async (image: ImageFile): Promise<string> => {
    const ai = getAI();
    const contents = {
        parts: [
            { inlineData: { mimeType: image.mimeType, data: image.base64 } },
            { text: "Descreva esta imagem detalhadamente para um prompt de vídeo." }
        ]
    };
    const response = await ai.models.generateContent({ 
        model: 'gemini-3.1-flash-lite-preview', 
        contents 
    });
    return response.text;
};

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
        model: 'gemini-3.1-flash-lite-preview',
        contents: { parts },
        config: { imageConfig: { aspectRatio } } as any,
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Falha ao editar imagem.");
};
