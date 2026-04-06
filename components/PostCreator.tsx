
import React, { useState, useRef } from 'react';
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
      ${current === value 
        ? 'bg-red-600/40 border-red-500/80 ring-2 ring-red-400' 
        : 'bg-red-900/20 border-red-500/30 hover:bg-red-900/40'
      }`}
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

    const postContainerRef = useRef<HTMLDivElement>(null);

    const handleGenerate = async () => {
        if (!backgroundDescription) {
            setError('A descrição do fundo é obrigatória para gerar a imagem.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const detailedPrompt = await createBackgroundImagePrompt(backgroundDescription, referenceImage ?? undefined);
            const image = await generateImage(detailedPrompt, aspectRatio);
            setGeneratedImage(image);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClass = "w-full px-4 py-3 bg-gray-900/60 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors placeholder:text-gray-500 text-white";
    const labelClass = "block mb-2 text-sm font-medium text-red-400 uppercase tracking-wider";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Coluna de Controles */}
            <div className="space-y-6">
                {/* Campo 1: Upload */}
                <div>
                    <h3 className={labelClass}>Campo 1: Imagem de Referência (Opcional)</h3>
                    <FileUpload 
                        id="post-creator-upload" 
                        onFileSelect={setReferenceImage} 
                        onFileClear={() => setReferenceImage(null)}
                        showImageSearch 
                    />
                </div>
                
                {/* Campo 2: Formatos */}
                <div>
                    <h3 className={labelClass}>Campo 2: Formato do Post</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <AspectRatioButton value="9:16" label="Story" description="Ideal para Instagram/TikTok" current={aspectRatio} onClick={setAspectRatio} />
                        <AspectRatioButton value="1:1" label="Post" description="Ideal para Feed do Insta/Face" current={aspectRatio} onClick={setAspectRatio} />
                        <AspectRatioButton value="3:4" label="Poster Vertical" description="Formato 90x120cm" current={aspectRatio} onClick={setAspectRatio} />
                    </div>
                </div>

                {/* Campos 3, 4, 5: Textos */}
                <div className="space-y-4">
                    <div>
                        <h3 className={labelClass}>Campo 3: Título</h3>
                        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Ex: DIA DE JOGO!" />
                    </div>
                    <div>
                       <h3 className={labelClass}>Campo 4: Subtítulo</h3>
                       <input id="subtitle" type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} placeholder="Ex: Inter vs. Grêmio" />
                    </div>
                    <div>
                        <h3 className={labelClass}>Campo 5: Informações</h3>
                        <textarea id="additional" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} className={inputClass} rows={3} placeholder="Ex: Domingo às 16h no Beira-Rio" />
                    </div>
                </div>

                {/* Campo 6: Descrição do Fundo */}
                <div>
                    <h3 className={labelClass}>Campo 6: Descrição do Fundo da Imagem</h3>
                     <textarea id="background-desc" value={backgroundDescription} onChange={(e) => setBackgroundDescription(e.target.value)} className={inputClass} rows={4} placeholder="Ex: Estádio Beira-Rio lotado com fumaça vermelha, torcida vibrando, close em um jogador comemorando..." />
                </div>

                {/* Botão Gerar */}
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 text-lg font-bold py-4 px-6 rounded-xl bg-red-700/40 border border-red-500/80 backdrop-blur-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:bg-red-700/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
                >
                    <SparklesIcon/>
                    {isLoading ? 'Gerando Imagem...' : 'Gerar Post'}
                </button>
            </div>
            
            {/* Coluna de Visualização */}
            <div 
              ref={postContainerRef}
              className="relative flex flex-col items-center justify-center h-full bg-gray-900/70 rounded-lg p-2 min-h-[500px] lg:min-h-full overflow-hidden border border-gray-700"
              style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                        <p className="mt-4 text-gray-300">A IA está criando sua arte...</p>
                    </div>
                )}
                {error && <p className="absolute inset-0 flex items-center justify-center text-red-400 text-center z-20 p-4 bg-black/70">{error}</p>}
                
                {generatedImage && (
                    <img src={generatedImage} alt="Fundo Gerado" className="absolute inset-0 w-full h-full object-cover" />
                )}
                
                <div className="relative z-10 flex flex-col justify-between items-center w-full h-full p-8 text-center pointer-events-none">
                    {/* Placeholder for potential top logo */}
                    <div></div>
                    <div className="flex flex-col items-center">
                        <h2 id="post-title" className="text-4xl md:text-6xl font-black uppercase text-white" style={{ textShadow: '3px 3px 10px rgba(0,0,0,0.8)' }}>{title}</h2>
                        <h3 id="post-subtitle" className="text-2xl md:text-3xl font-semibold text-gray-200 mt-2" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>{subtitle}</h3>
                    </div>
                    <p id="post-additional" className="text-base md:text-xl text-white font-medium whitespace-pre-wrap" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.9)' }}>{additionalInfo}</p>
                </div>
                
                {!isLoading && !error && !generatedImage && (
                    <div className="text-center text-gray-500 z-10 p-4">
                       <SparklesIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                       <h3 className="font-bold text-lg text-gray-400">Preview do seu Post</h3>
                       <p>A imagem gerada com seus textos aparecerá aqui.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCreator;