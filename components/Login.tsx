import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { auth } from '../firebase'; 
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Verifica se está rodando em ambiente nativo (Android/iOS) ou Web
      if (Capacitor.isNativePlatform()) {
        // --- FLUXO NATIVO (Capacitor) ---
        const result = await SocialLogin.login({
          provider: 'google',
          options: {}
        });

        const response = result.result as any;

        if (response && response.idToken) {
          const credential = GoogleAuthProvider.credential(response.idToken);
          await signInWithCredential(auth, credential);
          console.log("Login nativo realizado com sucesso!");
        }
      } else {
        // --- FLUXO WEB (Vercel/Browser) ---
        const provider = new GoogleAuthProvider();
        // Força a seleção de conta para evitar login automático indesejado
        provider.setCustomParameters({ prompt: 'select_account' });
        
        await signInWithPopup(auth, provider);
        console.log("Login Web realizado com sucesso!");
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      
      // Tratamento de erro amigável
      if (err.code === 'auth/popup-closed-by-user') {
        setError("O login foi cancelado.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("Este domínio não está autorizado no Firebase Console.");
      } else {
        setError("Não foi possível conectar com o Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#111111] text-white">
      <div className="p-8 bg-black/50 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-red-500 tracking-tighter">CrIA Base</h2>
        <p className="text-gray-400 mb-8 text-sm">Acesse sua conta para continuar</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-xs">{error}</p>
          </div>
        )}
        
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className={`w-full p-4 bg-white text-black rounded-xl font-black transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
            loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-200'
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              CARREGANDO...
            </>
          ) : (
            'ENTRAR COM GOOGLE'
          )}
        </button>
      </div>
    </div>
  );
};

export default Login;
