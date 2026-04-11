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
            // Cria um elemento de imagem para carregar a fonte base64
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = editedImage;

            img.onload = () => {
                // Cria um canvas para garantir a conversão real para PNG
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.drawImage(img, 0, 0);

                // Converte o canvas para um Blob PNG
                canvas.toBlob((blob) => {
                    if (!blob) return;

                    // Cria a URL do objeto para o download
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = url;
                    link.download = `CrIA-Base-Edit-${Date.now()}.png`;

                    document.body.appendChild(link);
                    link.click();

                    // Limpeza
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
        
        let finalPrompt = prompt;

        if (preserveFace || preserveRefFace || marketingMode) {
            finalPrompt = `You are a world-class advertising photographer and digital retouching expert.\n\n`;
            finalPrompt += `**PRIMARY DIRECTIVE**: Create a perfect commercial image by modifying the Main Image based on these exact requirements.\n`;
            finalPrompt += `**USER COMMAND**: "${prompt}"\n\n`;
            finalPrompt += `**ASSETS PROVIDED**:\n`;
            finalPrompt += `- Image 1 (Main): The scene and subject to be edited.\n`;
            if (referenceImage) {
                 finalPrompt += `- Image 2 (Reference): The ABSOLUTE SOURCE OF TRUTH for the object, product, or person's identity.\n`;
            }
            finalPrompt += `\n**EXECUTION PROTOCOL (STRICT COMPLIANCE REQUIRED)**:\n`;
            if (preserveFace) {
                finalPrompt += `1. **ZERO-TOLERANCE MAIN FACE PRESERVATION**: The facial identity of the person ALREADY IN the Main Image (Image 1) must remain 100% unchanged.\n`;
            }
            if (preserveRefFace && referenceImage) {
                finalPrompt += `2. **IDENTITY CLONING (REFERENCE IMAGE)**: Transfer the EXACT face from Image 2 onto the subject in Image 1. It must be identical to Image 2.\n`;
            }
            if (marketingMode) {
                finalPrompt += `3. **PIXEL-PERFECT PRODUCT INTEGRATION**: Transfer products/apparel EXACTLY from Image 2. Include labels and logos.\n`;
                finalPrompt += `4. **ANATOMICAL POSE RIGOR**: Ensure realistic limb/finger placement.\n`;
                finalPrompt += `5. **PHOTOREALISTIC LIGHTING**: Match lighting and shadows perfectly.\n`;
            }
            finalPrompt += `\n**FINAL VERIFICATION**: Cinematic high-resolution quality only. Export as clean image.`;
        }
        
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
                           <SparklesIcon className="w-5 h-5" /> 1. Imagem Principal
                        </h3>
                        <FileUpload 
                            id="main-image-upload" 
                            onFileSelect={setImage} 
                            onFileClear={() => setImage(null)}
                        />
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-400 flex items-center gap-2">
                           <MagnifyingGlassIcon className="w-5 h-5" /> Objeto/Pessoa de Referência
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
                        <PencilSquareIcon className="w-5 h-5" /> Configurações de Edição
                    </h3>
                    
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest text-white/60">Formato de Saída</label>
                        <div className="flex flex-wrap gap-2">
                            {(['9:16', '16:9', '1:1', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all
                                    ${aspectRatio === ratio 
                                        ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-105' 
                                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-500 text-gray-400'
                                    }`}
                                >
                                    {ratio === '9:16' ? 'TikTok (9:16)' : ratio}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest text-white/60">Instruções para a IA</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Substitua a pessoa da imagem principal pelo jogador da referência..."
                        rows={4}
                        className="w-full p-4 bg-gray-950/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder:text-gray-600 text-white shadow-inner mb-4"
                    />
                    
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        <div 
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${preserveFace ? 'bg-red-900/30 border-red-500' : 'bg-gray-800/20 border-gray-700'}`} 
                            onClick={() => setPreserveFace(!preserveFace)}
                        >
                            <input type="checkbox" checked={preserveFace} readOnly className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-red-600" />
                            <div>
                                <span className="font-bold text-sm text-white flex items-center gap-2 uppercase tracking-tight">
                                    <ShieldCheckIcon className="w-4 h-4 text-red-500" />
                                    Preservar Rosto Principal
                                </span>
                                <p className="text-[10px] text-gray-400 mt-0.5 uppercase">Mantém a pessoa da Imagem 1</p>
                            </div>
                        </div>

                        <div 
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${preserveRefFace ? 'bg-red-900/30 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-gray-800/20 border-gray-700'}`} 
                            onClick={() => setPreserveRefFace(!preserveRefFace)}
                        >
                            <input type="checkbox" checked={preserveRefFace} readOnly className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-red-600" />
                            <div>
                                <span className="font-bold text-sm text-white flex items-center gap-2 uppercase tracking-tight">
                                    <SparklesIcon className="w-4 h-4 text-red-500" />
                                    Preservar Rosto da Referência
                                </span>
                                <p className="text-[10px] text-gray-400 mt-0.5 uppercase text-red-400 font-bold">Clona a Identidade da Imagem 2</p>
                            </div>
                        </div>

                        <div 
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${marketingMode ? 'bg-red-900/30 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-gray-800/20 border-gray-700'}`} 
                            onClick={() => setMarketingMode(!marketingMode)}
                        >
                            <input type="checkbox" checked={marketingMode} readOnly className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-red-600" />
                            <div>
                                <span className="font-bold text-sm text-white flex items-center gap-2 uppercase tracking-tight">
                                    <SparklesIcon className="w-4 h-4 text-red-500" />
                                    Modo Campanha (Produtos)
                                </span>
                                <p className="text-[10px] text-gray-400 mt-0.5 uppercase">Fidelidade Total a Objetos e Poses</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleEdit} 
                        disabled={isLoading || !image || !prompt}
                        className="w-full flex items-center justify-center gap-3 font-black py-4 px-6 rounded-xl bg-gradient-to-br from-red-500 to-red-800 hover:from-red-400 hover:to-red-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20 uppercase tracking-widest text-sm"
                    >
                        {isLoading ? 'Processando Edição...' : 'Aplicar Edição'}
                        <SparklesIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl text-red-400 text-sm font-semibold flex items-center gap-3">
                    <XCircleIcon className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {image && (
                    <div className="group relative">
                        <div className="absolute -top-3 left-4 px-2 py-1 bg-gray-800 rounded border border-gray-700 text-[10px] font-bold text-gray-400 uppercase z-10">Principal</div>
                        <img src={`data:${image.mimeType};base64,${image.base64}`} alt="Original" className="rounded-2xl w-full border border-gray-800 shadow-2xl h-64 object-cover" />
                    </div>
                )}
                
                {referenceImage && (
                    <div className="group relative">
                        <div className="absolute -top-3 left-4 px-2 py-1 bg-gray-800 rounded border border-gray-700 text-[10px] font-bold text-gray-400 uppercase z-10">Referência</div>
                        <img src={`data:${referenceImage.mimeType};base64,${referenceImage.base64}`} alt="Reference" className="rounded-2xl w-full border border-gray-800 shadow-2xl h-64 object-cover" />
                    </div>
                )}

                <div className="relative flex flex-col items-center justify-center bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl p-6 min-h-[256px]">
                    {isLoading && (
                        <div className="text-center">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full border-4 border-red-500/20 animate-ping"></div>
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500 border-r-4 border-transparent mx-auto"></div>
                            </div>
                            <p className="mt-6 text-red-400 font-bold uppercase tracking-widest text-xs">IA Trabalhando...</p>
                        </div>
                    )}
                    {editedImage && (
                        <div className="w-full">
                            <div className="absolute -top-3 left-4 px-2 py-1 bg-red-600 rounded border border-red-500 text-[10px] font-bold text-white uppercase z-10">Resultado Final</div>
                            <img src={editedImage} alt="Edited" className="rounded-2xl w-full border border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)] mb-4" />
                            <button 
                                onClick={handleDownload}
                                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white hover:bg-gray-100 text-black font-black rounded-xl transition-all uppercase tracking-widest text-xs"
                            >
                                💾 Baixar Imagem (.PNG)
                            </button>
                        </div>
                    )}
                    {!isLoading && !editedImage && (
                        <div className="text-center opacity-30">
                            <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Aguardando Comando</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
