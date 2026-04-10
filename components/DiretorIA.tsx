// @ts-nocheck
import React, { useState } from 'react';
import { SparklesIcon, FilmIcon, PencilSquareIcon, SquaresPlusIcon } from './Icons';

interface DiretorIAProps {
  scriptsSalvos: any[];
  setScriptsSalvos: (scripts: any[]) => void;
}

export const DiretorIA: React.FC<DiretorIAProps> = ({ scriptsSalvos, setScriptsSalvos }) => {
  // Estados de Configuração Técnica
  const [produto, setProduto] = useState("");
  const [numCenas, setNumCenas] = useState(3);
  const [iluminacao, setIluminacao] = useState("Professional Studio Softbox");
  const [enquadramento, setEnquadramento] = useState("Medium Shot");
  const [lente, setLente] = useState("85mm (Portrait/Bokeh)");
  const [movimento, setMovimento] = useState("Static");
  const [expressao, setExpressao] = useState("Smiling/Persuasive");
  
  // NOVO: Estado para o Tom da Campanha (Sincronia Voz + Expressão)
  const [tomCampanha, setTomCampanha] = useState("Lifestyle");

  const gerarDirecaoTecnica = () => {
    // Regra de Ouro: Consistência da Bruna
    const promptBaseBruna = "[CHARACTER CLONE: BRUNA] Brazilian influencer, ultra-realistic 8k, skin micro-texture, perfect teeth, detailed eyes.";
    
    // Motor de Sincronia (ElevenLabs + Prompt Visual)
    let vozDiretiva = "";
    let acaoContextual = "";

    switch (tomCampanha) {
      case "HardSell":
        vozDiretiva = "[ElevenLabs: Vibe Empolgada, speed: 1.15, stability: 0.3]";
        acaoContextual = "fast hand gestures, highly energetic body language, pointing at product";
        break;
      case "SoftSell":
        vozDiretiva = "[ElevenLabs: Vibe Empática, speed: 0.90, stability: 0.8]";
        acaoContextual = "relaxed posture, gentle and slow movements, warm inviting look";
        break;
      case "Urgencia":
        vozDiretiva = "[ElevenLabs: Vibe Urgente, speed: 1.25, stability: 0.4]";
        acaoContextual = "dynamic movement, pointing emphatically, slight tension, wide eyes";
        break;
      default: // Lifestyle
        vozDiretiva = "[ElevenLabs: Vibe Conversacional, speed: 1.0, stability: 0.5]";
        acaoContextual = "casual posture, natural and warm hand gestures, talking to friend vibe";
        break;
    }

    const novasCenas = Array.from({ length: numCenas }, (_, i) => {
      const isFirst = i === 0;
      const isLast = i === numCenas - 1;
      
      let camCena = enquadramento;
      let falaCena = "";

      // Lógica de Diretor: Hook -> Body -> CTA adaptado com as tags de voz
      if (isFirst) {
        camCena = "Extreme Close-up";
        falaCena = `${vozDiretiva} Gente, olhem só a qualidade desse ${produto || "produto"}! É surreal.`;
      } else if (isLast) {
        camCena = "Wide Shot";
        falaCena = `${vozDiretiva} Não perde tempo, o link do ${produto || "produto"} está aqui embaixo!`;
      } else {
        falaCena = `${vozDiretiva} O acabamento e os detalhes desse ${produto || "produto"} mostram que é premium de verdade.`;
      }

      return {
        id: i + 1,
        // Combinando as ações dinâmicas da voz com o prompt visual base
        visualPrompt: `${promptBaseBruna} Camera: ${camCena}, Lens: ${lente}. Action: ${movimento}, ${acaoContextual}. Expression: ${expressao}. Environment: ${produto || "studio"}. Style: ${iluminacao}, TikTok Shop aesthetic.`,
        audioScript: falaCena,
        tipo: isFirst ? "HOOK" : isLast ? "CTA" : "BODY"
      };
    });

    setScriptsSalvos(novasCenas);
  };

  // Função para editar individualmente antes de copiar
  const atualizarCenaManual = (index: number, campo: string, valor: string) => {
    const novosScripts = [...scriptsSalvos];
    novosScripts[index][campo] = valor;
    setScriptsSalvos(novosScripts);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      {/* PAINEL DE CONTROLE DO DIRETOR */}
      <div className="bg-zinc-900/95 p-6 rounded-3xl border border-red-900/40 shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-red-900/20 pb-4">
          <h2 className="text-white font-black tracking-tighter text-2xl uppercase flex items-center gap-3">
            <FilmIcon className="text-red-600 w-8 h-8" /> Diretor de IA Pro
          </h2>
          <div className="flex gap-2">
            <span className="text-[10px] bg-red-900/20 text-red-500 px-3 py-1 rounded-full font-bold border border-red-900/30">SC INTERNACIONAL PROJECT</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full font-bold">V.3.0 AUDIO SYNC</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUNA 1: PRODUTO */}
          <div className="lg:col-span-1 space-y-4">
            <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
              <PencilSquareIcon className="w-3 h-3"/> Descrição do Produto
            </label>
            <textarea 
              className="w-full bg-black p-4 text-white border border-zinc-800 rounded-2xl focus:border-red-600 outline-none transition-all h-[310px] resize-none text-sm leading-relaxed"
              placeholder="Descreva o produto ou a ação principal..."
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
            />
          </div>

          {/* COLUNA 2: PARÂMETROS CÂMERA */}
          <div className="space-y-4 bg-black/40 p-5 rounded-2xl border border-zinc-800">
             <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
               <SquaresPlusIcon className="w-3 h-3"/> Configuração de Câmera
             </label>
             
             <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-[9px] text-zinc-600 uppercase mb-1 font-bold">Enquadramento</p>
                  <select value={enquadramento} onChange={(e)=>setEnquadramento(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-xs text-white outline-none focus:border-red-600">
                    <option>Extreme Close-up</option>
                    <option>Close-up</option>
                    <option>Medium Shot</option>
                    <option>Wide Shot</option>
                  </select>
                </div>

                <div>
                  <p className="text-[9px] text-zinc-600 uppercase mb-1 font-bold">Lente Cinematográfica</p>
                  <select value={lente} onChange={(e)=>setLente(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-xs text-white outline-none focus:border-red-600">
                    <option>85mm (Portrait/Bokeh)</option>
                    <option>35mm (Standard)</option>
                    <option>24mm (Wide Angle)</option>
                    <option>Macro Lens</option>
                  </select>
                </div>

                <div>
                  <p className="text-[9px] text-zinc-600 uppercase mb-1 font-bold">Movimento de Cena</p>
                  <select value={movimento} onChange={(e)=>setMovimento(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-xs text-white outline-none focus:border-red-600">
                    <option>Static</option>
                    <option>Slow Zoom In</option>
                    <option>Pan Left to Right</option>
                    <option>Handheld Shake</option>
                  </select>
                </div>
             </div>
          </div>

          {/* COLUNA 3: PERSONA & GERAÇÃO */}
          <div className="space-y-4 bg-black/40 p-5 rounded-2xl border border-zinc-800">
             <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
               <SparklesIcon className="w-3 h-3"/> Direção da Bruna & Voz
             </label>

             <div className="space-y-4">
                {/* NOVO SELETOR DE TOM DE VOZ */}
                <div>
                  <p className="text-[9px] text-red-500 uppercase mb-1 font-black flex justify-between">
                    <span>Tom da Campanha (Voz)</span>
                    <span className="text-[8px] bg-red-950/50 px-1 rounded">ElevenLabs Sync</span>
                  </p>
                  <select value={tomCampanha} onChange={(e)=>setTomCampanha(e.target.value)} className="w-full bg-red-950/20 border border-red-900/40 p-2 rounded-lg text-xs text-white outline-none focus:border-red-600">
                    <option value="Lifestyle">Review Sincero (Lifestyle)</option>
                    <option value="HardSell">Vendedora Agressiva (Hard Sell)</option>
                    <option value="SoftSell">Amiga Conselheira (Soft Sell)</option>
                    <option value="Urgencia">Promoção / Escassez (Urgência)</option>
                  </select>
                </div>

                <div>
                  <p className="text-[9px] text-zinc-600 uppercase mb-1 font-bold">Expressão Facial Base</p>
                  <select value={expressao} onChange={(e)=>setExpressao(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-xs text-white outline-none focus:border-red-600">
                    <option>Smiling/Persuasive</option>
                    <option>Surprised/Energetic</option>
                    <option>Serious/Professional</option>
                    <option>Relaxed/Natural</option>
                  </select>
                </div>

                <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-xl">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase">Cenas</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setNumCenas(Math.max(1, numCenas - 1))} className="text-red-500 font-black">-</button>
                    <span className="text-white font-mono">{numCenas}</span>
                    <button onClick={() => setNumCenas(numCenas + 1)} className="text-red-500 font-black">+</button>
                  </div>
                </div>

                <button 
                  onClick={gerarDirecaoTecnica} 
                  className="w-full bg-red-700 hover:bg-red-600 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-red-900/20 active:scale-95 flex items-center justify-center gap-2 mt-2"
                >
                  <SparklesIcon className="w-5 h-5"/> Gerar Roteiro Pro
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* LISTAGEM DE CENAS COM EDITOR LIVE */}
      <div className="grid gap-6">
        {scriptsSalvos && scriptsSalvos.length > 0 ? (
          scriptsSalvos.map((cena: any, idx: number) => (
            <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden hover:border-red-600/30 transition-all shadow-xl">
              <div className="bg-zinc-900/50 px-6 py-3 border-b border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="bg-red-700 text-white text-[10px] font-black px-2 py-0.5 rounded">CENA {cena.id}</span>
                  <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">{cena.tipo}</span>
                </div>
                <span className="text-[9px] text-zinc-600 font-mono italic">8 SECONDS | 8K RENDER</span>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-zinc-600 text-[9px] uppercase font-black flex justify-between">
                    <span>Visual Prompt (IA Video)</span>
                    <span className="text-red-900">EDITÁVEL</span>
                  </label>
                  <textarea 
                    value={cena.visualPrompt}
                    onChange={(e) => atualizarCenaManual(idx, 'visualPrompt', e.target.value)}
                    className="w-full bg-black/50 p-3 text-xs text-zinc-300 border border-zinc-900 rounded-xl focus:border-red-900 outline-none h-32 resize-none leading-relaxed italic"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-red-900 text-[9px] uppercase font-black flex justify-between">
                    <span>Script de Voz (ElevenLabs)</span>
                    <span>EDITÁVEL</span>
                  </label>
                  <textarea 
                    value={cena.audioScript}
                    onChange={(e) => atualizarCenaManual(idx, 'audioScript', e.target.value)}
                    className="w-full bg-red-950/5 p-3 text-xs text-zinc-200 border border-red-900/10 rounded-xl focus:border-red-700 outline-none h-32 resize-none font-medium"
                  />
                </div>
              </div>

              <div className="px-6 pb-6">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`PROMPT: ${cena.visualPrompt}\n\nAUDIO: ${cena.audioScript}`);
                    alert(`Pack da Cena ${cena.id} copiado com sucesso!`);
                  }}
                  className="w-full bg-zinc-900 hover:bg-red-700 text-zinc-500 hover:text-white py-3 rounded-xl text-[10px] font-black uppercase transition-all border border-zinc-800 hover:border-red-600 shadow-md"
                >
                  Copiar Pack Finalizado
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-zinc-900 rounded-[40px] bg-zinc-900/10">
            <FilmIcon className="w-12 h-12 text-zinc-800 mx-auto mb-4 opacity-20" />
            <p className="text-zinc-700 text-xs uppercase font-black tracking-[0.4em]">Aguardando Direção Técnica</p>
          </div>
        )}
      </div>
    </div>
  );
};