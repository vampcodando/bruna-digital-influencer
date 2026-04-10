// @ts-nocheck
import React, { useState } from 'react';

interface DiretorIAProps {
  scriptsSalvos: any[];
  setScriptsSalvos: (scripts: any[]) => void;
}

export const DiretorIA: React.FC<DiretorIAProps> = ({ scriptsSalvos, setScriptsSalvos }) => {
  const [produto, setProduto] = useState("");
  const [numCenas, setNumCenas] = useState(3);
  const [estiloIluminacao, setEstiloIluminacao] = useState("Professional Studio Lighting");

  const gerarDirecaoTecnica = () => {
    // A regra de ouro: Personagem Bruna sempre idêntica
    const promptBaseBruna = "[CHARACTER CLONE: BRUNA] Brazilian digital influencer, ultra-realistic skin texture, detailed eyes, perfect teeth, natural expressions.";
    
    const novasCenas = Array.from({ length: numCenas }, (_, i) => {
      // Lógica de variação de câmera por cena
      let camera = "Medium Shot, eye level";
      let movimento = "Slight head tilt and smiling";
      let roteiroVoz = "";

      if (i === 0) {
        camera = "Extreme Close-up on face";
        movimento = "Looking at camera, energetic expression";
        roteiroVoz = `Ei gente! Olha a perfeição desse ${produto} que acabou de chegar!`;
      } else if (i === numCenas - 1) {
        camera = "Wide shot, showing the product environment";
        movimento = "Pointing to the link below, happy face";
        roteiroVoz = `Corre no link da bio e garante o seu ${produto} agora mesmo!`;
      } else {
        camera = "Close-up on hands and product";
        movimento = "Showing details and texture of the material";
        roteiroVoz = `A qualidade do material é de outro mundo, o toque é super macio.`;
      }

      return {
        id: i + 1,
        visualPrompt: `${promptBaseBruna} Camera: ${camera}. Action: ${movimento}. Environment: ${produto}. Style: ${estiloIluminacao}, 8k, highly detailed, TikTok Shop aesthetic.`,
        audioScript: roteiroVoz,
        tecnico: `Duração: 8s | Estabilidade: 10 | Motion: 5`
      };
    });

    setScriptsSalvos(novasCenas);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      {/* Painel de Controle do Diretor */}
      <div className="bg-zinc-900/90 p-6 rounded-2xl border border-red-900/40 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-red-900/20 pb-4">
          <h2 className="text-white font-black tracking-tighter text-2xl uppercase flex items-center gap-3">
            <span className="text-red-600">🎬</span> Diretor de IA Pro
          </h2>
          <span className="text-[10px] bg-red-900/30 text-red-500 px-3 py-1 rounded-full font-bold border border-red-900/50">
            MODO: TIKTOK SHOP
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Produto ou Ação Central</label>
            <textarea 
              className="w-full bg-black p-4 text-white border border-zinc-800 rounded-xl focus:border-red-600 outline-none transition-all placeholder:text-zinc-800 h-32 resize-none shadow-inner"
              placeholder="Ex: Jogo de lençol de cetim vermelho premium..."
              value={produto}
              onChange={(e: any) => setProduto(e.target.value)}
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest block mb-2">Iluminação e Estilo</label>
              <select 
                className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-white text-sm outline-none focus:border-red-600"
                value={estiloIluminacao}
                onChange={(e: any) => setEstiloIluminacao(e.target.value)}
              >
                <option>Professional Studio Lighting</option>
                <option>Luxury Soft Daylight</option>
                <option>Cyberpunk Neon Marketing</option>
                <option>Warm Golden Hour</option>
              </select>
            </div>

            <div className="flex items-center justify-between bg-black p-4 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 text-xs font-bold uppercase">Total de Cenas</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setNumCenas(Math.max(1, numCenas - 1))} className="text-red-500 hover:scale-125 transition-transform font-black text-xl">-</button>
                <span className="text-white font-mono text-xl w-8 text-center">{numCenas}</span>
                <button onClick={() => setNumCenas(numCenas + 1)} className="text-red-500 hover:scale-125 transition-transform font-black text-xl">+</button>
              </div>
            </div>

            <button 
              onClick={gerarDirecaoTecnica} 
              className="w-full bg-red-700 hover:bg-red-600 text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-red-900/30"
            >
              Gerar Roteiro Técnico
            </button>
          </div>
        </div>
      </div>

      {/* Exibição das Cenas Geradas */}
      <div className="grid gap-4">
        {scriptsSalvos && scriptsSalvos.length > 0 ? (
          scriptsSalvos.map((cena: any, idx: number) => (
            <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden hover:border-red-600/50 transition-colors shadow-xl">
              <div className="bg-zinc-900 px-5 py-2 border-b border-zinc-800 flex justify-between items-center">
                <span className="text-red-600 font-black text-xs uppercase tracking-widest">CENA {cena.id}</span>
                <span className="text-[9px] text-zinc-600 font-mono italic">{cena.tecnico}</span>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-zinc-600 text-[9px] uppercase font-black block mb-1">Visual Prompt (Gerador de Vídeo)</label>
                  <p className="text-sm text-zinc-300 leading-relaxed italic">"{cena.visualPrompt}"</p>
                </div>

                <div className="bg-red-950/10 p-4 rounded-lg border-l-2 border-red-600">
                  <label className="text-red-900 text-[9px] uppercase font-black block mb-1">Roteiro de Voz (ElevenLabs)</label>
                  <p className="text-sm text-zinc-200 font-medium">"{cena.audioScript}"</p>
                </div>

                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`PROMPT: ${cena.visualPrompt}\n\nFALA: ${cena.audioScript}`);
                    alert(`Cena ${cena.id} copiada para o clipboard!`);
                  }}
                  className="w-full bg-zinc-800 hover:bg-white hover:text-black text-zinc-400 hover:text-black py-2 rounded-lg text-[10px] font-black uppercase transition-all"
                >
                  Copiar Pack de Dados da Cena
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-3xl">
            <p className="text-zinc-700 text-xs uppercase font-bold tracking-[0.3em]">Aguardando comando do diretor...</p>
          </div>
        )}
      </div>
    </div>
  );
};