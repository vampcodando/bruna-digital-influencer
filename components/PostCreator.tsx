// @ts-nocheck
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { ImageFile, AspectRatio } from '../types';
import { createBackgroundImagePrompt, generateImage } from '../services/geminiService';
import { SparklesIcon } from './Icons';

const AspectRatioButton: React.FC<{
  value: AspectRatio;
  label: string;
  description: string;
  current: AspectRatio;
  onClick: (value: AspectRatio) => void;
}> = ({ value, label, description, current, onClick }) => (
  <button
    onClick={() => onClick(value)}
    className={`p-3 rounded-xl border text-left transition-all w-full backdrop-blur-sm
      ${current === value ? 'bg-red-600/40 border-red-500/80 ring-2 ring-red-400' : 'bg-red-900/20 border-red-500/30 hover:bg-red-900/40'}`}
  >
    <div className="font-bold text-md text-white">{label}</div>
    <div className="text-xs text-gray-300">{description}</div>
  </button>
);

const PostCreator: React.FC = () => {
    const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [backgroundDescription, setBackgroundDescription] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const renderFinalPost = (bgUrl: string) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            // 1. Desenha o fundo da IA
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 2. Overlay de Degradê (Vinheta) para legibilidade do texto
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, 'rgba(0,0,0,0.5)');
            grad.addColorStop(0.4, 'transparent');
            grad.addColorStop(1, 'rgba(0,0,0,0.85)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 3. Configuração de Estilo de Texto
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            // Título (Maiúsculo e Centralizado)
            const titleSize = Math.floor(canvas.width * 0.09);
            ctx.font = `bold ${titleSize}px Arial Black, sans-serif`;
            ctx.fillText(title.toUpperCase(), canvas.width / 2, canvas.height * 0.45);

            // Subtítulo
            const subSize = Math.floor(canvas.width * 0.045);
            ctx.font = `bold ${subSize}px Arial, sans-serif`;
            ctx.fillStyle = '#f3f4f6';
            ctx.fillText(subtitle, canvas.width / 2, canvas.height * 0.51);

            // Informações (Rodapé)
            const infoSize = Math.floor(canvas.width * 0.038);
            ctx.font = `${infoSize}px Arial, sans-serif`;
            ctx.fillStyle = 'white';
            ctx.fillText(additionalInfo, canvas.width / 2, canvas.height * 0.92);

            setGeneratedImage(canvas.toDataURL('image/png'));
            setIsLoading(false);
        };
        img.src = bgUrl;
    };

    const handleGenerate = async () => {
        if (!backgroundDescription) {
            setError('Descreva o cenário do post.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const detailedPrompt = await createBackgroundImagePrompt(backgroundDescription, referenceImage || undefined);
            const baseImage = await generateImage(detailedPrompt, aspectRatio);
            renderFinalPost(baseImage);
        } catch (e: any) {
            setError('Erro: ' + e.message);
            setIsLoading(false);
        }
    };

    const inputStyle = "w-full bg-black/60 border border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-red-600 transition-all";
    const labelStyle = "block mb-2 text-[10px] font-black uppercase tracking-widest text-red-500";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
            <div className="space-y-6 bg-black/40 p-8 rounded-[2.5rem] border border-red-500/20 shadow-2xl">
                <div>
                    <span className={labelStyle}>1. Formato & Referência</span>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <AspectRatioButton value="9:16" label="Story" description="Vertical" current={aspectRatio} onClick={setAspectRatio} />
                        <AspectRatioButton value="16:9" label="Widescreen" description="Horizontal" current={aspectRatio} onClick={setAspectRatio} />
                    </div>
                    <FileUpload onFileSelect={setReferenceImage} label="Imagem de Referência" />
                </div>

                <div className="space-y-4">
                    <span className={labelStyle}>2. Conteúdo Visual</span>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (Ex: DIA DE GRENAL)" className={inputStyle} />
                    <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtítulo (Ex: Inter x Grêmio)" className={inputStyle} />
                    <textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} placeholder="Info Rodapé (Ex: Estádio Beira-Rio)" className={inputStyle + " h-20"} />
                </div>

                <div>
                    <span className={labelStyle}>3. Cenário da IA</span>
                    <textarea value={backgroundDescription} onChange={(e) => setBackgroundDescription(e.target.value)} placeholder="Fundo (Ex: Interior do estádio lotado com fumaça vermelha...)" className={inputStyle + " h-24"} />
                </div>

                <button onClick={handleGenerate} disabled={isLoading} className="w-full py-5 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 text-white font-black uppercase tracking-[0.3em] shadow-lg hover:scale-[1.02] transition-all">
                    {isLoading ? "PROCESSANDO..." : "Gerar Post Completo"}
                </button>
                {error && <p className="text-red-500 text-center text-xs font-bold">{error}</p>}
            </div>

            <div className="bg-black/80 rounded-[3rem] border border-white/5 relative flex items-center justify-center min-h-[600px] overflow-hidden shadow-inner">
                {generatedImage ? (
                    <div className="flex flex-col items-center p-6">
                        <img src={generatedImage} className="max-h-[750px] rounded-2xl shadow-2xl border border-white/10" alt="Post Final" />
                        <a href={generatedImage} download="post-final.png" className="mt-6 px-10 py-4 bg-white text-black font-black rounded-full text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Baixar Imagem</a>
                    </div>
                ) : (
                    <div className="text-center opacity-20">
                        <SparklesIcon className="w-16 h-16 mx-auto mb-4" />
                        <p className="font-black uppercase text-[10px] tracking-[0.3em]">Aguardando Produção</p>
                    </div>
                )}
                {isLoading && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-white font-black text-[10px] tracking-[0.4em] animate-pulse">MIXANDO FUNDO E TEXTO...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCreator;
