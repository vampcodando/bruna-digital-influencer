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

    // ETAPA 1: Processa o texto livre do Notion
    const handleCriarScriptsCasting = async () => {
        if (!inputMassa) return;
        setLoading(true);
        try {
            const scripts = await generateCastingPrompts(inputMassa);
            setScriptsTecnicos(scripts);
        } catch (err) {
            alert("Erro no casting técnico.");
        } finally {
            setLoading(false);
        }
    };

    // ETAPA 2: Produz o boneco real (Imagen 4.0)
    const handleProduzirAtivo = async (scriptObj) => {
        setLoading(true);
        try {
            const url = await generateImage(scriptObj.fullPrompt, "9:16");
            setPersonagens([...personagens, { ...scriptObj, url }]);
            setScriptsTecnicos(scriptsTecnicos.filter(s => s.fullPrompt !== scriptObj.fullPrompt));
        } catch (err) {
            alert("Erro na produção da imagem.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8 pb-20 text-white bg-black/40 rounded-[2.5rem] min-h-[600px] backdrop-blur-md border border-white/5">
            <div className="flex items-center gap-3 border-b border-orange-900/30 pb-6">
                <div className="w-3 h-3 bg-orange-600 rounded-full animate-pulse"></div>
                <h1 className="text-orange-500 font-black text-2xl uppercase italic tracking-tighter">Fábrica de Frutas</h1>
            </div>

            {/* INPUT LIVRE */}
            <section className="bg-zinc-900/60 p-8 rounded-[2rem] border border-zinc-800 shadow-2xl space-y-4">
                <h3 className="text-[11px] font-black uppercase text-orange-500 italic tracking-widest">✨ Casting em Massa</h3>
                <textarea 
                    value={inputMassa}
                    onChange={(e) => setInputMassa(e.target.value)}
                    placeholder="Ex: pêra dona de casa, banana sarado academia..."
                    className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-sm h-32 focus:border-orange-600 outline-none transition-all"
                />
                <button 
                    onClick={handleCriarScriptsCasting}
                    disabled={loading || !inputMassa}
                    className="w-full py-5 rounded-2xl bg-orange-600 hover:bg-orange-500 font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl shadow-orange-900/20"
                >
                    {loading ? "PROCESSANDO DNA..." : "Gerar Scripts de Casting"}
                </button>
            </section>

            {/* CARDS DE DNA (PENDENTES) */}
            {scriptsTecnicos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scriptsTecnicos.map((s, i) => (
                        <div key={i} className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                <span className="text-orange-400">{s.fruit}</span>
                                <span className="text-zinc-600 italic">{s.style}</span>
                            </div>
                            <p className="text-[9px] text-zinc-500 italic line-clamp-3">"{s.fullPrompt}"</p>
                            <button onClick={() => handleProduzirAtivo(s)} className="w-full bg-white text-black py-3 rounded-xl font-black uppercase text-[10px] hover:bg-orange-600 hover:text-white transition-all">
                                Produzir com Imagen 4.0
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* VARAL DE ELENCO PRONTO */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Elenco Ativo</h3>
                <div className="flex gap-4 overflow-x-auto py-2 px-2 scrollbar-hide snap-x">
                    {personagens.map((p, i) => (
                        <div key={i} className="min-w-[150px] snap-center">
                            <div className="relative aspect-[9/16] overflow-hidden rounded-[1.5rem] border border-zinc-800">
                                <img src={p.url} className="w-full h-full object-cover" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-4 text-center">
                                     <p className="text-[10px] font-black uppercase text-orange-400">{p.fruit}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ROTEIRISTA */}
            {personagens.length > 0 && (
                <div className="bg-zinc-900/80 p-8 rounded-[2.5rem] border border-orange-900/20 space-y-4">
                    <h2 className="text-white font-black uppercase text-sm italic">Criar Roteiro</h2>
                    <textarea 
                        value={ideiaNovela}
                        onChange={(e) => setIdeiaNovela(e.target.value)}
                        placeholder="Descreva a treta..."
                        className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-sm h-32 focus:border-orange-500 outline-none"
                    />
                    <button 
                        onClick={async () => {
                            setLoading(true);
                            try {
                                const desc = personagens.map(p => p.fruit).join(", ");
                                const res = await generateNovelaScript(ideiaNovela, desc);
                                setRoteiro(res);
                            } catch (e) {}
                            setLoading(false);
                        }}
                        className="w-full py-5 rounded-2xl bg-white text-black hover:bg-orange-500 hover:text-white font-black uppercase text-xs transition-all"
                    >
                        Gerar Script Final
                    </button>
                </div>
            )}

            {/* RESULTADO ROTEIRO */}
            {roteiro && (
                <div className="space-y-6">
                    {roteiro.map((cena, i) => (
                        <div key={i} className="bg-zinc-950 p-6 rounded-[2rem] border border-zinc-900">
                            <span className="text-orange-500 font-black text-[10px] uppercase">Cena {cena.Cena}</span>
                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <div>
                                    <p className="text-[9px] text-zinc-500 uppercase font-black mb-1 tracking-widest">Áudio</p>
                                    <p className="text-sm italic text-zinc-300">"{cena.Dialogo}"</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-zinc-500 uppercase font-black mb-1 tracking-widest">Visual IA</p>
                                    <p className="text-[10px] text-zinc-500 uppercase font-mono">{cena.Visual_Prompt}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
