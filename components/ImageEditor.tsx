// @ts-nocheck
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { ImageFile, AspectRatio } from '../types';
import { editImage, generateImage } from '../services/geminiService';
import { SparklesIcon, MagnifyingGlassIcon, ShieldCheckIcon, XCircleIcon, PencilSquareIcon, PhotoIcon } from './Icons';

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

    // FUNÇÃO SIMPLES - GERA DO ZERO (Como era antes)
    const handleGenerateNew = async () => {
        if (!prompt) {
            setError('Descreva o que você quer criar no campo de texto.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);
        try {
            // Usa a função pura de geração, ignorando as fotos de base
            const result = await generateImage(prompt, aspectRatio);
            setEditedImage(result);
        } catch (e) {
            setError('Erro ao gerar imagem nova.');
        } finally {
            setIsLoading(false);
        }
    };

    // FUNÇÃO DE EDIÇÃO - USA A LÓGICA "ANTI-REBELDE"
    const handleEditExisting = async () => {
        if (!image || !prompt) {
            setError('Para editar, você precisa enviar uma imagem base e um comando.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);
        
        let finalPrompt = `IMAGE EDITING MISSION: SURGICAL RETOUCHING.
        Keep the character and background from Image 1. 
        Only change: ${prompt}. 
        No extra text.`;

        if (preserveFace) finalPrompt += ` [CRITICAL: DO NOT CHANGE THE FACE].`;
        if (preserveRefFace && referenceImage) finalPrompt += ` [ACTION: Use the face from Image 2].`;
        if (marketingMode) finalPrompt += ` [ACTION: Maintain product texture from Image 2].`;
        
        try {
            const result = await editImage(image, finalPrompt, aspectRatio, referenceImage ?? undefined);
            setEditedImage(result);
        } catch (e) {
            setError('Erro ao editar imagem.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!editedImage) return;
        const link = document.createElement('a');
        link.href = editedImage;
        link.download = `criabase-${Date.now()}.png`;
        link.click();
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* COLUNA DA ESQUERDA: UPLOADS */}
                <div className="space-y-4">
                     <div>
                        <h3 className="text-sm font-bold mb-2 text-red-500 uppercase tracking-tighter flex items-center gap-2">
                           <PhotoIcon className="w-4 h-4" /> 1. Imagem de Base (Para Editar)
                        </h3>
                        <FileUpload onFileSelect={setImage} onFileClear={() => setImage(null)} />
                    </div>
                     <div>
                        <h3 className="text-sm font-bold mb-2 text-gray-400 uppercase tracking-tighter flex items-center gap-2">
                           <MagnifyingGlassIcon className="w-4 h-4" /> 2. Referência (Rosto/Produto)
                        </h3>
                        <FileUpload onFileSelect={setReferenceImage} onFileClear={() => setReferenceImage(null)} />
                    </div>
                </div>

                {/* COLUNA DA DIREITA: COMANDOS */}
                <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
                    <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Comando para a IA</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Crie Bruna loira em um café... OU ...Mude a cor do cabelo para loiro..."
                        className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white text-sm mb-4 focus:border-red-500 outline-none"
                        rows={3}
                    />

                    <div className="flex flex-wrap gap-2 mb-6">
                        {['9:16', '16:9', '1:1'].map((r) => (
                            <button key={r} onClick={() => setAspectRatio(r)} className={`px-3 py-1 rounded-lg text-xs font-bold border ${aspectRatio === r ? 'bg-red-600 border-red-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>{r}</button>
                        ))}
                    </div>

                    <div className="space-y-2 mb-6">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase cursor-pointer">
                            <input type="checkbox" checked={preserveFace} onChange={() => setPreserveFace(!preserveFace)} className="accent-red-600" />
                            Preservar Rosto Original
                        </label>
                        <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase cursor-pointer">
                            <input type="checkbox" checked={preserveRefFace} onChange={() => setPreserveRefFace(!preserveRefFace)} className="accent-red-600" />
                            Usar Rosto da Referência
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleGenerateNew} 
                            disabled={isLoading}
                            className="py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest border border-gray-600 transition-all"
                        >
                            Gerar do Zero
                        </button>
                        <button 
                            onClick={handleEditExisting} 
                            disabled={isLoading}
                            className="py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-900/20 transition-all"
                        >
                            Aplicar Edição
                        </button>
                    </div>
                </div>
            </div>

            {/* ÁREA DE RESULTADO */}
            <div className="mt-8 flex justify-center">
                <div className="w-full max-w-md bg-black/60 border border-gray-800 rounded-3xl p-4 min-h-[400px] flex flex-col items-center justify-center relative">
                    {isLoading ? (
                        <div className="animate-pulse text-red-500 font-black uppercase text-xs">Processando...</div>
                    ) : editedImage ? (
                        <>
                            <img src={editedImage} className="rounded-2xl w-full mb-4 shadow-2xl" />
                            <button onClick={handleDownload} className="w-full py-3 bg-white text-black font-black rounded-xl text-[10px] uppercase tracking-widest">Baixar PNG</button>
                        </>
                    ) : (
                        <div className="opacity-20 text-center uppercase font-black text-[10px] tracking-[0.3em]">Aguardando</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
