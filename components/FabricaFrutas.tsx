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
        <div className="max-w-6xl mx-auto p-6 space-y-10 pb-20 text-white bg-black/40 rounded-[3rem] min-h-[700px] backdrop-blur-xl border border-white/5 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-orange-900/30 pb-8">
                <div className="w-4 h-4 bg-orange-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(234,88,12,0.5)]"></div>
                <h1 className="text-orange-500 font-black text-3xl uppercase italic tracking-tighter">
                    Fábrica de Frutas <span className="text-white/20">| Casting & Ativos</span>
                </h1>
            </div>

            {/* Input Área */}
            <section className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-zinc-800/50 shadow-inner space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 italic flex items-center gap-2">
                    <span className="text-lg">✨</span> Casting em Massa (Lógica Notion)
                </h3>
                <textarea 
                    value={inputMassa}
                    onChange={(e) => setInputMassa(e.target.value)}
                    placeholder="Descreva seus personagens aqui (ex: Mulher Goiaba 25 anos...)"
                    className="w-full bg-black/60 border border-zinc-800 p-6 rounded-3xl text-base h-40 focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 outline-none transition-all placeholder:text-zinc-700 text-zinc-200 leading-relaxed"
                />
                <button 
                    onClick={handleCriarScriptsCasting}
                    disabled={loading || !inputMassa}
                    className="w-full py-6 rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 font-black uppercase text-sm tracking-[0.4em] transition-all shadow-xl shadow-orange-900/20 active:scale-[0.98]"
                >
                    {loading ? "PROCESSANDO DNA TECNOLOGICO..." : "Gerar Scripts de Casting"}
                </button>
            </section>

            {/* Grid de Scripts Gerados - Melhoria de Visualização */}
            {scriptsTecnicos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {scriptsTecnicos.map((s, i) => (
                        <div key={i} className="group bg-zinc-950/80 p-8 rounded-[2.5rem] border border-zinc-800 hover:border-orange-900/50 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                                <span className="text-orange-400 font-black uppercase text-base italic tracking-tight">
                                    #0{i+1} {s.fruit}
                                </span>
                                <span className="bg-zinc-900 px-4 py-1.5 rounded-full text-zinc-500 text-[11px] font-black uppercase tracking-tighter">
                                    {s.style || 'Casting Open'}
                                </span>
                            </div>
                            
                            {/* Caixa de Texto do Prompt - Aumentada e com Scroll Suave */}
                            <div className="bg-black/80 p-6 rounded-2xl border border-zinc-900 h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                                <p className="text-sm text-zinc-300 leading-relaxed font-medium italic">
                                    "{s.fullPrompt}"
                                </p>
                            </div>

                            <button 
                                onClick={() => handleProduzirAtivo(s)}
                                className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-orange-600 hover:text-white transition-all shadow-lg active:scale-[0.97]"
                            >
                                Produzir com Imagen 4.0
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Elenco Confirmado */}
            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 ml-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></div>
                    Elenco Confirmado
                </h3>
                <div className="flex gap-6 overflow-x-auto py-4 px-4 scrollbar-hide snap-x">
                    {personagens.map((p, i) => (
                        <div key={i} className="min-w-[200px] snap-center group">
                            <div className="relative aspect-[9/16] overflow-hidden rounded-[2.5rem] border-2 border-zinc-800 group-hover:border-orange-600 transition-all shadow-2xl">
                                <img src={p.url} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 text-center">
                                     <p className="text-xs font-black uppercase text-orange-500 italic tracking-widest">{p.fruit}</p>
                                     <p className="text-[10px] text-zinc-400 font-bold uppercase">{p.gender} • {p.age}y</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {personagens.length === 0 && (
                        <div className="w-full h-40 flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-[2.5rem] opacity-30 font-black uppercase text-xs tracking-widest">
                            Nenhum ativo produzido ainda
                        </div>
                    )}
                </div>
            </div>

            {/* Roteirista Final */}
            {personagens.length > 0 && (
                <div className="bg-gradient-to-br from-zinc-900 to-black p-10 rounded-[3rem] border border-orange-900/20 space-y-6 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <h2 className="text-white font-black uppercase text-base tracking-[0.3em]">Roteirista da Temporada</h2>
                    </div>
                    <textarea 
                        value={ideiaNovela}
                        onChange={(e) => setIdeiaNovela(e.target.value)}
                        placeholder="Descreva a trama principal da novela..."
                        className="w-full bg-black/40 border border-zinc-800 p-6 rounded-3xl text-base h-40 focus:border-orange-500 outline-none transition-all text-zinc-200 leading-relaxed"
                    />
                    <button 
                        disabled={loading || !ideiaNovela}
                        onClick={async () => {
                            setLoading(true);
                            try {
                                const elencoStr = personagens.map(p => `${p.fruit} (${p.gender}, ${p.age} anos)`).join(", ");
                                const res = await generateNovelaScript(ideiaNovela, elencoStr);
                                setRoteiro(res);
                            } catch (err) { alert("Erro ao gerar roteiro."); }
                            setLoading(false);
                        }}
                        className="w-full py-6 rounded-2xl bg-white text-black hover:bg-orange-600 hover:text-white font-black uppercase text-sm tracking-[0.5em] transition-all shadow-2xl active:scale-[0.98]"
                    >
                        {loading ? "ESCREVENDO EPISÓDIOS..." : "Gerar Script Final"}
                    </button>
                </div>
            )}
        </div>
    );
};
