// @ts-nocheck
import React from 'react';
const { useState } = React;
import { generateImage, generateNovelaScript, generateCastingPrompts } from '../services/geminiService';

export const FabricaFrutas = () => {
    const [inputMassa, setInputMassa] = useState(""); 
    const [scriptsTecnicos, setScriptsTecnicos] = useState([]); 
    const [personagensProntos, setPersonagensProntos] = useState([]); 
    const [ideiaNovela, setIdeiaNovela] = useState("");
    const [roteiro, setRoteiro] = useState(null);
    const [loading, setLoading] = useState(false);

    // ETAPA 1: Processa o texto corrido e cria os "cards" de intenção
    const handleCastingMassa = async () => {
        setLoading(true);
        try {
            const scripts = await generateCastingPrompts(inputMassa);
            setScriptsTecnicos(scripts);
        } catch (err) {
            alert("Erro ao processar lista de casting");
        } finally {
            setLoading(false);
        }
    };

    // ETAPA 2: Gera a imagem real para um card específico
    const handleProduzirPersonagem = async (scriptObj) => {
        setLoading(true);
        try {
            const url = await generateImage(scriptObj.fullPrompt, "9:16");
            setPersonagensProntos(prev => [...prev, { ...scriptObj, url }]);
            // Remove da lista de pendentes
            setScriptsTecnicos(prev => prev.filter(s => s.fullPrompt !== scriptObj.fullPrompt));
        } catch (err) {
            alert("Erro na geração da imagem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8 pb-20 text-white bg-black/40 rounded-[2.5rem] backdrop-blur-md border border-white/5">
            <h1 className="text-orange-500 font-black text-2xl uppercase italic tracking-tighter border-b border-orange-900/30 pb-4">
                Fábrica de Frutas <span className="text-white opacity-20">| Produção Ativa</span>
            </h1>

            {/* INPUT EM MASSA */}
            <section className="bg-zinc-900/80 p-6 rounded-[2rem] border border-zinc-800 space-y-4 shadow-2xl">
                <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-widest italic">✨ Casting em Massa</h3>
                <textarea 
                    value={inputMassa}
                    onChange={(e) => setInputMassa(e.target.value)}
                    placeholder="mulher pêssego dona de casa 35 anos, homem beringela sarado academia..."
                    className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-sm h-32 focus:border-orange-600 outline-none transition-all"
                />
                <button 
                    onClick={handleCastingMassa}
                    disabled={loading || !inputMassa}
                    className="w-full py-4 rounded-xl bg-orange-600 hover:bg-orange-500 font-black uppercase text-xs tracking-widest transition-all"
                >
                    {loading ? "Processando DNA..." : "Gerar Scripts de Casting"}
                </button>
            </section>

            {/* CARDS DE SCRIPTS GERADOS */}
            {scriptsTecnicos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {scriptsTecnicos.map((s, i) => (
                        <div key={i} className="bg-zinc-950 p-5 rounded-3xl border border-zinc-800 space-y-3">
                            <div className="flex justify-between font-black text-[10px] uppercase italic text-orange-400">
                                <span>{s.fruit}</span>
                                <span className="text-zinc-600">{s.age} anos</span>
                            </div>
                            <p className="text-[9px] text-zinc-500 line-clamp-2 italic">"{s.fullPrompt}"</p>
                            <button 
                                onClick={() => handleProduzirPersonagem(s)}
                                className="w-full bg-white text-black py-2 rounded-lg font-black uppercase text-[10px] hover:bg-orange-500 hover:text-white transition-all"
                            >
                                Produzir Personagem (9:16)
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ELENCO CONFIRMADO */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Elenco Pronto para Novela</h3>
                <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
                    {personagensProntos.map((p, i) => (
                        <div key={i} className="min-w-[140px] relative group snap-center">
                            <img src={p.url} className="w-full aspect-[9/16] object-cover rounded-[1.5rem] border border-zinc-800 shadow-xl" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-3 text-center rounded-b-[1.5rem]">
                                <p className="text-[10px] font-black uppercase text-orange-400 truncate">{p.fruit}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* GERADOR DE ROTEIRO FINAL */}
            {personagensProntos.length > 0 && (
                <section className="bg-zinc-900/60 p-6 rounded-[2rem] border border-orange-900/20 space-y-4">
                    <h2 className="text-white font-black uppercase text-xs tracking-widest">Roteiro da Temporada</h2>
                    <textarea 
                        value={ideiaNovela}
                        onChange={(e) => setIdeiaNovela(e.target.value)}
                        placeholder="Descreva a trama..."
                        className="w-full bg-black/40 border border-zinc-800 p-4 rounded-2xl text-sm h-28 focus:border-white outline-none"
                    />
                    <button 
                        onClick={async () => {
                            setLoading(true);
                            try {
                                const elenco = personagensProntos.map(p => `${p.fruit} (${p.gender})`).join(", ");
                                const res = await generateNovelaScript(ideiaNovela, elenco);
                                setRoteiro(res);
                            } catch (e) { alert("Erro no roteiro"); }
                            setLoading(false);
                        }}
                        className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-orange-500 hover:text-white transition-all"
                    >
                        Gerar Script de 8 segundos
                    </button>
                </section>
            )}
        </div>
    );
};
