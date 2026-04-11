// @ts-nocheck
import React, { useState, useRef } from 'react';
import FileUpload from './FileUpload';
import { ImageFile, AspectRatio } from '../types';
import { createBackgroundImagePrompt, generateImage } from '../services/geminiService';
import { SparklesIcon, CloudArrowUpIcon } from './Icons';

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

    // FUNÇÃO PARA QUEBRAR TEXTO E NÃO SAIR DA TELA
    const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
        return currentY;
    };

    const renderFinalPost = (bgUrl: string) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
            // Definir tamanho baseado no aspecto escolhido
            const targetWidth = 1080;
            const [wRatio, hRatio] = aspectRatio.split(':').map(Number);
            canvas.width = targetWidth;
            canvas.height = (targetWidth / wRatio) * hRatio;

            // 1. Desenha o fundo (Sua imagem ou a da IA)
            // Ajuste de "Object Cover" no Canvas
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            // 2. Filtro de Contraste (Vinheta Inferior Profissional)
            const grad = ctx.createLinearGradient(0, canvas.height * 0.3, 0, canvas.height);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(1, 'rgba(0,0,0,0.9)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 3. Tipografia de Alto Impacto
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Sombra "Glow" para destacar do fundo
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;

            // Renderizar Título (Maiúsculo, Fonte Forte)
            if (title) {
                const fontSize = Math.floor(canvas.width * 0.12);
                ctx.font = `900 ${fontSize}px "Arial Black", Gadget, sans-serif`;
                ctx.fillStyle = '#FFFFFF';
                // Usamos wrapText para garantir que caiba
                wrapText(ctx, title.toUpperCase(), canvas.width / 2, canvas.height * 0.45, canvas.width * 0.9, fontSize * 1.1);
            }

            // Renderizar Subtítulo
            if (subtitle) {
                const subSize = Math.floor(canvas.width * 0.05);
                ctx.font = `bold ${subSize}px Arial, sans-serif`;
                ctx.fillStyle = '#FF0000'; // Vermelho vibrante para destaque
                ctx.shadowBlur = 10;
                ctx.fillText(subtitle, canvas.width / 2, canvas.height * 0.58);
            }

            // Renderizar Rodapé
            if (additionalInfo) {
                ctx.shadowBlur = 5;
                const infoSize = Math.floor(canvas.width * 0.035);
                ctx.font = `bold ${infoSize}px Arial, sans-serif`;
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                wrapText(ctx, additionalInfo, canvas.width / 2, canvas.height * 0.92, canvas.width * 0.8, infoSize * 1.3);
            }

            setGeneratedImage(canvas.toDataURL('image/png'));
            setIsLoading(false);
        };
        img.src = bgUrl;
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let finalBackground;

            // LÓGICA DE DECISÃO:
            // Se você enviou uma imagem E NÃO escreveu uma descrição de cenário, usamos a SUA imagem direta.
            // Se você escreveu uma descrição, a IA tenta mesclar ou criar.
            if (referenceImage && !backgroundDescription) {
                finalBackground = referenceImage.preview;
            } else {
                const prompt = await createBackgroundImagePrompt(backgroundDescription || "cinematic background", referenceImage || undefined);
                finalBackground = await generateImage(prompt, aspectRatio);
            }

            renderFinalPost(finalBackground);
        } catch (e) {
            setError("Erro ao processar post: " + e.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-10 p-6 max-w-7xl mx-auto">
            {/* PAINEL DE CONTROLE */}
            <div className="w-full lg:w-1/2 space-y-6 bg-zinc-900/50 p-8 rounded-[2rem] border border-white/10">
                <header>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter">DESIGNER <span className="text-red-600">PRO</span></h2>
                    <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Geração de Posts Magníficos</p>
                </header>

                <div className="space-y-4">
                    <label className="block">
                        <span className="text-[10px] font-black text-red-500 uppercase mb-2 block">1. Sua Foto de Fundo</span>
                        <FileUpload onFileSelect={setReferenceImage} />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setAspectRatio('9:16')} className={`p-4 rounded-xl border font-bold ${aspectRatio === '9:16' ? 'bg-red-600 border-red-500' : 'bg-black border-zinc-800 text-zinc-500'}`}>9:16 (STORY)</button>
                        <button onClick={() => setAspectRatio('1:1')} className={`p-4 rounded-xl border font-bold ${aspectRatio === '1:1' ? 'bg-red-600 border-red-500' : 'bg-black border-zinc-800 text-zinc-500'}`}>1:1 (FEED)</button>
                    </div>

                    <label className="block">
                        <span className="text-[10px] font-black text-red-500 uppercase mb-2 block">2. Textos do Post</span>
                        <input type="text" placeholder="TÍTULO DE IMPACTO" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white font-bold mb-3" />
                        <input type="text" placeholder="Subtítulo ou Chamada" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white text-sm" />
                    </label>

                    <label className="block">
                        <span className="text-[10px] font-black text-red-500 uppercase mb-2 block">3. Instrução para IA (Opcional)</span>
                        <textarea 
                            placeholder="Deixe em branco para usar sua foto original. Escreva aqui se quiser que a IA altere o fundo (ex: adicione fumaça, mude as luzes)." 
                            value={backgroundDescription} 
                            onChange={e => setBackgroundDescription(e.target.value)} 
                            className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white text-xs h-24"
                        />
                    </label>

                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading}
                        className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-900/20 uppercase tracking-widest"
                    >
                        {isLoading ? 'ESTILIZANDO POST...' : 'GERAR ARTE FINAL'}
                    </button>
                </div>
            </div>

            {/* PREVIEW FINAL */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-black rounded-[3rem] border border-white/5 min-h-[600px] overflow-hidden shadow-2xl">
                {generatedImage ? (
                    <div className="flex flex-col items-center p-4">
                        <img src={generatedImage} alt="Post" className="max-h-[80vh] rounded-2xl shadow-2xl border border-white/10" />
                        <a href={generatedImage} download="qualyhop-post.png" className="mt-6 px-12 py-4 bg-white text-black font-black rounded-full hover:bg-red-600 hover:text-white transition-all text-xs tracking-widest">BAIXAR AGORA</a>
                    </div>
                ) : (
                    <div className="text-center opacity-10">
                        <SparklesIcon className="w-20 h-20 mx-auto text-white mb-4" />
                        <p className="font-black text-white tracking-[0.5em] uppercase text-[10px]">Preview Indisponível</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCreator;
