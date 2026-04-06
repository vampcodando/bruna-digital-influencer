import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    browserLocalPersistence, 
    setPersistence, 
    GoogleAuthProvider, 
    signInWithPopup 
} from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Inicializa o Firebase com as configurações do ficheiro JSON
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configura a persistência para "local" para garantir que o login 
// permaneça ativo mesmo após fechar o app ou trocar de aba
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Erro ao configurar persistência:", error);
});

/**
 * Função para Autenticação com Google via Popup.
 * Recomendado para Capacitor/Android para evitar a perda do estado inicial (initial state).
 */
export const loginComGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        // O signInWithPopup evita o erro de "missing initial state" no Android
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Erro detalhado no login:", error);
        throw error;
    }
};

// Inicializa o Firestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);