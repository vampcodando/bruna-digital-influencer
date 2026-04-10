import React, { useState } from 'react';

interface DiretorIAProps {
  scriptsSalvos: string[];
  setScriptsSalvos: (scripts: string[]) => void;
}

export const DiretorIA: React.FC<DiretorIAProps> = ({ scriptsSalvos, setScriptsSalvos }) => {
  const [descricao, setDescricao] = useState("");
  const [numCenas, setNumCenas] = useState(1);

  const gerarRoteiro = () => {
    // Lógica simples para criar os blocos
    const novosBlocos = Array.from({ length: numCenas }, (_, i) => 
      `CENA ${i + 1}: [8s] Produto: ${descricao}. Estilo: Ultra-realista, TikTok Shop.`
    );
    setScriptsSalvos(novosBlocos);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-zinc-900 p-4 rounded-lg border border-red-900">
        <h2 className="text-white font-bold mb-4">DIRETOR DE IA - SCRIPTS</h2>
        <textarea 
          className="w-full bg-black p-2 text-white border border-zinc-800 rounded"
          placeholder="Descrição do produto..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <div className="flex items-center gap-4 mt-4">
          <button onClick={() => setNumCenas(Math.max(1, numCenas - 1))} className="text-red-500">-</button>
          <span className="text-white">{numCenas} Cenas</span>
          <button onClick={() => setNumCenas(numCenas + 1)} className="text-red-500">+</button>
          <button onClick={gerarRoteiro} className="bg-red-700 px-4 py-1 rounded text-white ml-auto">GERAR</button>
        </div>
      </div>

      {/* Renderização dos Blocos que ficam salvos */}
      <div className="space-y-2">
        {scriptsSalvos.map((txt, idx) => (
          <div key={idx} className="bg-zinc-800 p-3 rounded flex justify-between items-center">
            <p className="text-sm text-zinc-300">{txt}</p>
            <button 
              onClick={() => navigator.clipboard.writeText(txt)}
              className="bg-zinc-700 text-[10px] p-1 rounded hover:bg-white hover:text-black"
            >
              COPIAR
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};