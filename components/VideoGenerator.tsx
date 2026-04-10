// @ts-nocheck
import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import { ImageFile } from '../types';
import { generateVideo } from '../services/geminiService';
import { SparklesIcon, FilmIcon, SpeakerWaveIcon, DocumentTextIcon } from './Icons';
import { Preferences } from '@capacitor/preferences';

const VideoGenerator: React.FC = () => {
    const [image, setImage] = useState<ImageFile | null>(null);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
    const [duration, setDuration] = useState<4 | 6 | 8>(8);
    
    // --- NOVOS ESTADOS PARA VOZ E SCRIPT ---
    const [vozSelecionada, setVozSelecionada] = useState('bruna-lifestyle');
    const [scriptAudio, setScriptAudio] = useState('');
    const [audioFile, setAudioFile] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Lógica de Geração (Simulada para integrar com seu backend)
    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setProgressMessage('Sincronizando Voz e Gerando Frames...');
        
        try {
            // Aqui entra a sua chamada de serviço enviando:
            // image, aspectRatio, duration, vozSelecionada, scriptAudio e prompt
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
                
                {/* 1. ENVIO DA IMAGEM INICIAL */}
                <div className="space-y-2">
                    <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <span className="bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">1</span>
                        Envie a Imagem Inicial (Bruna)
                    </label>
                    <FileUpload onFileSelect={(file) => setImage(file)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* 2. FORMATO DE SAÍDA */}
                    <div className="space-y-2">
                        <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                            <span className="bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">2</span>
                            Formato de Saída
                        </label>
                        <select 
                            value={aspectRatio} 
                            onChange={(e) => setAspectRatio(e.target.value as any)}
                            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs text-white outline-none focus:border-red-600 transition-all"
                        >
                            <option value="9:16">TikTok / Reels (9:16)</option>
                            <option value="16:9">YouTube / Wide (16:9)</option>
                        </select>
                    </div>

                    {/* 3. DURAÇÃO */}
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
                                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${duration === d ? 'bg-red-700 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    {d}s
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. ESCOLHA A VOZ OU SUBA MODELO */}
                <div className="space-y-4 bg-zinc-900/50 p-4 rounded-2xl border border-red-900/10">
                    <label className="text-red-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <span className="bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">4</span>
                        Sincronia de Voz (ElevenLabs)
                    </label>
                    
                    <div className="space-y-3">
                        <select 
                            value={vozSelecionada} 
                            onChange={(e) => setVozSelecionada(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-xs text-white outline-none focus:border-red-600 transition-all"
                        >
                            <option value="bruna-lifestyle">Bruna - Lifestyle (Natural)</option>
                            <option value="bruna-vendedora">Bruna - Vendedora (Excited)</option>
                            <option value="bruna-urgente">Bruna - Urgência (Fast)</option>
                            <option value="custom">Subir Modelo de Voz (.mp3)</option>
                        </select>

                        <div className="relative">
                            <label className="text-[9px] text-zinc-600 uppercase font-bold ml-1 mb-1 block">Cole o Script de Fala</label>
                            <textarea 
                                value={scriptAudio}
                                onChange={(e) => setScriptAudio(e.target.value)}
                                placeholder="Cole aqui o texto que você copiou do Diretor IA..."
                                className="w-full bg-black/40 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-300 outline-none focus:border-red-900 h-20 resize-none font-medium italic"
                            />
                        </div>
                    </div>
                </div>

                {/* 5. DESCREVA O MOVIMENTO */}
                <div className="space-y-2">
                    <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                        <span className="bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">5</span>
                        Descreva o Movimento (Visual Prompt)
                    </label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Cole aqui o Visual Prompt técnico do Diretor IA..."
                        className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-xs text-white outline-none focus:border-red-600 h-28 resize-none shadow-inner"
                    />
                </div>

                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !image || !prompt}
                    className="w-full flex items-center justify-center gap-3 text-sm font-black py-5 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 text-white disabled:opacity-30 active:scale-95 transition-all shadow-xl shadow-red-900/20 uppercase tracking-[0.2em]"
                >
                    {isLoading ? 'Sincronizando e Gerando...' : 'Gerar Vídeo com Voz'}
                    <SparklesIcon className="w-5 h-5" />
                </button>
            </div>

            {/* PREVIEW DO VÍDEO GERADO */}
            <div className="flex flex-col items-center justify-center bg-black/40 rounded-[2.5rem] p-4 min-h-[500px] border border-zinc-800/50 relative overflow-hidden">
                <div className="absolute top-6 left-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Live Preview Render</span>
                </div>

                {isLoading && (
                    <div className="text-center z-10">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-red-900/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-white text-xs font-black uppercase tracking-widest animate-pulse">{progressMessage}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-2xl text-center">
                        <p className="text-red-500 text-xs font-bold">{error}</p>
                    </div>
                )}

                {generatedVideoUrl && (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <video 
                            src={generatedVideoUrl} 
                            controls 
                            autoPlay 
                            loop 
                            className={`rounded-2xl shadow-2xl border-2 border-zinc-800 ${aspectRatio === '9:16' ? 'max-h-[600px] w-auto' : 'w-full'}`} 
                        />
                    </div>
                )}

                {!isLoading && !generatedVideoUrl && !error && (
                    <div className="text-center opacity-20">
                        <FilmIcon className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.3em]">Aguardando Ordem de Produção</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGenerator;