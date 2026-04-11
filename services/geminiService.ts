// @ts-nocheck
import { GoogleGenAI } from "@google/genai";
import { ImageFile, AspectRatio } from '../types';

const getApiKey = (): string => {
    const envKey = (import.meta as any).env?.VITE_API_KEY;
    const hardcodedKey = ''; 
    const key = envKey || hardcodedKey;
    return key.trim();
};

const getAI = () => {
    return new GoogleGenAI({ apiKey: getApiKey() });
};

export const generateText = async (prompt: string, isPro: boolean = false): Promise<string> => {
    const ai = getAI();
    const modelName = isPro ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
    const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ parts: [{ text: prompt }] }]
    });
    let text = response.text || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return text;
};

// --- NOVA FUNÇÃO DE CASTING (LÓGICA NOTION) ---
export const generateCastingPrompts = async (inputMassa: string): Promise<any[]> => {
    const prompt = `
        Aja como um Engenheiro de Prompts especialista em personagens 3D antropomórficos.
        Transforme esta ideia em um DNA estruturado para cada personagem: "${inputMassa}"

        REGRAS:
        - O "fullPrompt" deve ser um texto longo em INGLÊS seguindo o padrão:
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
        const cleanJson = responseText.substring(responseText.indexOf("["), responseText.lastIndexOf("]") + 1);
        return JSON.parse(cleanJson);
    } catch (e) {
        return [];
    }
};

export const generateNovelaScript = async (ideia: string, personagensDesc: string): Promise<any> => {
    const prompt = `
        Aja como um Roteirista de Novelas Virais. 
        História Base: ${ideia}
        Personagens Ativos: ${personagensDesc}
        Crie um roteiro técnico de 3 a 5 cenas. Cada cena dura 8 segundos.
        Retorne um JSON: [{"Cena": 1, "Dialogo": "fala do personagem", "Visual_Prompt": "descrição visual detalhada em inglês para gerador de vídeo"}]
    `;
    const res = await generateText(prompt, true);
    return JSON.parse(res);
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio = "1:1"): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }] }],
        config: { imageConfig: { aspectRatio } } as any,
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Falha ao gerar imagem.");
};

// --- MANTENDO FUNÇÕES DE VÍDEO E ANÁLISE ---
export const generateVideo = async (imagePrompt: string): Promise<string> => {
    const ai = getAI() as any;
    let operation = await ai.models.generateContent({
        model: 'veo-2.0-generate-video',
        contents: [{ parts: [{ text: imagePrompt }] }],
    });
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await (ai as any).operations.getVideosOperation({ operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const videoResponse = await fetch(downloadLink, { headers: { 'x-goog-api-key': getApiKey() } });
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

export const generateSceneFromImages = async (images: ImageFile[], prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAI();
    const parts: any[] = images.map(img => ({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
    parts.push({ text: `Integre estes elementos em uma cena: ${prompt}` });
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

export const analyzeImage = async (image: ImageFile): Promise<string> => {
    const ai = getAI();
    const contents = {
        parts: [{ inlineData: { mimeType: image.mimeType, data: image.base64 } }, { text: "Descreva esta imagem detalhadamente para um prompt de geração." }]
    };
    const response = await ai.models.generateContent({ model: 'gemini-1.5-flash', contents });
    return response.text;
};
