// @ts-nocheck
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PostCreator from './components/PostCreator';
import ImageEditor from './components/ImageEditor';
import ImageGenerator from './components/ImageGenerator';
import SceneCollage from './components/SceneCollage';
import VideoGenerator from './components/VideoGenerator';
import { DiretorIA } from './components/DiretorIA'; 
import TabButton from './components/TabButton';
import Login from './components/Login';
import { SparklesIcon, PencilSquareIcon, PhotoIcon, SquaresPlusIcon, FilmIcon } from './components/Icons';
import { auth } from './firebase';
import * as firebaseAuth from 'firebase/auth';

// 1. Definição do Enum de Abas
enum Tab {
  PostCreator = 'PostCreator',
  ImageEditor = 'ImageEditor',
  ImageGenerator = 'ImageGenerator',
  SceneCollage = 'SceneCollage',
  VideoGenerator = 'VideoGenerator',
  DiretorIA = 'DiretorIA', 
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.PostCreator);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scriptsPersistentes, setScriptsPersistentes] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(auth, (currentUser: any) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => firebaseAuth.signOut(auth);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#111111] text-white font-black uppercase tracking-widest">Carregando Sistema...</div>;
  if (!user) return <Login />;

  const renderContent = () => {
    switch (activeTab) {
      case Tab.PostCreator: return <PostCreator />;
      case Tab.ImageEditor: return <ImageEditor />;
      case Tab.ImageGenerator: return <ImageGenerator />;
      case Tab.SceneCollage: return <SceneCollage />;
      case Tab.VideoGenerator: 
        return <VideoGenerator scripts={scriptsPersistentes} />; 
      case Tab.DiretorIA: 
        return <DiretorIA scriptsSalvos={scriptsPersistentes} setScriptsSalvos={setScriptsPersistentes} />;
      default: return <PostCreator />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case Tab.PostCreator: return 'AI Post Generator Studio';
      case Tab.ImageEditor: return 'AI Image Editor';
      case Tab.ImageGenerator: return 'AI Image Generator';
      case Tab.SceneCollage: return 'Compositor de Cena Épica';
      case Tab.VideoGenerator: return 'Gerador de Vídeo Ultra Realista';
      case Tab.DiretorIA: return 'Diretor de IA: Roteiros Técnicos';
      default: return 'AI Post Generator Studio';
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans overflow-x-hidden">
      {/* Background com Overlay */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579952363873-27f3bade9745?q=80&w=2070&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 w-full h-full bg-black/85 backdrop-blur-xl"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8">
        <Header />
        <button onClick={handleSignOut} className="absolute top-4 right-4 text-[10px] font-black uppercase bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800 hover:bg-red-600 transition-all tracking-widest">Desconectar</button>
        
        <main className="w-full max-w-7xl mx-auto mt-8 flex-grow">
          {/* Menu de Navegação */}
          <div className="mb-6 flex flex-wrap justify-center items-center bg-black/40 backdrop-blur-sm border border-zinc-800/60 rounded-2xl p-2 max-w-4xl mx-auto gap-2">
            <TabButton label="Posts" isActive={activeTab === Tab.PostCreator} onClick={() => setActiveTab(Tab.PostCreator)} icon={<SparklesIcon className="w-4 h-4" />} />
            <TabButton label="Editar" isActive={activeTab === Tab.ImageEditor} onClick={() => setActiveTab(Tab.ImageEditor)} icon={<PencilSquareIcon className="w-4 h-4" />} />
            <TabButton label="Gerar" isActive={activeTab === Tab.ImageGenerator} onClick={() => setActiveTab(Tab.ImageGenerator)} icon={<PhotoIcon className="w-4 h-4" />} />
            <TabButton label="Compor" isActive={activeTab === Tab.SceneCollage} onClick={() => setActiveTab(Tab.SceneCollage)} icon={<SquaresPlusIcon className="w-4 h-4" />} />
            <TabButton label="Diretor IA" isActive={activeTab === Tab.DiretorIA} onClick={() => setActiveTab(Tab.DiretorIA)} icon={<FilmIcon className="w-4 h-4" />} />
            <TabButton label="Vídeo" isActive={activeTab === Tab.VideoGenerator} onClick={() => setActiveTab(Tab.VideoGenerator)} icon={<FilmIcon className="w-4 h-4" />} />
          </div>

          {/* Container Principal do Conteúdo */}
          <div className="bg-black/60 border border-zinc-800/70 rounded-[2.5rem] shadow-2xl shadow-red-900/10 backdrop-blur-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-black text-center mb-8 tracking-[0.2em] uppercase border-b border-red-900/20 pb-6 inline-block w-full">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                {getTabTitle()}
              </span>
            </h2>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;