import React from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  showActions?: boolean;
  actions?: React.ReactNode;
  size?: 'max-w-4xl' | 'max-w-2xl' | 'max-w-lg';
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);

export const Modal: React.FC<ModalProps> = ({ title, onClose, children, actions, size = 'max-w-4xl' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] animate-fade-in" onMouseDown={onClose}>
      <div
        className={`bg-[#1e1e1e] rounded-xl shadow-2xl w-full ${size} h-[90vh] max-h-[1000px] flex flex-col overflow-hidden border border-surface-light`}
        onMouseDown={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-surface">
          <h2 className="text-lg font-bold text-text-light">{title}</h2>
          <div className="flex items-center space-x-4">
            {actions}
            <button onClick={onClose} className="text-text-dark hover:text-text-light transition-colors">
              <CloseIcon />
            </button>
          </div>
        </header>
        <main className="flex-grow overflow-y-auto p-6 bg-surface">
          {children}
        </main>
      </div>
    </div>
  );
};