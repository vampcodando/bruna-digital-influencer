import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PostCreator from './components/PostCreator';
import ImageEditor from './components/ImageEditor';
import ImageGenerator from './components/ImageGenerator';
import SceneCollage from './components/SceneCollage';
import VideoGenerator from './components/VideoGenerator';
import TabButton from './components/TabButton';
import Login from './components/Login';
import { Tab } from './types';
import { SparklesIcon, PencilSquareIcon, PhotoIcon, SquaresPlusIcon, FilmIcon } from './components/Icons';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// 1. Importação do plugin para o Capacitor 8 [cite: 71, 72]
import { SocialLogin } from '@capgo/capacitor-social-login';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.PostCreator);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Inicialização crucial para Android [cite: 91, 98]
    SocialLogin.initialize({
      google: {
        // Seu ID do Cliente Web confirmado nas imagens
        webClientId: '176660514948-egf89uuod3rfr3etc0onv68rmbtf82gm.apps.googleusercontent.com',
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#111111] text-white">Carregando...</div>;
  if (!user) return <Login />;

  const renderContent = () => {
    switch (activeTab) {
      case Tab.PostCreator: return <PostCreator />;
      case Tab.ImageEditor: return <ImageEditor />;
      case Tab.ImageGenerator: return <ImageGenerator />;
      case Tab.SceneCollage: return <SceneCollage />;
      case Tab.VideoGenerator: return <VideoGenerator />;
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
      default: return 'AI Post Generator Studio';
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans overflow-x-hidden">
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579952363873-27f3bade9745?q=80&w=2070&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 w-full h-full bg-black/80 backdrop-blur-md"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8">
        <Header />
        <button onClick={() => signOut(auth)} className="absolute top-4 right-4 text-sm text-gray-400 hover:text-white">Sair</button>
        
        <main className="w-full max-w-7xl mx-auto mt-8 flex-grow">
          <div className="mb-6 flex flex-wrap justify-center items-center bg-black/40 backdrop-blur-sm border border-gray-800/60 rounded-xl p-2 max-w-3xl mx-auto gap-2">
            <TabButton 
              label="Posts"
              isActive={activeTab === Tab.PostCreator}
              onClick={() => setActiveTab(Tab.PostCreator)}
              icon={<SparklesIcon className="w-4 h-4" />}
            />
            <TabButton 
              label="Editar"
              isActive={activeTab === Tab.ImageEditor}
              onClick={() => setActiveTab(Tab.ImageEditor)}
              icon={<PencilSquareIcon className="w-4 h-4" />}
            />
            <TabButton 
              label="Gerar"
              isActive={activeTab === Tab.ImageGenerator}
              onClick={() => setActiveTab(Tab.ImageGenerator)}
              icon={<PhotoIcon className="w-4 h-4" />}
            />
            <TabButton 
              label="Compor Cena"
              isActive={activeTab === Tab.SceneCollage}
              onClick={() => setActiveTab(Tab.SceneCollage)}
              icon={<SquaresPlusIcon className="w-4 h-4" />}
            />
            <TabButton 
              label="Vídeo"
              isActive={activeTab === Tab.VideoGenerator}
              onClick={() => setActiveTab(Tab.VideoGenerator)}
              icon={<FilmIcon className="w-4 h-4" />}
            />
          </div>

          <div className="bg-black/50 border border-gray-800/70 rounded-2xl shadow-2xl shadow-red-500/20 backdrop-blur-xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-black text-center mb-8 tracking-widest uppercase border-b border-red-500/20 pb-4 inline-block w-full">{getTabTitle()}</h2>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;