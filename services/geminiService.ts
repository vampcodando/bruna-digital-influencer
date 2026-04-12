// @ts-nocheck
import { GoogleGenAI } from "@google/genai";
import { ImageFile, AspectRatio } from '../types';

/**
 * DOCUMENTO DE REFERÊNCIA DE MODELOS - FÁBRICA DE FRUTAS (2026)
 */
export const FRUIT_FACTORY_MODELS = {
    /** Lógica, JSON Casting e Roteiros */
    CORE_AI: 'gemini-3.1-flash-lite-preview',
    
    /** Geração de Personagens e Fotos */
    IMAGE_GEN: 'imagen-4.0-fast-generate-001',
    
    /** Animação de 8 segundos (Novelas) */
    VIDEO_GEN: 'veo-3.1-lite-generate-preview',
    
    /** Edição e Análise Visual */
    VISION_EDITOR: 'gemini-3.1-flash-lite-preview'
} as const;

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
    // IMPORTANTE: Para modelos de 2026 (gemini-3.1, veo-3.1), a versão da API deve ser v1beta
    return new GoogleGenAI({ apiKey: getApiKey(), apiVersion: 'v1beta' });
};

/**
 * --- GERAÇÃO DE TEXTO & ROTEIRO ---
 */
export const generateText = async (prompt: string, isPro: boolean = false): Promise<string> => {
    const ai = getAI();
    const modelName = FRUIT_FACTORY_MODELS.CORE_AI;
    
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
 * --- SUPORTE AO POSTCREATOR & IMAGEEDITOR ---
 */
export const createBackgroundImagePrompt = async (description: string, reference?: ImageFile): Promise<string> => {
    const ai = getAI();
    let promptText = `Crie um prompt detalhado em inglês para geração de imagem de fundo. Tema: "${description}". Estética cinematográfica, 4k.`;
    const parts: any[] = [{ text: promptText }];
    if (reference) {
        parts.unshift({ inlineData: { mimeType: reference.mimeType, data: reference.base64.split(',')[1] || reference.base64 } });
    }
    const response = await ai.models.generateContent({
        model: FRUIT_FACTORY_MODELS.VISION_EDITOR,
        contents: [{ parts }]
    });
    return response.text || "";
};

export const editImage = async (
    mainImage: ImageFile, 
    prompt: string, 
    aspectRatio: AspectRatio, 
    referenceImage?: ImageFile
): Promise<string> => {
    const ai = getAI();
    const parts: any[] = [{ inlineData: { data: mainImage.base64.split(',')[1] || mainImage.base64, mimeType: mainImage.mimeType } }];
    if (referenceImage) {
        parts.push({ inlineData: { data: referenceImage.base64.split(',')[1] || referenceImage.base64, mimeType: referenceImage.mimeType } });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: FRUIT_FACTORY_MODELS.VISION_EDITOR,
        contents: { parts },
        config: { imageConfig: { aspectRatio } } as any,
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Falha ao editar imagem.");
};

/**
 * --- GERAÇÃO DE IMAGEM (IMAGEN 4.0) ---
 */
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAI();
    const response = await (ai as any).models.generateImages({
        model: FRUIT_FACTORY_MODELS.IMAGE_GEN,
        prompt: prompt,
        config: { numberOfImages: 1, aspectRatio },
    });
    if (response.generatedImages && response.generatedImages.length > 0) {
        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    throw new Error("Falha na geração da imagem.");
};

/**
 * --- VÍDEO (VEO 3.1 LITE - 8 SEGUNDOS) ---
 */
export const generateVideo = async (
    image: ImageFile, 
    prompt: string, 
    aspectRatio: '16:9' | '9:16', 
    onProgress: (message: string) => void,
    durationSeconds: 4 | 6 | 8 = 8 
): Promise<string> => {
    const ai = getAI();
    onProgress("Iniciando animação de 8s...");
    
    // CORREÇÃO 400 (ABRIL 2026): 
    // 1. A imagem deve ser enviada no campo 'image' com 'imageBytes' e 'mimeType'.
    // 2. O base64 NÃO pode conter o prefixo 'data:image/...;base64,'.
    const cleanBase64 = image.base64.split(',')[1] || image.base64;

    let operation = await (ai as any).models.generateVideos({
        model: FRUIT_FACTORY_MODELS.VIDEO_GEN,
        prompt: prompt,
        image: {
            imageBytes: cleanBase64,
            mimeType: image.mimeType
        },
        config: {
            aspectRatio: aspectRatio, // O Veo 3.1 agora aceita a string direta '9:16' ou '16:9'
            durationSeconds: durationSeconds
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        // O polling deve passar o objeto da operação retornado inicialmente
        operation = await (ai as any).operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Vídeo não gerado pelo modelo.");

    const videoResponse = await fetch(downloadLink, { headers: { 'x-goog-api-key': getApiKey() } });
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

/**
 * --- COMPOSIÇÃO & ANÁLISE ---
 */
export const generateSceneFromImages = async (images: ImageFile[], prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAI();
    const parts: any[] = images.map(img => ({ inlineData: { data: img.base64.split(',')[1] || img.base64, mimeType: img.mimeType } }));
    parts.push({ text: `Integre estes elementos em uma cena: ${prompt}` });
    const response = await ai.models.generateContent({
        model: FRUIT_FACTORY_MODELS.VISION_EDITOR,
        contents: { parts },
        config: { imageConfig: { aspectRatio } } as any,
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Falha ao gerar cena.");
};

export const analyzeImage = async (image: ImageFile): Promise<string> => {
    const ai = getAI();
    const contents = {
        parts: [{ inlineData: { mimeType: image.mimeType, data: image.base64.split(',')[1] || image.base64 } }, { text: "Descreva esta imagem." }]
    };
    const response = await ai.models.generateContent({ model: FRUIT_FACTORY_MODELS.VISION_EDITOR, contents });
    return response.text;
};
