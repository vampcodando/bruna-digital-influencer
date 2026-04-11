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
        if (!image || !prompt) {
            setError("Selecione uma imagem e digite o prompt de movimento.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);

        try {
            // CHAMADA CORRIGIDA COM TODOS OS ARGUMENTOS
            const result = await generateVideo(
                image, 
                prompt, 
                aspectRatio, 
                (msg) => setProgressMessage(msg), 
                duration
            ); 
            setGeneratedVideoUrl(result);
        } catch (err) {
            console.error(err);
            setError('Falha ao gerar vídeo. Verifique se o modelo Veo 3.1 está ativo na sua conta.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-zinc-950/50 rounded-[3rem] border border-white/5">
            <div className="space-y-6">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[9/16] max-h-[400px] mx-auto bg-black/60 rounded-3xl border-2 border-dashed border-zinc-800 hover:border-red-600/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group"
                >
                    {image ? (
                        <img src={image.preview} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center p-6">
                            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <FilmIcon className="text-zinc-500" />
                            </div>
                            <p className="text-zinc-500 font-bold text-xs uppercase">Carregar Personagem</p>
                        </div>
                    )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-red-500">Direção de Movimento</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Ela pisca suavemente e sorri para a câmera, luz de fundo piscando..."
                        className="w-full bg-black/80 border border-zinc-800 p-4 rounded-2xl text-white text-sm h-24 outline-none focus:border-red-600 transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 block mb-2">Duração (Segundos)</label>
                        <select 
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-white text-xs outline-none"
                        >
                            <option value={4}>4 Segundos</option>
                            <option value={6}>6 Segundos</option>
                            <option value={8}>8 Segundos</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 block mb-2">Formato</label>
                        <select 
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as any)}
                            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-white text-xs outline-none"
                        >
                            <option value="9:16">Vertical (Reels/TikTok)</option>
                            <option value="16:9">Horizontal (YouTube)</option>
                        </select>
                    </div>
                </div>

                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !image || !prompt}
                    className="w-full flex items-center justify-center gap-3 text-sm font-black py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 text-white disabled:opacity-30 uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    {isLoading ? 'Gerando...' : 'Gerar Animação Veo'}
                    <SparklesIcon className="w-5 h-5" />
                </button>
                {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tighter">{error}</p>}
            </div>

            <div className="flex flex-col items-center justify-center bg-black/80 rounded-[2.5rem] p-4 min-h-[500px] border border-zinc-800/50 relative overflow-hidden shadow-inner">
                {isLoading && (
                    <div className="text-center z-10">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">{progressMessage}</p>
                    </div>
                )}
                {generatedVideoUrl && (
                    <video src={generatedVideoUrl} controls autoPlay loop className="max-h-[600px] rounded-3xl shadow-2xl border border-white/10" />
                )}
                {!isLoading && !generatedVideoUrl && (
                    <div className="text-center opacity-20">
                        <FilmIcon className="w-20 h-20 text-white mx-auto mb-4" />
                        <p className="text-white text-xs font-black uppercase tracking-widest">Aguardando Produção</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGenerator;
