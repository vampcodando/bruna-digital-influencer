import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import { ImageFile } from '../types';
import { generateVideo } from '../services/geminiService';
import { SparklesIcon } from './Icons';
import { Preferences } from '@capacitor/preferences';

const VideoGenerator: React.FC = () => {
    const [image, setImage] = useState<ImageFile | null>(null);
    const [prompt, setPrompt] = useState('');
    
    // --- ESTADOS DE FORMATO E DURAÇÃO ---
    // Definimos 9:16 (TikTok) como padrão conforme solicitado
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
    const [duration, setDuration] = useState<4 | 6 | 8>(8); 
    
    const [isLoading, setIsLoading] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isKeySelected, setIsKeySelected] = useState(false);
    const [inputApiKey, setInputApiKey] = useState('');

    useEffect(() => {
        const loadSavedKey = async () => {
            const { value } = await Preferences.get({ key: 'gemini_api_key' });
            if (value) setIsKeySelected(true);
        };
        loadSavedKey();
    }, []);

    const handleSaveKey = async () => {
        if (inputApiKey.startsWith('AIza')) {
            await Preferences.set({ key: 'gemini_api_key', value: inputApiKey });
            setIsKeySelected(true);
            setError(null);
        } else {
            setError('Insira uma chave válida (começa com AIza).');
        }
    };

    const handleGenerate = async () => {
        if (!image || !prompt) {
            setError('Por favor, envie uma imagem e um prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);

        try {
            const { value: savedKey } = await Preferences.get({ key: 'gemini_api_key' });
            
            const videoUrl = await generateVideo(
                image, 
                prompt, 
                aspectRatio, 
                (msg) => setProgressMessage(msg),
                savedKey || undefined,
                duration 
            );
            setGeneratedVideoUrl(videoUrl);
        } catch (e: any) {
            setError(e.message || 'Erro desconhecido.');
        } finally {
            setIsLoading(false);
            setProgressMessage('');
        }
    };

    if (!isKeySelected) {
        return (
            <div className="text-center p-8 bg-gray-900/50 rounded-lg max-w-md mx-auto">
                <h3 className="text-xl font-bold text-white mb-4">Configurar Chave de API</h3>
                <input 
                    type="password"
                    value={inputApiKey}
                    onChange={(e) => setInputApiKey(e.target.value)}
                    placeholder="Cole sua chave AIza... aqui"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4 outline-none focus:ring-2 focus:ring-red-500"
                />
                <button onClick={handleSaveKey} className="w-full px-6 py-3 font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all">
                    Salvar e Continuar
                </button>
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-red-400">1. Envie a Imagem Inicial</h3>
                    <FileUpload 
                        id="video-generator-upload"
                        onFileSelect={setImage} 
                        onFileClear={() => setImage(null)}
                    />
                </div>
                
                {/* --- SELETORES DE FORMATO E DURAÇÃO (REVISADOS) --- */}
                <div className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300 uppercase tracking-widest text-[10px]">
                            2. Formato de Saída (Rede Social)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setAspectRatio('9:16')}
                                className={`py-3 rounded-lg border-2 transition-all font-bold text-xs uppercase
                                    ${aspectRatio === '9:16' 
                                        ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                                        : 'bg-gray-800/30 border-gray-700 text-gray-500 hover:border-gray-600'}`}
                            >
                                TIKTOK (9:16)
                            </button>
                            <button
                                onClick={() => setAspectRatio('16:9')}
                                className={`py-3 rounded-lg border-2 transition-all font-bold text-xs uppercase
                                    ${aspectRatio === '16:9' 
                                        ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                                        : 'bg-gray-800/30 border-gray-700 text-gray-500 hover:border-gray-600'}`}
                            >
                                YOUTUBE (16:9)
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300 uppercase tracking-widest text-[10px]">
                            3. Duração do Vídeo
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[4, 6, 8].map((sec) => (
                                <button
                                    key={sec}
                                    onClick={() => setDuration(sec as 4 | 6 | 8)}
                                    className={`py-2 rounded-lg border-2 transition-all font-bold text-xs
                                        ${duration === sec 
                                            ? 'bg-red-600/20 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                                            : 'bg-gray-800/30 border-gray-700 text-gray-500 hover:border-gray-600'}`}
                                >
                                    {sec}s
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300 uppercase tracking-widest text-[10px]">
                        4. Descreva o Movimento
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                        placeholder="Ex: A imagem ganha vida com movimentos suaves..."
                        rows={4}
                    />
                </div>

                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !image || !prompt}
                    className="w-full flex items-center justify-center gap-2 text-lg font-bold py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white disabled:opacity-50 active:scale-95 transition-transform"
                >
                    {isLoading ? 'Gerando Vídeo...' : 'Gerar Vídeo'}
                    <SparklesIcon />
                </button>
            </div>

            <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded-lg p-4 min-h-[400px] border border-gray-800">
                {isLoading && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                        <p className="mt-4 text-gray-300">{progressMessage || 'Processando...'}</p>
                    </div>
                )}
                {error && <p className="text-red-400 text-center">{error}</p>}
                {generatedVideoUrl && (
                    <video src={generatedVideoUrl} controls autoPlay loop className="rounded-lg w-full shadow-2xl" />
                )}
                {!isLoading && !generatedVideoUrl && !error && (
                    <p className="text-gray-500 text-center italic">Seu vídeo aparecerá aqui após a geração.</p>
                )}
            </div>
        </div>
    );
};

export default VideoGenerator;