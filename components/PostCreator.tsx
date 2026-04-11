// @ts-nocheck
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { ImageFile, AspectRatio } from '../types';
import { createBackgroundImagePrompt, generateImage } from '../services/geminiService';
import { SparklesIcon } from './Icons';

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

    // FUNÇÃO PROFISSIONAL DE QUEBRA DE LINHA
    const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
        const words = text.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            if (ctx.measureText(testLine).width > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else { line = testLine; }
        }
        ctx.fillText(line, x, y);
    };

    const renderFinalPost = (bgUrl: string) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const targetWidth = 1080;
            const [w, h] = aspectRatio.split(':').map(Number);
            canvas.width = targetWidth;
            canvas.height = (targetWidth / w) * h;

            // Fundo (Object Fit: Cover)
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            ctx.drawImage(img, (canvas.width - img.width * scale) / 2, (canvas.height - img.height * scale) / 2, img.width * scale, img.height * scale);

            // Vinheta para leitura
            const grad = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(1, 'rgba(0,0,0,0.85)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Título Impacto (Arial Black)
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 15;
            const fontSize = Math.floor(canvas.width * 0.11);
            ctx.font = `900 ${fontSize}px "Arial Black", sans-serif`;
            wrapText(ctx, title.toUpperCase(), canvas.width / 2, canvas.height * 0.45, canvas.width * 0.9, fontSize * 1.1);

            // Subtítulo
            ctx.font = `bold ${Math.floor(canvas.width * 0.05)}px Arial`;
            ctx.fillStyle = '#ff1a1a';
            ctx.fillText(subtitle, canvas.width / 2, canvas.height * 0.55);

            // Info Rodapé
            ctx.font = `bold ${Math.floor(canvas.width * 0.035)}px Arial`;
            ctx.fillStyle = 'white';
            ctx.fillText(additionalInfo, canvas.width / 2, canvas.height * 0.92);

            setGeneratedImage(canvas.toDataURL('image/png'));
            setIsLoading(false);
        };
        img.src = bgUrl;
    };

    const handleGenerate = async () => {
        setIsLoading(true); setError(null);
        try {
            let finalBg = (referenceImage && !backgroundDescription) 
                ? referenceImage.preview 
                : await generateImage(await createBackgroundImagePrompt(backgroundDescription || "cinematic background", referenceImage || undefined), aspectRatio);
            renderFinalPost(finalBg);
        } catch (e) { setError(e.message); setIsLoading(false); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 bg-black min-h-screen text-white">
            <div className="space-y-6 bg-zinc-900/50 p-8 rounded-3xl border border-white/10">
                <h2 className="text-xl font-black text-red-600 uppercase italic">Qualyhop Studio</h2>
                <FileUpload onFileSelect={setReferenceImage} />
                <div className="grid grid-cols-2 gap-2">
                    {['9:16', '1:1'].map(r => (
                        <button key={r} onClick={() => setAspectRatio(r)} className={`p-3 rounded-xl border ${aspectRatio === r ? 'bg-red-600 border-red-500' : 'bg-black border-zinc-800 text-zinc-500'}`}>{r}</button>
                    ))}
                </div>
                <input type="text" placeholder="TÍTULO PRINCIPAL" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl" />
                <input type="text" placeholder="Subtítulo" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl" />
                <textarea placeholder="Descrição para IA (Opcional)" value={backgroundDescription} onChange={e => setBackgroundDescription(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl h-24" />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full py-5 bg-red-600 rounded-2xl font-black uppercase tracking-widest">{isLoading ? 'CRIANDO...' : 'GERAR POST'}</button>
                {error && <p className="text-red-500 text-center text-xs">{error}</p>}
            </div>
            <div className="flex items-center justify-center bg-zinc-950 rounded-3xl border border-white/5 relative overflow-hidden">
                {generatedImage ? (
                    <div className="text-center p-4">
                        <img src={generatedImage} className="max-h-[80vh] rounded-lg shadow-2xl" />
                        <a href={generatedImage} download="post.png" className="mt-4 inline-block px-8 py-3 bg-white text-black font-black rounded-full uppercase text-xs">Baixar Arte</a>
                    </div>
                ) : <SparklesIcon className="w-12 h-12 opacity-10 animate-pulse" />}
            </div>
        </div>
    );
};

export default PostCreator;
