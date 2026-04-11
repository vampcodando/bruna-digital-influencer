// @ts-nocheck
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
            alert("Erro ao criar personagem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20 text-white bg-black min-h-screen">
            <h1 className="text-orange-500 font-black text-2xl uppercase italic">Fábrica de Personagens</h1>

            {/* 1. FORMULÁRIO DE CRIAÇÃO */}
            <form onSubmit={handleCriarPersonagem} className="grid grid-cols-2 gap-3 bg-zinc-900 p-4 rounded-3xl border border-zinc-800">
                <input name="fruta" placeholder="Qual fruta? (Ex: Pêssego)" className="bg-black border border-zinc-700 p-3 rounded-xl text-sm" required />
                <input name="genero" placeholder="Homem / Mulher" className="bg-black border border-zinc-700 p-3 rounded-xl text-sm" />
                <input name="estilo" placeholder="Estilo (Ex: Academia, Luxo)" className="bg-black border border-zinc-700 p-3 rounded-xl text-sm col-span-2" />
                <button disabled={loading} className="col-span-2 bg-orange-600 py-3 rounded-xl font-bold uppercase text-xs">
                    {loading ? "Gerando Ativo..." : "Criar Boneco (Fundo Branco)"}
                </button>
            </form>

            {/* 2. O VARAL DE PERSONAGENS (Os Quadradinhos que você pediu) */}
            <div className="flex gap-4 overflow-x-auto py-4 scrollbar-hide">
                {personagens.map((p, i) => (
                    <div key={i} className="min-w-[120px] bg-zinc-900 p-2 rounded-2xl border-2 border-orange-500/20 text-center">
                        <img src={p.url} className="w-full h-32 object-cover rounded-xl shadow-lg" alt={p.fruta} />
                        <p className="text-[10px] mt-2 font-black uppercase text-orange-400">{p.fruta}</p>
                    </div>
                ))}
                {personagens.length === 0 && (
                    <div className="w-full py-10 text-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-3xl">
                        Nenhum personagem criado ainda.
                    </div>
                )}
            </div>

            {/* 3. GERADOR DE ROTEIRO (Só aparece se tiver personagens) */}
            {personagens.length > 0 && (
                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4">
                    <h2 className="text-white font-bold uppercase text-sm">Roteirista de Novela (8s)</h2>
                    <textarea 
                        value={ideiaNovela}
                        onChange={(e) => setIdeiaNovela(e.target.value)}
                        placeholder="Descreva a treta da novela..."
                        className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm h-24"
                    />
                    <button 
                        onClick={async () => {
                            setLoading(true);
                            const desc = personagens.map(p => p.fruta).join(", ");
                            const res = await generateNovelaScript(ideiaNovela, desc);
                            setRoteiro(res);
                            setLoading(false);
                        }}
                        className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs"
                    >
                        {loading ? "Criando Roteiro..." : "Gerar Série Completa"}
                    </button>
                </div>
            )}

            {/* 4. EXIBIÇÃO DO ROTEIRO */}
            {roteiro && (
                <div className="space-y-4">
                    {roteiro.map((cena, i) => (
                        <div key={i} className="bg-zinc-950 p-4 rounded-2xl border-l-4 border-orange-600">
                            <span className="text-orange-500 font-black text-[10px] uppercase">Cena {cena.Cena}</span>
                            <p className="text-sm my-2">"{cena.Dialogo}"</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
