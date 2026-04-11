// @ts-nocheck
import React, { useState, useRef } from 'react';
import { ImageFile } from '../types';
import { generateVideo } from '../services/geminiService';
import { SparklesIcon, FilmIcon } from './Icons';

const VideoGenerator: React.FC = () => {
    const [image, setImage] = useState<ImageFile | null>(null);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
    const [duration, setDuration] = useState<4 | 6 | 8>(8);
    const [vozSelecionada, setVozSelecionada] = useState('bruna-lifestyle');
    const [scriptAudio, setScriptAudio] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target?.result as string;
                setImage({
                    file: file,
                    preview: base64String,
                    base64: base64String, // GARANTINDO QUE O BASE64 ESTEJA PRESENTE
                    mimeType: file.type,   // GARANTINDO O MIMETYPE
                    name: file.name
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!image || !prompt) return;
        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);

        try {
            // CORREÇÃO: Passando os argumentos na ordem exata esperada pelo geminiService.ts
            const result = await generateVideo(
                image, 
                prompt, 
                aspectRatio, 
                (msg) => setProgressMessage(msg), 
                duration // Duração como 5º argumento
            ); 
            setGeneratedVideoUrl(result);
        } catch (err) {
            console.error(err);
            setError('Falha na geração do vídeo. Verifique o console para detalhes.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left p-2">
            <div className="space-y-6 bg-zinc-950/50 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <div className="space-y-2">
                    <label className="text-red-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <span className="bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">1</span>
                        Imagem Base
                    </label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-40 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center bg-black/40 hover:border-red-600/40 transition-all cursor-pointer overflow-hidden"
                    >
                        {image ? <img src={image.preview} className="w-full h-full object-cover" /> : <FilmIcon className="w-8 h-8 text-zinc-700" />}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Formato</label>
                        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as any)} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs text-white outline-none">
                            <option value="9:16">9:16 (Stories)</option>
                            <option value="16:9">16:9 (YouTube)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Duração</label>
                        <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                            {[4, 6, 8].map((d) => (
                                <button key={d} onClick={() => setDuration(d as any)} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${duration === d ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500'}`}>{d}s</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Movimento (Prompt)</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Bruna pisca e sorri..."
                        className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-xs text-white h-24 resize-none focus:border-red-600 outline-none"
                    />
                </div>

                <button onClick={handleGenerate} disabled={isLoading || !image || !prompt} className="w-full flex items-center justify-center gap-3 text-sm font-black py-5 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 text-white disabled:opacity-30 uppercase tracking-[0.2em] shadow-xl hover:scale-[1.01] transition-all">
                    {isLoading ? 'Gerando Animação...' : 'Gerar Vídeo Veo'}
                    <SparklesIcon className="w-5 h-5" />
                </button>
                {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tighter">{error}</p>}
            </div>

            <div className="bg-black/60 rounded-[3rem] p-4 min-h-[500px] border border-white/5 flex flex-col items-center justify-center shadow-inner relative">
                {isLoading ? (
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
                        <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">{progressMessage}</p>
                    </div>
                ) : generatedVideoUrl ? (
                    <video src={generatedVideoUrl} controls autoPlay loop className="max-h-[600px] rounded-[2rem] shadow-2xl border border-white/10" />
                ) : (
                    <div className="opacity-10 text-center">
                        <FilmIcon className="w-20 h-20 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase">Studio Vazio</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGenerator;
