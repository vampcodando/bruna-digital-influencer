// @ts-nocheck
import React from 'react';
const { useState, useEffect } = React;

import { 
    generateImage, 
    generateNovelaScript, 
    generateCastingPrompts 
} from '../services/geminiService';

export const FabricaFrutas = () => {
    const [inputMassa, setInputMassa] = useState(""); 
    const [scriptsTecnicos, setScriptsTecnicos] = useState([]); 
    const [personagens, setPersonagens] = useState([]); 
    const [ideiaNovela, setIdeiaNovela] = useState("");
    const [roteiro, setRoteiro] = useState(null);
    const [loading, setLoading] = useState(false);

    // ETAPA 1: Casting em Massa
    const handleCriarScriptsCasting = async () => {
        if (!inputMassa) return;
        setLoading(true);
        try {
            const scripts = await generateCastingPrompts(inputMassa);
            setScriptsTecnicos(scripts);
        } catch (err) {
            alert("Erro ao processar casting em massa.");
        } finally {
            setLoading(false);
        }
    };

    // ETAPA 2: Produção de Imagem Individual
    const handleProduzirAtivo = async (scriptObj) => {
        setLoading(true);
        try {
            const url = await generateImage(scriptObj.fullPrompt, "9:16");
            setPersonagens([...personagens, { ...scriptObj, url }]);
            setScriptsTecnicos(scriptsTecnicos.filter(s => s.fullPrompt !== scriptObj.fullPrompt));
        } catch (err) {
            alert("Erro ao produzir imagem do personagem.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8 pb-20 text-white bg-black/40 rounded-[2.5rem] min-h-[600px] backdrop-blur-md border border-white/5">
            
            <div className="flex items-center gap-3 border-b border-orange-900/30 pb-6">
                <div className="w-3 h-3 bg-orange-600 rounded-full animate-pulse"></div>
                <h1 className="text-orange-500 font-black text-2xl uppercase italic tracking-tighter">
                    Fábrica de Frutas <span className="text-white opacity-20">| Casting & Ativos</span>
                </h1>
            </div>

            <section className="bg-zinc-900/60 p-8 rounded-[2rem] border border-zinc-800 shadow-2xl space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-orange-500 italic">✨ Casting em Massa (Lógica Notion)</h3>
                <textarea 
                    value={inputMassa}
                    onChange={(e) => setInputMassa(e.target.value)}
                    placeholder="Ex: mulher goiaba esposa dona de casa, homem beringela professor..."
                    className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-sm h-32 focus:border-orange-600 outline-none transition-all placeholder:text-zinc-800"
                />
                <button 
                    onClick={handleCriarScriptsCasting}
                    disabled={loading || !inputMassa}
                    className="w-full py-5 rounded-2xl bg-orange-600 hover:bg-orange-500 font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl shadow-orange-900/20"
                >
                    {loading ? "PROCESSANDO DNA..." : "Gerar Scripts de Casting"}
                </button>
            </section>

            {/* GRID DE SCRIPTS PENDENTES */}
            {scriptsTecnicos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scriptsTecnicos.map((s, i) => (
                        <div key={i} className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 space-y-4 animate-in fade-in zoom-in-95">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase italic">
                                <span className="text-orange-400">#0{i+1} {s.fruit}</span>
                                <span className="bg-zinc-900 px-2 py-1 rounded text-zinc-500">{s.style}</span>
                            </div>
                            <div className="bg-black/50 p-3 rounded-xl border border-zinc-900 h-24 overflow-y-auto">
                                <p className="text-[9px] text-zinc-500 leading-relaxed italic">"{s.fullPrompt}"</p>
                            </div>
                            <button 
                                onClick={() => handleProduzirAtivo(s)}
                                className="w-full bg-white text-black py-3 rounded-xl font-black uppercase text-[10px] hover:bg-orange-500 hover:text-white transition-all shadow-lg"
                            >
                                Produzir com Imagen 4.0
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ELENCO CONFIRMADO */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-2">Elenco Confirmado</h3>
                <div className="flex gap-4 overflow-x-auto py-2 px-2 scrollbar-hide snap-x">
                    {personagens.map((p, i) => (
                        <div key={i} className="min-w-[150px] snap-center relative">
                            <div className="relative aspect-[9/16] overflow-hidden rounded-[1.8rem] border border-zinc-800 shadow-2xl">
                                <img src={p.url} className="w-full h-full object-cover" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-4 text-center">
                                     <p className="text-[10px] font-black uppercase text-orange-400 italic">{p.fruit}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ROTEIRISTA */}
            {personagens.length > 0 && (
                <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-[2.5rem] border border-orange-900/20 space-y-4 shadow-2xl">
                    <h2 className="text-white font-black uppercase text-sm tracking-[0.2em]">Roteirista da Temporada</h2>
                    <textarea 
                        value={ideiaNovela}
                        onChange={(e) => setIdeiaNovela(e.target.value)}
                        placeholder="Descreva a trama..."
                        className="w-full bg-black/40 border border-zinc-800 p-5 rounded-2xl text-sm h-32 focus:border-orange-500 outline-none transition-all"
                    />
                    <button 
                        disabled={loading || !ideiaNovela}
                        onClick={async () => {
                            setLoading(true);
                            try {
                                const elencoStr = personagens.map(p => `${p.fruit} (${p.gender})`).join(", ");
                                const res = await generateNovelaScript(ideiaNovela, elencoStr);
                                setRoteiro(res);
                            } catch (err) { alert("Erro ao gerar roteiro."); }
                            setLoading(false);
                        }}
                        className="w-full py-5 rounded-2xl bg-white text-black hover:bg-orange-500 hover:text-white font-black uppercase text-xs tracking-[0.4em] transition-all"
                    >
                        {loading ? "ESCREVENDO..." : "Gerar Script Final"}
                    </button>
                </div>
            )}
        </div>
    );
};
