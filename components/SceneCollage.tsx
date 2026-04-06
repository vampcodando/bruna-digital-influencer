
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { ImageFile, AspectRatio } from '../types';
import { generateSceneFromImages } from '../services/geminiService';
import { SparklesIcon, SquaresPlusIcon, XCircleIcon } from './Icons';

const SceneCollage: React.FC = () => {
    const [images, setImages] = useState<(ImageFile | null)[]>(new Array(6).fill(null));
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [isLoading, setIsLoading] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (index: number, file: ImageFile) => {
        const newImages = [...images];
        newImages[index] = file;
        setImages(newImages);
    };

    const handleFileClear = (index: number) => {
        const newImages = [...images];
        newImages[index] = null;
        setImages(newImages);
    };

    const handleDownload = async () => {
        if (!resultImage) return;
        try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = resultImage;
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
                    link.download = `CrIA-Cena-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                    }, 100);
                }, 'image/png');
            };
        } catch (err) {
            console.error("Erro no download:", err);
            setError("Falha ao salvar imagem.");
        }
    };

    const handleGenerate = async () => {
        const activeImages = images.filter((img): img is ImageFile => img !== null);
        if (activeImages.length === 0) {
            setError("Adicione pelo menos 1 imagem para compor.");
            return;
        }
        if (!prompt) {
            setError("Descreva como a cena deve ser montada.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const result = await generateSceneFromImages(activeImages, prompt, aspectRatio);
            setResultImage(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erro ao gerar cena.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Lado Esquerdo: Inputs */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-red-400 font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                            <SquaresPlusIcon /> Carregar Elementos (1 a 6)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {images.map((_, idx) => (
                                <div key={idx} className="relative">
                                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-black text-white z-10 border border-white/20">
                                        {idx + 1}
                                    </div>
                                    <FileUpload 
                                        id={`scene-upload-${idx}`}
                                        onFileSelect={(file) => handleFileSelect(idx, file)}
                                        onFileClear={() => handleFileClear(idx)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
                        <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">Descrição da Cena Final</label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ex: Reúna estas pessoas em uma paisagem futurista com iluminação cinematográfica e névoa..."
                            className="w-full p-4 bg-gray-950/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 text-white mb-6"
                            rows={3}
                        />

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Formato de Saída</label>
                            <div className="flex gap-2">
                                {(['16:9', '9:16', '1:1'] as AspectRatio[]).map(r => (
                                    <button 
                                        key={r}
                                        onClick={() => setAspectRatio(r)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${aspectRatio === r ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'bg-gray-800 text-gray-400'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50"
                        >
                            {isLoading ? 'Compondo Cena...' : 'Criar Cena'}
                            <SparklesIcon />
                        </button>
                    </div>
                </div>

                {/* Lado Direito: Preview */}
                <div className="relative bg-gray-900/20 border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center min-h-[400px] p-6 overflow-hidden">
                    {isLoading && (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500 mx-auto mb-4"></div>
                            <p className="text-red-400 font-bold uppercase tracking-widest text-xs animate-pulse">Integrando imagens...</p>
                        </div>
                    )}

                    {resultImage && (
                        <div className="w-full animate-in fade-in duration-500">
                            <img src={resultImage} alt="Cena Gerada" className="w-full rounded-xl shadow-2xl border border-red-500/30 mb-4" />
                            <button 
                                onClick={handleDownload}
                                className="w-full py-3 bg-white text-black font-black rounded-xl uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                            >
                                💾 Baixar Resultado (.PNG)
                            </button>
                        </div>
                    )}

                    {!isLoading && !resultImage && (
                        <div className="text-center opacity-20">
                            <SquaresPlusIcon className="w-24 h-24 mx-auto mb-4" />
                            <p className="font-bold uppercase tracking-widest text-sm">Visualização da Cena</p>
                        </div>
                    )}

                    {error && (
                        <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-900/80 border border-red-500 rounded-lg text-white text-xs font-bold flex items-center gap-2">
                            <XCircleIcon className="w-4 h-4" /> {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SceneCollage;
