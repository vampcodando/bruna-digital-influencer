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

    // Referência para o input escondido que abre a galeria
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage({
                    file: file,
                    preview: event.target?.result as string,
                    name: file.name
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setProgressMessage('Sincronizando Voz e Gerando Frames...');
        try {
            const result = await generateVideo(image, prompt); 
            setGeneratedVideoUrl(result);
        } catch (err) {
            setError('Falha na geração do vídeo sincronizado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
            <div className="space-y-6 bg-black/20 p-6 rounded-[2rem] border border-zinc-800/50">

                {/* 1. ENVIO DA IMAGEM - VERSÃO MOBILE OPTIMIZED */}
                <div className="space-y-2">
                    <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <span className="bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">1</span>
                        Envie a Imagem Inicial (Bruna)
                    </label>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />

                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all cursor-pointer overflow-hidden"
                    >
                        {image ? (
                            <img src={image.preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <SparklesIcon className="w-6 h-6 text-zinc-600" />
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">Toque para selecionar imagem</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                            <span className="bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">2</span>
                            Formato de Saída
                        </label>
                        <select 
                            value={aspectRatio} 
                            onChange={(e) => setAspectRatio(e.target.value as any)}
                            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs text-white outline-none focus:border-red-600"
                        >
                            <option value="9:16">TikTok / Reels (9:16)</option>
                            <option value="16:9">YouTube / Wide (16:9)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                            <span className="bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">3</span>
                            Duração
                        </label>
                        <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                            {[4, 6, 8].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d as any)}
                                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg ${duration === d ? 'bg-red-700 text-white shadow-lg' : 'text-zinc-500'}`}
                                >
                                    {d}s
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 bg-zinc-900/50 p-4 rounded-2xl border border-red-900/10">
                    <label className="text-red-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <span className="bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">4</span>
                        Sincronia de Voz (ElevenLabs)
                    </label>
                    <div className="space-y-3">
                        <select 
                            value={vozSelecionada} 
                            onChange={(e) => setVozSelecionada(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-xs text-white outline-none"
                        >
                            <option value="bruna-lifestyle">Bruna - Lifestyle (Natural)</option>
                            <option value="bruna-vendedora">Bruna - Vendedora (Excited)</option>
                            <option value="bruna-urgente">Bruna - Urgência (Fast)</option>
                        </select>
                        <textarea 
                            value={scriptAudio}
                            onChange={(e) => setScriptAudio(e.target.value)}
                            placeholder="Cole aqui o texto da Bruna..."
                            className="w-full bg-black/40 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-300 h-20 resize-none font-medium italic"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <span className="bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">5</span>
                        Descreva o Movimento
                    </label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Visual Prompt técnico..."
                        className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-xs text-white h-28 resize-none"
                    />
                </div>

                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !image || !prompt}
                    className="w-full flex items-center justify-center gap-3 text-sm font-black py-5 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 text-white disabled:opacity-30 uppercase tracking-[0.2em]"
                >
                    {isLoading ? 'Gerando...' : 'Gerar Vídeo'}
                    <SparklesIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="flex flex-col items-center justify-center bg-black/40 rounded-[2.5rem] p-4 min-h-[500px] border border-zinc-800/50 relative overflow-hidden">
                {isLoading && (
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white text-[10px] font-black uppercase tracking-widest">{progressMessage}</p>
                    </div>
                )}
                {generatedVideoUrl && (
                    <video src={generatedVideoUrl} controls autoPlay loop className="max-h-[500px] rounded-2xl" />
                )}
                {!isLoading && !generatedVideoUrl && (
                    <FilmIcon className="w-16 h-16 text-zinc-800 opacity-20" />
                )}
            </div>
        </div>
    );
};

export default VideoGenerator;
