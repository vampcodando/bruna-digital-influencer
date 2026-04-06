import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UploadIcon, XCircleIcon } from './Icons';
import { ImageFile } from '../types';

interface FileUploadProps {
  id: string;
  onFileSelect: (file: ImageFile) => void;
  onFileClear: () => void;
  acceptedFileTypes?: string;
  maxSizeMb?: number;
  showImageSearch?: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // remove the "data:mime/type;base64," part
        };
        reader.onerror = error => reject(error);
    });
};

const FileUpload: React.FC<FileUploadProps> = ({ 
    id,
    onFileSelect, 
    onFileClear,
    acceptedFileTypes = "image/png, image/jpeg, image/webp", 
    maxSizeMb = 10,
    showImageSearch = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dropZoneRef = useRef<HTMLLabelElement>(null);

  const handleFile = useCallback(async (file: File | null) => {
    if (!file) return;

    setError(null);

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Arquivo excede o tamanho máximo de ${maxSizeMb}MB.`);
      setPreview(null);
      return;
    }

    const acceptedTypes = acceptedFileTypes.split(',').map(t => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      setError(`Tipo de arquivo não suportado. Use: ${acceptedFileTypes}`);
      setPreview(null);
      return;
    }
    
    try {
        const base64 = await fileToBase64(file);
        onFileSelect({ base64, mimeType: file.type, name: file.name || 'clipboard-image.png' });
        setPreview(URL.createObjectURL(file));
    } catch(err) {
        setError("Falha ao processar o arquivo.");
        setPreview(null);
    }

  }, [onFileSelect, acceptedFileTypes, maxSizeMb]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handlePasteButtonClick = async () => {
    try {
        // Tentativa de leitura direta (pode exigir HTTPS e permissão explícita)
        if (navigator.clipboard && navigator.clipboard.read) {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                const imageTypes = item.types.filter(type => type.startsWith('image/'));
                if (imageTypes.length > 0) {
                    const blob = await item.getType(imageTypes[0]);
                    const file = new File([blob], 'pasted-image.png', { type: blob.type });
                    handleFile(file);
                    return;
                }
            }
            setError("Nenhuma imagem encontrada na área de transferência.");
        } else {
            throw new Error("API de Clipboard não disponível.");
        }
    } catch (err) {
        // Fallback: orientar o usuário a usar o atalho de teclado que é mais compatível
        setError("O navegador bloqueou o acesso automático. Clique aqui e use Ctrl+V para colar.");
        if (dropZoneRef.current) dropZoneRef.current.focus();
    }
  };

  const handleLocalPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) handleFile(file);
            break; 
        }
    }
  };

  const handleGoogleSearch = () => {
      if (searchQuery.trim()) {
          window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchQuery)}`, '_blank', 'noopener,noreferrer');
      }
  };
  
  const handleClear = () => {
    if(preview) {
        URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError(null);
    onFileClear();
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) {
        input.value = "";
    }
  };

  return (
    <div className="w-full">
        {showImageSearch && (
            <div className="mb-4">
                <label htmlFor={`${id}-search`} className="block mb-2 text-sm font-medium text-gray-300">
                    Buscar imagem de referência no Google
                </label>
                <div className="flex gap-2">
                    <input
                        id={`${id}-search`}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleGoogleSearch(); }}
                        placeholder="Ex: Escudo do Inter, jogador comemorando"
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors placeholder:text-gray-500 text-white"
                    />
                    <button onClick={handleGoogleSearch} className="px-4 py-2 font-semibold text-white bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors">
                        Buscar
                    </button>
                </div>
            </div>
        )}
        
        {preview ? (
            <div className="relative group">
                <img src={preview} alt="Pré-visualização" className="w-full h-48 object-cover rounded-lg border border-gray-700" />
                <button 
                    onClick={handleClear} 
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-600/80 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Limpar imagem"
                >
                    <XCircleIcon className="w-6 h-6" />
                </button>
            </div>
        ) : (
             <div className="relative group">
                <label
                    ref={dropZoneRef}
                    htmlFor={id}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onPaste={handleLocalPaste}
                    tabIndex={0}
                    className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors focus:ring-2 focus:ring-red-500 outline-none
                    ${dragActive ? 'border-red-500 bg-red-500/10' : 'border-gray-600 bg-gray-800/20 hover:bg-gray-800/40'}`}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                        <UploadIcon className="w-10 h-10 mb-4 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold text-red-400">Arraste</span> ou clique para enviar
                        </p>
                        <p className="text-xs text-gray-500 mb-4 uppercase tracking-widest font-bold">Ou use Ctrl+V aqui</p>
                        
                        <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePasteButtonClick(); }}
                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-white text-xs font-bold rounded-lg border border-red-500/50 transition-all flex items-center gap-2"
                        >
                            📋 Colar Imagem
                        </button>
                    </div>
                    <input id={id} type="file" className="hidden" onChange={handleChange} accept={acceptedFileTypes} />
                </label>
             </div>
        )}
        
        {error && (
            <div className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded text-[10px] text-red-300 font-bold uppercase animate-pulse">
                {error}
            </div>
        )}
    </div>
  );
};

export default FileUpload;