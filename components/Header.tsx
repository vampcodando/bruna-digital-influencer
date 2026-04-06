
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-7xl mx-auto flex items-center justify-between p-4 bg-black/30 backdrop-blur-lg border border-gray-800 rounded-2xl">
      <div className="flex items-center space-x-4">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/f/f1/Escudo_do_Sport_Club_Internacional.svg" 
          alt="Sport Club Internacional Logo" 
          className="h-10 w-10 sm:h-12 sm:w-12"
        />
        <span className="text-xl sm:text-2xl font-bold tracking-wider uppercase">
          Cr<span className="text-red-500">IA</span> Base
        </span>
      </div>
      <div className="flex items-center space-x-2">
         <button className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500">
          Painel Admin
        </button>
        <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500">
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;
