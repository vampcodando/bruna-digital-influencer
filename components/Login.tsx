import React, { useState } from 'react';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { auth } from '../firebase'; 
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      // 1. Inicia o fluxo nativo
      const result = await SocialLogin.login({
        provider: 'google',
        options: {}
      });

      // 2. Usamos 'as any' para evitar o erro de tipagem no build do TypeScript
      const response = result.result as any;

      // 3. Verifica e usa o idToken para o Firebase
      if (response && response.idToken) {
        const credential = GoogleAuthProvider.credential(response.idToken);
        await signInWithCredential(auth, credential);
        console.log("Login nativo realizado com sucesso!");
      }
    } catch (err: any) {
      console.error('Erro no login nativo:', err);
      setError("Não foi possível conectar com o Google.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#111111] text-white">
      <div className="p-8 bg-black/50 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-red-500 tracking-tighter">CrIA Base</h2>
        <p className="text-gray-400 mb-8 text-sm">Acesse sua conta para continuar</p>
        
        {error && <p className="text-red-500 mb-4 text-xs bg-red-500/10 p-2 rounded">{error}</p>}
        
        <button 
          onClick={handleGoogleLogin} 
          className="w-full p-4 bg-white text-black rounded-xl font-black hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
        >
          ENTRAR COM GOOGLE
        </button>
      </div>
    </div>
  );
};

export default Login;