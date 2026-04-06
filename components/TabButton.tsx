import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, icon }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200
        ${isActive 
          ? 'bg-red-600 text-white shadow-md' 
          : 'bg-transparent text-gray-300 hover:bg-white/10'
        }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default TabButton;
