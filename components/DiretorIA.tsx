// @ts-nocheck
import React, { useState } from 'react';

// Definimos a interface de forma simples
interface DiretorIAProps {
  scriptsSalvos: any[]; // Usamos any para evitar conflito de tipos no editor
  setScriptsSalvos: (scripts: any[]) => void;
}

export const DiretorIA: React.FC<DiretorIAProps> = ({ scriptsSalvos, setScriptsSalvos }) => {
  const [descricao, setDescricao] = useState("");
  const [numCenas, setNumCenas] = useState(1);

  const gerarRoteiro = () => {
    const novosBlocos = Array.from({ length: numCenas }, (_, i) => 
      `CENA ${i + 1}: [8s] Produto: ${descricao}. Estilo: Ultra-realista, TikTok Shop.`
    );
    setScriptsSalvos(novosBlocos);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="bg-zinc-900/80 p-6 rounded-xl border border-red-900/50 shadow-inner">
        <h2 className="text-white font-black mb-4 tracking-tighter text-lg uppercase border-b border-red-900/30 pb-2">
          🎬 Diretor de IA - Planejamento de Cenas
        </h2>
        
        <label className="text-zinc-500 text-[10px] uppercase font-bold mb-1 block">Roteiro Base do Produto</label>
        <textarea 
          className="w-full bg-black p-3 text-white border border-zinc-800 rounded-lg focus:border-red-600 outline-none transition-all placeholder:text-zinc-700"
          placeholder="Ex: Jogo de lençol vermelho cetim, luz de estúdio, 8k..."
          value={descricao}
          onChange={(e: any) => setDescricao(e.target.value)}
          rows={3}
        />
        
        <div className="flex flex-wrap items-center gap-6 mt-6">
          <div className="flex flex-col gap-1">
            <label className="text-zinc-500 text-[10px] uppercase font-bold">Quantidade de Cenas</label>
            <div className="flex items-center gap-4 bg-black border border-zinc-800 p-2 rounded-lg">
              <button 
                onClick={() => setNumCenas(Math.max(1, numCenas - 1))} 
                className="text-red-500 hover:text-white transition-colors font-bold px-2"
              >-</button>
              <span className="text-white font-mono w-12 text-center">{numCenas}</span>
              <button 
                onClick={() => setNumCenas(numCenas + 1)} 
                className="text-red-500 hover:text-white transition-colors font-bold px-2"
              >+</button>
            </div>
          </div>

          <button 
            onClick={gerarRoteiro} 
            className="bg-red-700 hover:bg-red-600 px-8 py-3 rounded-lg text-white font-black ml-auto uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-900/20"
          >
            Gerar Blocos de Script
          </button>
        </div>
      </div>

      {/* Listagem de Scripts com Persistência */}
      <div className="grid gap-3 mt-4">
        {scriptsSalvos && scriptsSalvos.length > 0 ? (
          scriptsSalvos.map((txt: string, idx: number) => (
            <div key={idx} className="bg-zinc-900/40 border-l-4 border-red-700 p-4 rounded-r-xl flex justify-between items-center group hover:bg-zinc-800/60 transition-all">
              <div className="flex-1">
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Bloco {idx + 1}</span>
                <p className="text-sm text-zinc-300 mt-1 italic leading-relaxed">"{txt}"</p>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(txt);
                  alert(`Script do Bloco ${idx + 1} copiado!`);
                }}
                className="ml-4 bg-zinc-800 group-hover:bg-red-700 text-[10px] text-zinc-400 group-hover:text-white px-4 py-2 rounded-md font-bold transition-all uppercase"
              >
                Copiar
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-600 text-sm uppercase tracking-widest">Nenhum roteiro gerado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};