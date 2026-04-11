import React, { useState } from 'react';
import { AspectRatio } from '../types';
import { generateImage } from '../services/geminiService';
import { SparklesIcon, PhotoIcon } from './Icons';

const AspectRatioToggle: React.FC<{
  value: AspectRatio;
  label: string;
  current: AspectRatio;
  onClick: (value: AspectRatio) => void;
}> = ({ value, label, current, onClick }) => (
  <button
    onClick={() => onClick(value)}
    className={`px-4 py-2 rounded-lg border-2 text-center transition-all text-sm font-semibold
      ${current === value ? 'bg-red-500/20 border-red-500 text-white' : 'bg-gray-800/30 border-gray-700 hover:border-red-400 text-gray-300'}`}
  >
    {label}
  </button>
);

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        if (!generatedImage) return;

        try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = generatedImage;

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
                    link.download = `CrIA-Base-Gen-${Date.now()}.png`;

                    document.body.appendChild(link);
                    link.click();

                    setTimeout(() => {
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                    }, 100);
                }, 'image/png');
            };
        } catch (err) {
            console.error("Erro ao baixar:", err);
            setError("Erro ao preparar download.");
        }
    };

    const handleGenerate = async () => {
        if (!prompt) {
            setError('Por favor, insira um prompt para gerar a imagem.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            // Utilizando a função pura conforme sua lógica antiga
            const image = await generateImage(prompt, aspectRatio);
            setGeneratedImage(image);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido ao gerar a imagem.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors placeholder:text-gray-500 text-white";
    const labelClass = "block mb-2 text-sm font-medium text-gray-300";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <div>
                    <label htmlFor="prompt" className={labelClass}>1. Descreva a Imagem</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Um jogador de futebol do Internacional comemorando um gol no estádio Beira-Rio, estilo hyper-realista, iluminação dramática..."
                        rows={5}
                        className={inputClass}
                    />
                </div>

                <div>
                    <h3 className={labelClass}>2. Escolha a Proporção</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        <AspectRatioToggle value="1:1" label="1:1" current={aspectRatio} onClick={setAspectRatio} />
                        <AspectRatioToggle value="16:9" label="16:9" current={aspectRatio} onClick={setAspectRatio} />
                        <AspectRatioToggle value="9:16" label="9:16" current={aspectRatio} onClick={setAspectRatio} />
                        <AspectRatioToggle value="4:3" label="4:3" current={aspectRatio} onClick={setAspectRatio} />
                        <AspectRatioToggle value="3:4" label="3:4" current={aspectRatio} onClick={setAspectRatio} />
                    </div>
                </div>
                
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !prompt}
                    className="w-full flex items-center justify-center gap-2 text-lg font-bold py-4 px-6 rounded-xl bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    {isLoading ? 'Gerando Imagem...' : 'Gerar Imagem'}
                    <SparklesIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="flex flex-col items-center justify-center h-full bg-gray-900/50 rounded-lg p-4 min-h-[400px] md:min-h-full border border-gray-800 border-dashed">
                {isLoading && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                        <p className="mt-4 text-gray-300 font-bold uppercase text-[10px] tracking-widest">Criando sua imagem...</p>
                    </div>
                )}
                {error && <p className="text-red-400 text-center font-bold text-sm">{error}</p>}
                {generatedImage && (
                    <div className="w-full">
                        <img src={generatedImage} alt="Generated" className="rounded-lg w-full object-contain mb-4 shadow-2xl border border-gray-700" />
                        <button 
                            onClick={handleDownload}
                            className="inline-block w-full text-center py-3 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold transition-colors uppercase tracking-widest text-xs"
                        >
                            Baixar Imagem (.PNG)
                        </button>
                    </div>
                )}
                {!isLoading && !error && !generatedImage && (
                    <div className="text-center text-gray-600">
                       <PhotoIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                       <p className="font-bold uppercase text-[10px] tracking-widest opacity-40">Aguardando seu comando</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageGenerator;
