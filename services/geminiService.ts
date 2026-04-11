// @ts-nocheck
import { GoogleGenAI } from "@google/genai";
import { ImageFile, AspectRatio } from '../types';

/**
 * --- CONFIGURAÇÃO DE SEGURANÇA ---
 */
const getApiKey = (): string => {
    const envKey = (import.meta as any).env?.VITE_API_KEY;
    const hardcodedKey = ''; // Sua chave aqui se não usar .env
    const key = envKey || hardcodedKey;
    return key.trim();
};

const getAI = () => {
    const key = getApiKey();
    // No browser, precisamos passar a chave e, em alguns casos, 
    // garantir que o objeto de configuração esteja correto.
    return new GoogleGenAI(key);
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
    const genAI = getAI();
    // Usamos o Flash para textos rápidos e roteiros
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text() || "";
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
 * Nota: Imagen 4.0 geralmente requer Vertex AI ou acesso via gapi. 
 * Se estiver usando o SDK comum, certifique-se que seu modelo está liberado.
 */
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const genAI = getAI();
    const response = await (genAI as any).models.generateImages({
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
    const genAI = getAI();
    onProgress(`Iniciando animação de ${durationSeconds}s...`);
    
    const base64Data = getCleanBase64(image);

    let operation = await (genAI as any).models.generateVideos({
        model: 'veo-3.1-lite-generate-preview', 
        prompt,
        image: { imageBytes: base64Data, mimeType: 'image/png' },
        config: { resolution: '720p', aspectRatio, durationSeconds }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        onProgress("Processando frames cinematográficos...");
        operation = await (genAI as any).operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const videoResponse = await fetch(downloadLink, { headers: { 'x-goog-api-key': getApiKey() } });
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

/**
 * --- COMPOSIÇÃO DE CENA ---
 */
export const generateSceneFromImages = async (images: ImageFile[], prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const genAI = getAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const parts = images.map(img => ({
        inlineData: { data: getCleanBase64(img), mimeType: 'image/png' }
    }));
    parts.push({ text: `Integre os elementos em uma cena única, sem textos: ${prompt}` });

    const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
    const response = await result.response;

    const resultPart = response.candidates[0].content.parts.find(p => p.inlineData);
    if (resultPart) return `data:${resultPart.inlineData.mimeType};base64,${resultPart.inlineData.data}`;
    
    return await generateImage(prompt, aspectRatio);
};

/**
 * --- EDIÇÃO DE IMAGEM (IMAGEEDITOR) ---
 */
export const editImage = async (
    mainImage: ImageFile, 
    prompt: string, 
    aspectRatio: AspectRatio, 
    referenceImage?: ImageFile
): Promise<string> => {
    const genAI = getAI();
    
    // Pro é essencial aqui para obedecer "Preservar Rosto"
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro"
    });

    const parts = [
        { text: prompt },
        {
            inlineData: {
                mimeType: 'image/png',
                data: getCleanBase64(mainImage)
            }
        }
    ];

    if (referenceImage) {
        parts.push({
            inlineData: {
                mimeType: 'image/png',
                data: getCleanBase64(referenceImage)
            }
        });
    }

    // Configuração de baixa temperatura para maior fidelidade
    const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: {
            temperature: 0.4,
            topP: 0.8,
        }
    });

    const response = await result.response;
    const resultPart = response.candidates[0].content.parts.find(p => p.inlineData);
    
    if (resultPart) {
        return `data:${resultPart.inlineData.mimeType};base64,${resultPart.inlineData.data}`;
    }

    // Fallback caso ele não retorne imagem direta
    return await generateImage(prompt, aspectRatio);
};

/**
 * --- ANÁLISE E BACKDROP ---
 */
export const analyzeImage = async (image: ImageFile): Promise<string> => {
    const genAI = getAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const parts = [
        { inlineData: { mimeType: 'image/png', data: getCleanBase64(image) } }, 
        { text: "Descreva esta imagem para prompt de vídeo detalhado." }
    ];

    const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
    const response = await result.response;
    return response.text();
};

/**
 * --- GERADOR DE PROMPT PARA FUNDO ---
 */
export const createBackgroundImagePrompt = async (description: string, reference?: ImageFile): Promise<string> => {
    const genAI = getAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let systemInstruction = `Act as a professional Image Editor. Describe an enhancement based on: "${description}". Output ONLY the prompt in English.`;

    const parts = [{ text: systemInstruction }];
    if (reference) {
        parts.push({ inlineData: { mimeType: 'image/png', data: getCleanBase64(reference) } });
    }
    
    const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
    const response = await result.response;

    return (response.text() || "").trim();
};
