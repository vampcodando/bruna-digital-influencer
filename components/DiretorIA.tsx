// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { SparklesIcon, FilmIcon, PencilSquareIcon, SquaresPlusIcon, RocketLaunchIcon } from './Icons';
import { generateText } from '../services/geminiService';

interface DiretorIAProps {
  scriptsSalvos: any[];
  setScriptsSalvos: (scripts: any[]) => void;
}

export const DiretorIA: React.FC<DiretorIAProps> = ({ scriptsSalvos, setScriptsSalvos }) => {
  const [produto, setProduto] = useState("");
  const [numCenas, setNumCenas] = useState(3);
  const [iluminacao, setIluminacao] = useState("Professional Studio Softbox");
  const [enquadramento, setEnquadramento] = useState("Medium Shot");
  const [lente, setLente] = useState("85mm (Portrait/Bokeh)");
  const [movimento, setMovimento] = useState("Static");
  const [expressao, setExpressao] = useState("Smiling/Persuasive");
  const [tomCampanha, setTomCampanha] = useState("Lifestyle");
  const [isLoading, setIsLoading] = useState(false);

  const gerarDirecaoTecnica = async () => {
    if (!produto) return;
    setIsLoading(true);
    
    const promptBaseBruna = "[CHARACTER CLONE: BRUNA, 35-year-old woman] Brazilian influencer, ultra-realistic 8k, skin micro-texture, perfect teeth, detailed eyes.";
    
    let vozDiretiva = "";
    switch (tomCampanha) {
      case "HardSell": vozDiretiva = "[ElevenLabs: Vibe Empolgada, speed: 1.15, stability: 0.3]"; break;
      case "SoftSell": vozDiretiva = "[ElevenLabs: Vibe Empática, speed: 0.90, stability: 0.8]"; break;
      case "Urgencia": vozDiretiva = "[ElevenLabs: Vibe Urgente, speed: 1.25, stability: 0.4]"; break;
      default: vozDiretiva = "[ElevenLabs: Vibe Conversacional, speed: 1.0, stability: 0.5]"; break;
    }

    const superPrompt = `
      Você é um Copywriter Sênior e Diretor de Vídeo criando um roteiro técnico para a influenciadora digital "Bruna".
      O produto: "${produto}".
      O tom: ${tomCampanha}.
      
      Crie um roteiro com EXATAMENTE ${numCenas} cenas.
      Estrutura:
      - CENA 1: HOOK (Gancho impactante).
      - CENAS INTERMEDIÁRIAS: BODY (Benefícios).
      - CENA FINAL: CTA (Chamada para ação).

      Retorne APENAS um array JSON válido:
      [
        {
          "acao_visual": "action in english",
          "fala": "frase em português",
          "tipo": "HOOK"
        }
      ]
    `;

    try {
      const respostaGemini = await generateText(superPrompt);
      const cenasGeradas = JSON.parse(respostaGemini);

      const novasCenas = cenasGeradas.map((cena: any, index: number) => {
        let camCena = enquadramento;
        if (cena.tipo === "HOOK") camCena = "Extreme Close-up";
        if (cena.tipo === "CTA") camCena = "Wide Shot";

        return {
          id: index + 1,
          visualPrompt: `${promptBaseBruna} Camera: ${camCena}, Lens: ${lente}. Action: ${cena.acao_visual}. Expression: ${expressao}. Style: ${iluminacao}, TikTok aesthetic.`,
          audioScript: `${vozDiretiva} ${cena.fala}`,
          tipo: cena.tipo
        };
      });

      setScriptsSalvos(novasCenas);
    } catch (error) {
      console.error("Erro ao gerar script:", error);
      alert("Erro ao conectar com a IA. Verifique sua chave de API.");
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarCenaManual = (index: number, campo: string, valor: string) => {
    const novosScripts = [...scriptsSalvos];
    novosScripts[index][campo] = valor;
    setScriptsSalvos(novosScripts);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      <div className="bg-zinc-900/95 p-6 rounded-3xl border border-red-900/40 shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-red-900/20 pb-4">
          <h2 className="text-white font-black tracking-tighter text-2xl uppercase flex items-center gap-3">
            <RocketLaunchIcon className="text-red-600 w-8 h-8" /> Diretor de IA Pro
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
              <PencilSquareIcon className="w-3 h-3"/> Descrição do Produto
            </label>
            <textarea 
              className="w-full bg-black p-4 text-white border border-zinc-800 rounded-2xl focus:border-red-600 outline-none transition-all h-[310px] resize-none text-sm leading-relaxed"
              placeholder="Descreva o produto com detalhes..."
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
            />
          </div>

          <div className="space-y-4 bg-black/40 p-5 rounded-2xl border border-zinc-800">
             <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
               <SquaresPlusIcon className="w-3 h-3"/> Câmera
             </label>
             <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-[9px] text-zinc-600 uppercase mb-1 font-bold">Enquadramento</p>
                  <select value={enquadramento} onChange={(e)=>setEnquadramento(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-xs text-white outline-none">
                    <option>Close-up</option>
                    <option>Medium Shot</option>
                  </select>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-600 uppercase mb-1 font-bold">Lente</p>
                  <select value={lente} onChange={(e)=>setLente(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-xs text-white outline-none">
                    <option>85mm (Portrait/Bokeh)</option>
                    <option>35mm (Standard)</option>
                  </select>
                </div>
             </div>
          </div>

          <div className="space-y-4 bg-black/40 p-5 rounded-2xl border border-zinc-800">
             <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
               <SparklesIcon className="w-3 h-3"/> Direção Bruna
             </label>

             <div className="space-y-4">
                <div>
                  <p className="text-[9px] text-red-500 uppercase mb-1 font-black">Tom da Campanha</p>
                  <select value={tomCampanha} onChange={(e)=>setTomCampanha(e.target.value)} className="w-full bg-red-950/20 border border-red-900/40 p-2 rounded-lg text-xs text-white outline-none">
                    <option value="Lifestyle">Review Sincero</option>
                    <option value="HardSell">Vendedora Agressiva</option>
                    <option value="Urgencia">Urgência / Escassez</option>
                  </select>
                </div>

                <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-xl">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase">Cenas</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setNumCenas(Math.max(2, numCenas - 1))} className="text-red-500 font-black">-</button>
                    <span className="text-white font-mono">{numCenas}</span>
                    <button onClick={() => setNumCenas(Math.min(6, numCenas + 1))} className="text-red-500 font-black">+</button>
                  </div>
                </div>

                <button 
                  onClick={gerarDirecaoTecnica} 
                  disabled={isLoading || !produto}
                  className="w-full bg-red-700 hover:bg-red-600 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {isLoading ? 'IA ESCREVENDO...' : 'Gerar Roteiro'}
                  <SparklesIcon className="w-5 h-5"/>
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {scriptsSalvos && scriptsSalvos.length > 0 ? (
          scriptsSalvos.map((cena: any, idx: number) => (
            <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden hover:border-red-600/30 transition-all shadow-xl">
              <div className="bg-zinc-900/50 px-6 py-3 border-b border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="bg-red-700 text-white text-[10px] font-black px-2 py-0.5 rounded">CENA {cena.id}</span>
                  <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">{cena.tipo}</span>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-zinc-600 text-[9px] uppercase font-black">Visual Prompt</label>
                  <textarea 
                    value={cena.visualPrompt}
                    onChange={(e) => atualizarCenaManual(idx, 'visualPrompt', e.target.value)}
                    className="w-full bg-black/50 p-3 text-xs text-zinc-300 border border-zinc-900 rounded-xl outline-none h-32 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-red-900 text-[9px] uppercase font-black">Voz Bruna</label>
                  <textarea 
                    value={cena.audioScript}
                    onChange={(e) => atualizarCenaManual(idx, 'audioScript', e.target.value)}
                    className="w-full bg-red-950/5 p-3 text-xs text-zinc-200 border border-red-900/10 rounded-xl outline-none h-32 resize-none"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-zinc-900 rounded-[40px] bg-zinc-900/10">
            <FilmIcon className="w-12 h-12 text-zinc-800 mx-auto mb-4 opacity-20" />
            <p className="text-zinc-700 text-xs uppercase font-black tracking-[0.4em]">Aguardando Produto</p>
          </div>
        )}
      </div>
    </div>
  );
};
