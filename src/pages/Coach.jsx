import React, { useState, useRef, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';

export default function Coach() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: '¡Hola! Soy tu WePai Coach. ¿Hoy quieres que revisemos tu progreso, ajustemos tu rutina o tienes alguna duda específica?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: '¡Entendido! Estoy analizando tus datos más recientes de Press de Banca. Has subido un 5% tu fuerza este mes, lo cual es excelente. ¿Te gustaría intentar subir 2.5kg en tu próxima sesión?' 
      }]);
    }, 1500);
  };

  return (
    <AnimatedPage className="flex flex-col h-screen max-h-screen">
      <header className="fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 flex-shrink-0">
        <div className="flex items-center gap-3 px-6 py-4 max-w-7xl mx-auto">
          <div className="w-10 h-10 rounded-xl signature-gradient flex items-center justify-center text-white">
            <span className="material-symbols-outlined">psychology</span>
          </div>
          <div>
            <h1 className="text-sm font-headline font-extrabold text-on-surface">WePai Coach</h1>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Activo ahora</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 pt-24 pb-48 no-scrollbar">
        <div className="space-y-6 max-w-2xl mx-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-2xl max-w-[85%] ${
                m.role === 'user' 
                  ? 'bg-primary text-white rounded-br-none shadow-lg shadow-primary/20' 
                  : 'bg-surface-container-low text-on-surface border border-outline-variant/20 rounded-bl-none'
              }`}>
                <p className="text-sm leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="fixed bottom-[96px] w-full p-4 bg-surface/80 backdrop-blur-md">
        <div className="max-w-xl mx-auto flex gap-3">
          <input 
            type="text" 
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button 
            onClick={handleSend}
            className="w-14 h-14 rounded-2xl signature-gradient text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </footer>
    </AnimatedPage>
  );
}
