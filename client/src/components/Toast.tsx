import React, { createContext, useContext, useState } from 'react';

type Toast = { id: number; message: string; type?: 'success'|'error'|'info' };
const ToastContext = createContext<{ push: (msg: string, type?: Toast['type'])=>void }>({ push: ()=>{} });

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t)=> [...t, { id, message, type }]);
    setTimeout(()=> setToasts(t => t.filter(x=>x.id !== id)), 3500);
  };
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2 rounded shadow-soft text-sm ${t.type==='error' ? 'bg-red-600 text-white' : t.type==='success' ? 'bg-green-600 text-white' : 'bg-neutral-900 text-white'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);


