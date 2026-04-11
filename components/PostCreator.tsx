// @ts-nocheck
import React, { useState, useRef } from 'react';
import FileUpload from './FileUpload';
import { ImageFile, AspectRatio } from '../types';
import { createBackgroundImagePrompt, generateImage } from '../services/geminiService';
import { SparklesIcon } from './Icons';

// ... (Mantenha o AspectRatioButton como está)

const PostCreator: React.FC = () => {
    const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [backgroundDescription, setBackgroundDescription] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null); // Imagem com texto fundido
    const [error, setError] = useState<string | null>(null);

    // Função Mestra para renderizar o Post Final (QA Fix)
    const renderFinalPost = (bgUrl: string) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.crossOrigin = "anonymous";
        img.onload = () => {
            // Define o tamanho do canvas baseado na imagem gerada
            canvas.width = img.width;
            canvas.height = img.height;

            // 1. Desenha o Fundo da IA
            ctx.drawImage(img, 0, 0);

            // 2. Aplica um degradê escuro no fundo para dar leitura ao texto
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(0,0,0,0.3)');
            gradient.addColorStop(0.5, 'transparent');
            gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 3. Configuração de Texto Centralizado
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 15;

            // Título (Grande e Bold)
            ctx.font = 'black 120px Montserrat, Arial, sans-serif';
            ctx.fillText(title.toUpperCase(), canvas.width / 2, canvas.height * 0.45);

            // Subtítulo
            ctx.font = '60px Montserrat, Arial, sans-serif';
            ctx.fillStyle = '#e5e7eb';
            ctx.fillText(subtitle, canvas.width / 2, canvas.height * 0.52);

            // Info Adicional (Rodapé)
            ctx.font = '50px Montserrat, Arial, sans-serif';
            ctx.fillStyle = 'white';
            ctx.fillText(additionalInfo, canvas.width / 2, canvas.height * 0.85);

            // Converte o canvas para a imagem final que o usuário vai baixar
            setGeneratedImage(canvas.toDataURL('image/png'));
            setIsLoading(false);
        };
        img.src = bgUrl;
    };

    const handleGenerate = async () => {
        if (!backgroundDescription) {
            setError('A descrição do fundo é obrigatória.');
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            // 1. Gera o prompt detalhado
            const detailedPrompt = await createBackgroundImagePrompt(backgroundDescription, referenceImage ?? undefined);
            
            // 2. Gera a imagem base com a IA
            const baseImage = await generateImage(detailedPrompt, aspectRatio);
            
            // 3. Funde o texto na imagem (Correção de QA)
            renderFinalPost(baseImage);
            
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erro na geração.');
            setIsLoading(false);
        }
    };

    // ... (Mantenha o restante do JSX, mas certifique-se de que o botão handleGenerate seja chamado)
    // Dica de QA: O preview agora mostrará a imagem JÁ COM O TEXTO embutido, facilitando o download.
