import { create } from 'zustand';

// Modal Types: 'alert', 'confirm', 'prompt'

export const useModalStore = create((set) => ({
  isOpen: false,
  type: 'alert',
  title: '',
  message: '',
  inputValue: '',
  inputPlaceholder: '',
  onConfirm: null,
  onCancel: null,

  openModal: (options) => set({
    isOpen: true,
    type: options.type || 'alert',
    title: options.title || '',
    message: options.message || '',
    inputValue: options.defaultValue || '',
    inputPlaceholder: options.placeholder || '',
    onConfirm: options.onConfirm || null,
    onCancel: options.onCancel || null,
  }),

  closeModal: () => set({ isOpen: false }),

  setInputValue: (val) => set({ inputValue: val }),
}));

export const showConfirm = (title, message) => {
  return new Promise((resolve) => {
    useModalStore.getState().openModal({
      type: 'confirm',
      title,
      message,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false)
    });
  });
};

export const showPrompt = (title, placeholder = '', defaultValue = '') => {
  return new Promise((resolve) => {
    useModalStore.getState().openModal({
      type: 'prompt',
      title,
      placeholder,
      defaultValue,
      onConfirm: (val) => resolve(val),
      onCancel: () => resolve(null)
    });
  });
};

export const showAlert = (title, message) => {
  return new Promise((resolve) => {
    useModalStore.getState().openModal({
      type: 'alert',
      title,
      message,
      onConfirm: () => resolve(true)
    });
  });
};
