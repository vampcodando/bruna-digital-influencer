// @ts-nocheck
import React from 'react';
// Importação obrigatória para o seu ambiente CDN/Importmap
const { useState, useEffect } = React;

import { generateImage, generateNovelaScript } from '../services/geminiService';

export const FabricaFrutas = () => {
    // ESTADOS: Aqui é onde as imagens ficam "salvas" nos quadradinhos
    const [personagens, setPersonagens] = useState([]); 
    const [ideiaNovela, setIdeiaNovela] = useState("");
    const [roteiro, setRoteiro] = useState(null);
    const [loading, setLoading] = useState(false);

    // Função para criar o boneco e jogar no quadradinho
    const handleCriarPersonagem = async (e) => {
        e.preventDefault();
        setLoading(true);
        const form = new FormData(e.target);
        const dados = Object.fromEntries(form);

        // Prompt técnico para manter o padrão 3D Pixar fundo branco
        const promptCasting = `Full-body 3D stylized anthropomorphic ${dados.fruta} character, ${dados.genero}, ${dados.estilo}. Pixar style, ultra-detailed fruit texture, isolated on pure white background, cinematic lighting, 9:16 aspect ratio.`;

        try {
            const url = await generateImage(promptCasting, "9:16");
            // ADICIONA O NOVO QUADRADINHO
            setPersonagens([...personagens, { ...dados, url }]);
            e.target.reset();
        } catch (err) {
            console.error(err);
            alert("Erro ao criar personagem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20 text-white bg-black/40 rounded-[2rem] min-h-[600px] backdrop-blur-md">
            <h1 className="text-orange-500 font-black text-2xl uppercase italic tracking-tighter">
                Fábrica de Personagens <span className="text-white opacity-20">| Casting</span>
            </h1>

            {/* 1. FORMULÁRIO DE CRIAÇÃO */}
            <form onSubmit={handleCriarPersonagem} className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900/80 p-5 rounded-3xl border border-zinc-800 shadow-xl">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Fruta Base</label>
                    <input name="fruta" placeholder="Ex: Pêssego" className="bg-black border border-zinc-700 p-3 rounded-xl text-sm focus:border-orange-500 outline-none transition-all" required />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Gênero</label>
                    <input name="genero" placeholder="Homem / Mulher" className="bg-black border border-zinc-700 p-3 rounded-xl text-sm focus:border-orange-500 outline-none transition-all" />
                </div>
                <div className="flex flex-col gap-1 col-span-1 sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Estilo do Figurino</label>
                    <input name="estilo" placeholder="Ex: Academia, Terno de Luxo, Casual" className="bg-black border border-zinc-700 p-3 rounded-xl text-sm focus:border-orange-500 outline-none transition-all" />
                </div>
                
                <button 
                    disabled={loading} 
                    className={`col-span-1 sm:col-span-2 py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                        loading ? "bg-zinc-800 text-zinc-500" : "bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-900/20"
                    }`}
                >
                    {loading ? "Processando GenAI..." : "Gerar Personagem (9:16)"}
                </button>
            </form>

            {/* 2. O VARAL DE PERSONAGENS (Quadradinhos) */}
            <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Elenco Confirmado</h3>
                <div className="flex gap-4 overflow-x-auto py-4 px-2 scrollbar-hide snap-x">
                    {personagens.map((p, i) => (
                        <div key={i} className="min-w-[130px] bg-zinc-900 p-2 rounded-2xl border border-zinc-800 text-center snap-center hover:border-orange-500/50 transition-all">
                            <div className="relative group">
                                <img src={p.url} className="w-full aspect-[9/16] object-cover rounded-xl shadow-2xl" alt={p.fruta} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2">
                                    <span className="text-[8px] font-bold">READY</span>
                                </div>
                            </div>
                            <p className="text-[10px] mt-3 font-black uppercase text-orange-400 truncate px-1">{p.fruta}</p>
                            <p className="text-[8px] opacity-40 uppercase">{p.genero}</p>
                        </div>
                    ))}
                    {personagens.length === 0 && (
                        <div className="w-full py-12 text-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-2">
                            <div className="w-8 h-8 opacity-20 bg-zinc-400 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Aguardando Casting...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. GERADOR DE ROTEIRO */}
            {personagens.length > 0 && (
                <div className="bg-zinc-900/90 p-6 rounded-[2rem] border border-orange-900/20 space-y-4 shadow-2xl">
                    <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                        <div className="w-2 h-6 bg-orange-600 rounded-full"></div>
                        <h2 className="text-white font-black uppercase text-xs tracking-widest">Roteirista de Série (8s per Scene)</h2>
                    </div>
                    
                    <textarea 
                        value={ideiaNovela}
                        onChange={(e) => setIdeiaNovela(e.target.value)}
                        placeholder="Ex: O Pêssego descobre que a Uva está roubando seus pesos na academia..."
                        className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm h-28 focus:border-white outline-none transition-all placeholder:text-zinc-700"
                    />
                    
                    <button 
                        disabled={loading || !ideiaNovela}
                        onClick={async () => {
                            setLoading(true);
                            try {
                                const desc = personagens.map(p => `${p.fruta} (${p.genero} estilo ${p.estilo})`).join(", ");
                                const res = await generateNovelaScript(ideiaNovela, desc);
                                setRoteiro(res);
                            } catch (err) {
                                alert("Erro ao gerar roteiro técnico.");
                            } finally {
                                setLoading(false);
                            }
                        }}
                        className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all ${
                            loading ? "bg-zinc-800 text-zinc-500" : "bg-white text-black hover:bg-zinc-200"
                        }`}
                    >
                        {loading ? "IA ESCREVENDO BLOCOS..." : "Gerar Roteiro da Temporada"}
                    </button>
                </div>
            )}

            {/* 4. EXIBIÇÃO DO ROTEIRO TÉCNICO */}
            {roteiro && (
                <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-500 ml-2">Script Finalizado</h3>
                    {roteiro.map((cena, i) => (
                        <div key={i} className="bg-zinc-950/50 p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-orange-600 text-white font-black text-[9px] px-2 py-1 rounded">CENA {cena.Cena}</span>
                                <span className="text-[8px] font-bold text-zinc-600 uppercase">Dur: 08 SEC</span>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[9px] font-bold text-orange-500 uppercase mb-1">Diálogo / Voiceover</p>
                                    <p className="text-sm italic text-zinc-200">"{cena.Dialogo}"</p>
                                </div>
                                <div className="p-3 bg-black/50 rounded-xl border border-zinc-900">
                                    <p className="text-[8px] font-bold text-zinc-500 uppercase mb-1">Prompt Visual (Imagen 4.0)</p>
                                    <p className="text-[10px] text-zinc-400 leading-relaxed uppercase tracking-tighter">{cena.Visual_Prompt}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
