import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useModalStore } from '../store/useModalStore';

export default function Modal() {
  const { 
    isOpen, type, title, message, inputValue, inputPlaceholder, 
    closeModal, setInputValue, onConfirm, onCancel 
  } = useModalStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm(type === 'prompt' ? inputValue : true);
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  // Prevenir envío de formulario al presionar Enter en Prompt
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      handleConfirm();
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={type !== 'alert' ? handleCancel : undefined} // Alert requires explict confirm
      >
        <motion.div 
          key="modal-box"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-container-low dark:bg-[#252525] rounded-[24px] p-6 w-full max-w-sm shadow-2xl overflow-hidden relative"
        >
          {title && <h3 className="font-headline text-xl font-bold mb-3 text-on-surface leading-tight">{title}</h3>}
          {message && <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">{message}</p>}
          
          {type === 'prompt' && (
            <input 
              autoFocus
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              className="w-full p-4 rounded-xl bg-surface-container text-on-surface border border-outline-variant mb-6 font-body text-base outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          )}

          <div className="flex gap-3 mt-2">
            {type !== 'alert' && (
              <button 
                onClick={handleCancel}
                className="flex-1 py-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold transition-colors outline-none"
              >
                Cancelar
              </button>
            )}
            <button 
              onClick={handleConfirm}
              className="flex-1 py-3.5 rounded-xl signature-gradient text-white font-semibold shadow-md shadow-primary/20 hover:shadow-lg active:scale-95 transition-all outline-none"
            >
              {type === 'alert' ? 'Entendido' : 'Confirmar'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
