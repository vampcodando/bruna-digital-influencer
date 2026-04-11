// @ts-nocheck
import React, { useState } from 'react';
// ... outros imports

const PostCreator: React.FC = () => {
    // ... seus states existentes

    const renderFinalPost = (bgUrl: string) => {
        // SEGURANÇA: Só executa se estiver no navegador
        if (typeof window === 'undefined') return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            // Fundo
            ctx.drawImage(img, 0, 0);

            // Overlay para leitura (QA: Isso garante que o texto apareça)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Texto - Ajuste de escala baseado na largura
            const fontSizeTitle = canvas.width * 0.08; 
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.font = `bold ${fontSizeTitle}px Arial`;
            ctx.fillText(title.toUpperCase(), canvas.width / 2, canvas.height * 0.45);

            setGeneratedImage(canvas.toDataURL('image/png'));
            setIsLoading(false);
        };
        img.src = bgUrl;
    };

    // ... restante do componente
