// @ts-nocheck
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { ImageFile, AspectRatio } from '../types';
import { createBackgroundImagePrompt, generateImage } from '../services/geminiService';
import { SparklesIcon } from './Icons';

// Componente de Botão Isolado e Seguro
const AspectRatioButton: React.FC<{
    value: AspectRatio;
    label: string;
    description: string;
    current: AspectRatio;
    onClick: (value: AspectRatio) => void;
}> = ({ value, label, description, current, onClick }) => {
    const isActive = current === value;
    const baseClasses = "p-3 rounded-xl border text-left transition-all w-full backdrop-blur-sm";
    const activeClasses = "bg-red-600/40 border-red-500/80 ring-2 ring-red-400";
    const inactiveClasses = "bg-red-900/20 border-red-500/30 hover:bg-red-900/40";

    return (
        <button
            onClick={() => onClick(value)}
            className={baseClasses + " " + (isActive ? activeClasses : inactiveClasses)}
        >
            <div className="font-bold text-md text-white">{label}</div>
            <div className="text-xs text-gray-300">{description}</div>
        </button>
    );
};

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
        if (typeof window === 'undefined') return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            // 1. Fundo
            ctx.drawImage(img, 0, 0);

            // 2. Degradê Escuro (Overlay)
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, 'rgba(0,0,0,0.4)');
            grad.addColorStop(0.5, 'transparent');
            grad.addColorStop(1, 'rgba(0,0,0,0.8)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 3. Textos (Usando concatenação segura para evitar TS1160)
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 10;

            const titleFontSize = Math.floor(canvas.width * 0.08);
            ctx.font = "bold " + titleFontSize + "px Arial";
            ctx.fillText(title.toUpperCase(), canvas.width / 2, canvas.height * 0.45);

            const subtitleFontSize = Math.floor(canvas.width * 0.04);
            ctx.font = subtitleFontSize + "px Arial";
            ctx.fillStyle = '#e5e7eb';
            ctx.fillText(subtitle, canvas.width / 2, canvas.height * 0.50);

            const infoFontSize = Math.floor(canvas.width * 0.035);
            ctx.font = infoFontSize + "px Arial";
            ctx.fillStyle = 'white';
            ctx.fillText(additionalInfo, canvas.width / 2, canvas.height * 0.90);

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
            setError('Erro ao gerar post: ' + e.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
            <div className="space-y-6 bg-black/40 p-8 rounded-[2.5rem] border border-red-500/20 shadow-2xl">
                <div className="space-y-4">
                    <h3 className="text-white font-black uppercase text-xs tracking-widest text-red-500">1. Formato do Post</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AspectRatioButton value="9:16" label="Story" description="TikTok/Reels" current={aspectRatio} onClick={setAspectRatio} />
                        <AspectRatioButton value="16:9" label="Widescreen" description="YouTube/Ads" current={aspectRatio} onClick={setAspectRatio} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-white font-black uppercase text-xs tracking-widest text-red-500">2. Textos do Layout</h3>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título Principal" className="w-full bg-black/60 border border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-red-600" />
                    <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtítulo" className="w-full bg-black/60 border border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-red-600" />
                    <textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} placeholder="Informações adicionais (Data, Local, CTA...)" className="w-full bg-black/60 border border-zinc-800 p-4 rounded-xl text-white h-24 outline-none focus:border-red-600" />
                </div>

                <div className="space-y-4">
                    <h3 className="text-white font-black uppercase text-xs tracking-widest text-red-500">3. Fundo da IA</h3>
                    <textarea value={backgroundDescription} onChange={(e) => setBackgroundDescription(e.target.value)} placeholder="Ex: Interior de um estádio de futebol moderno lotado..." className="w-full bg-black/60 border border-zinc-800 p-4 rounded-xl text-white h-24 outline-none focus:border-red-600" />
                    <FileUpload onFileSelect={setReferenceImage} label="Usar Referência Visual" />
                </div>

                <button onClick={handleGenerate} disabled={isLoading} className="w-full py-5 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 text-white font-black uppercase tracking-[0.3em] shadow-lg hover:scale-[1.02] transition-all">
                    {isLoading ? "PRODUZINDO..." : "Gerar Post Completo"}
                </button>
                {error && <p className="text-red-500 text-center text-xs font-bold">{error}</p>}
            </div>

            <div className="bg-black/80 rounded-[3rem] border border-white/5 relative flex items-center justify-center overflow-hidden min-h-[600px] shadow-inner">
                {generatedImage ? (
                    <div className="flex flex-col items-center p-4">
                        <img src={generatedImage} className="max-h-[700px] rounded-2xl shadow-2xl border border-white/10" alt="Post Final" />
                        <a href={generatedImage} download="post-final.png" className="mt-6 px-8 py-4 bg-white text-black font-black rounded-full text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-lg">Baixar Imagem Pronta</a>
                    </div>
                ) : (
                    <div className="text-center opacity-20">
                        <SparklesIcon className="w-20 h-20 mx-auto mb-4" />
                        <p className="font-black uppercase text-xs tracking-widest">Aguardando Criação</p>
                    </div>
                )}
                {isLoading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-white font-black text-[10px] tracking-[0.3em] animate-pulse">CRIANDO POST PROFISSIONAL...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCreator;
