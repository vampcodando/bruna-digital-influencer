// @ts-nocheck
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { ImageFile, AspectRatio } from '../types';
import { editImage } from '../services/geminiService';
import { SparklesIcon, MagnifyingGlassIcon, ShieldCheckIcon, XCircleIcon, PencilSquareIcon } from './Icons';

const ImageEditor: React.FC = () => {
    const [image, setImage] = useState<ImageFile | null>(null);
    const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
    const [prompt, setPrompt] = useState('');
    const [preserveFace, setPreserveFace] = useState(false);
    const [preserveRefFace, setPreserveRefFace] = useState(false);
    const [marketingMode, setMarketingMode] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
    const [isLoading, setIsLoading] = useState(false);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        if (!editedImage) return;
        try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = editedImage;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (!blob) return;
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = url;
                    link.download = `CrIA-Base-Edit-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                    }, 100);
                }, 'image/png');
            };
        } catch (err) {
            console.error("Erro ao processar download:", err);
            setError("Falha ao preparar o download da imagem.");
        }
    };

    const handleEdit = async () => {
        if (!image || !prompt) {
            setError('Por favor, envie uma imagem principal e um comando.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);
        
        // --- LÓGICA DE PROMPT "ANTI-REBELDE" (NANO BANANA 2 DOMADO) ---
        let finalPrompt = `IMAGE EDITING MISSION: SURGICAL RETOUCHING.
        You are an advanced AI Image Editor. Your task is to MODIFY the provided Image 1.
        
        STRICT LIMITATIONS:
        1. DO NOT CREATE A NEW SCENE.
        2. KEEP the character, the original face, the pose, the clothing style, and the exact background environment from Image 1.
        3. Only apply the changes described in the USER COMMAND to the existing pixels of Image 1.
        4. No additions of text, logos, or watermarks unless specified.
        
        USER COMMAND: "${prompt}"\n\n`;

        if (preserveFace || preserveRefFace || marketingMode) {
            finalPrompt += `EXECUTION PROTOCOL (INTERNAL OVERRIDE):\n`;
            
            if (preserveFace) {
                finalPrompt += `- [CRITICAL] PRESERVE IDENTITY: The person's facial features and identity from Image 1 MUST be 100% identical. Zero modifications to eyes, nose, or mouth shape.\n`;
            }
            
            if (preserveRefFace && referenceImage) {
                finalPrompt += `- FACE TRANSFER: Replace the facial area in Image 1 with the exact face from Image 2. Match the lighting and skin tone to Image 1's neck.\n`;
            }

            if (marketingMode) {
                finalPrompt += `- PRODUCT FIDELITY: Maintain the fabric textures, patterns, and logos from Image 2. Transfer them naturally to the subject's body in Image 1 while respecting their pose.\n`;
            }
        }

        finalPrompt += `\nFINAL QUALITY: High-end professional photography, 8k resolution, seamless integration. Output ONLY the resulting image.`;
        // -------------------------------------------------------------
        
        try {
            const result = await editImage(image, finalPrompt, aspectRatio, referenceImage ?? undefined);
            setEditedImage(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                     <div>
                        <h3 className="text-lg font-semibold mb-2 text-red-400 flex items-center gap-2">
                           <SparklesIcon className="w-5 h-5" /> 1. Imagem Principal (Base Fixa)
                        </h3>
                        <FileUpload 
                            id="main-image-upload" 
                            onFileSelect={setImage} 
                            onFileClear={() => setImage(null)}
                        />
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-400 flex items-center gap-2">
                           <MagnifyingGlassIcon className="w-5 h-5" /> Referência (Rosto ou Produto)
                        </h3>
                        <FileUpload 
                            id="reference-image-upload" 
                            onFileSelect={setReferenceImage} 
                            onFileClear={() => setReferenceImage(null)}
                            showImageSearch 
                        />
                    </div>
                </div>

                <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 shadow-inner">
                    <h3 className="text-lg font-semibold mb-4 text-red-400 flex items-center gap-2">
                        <PencilSquareIcon className="w-5 h-5" /> Painel de Comando IA
                    </h3>
                    
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest text-white/60">Formato</label>
                        <div className="flex flex-wrap gap-2">
                            {(['9:16', '16:9', '1:1', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all
                                    ${aspectRatio === ratio 
                                        ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500'
                                    }`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest text-white/60">O que a IA deve mudar?</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Mude a cor da camisa para verde neon sem alterar a pessoa..."
                        rows={4}
                        className="w-full p-4 bg-gray-950/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white mb-4"
                    />
                    
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        <div 
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${preserveFace ? 'bg-red-900/30 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'bg-gray-800/20 border-gray-700'}`} 
                            onClick={() => setPreserveFace(!preserveFace)}
                        >
                            <input type="checkbox" checked={preserveFace} readOnly className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-red-600" />
                            <div>
                                <span className="font-bold text-sm text-white flex items-center gap-2 uppercase tracking-tight">
                                    <ShieldCheckIcon className="w-4 h-4 text-red-500" /> Preservar Personagem Original
                                </span>
                                <p className="text-[10px] text-gray-400 mt-0.5 uppercase">Bloqueia mudanças no rosto da Imagem 1</p>
                            </div>
                        </div>

                        <div 
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${preserveRefFace ? 'bg-red-900/30 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'bg-gray-800/20 border-gray-700'}`} 
                            onClick={() => setPreserveRefFace(!preserveRefFace)}
                        >
                            <input type="checkbox" checked={preserveRefFace} readOnly className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-red-600" />
                            <div>
                                <span className="font-bold text-sm text-white flex items-center gap-2 uppercase tracking-tight">
                                    <SparklesIcon className="w-4 h-4 text-red-500" /> Clonar Rosto da Referência
                                </span>
                                <p className="text-[10px] text-gray-400 mt-0.5 uppercase">Aplica a face da Imagem 2 na Imagem 1</p>
                            </div>
                        </div>

                        <div 
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${marketingMode ? 'bg-red-900/30 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'bg-gray-800/20 border-gray-700'}`} 
                            onClick={() => setMarketingMode(!marketingMode)}
                        >
                            <input type="checkbox" checked={marketingMode} readOnly className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-red-600" />
                            <div>
                                <span className="font-bold text-sm text-white flex items-center gap-2 uppercase tracking-tight">
                                    <SparklesIcon className="w-4 h-4 text-red-500" /> Modo Campanha (Produtos)
                                </span>
                                <p className="text-[10px] text-gray-400 mt-0.5 uppercase">Fidelidade total a etiquetas e roupas</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleEdit} 
                        disabled={isLoading || !image || !prompt}
                        className="w-full flex items-center justify-center gap-3 font-black py-4 px-6 rounded-xl bg-gradient-to-br from-red-500 to-red-800 text-white transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                    >
                        {isLoading ? 'Processando...' : 'Aplicar Edição'}
                        <SparklesIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl text-red-400 text-sm font-semibold flex items-center gap-3">
                    <XCircleIcon className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {image && (
                    <div className="relative">
                        <div className="absolute -top-3 left-4 px-2 py-1 bg-gray-800 rounded border border-gray-700 text-[10px] font-bold text-gray-400 uppercase z-10">Base</div>
                        <img src={`data:${image.mimeType};base64,${image.base64}`} alt="Original" className="rounded-2xl w-full border border-gray-800 shadow-2xl h-64 object-cover" />
                    </div>
                )}
                
                {referenceImage && (
                    <div className="relative">
                        <div className="absolute -top-3 left-4 px-2 py-1 bg-gray-800 rounded border border-gray-700 text-[10px] font-bold text-gray-400 uppercase z-10">Ref</div>
                        <img src={`data:${referenceImage.mimeType};base64,${referenceImage.base64}`} alt="Reference" className="rounded-2xl w-full border border-gray-800 shadow-2xl h-64 object-cover" />
                    </div>
                )}

                <div className="relative flex flex-col items-center justify-center bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl p-6 min-h-[256px]">
                    {isLoading && (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-500 mx-auto"></div>
                            <p className="mt-4 text-red-400 font-bold uppercase tracking-widest text-[10px]">IA Retocando...</p>
                        </div>
                    )}
                    {editedImage && (
                        <div className="w-full">
                            <div className="absolute -top-3 left-4 px-2 py-1 bg-red-600 rounded border border-red-500 text-[10px] font-bold text-white uppercase z-10">Resultado</div>
                            <img src={editedImage} alt="Edited" className="rounded-2xl w-full border border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)] mb-4" />
                            <button 
                                onClick={handleDownload}
                                className="w-full py-3 bg-white text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                            >
                                💾 Baixar PNG
                            </button>
                        </div>
                    )}
                    {!isLoading && !editedImage && (
                        <div className="text-center opacity-30">
                            <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Aguardando Comando</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
