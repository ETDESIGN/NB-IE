import React from 'react';

// --- ICONS ---
export const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
export const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;


// --- COMPONENTS ---

export const ModalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h3 className="text-md font-semibold text-text-dark mb-4 uppercase tracking-wider">{title}</h3>
    {children}
  </section>
);

export const FilterButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  isTab?: boolean;
}> = ({ label, isActive, onClick, isTab = false }) => {
  const baseClasses = `px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200`;
  const activeClasses = isTab ? 'bg-surface-light text-text-light' : 'bg-primary text-white';
  const inactiveClasses = isTab ? 'text-text-dark hover:bg-surface-light hover:text-text-light' : 'bg-surface-light text-text-dark hover:bg-gray-700 hover:text-text-light';
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {label}
    </button>
  );
};

export const SearchBar: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}> = ({ value, onChange, placeholder }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
        </div>
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-surface-light border border-surface rounded-full py-2 pl-10 pr-4 text-text-light placeholder-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
        />
    </div>
);

export const ItemCard: React.FC<{
    name: string;
    isSelected: boolean;
    onSelect: () => void;
    children: React.ReactNode;
}> = ({ name, isSelected, onSelect, children }) => (
    <div className="text-center group cursor-pointer" onClick={onSelect}>
        <div className={`transition-transform duration-200 ease-in-out group-hover:scale-105 ${isSelected ? 'scale-105' : ''}`}>
             {children}
        </div>
        <p className={`mt-2 text-xs transition-colors ${isSelected ? 'text-text-light font-semibold' : 'text-text-dark'}`}>{name}</p>
    </div>
);

export const NewItemButton: React.FC<{
  label: string;
  onClick: () => void;
}> = ({ label, onClick }) => (
  <button onClick={onClick} className="bg-primary hover:bg-primary-hover text-white font-semibold text-sm py-2 px-4 rounded-full flex items-center space-x-2 transition-colors">
    <PlusIcon />
    <span>{label}</span>
  </button>
);