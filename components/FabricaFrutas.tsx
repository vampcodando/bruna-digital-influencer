// @ts-nocheck
import React from 'react';
// IMPORTANTE: Extração segura para ambiente CDN
const { useState, useEffect } = React;

import { generateImage, generateNovelaScript, generateCastingPrompts } from '../services/geminiService';

export const FabricaFrutas = () => {
    // 1. Estados do Sistema
    const [inputMassa, setInputMassa] = useState(""); 
    const [scriptsTecnicos, setScriptsTecnicos] = useState([]); // Etapa do Notion
    const [personagens, setPersonagens] = useState([]); // Elenco Final com Imagem
    const [ideiaNovela, setIdeiaNovela] = useState("");
    const [roteiro, setRoteiro] = useState(null);
    const [loading, setLoading] = useState(false);

    // 2. Motor de Geração de Prompt (A lógica que você enviou)
    const handleCriarScriptsCasting = async () => {
        setLoading(true);
        try {
            // Esta função no Service deve usar o seu template JavaScript para criar os 5 prompts
            const scripts = await generateCastingPrompts(inputMassa);
            setScriptsTecnicos(scripts);
        } catch (err) {
            console.error(err);
            alert("Erro ao criar roteiro de casting técnico.");
        } finally {
            setLoading(false);
        }
    };

    // 3. Geração da Imagem a partir do Script Técnico
    const handleProduzirAtivo = async (scriptObj) => {
        setLoading(true);
        try {
            // Envia o prompt estruturado de 300+ palavras para a IA
            const url = await generateImage(scriptObj.fullPrompt, "9:16");
            setPersonagens([...personagens, { ...scriptObj, url }]);
            // Remove da lista de pendentes após gerar
            setScriptsTecnicos(scriptsTecnicos.filter(s => s.fruit !== scriptObj.fruit));
        } catch (err) {
            alert("Erro ao produzir imagem do personagem.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8 pb-20 text-white bg-black/40 rounded-[2.5rem] min-h-[600px] backdrop-blur-md border border-white/5">
            
            {/* CABEÇALHO ESTILO STUDIO */}
            <div className="flex items-center justify-between border-b border-orange-900/30 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-600 rounded-full animate-pulse"></div>
                    <h1 className="text-orange-500 font-black text-2xl uppercase italic tracking-tighter">
                        Fábrica de Frutas <span className="text-white opacity-20">| Produção de Ativos</span>
                    </h1>
                </div>
            </div>

            {/* ETAPA 1: INPUT LIVRE (O QUE ESTAVA NO NOTION) */}
            <section className="bg-zinc-900/60 p-8 rounded-[2rem] border border-zinc-800 shadow-2xl space-y-4">
                <div className="space-y-1">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-orange-500 ml-1 italic">✨ Que personagem de fruta você quer criar?</h3>
                    <p className="text-[9px] text-zinc-500 uppercase font-bold ml-1">Descreva uma ou várias (Ex: pêra dona de casa, banana sarado...)</p>
                </div>
                
                <textarea 
                    value={inputMassa}
                    onChange={(e) => setInputMassa(e.target.value)}
                    placeholder="Cole aqui sua ideia simples ou detalhada..."
                    className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-sm h-32 focus:border-orange-600 outline-none transition-all placeholder:text-zinc-800"
                />

                <button 
                    onClick={handleCriarScriptsCasting}
                    disabled={loading || !inputMassa}
                    className="w-full py-5 rounded-2xl bg-orange-600 hover:bg-orange-500 font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl shadow-orange-900/20"
                >
                    {loading ? "IA PROCESSANDO DNA..." : "Gerar Scripts Técnicos de Casting"}
                </button>
            </section>

            {/* ETAPA 2: REVISÃO DE SCRIPTS (CARDS ANTES DA IMAGEM) */}
            {scriptsTecnicos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-5">
                    {scriptsTecnicos.map((s, i) => (
                        <div key={i} className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 space-y-4 hover:border-orange-500/30 transition-all">
                            <div className="flex justify-between items-center">
                                <span className="text-orange-400 font-black text-xs uppercase italic">#0{i+1} {s.fruit}</span>
                                <span className="text-[9px] bg-zinc-900 px-2 py-1 rounded text-zinc-500 font-bold uppercase tracking-tighter">{s.style}</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-3 italic opacity-60">"{s.fullPrompt}"</p>
                            <button 
                                onClick={() => handleProduzirAtivo(s)}
                                className="w-full bg-white text-black py-3 rounded-xl font-black uppercase text-[10px] hover:bg-orange-500 hover:text-white transition-all shadow-lg"
                            >
                                Produzir Ativo 3D (9:16)
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ETAPA 3: VARAL DE ELENCO (O QUE ESTÁ PRONTO) */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-2">Elenco Confirmado</h3>
                <div className="flex gap-4 overflow-x-auto py-2 px-2 scrollbar-hide snap-x">
                    {personagens.map((p, i) => (
                        <div key={i} className="min-w-[150px] bg-zinc-900/90 p-2 rounded-[2rem] border border-zinc-800 text-center snap-center relative group">
                            <div className="relative aspect-[9/16] overflow-hidden rounded-[1.5rem] shadow-2xl">
                                <img src={p.url} className="w-full h-full object-cover" alt={p.fruit} />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-4">
                                     <p className="text-[10px] font-black uppercase text-orange-400">{p.fruit}</p>
                                     <p className="text-[8px] opacity-60 uppercase font-bold">{p.gender}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {personagens.length === 0 && scriptsTecnicos.length === 0 && (
                        <div className="w-full py-16 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] flex flex-col items-center justify-center opacity-30">
                            <div className="w-10 h-10 border-2 border-zinc-700 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Aguardando Casting...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ETAPA 4: ROTEIRISTA DA TEMPORADA (SÓ APARECE COM ELENCO) */}
            {personagens.length > 0 && (
                <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-[2.5rem] border border-orange-900/20 space-y-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-600/10 rounded-2xl border border-orange-600/20">
                            <div className="w-4 h-4 bg-orange-600 rounded-sm rotate-45"></div>
                        </div>
                        <h2 className="text-white font-black uppercase text-sm tracking-[0.2em]">Roteirista de Temporada</h2>
                    </div>
                    
                    <textarea 
                        value={ideiaNovela}
                        onChange={(e) => setIdeiaNovela(e.target.value)}
                        placeholder="Descreva a trama da cena aqui..."
                        className="w-full bg-black/40 border border-zinc-800 p-5 rounded-2xl text-sm h-32 focus:border-orange-500 outline-none transition-all placeholder:text-zinc-800"
                    />
                    
                    <button 
                        disabled={loading || !ideiaNovela}
                        onClick={async () => {
                            setLoading(true);
                            try {
                                const desc = personagens.map(p => `${p.fruit} (${p.gender} estilo ${p.style})`).join(", ");
                                const res = await generateNovelaScript(ideiaNovela, desc);
                                setRoteiro(res);
                            } catch (err) {
                                alert("Erro ao gerar roteiro.");
                            } finally {
                                setLoading(false);
                            }
                        }}
                        className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.4em] transition-all ${
                            loading ? "bg-zinc-800 text-zinc-600" : "bg-white text-black hover:bg-orange-500 hover:text-white"
                        }`}
                    >
                        {loading ? "IA ESCREVENDO CAPÍTULOS..." : "Gerar Roteiro da Temporada"}
                    </button>
                </div>
            )}

            {/* ROTEIRO FINALIZADO */}
            {roteiro && (
                <div className="grid grid-cols-1 gap-6 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    {roteiro.map((cena, i) => (
                        <div key={i} className="group bg-zinc-900/40 p-6 rounded-[2rem] border border-zinc-800 hover:border-orange-500/30 transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <span className="bg-orange-600 text-white font-black text-[10px] px-4 py-1.5 rounded-full shadow-lg shadow-orange-900/20">CENA {cena.Cena}</span>
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest font-mono italic">Audio-Visual Sync OK</span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <h4 className="text-[9px] font-black text-orange-500 uppercase tracking-widest ml-1">Voz / Áudio</h4>
                                    <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800 italic text-zinc-300 text-sm leading-relaxed">"{cena.Dialogo}"</div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Prompt Visual IA</h4>
                                    <div className="bg-black/20 p-4 rounded-2xl border border-dashed border-zinc-800 text-[10px] text-zinc-500 uppercase font-mono tracking-tighter leading-tight">{cena.Visual_Prompt}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
