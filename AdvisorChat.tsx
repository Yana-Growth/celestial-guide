
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle } from 'lucide-react';
import { getAdvisorChat } from '../services/geminiService';
import { UserState } from '../types';

interface Props {
  userState: UserState;
}

const AdvisorChat: React.FC<Props> = ({ userState }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: `Приветствую, ${userState.birthData?.name}. Я — Небесный Проводник.\n\nЯ готов разъяснить любые детали вашего прогноза или натальной карты. Спросите меня о конкретных аспектах или грядущих переменах.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const context = {
        birthData: userState.birthData,
        natalChart: userState.natalChart,
        numerology: userState.numerology,
        dailyForecast: userState.dailyForecast
      };
      const response = await getAdvisorChat(messages, userMsg, context);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Космическая связь прервана. Попробуйте еще раз через мгновение." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] glass rounded-[2.5rem] overflow-hidden border border-purple-500/10 shadow-2xl">
      <div className="bg-purple-900/20 p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="font-serif text-xl">Небесный Проводник</h3>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/20 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-4 text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-purple-600 text-white rounded-tr-none' 
                : 'bg-slate-900 text-slate-200 rounded-tl-none border border-white/5'
            }`}>
              {m.text.split('\n').map((para, idx) => para.trim() ? (
                <p key={idx} className={idx > 0 ? "mt-3" : ""}>{para}</p>
              ) : <div key={idx} className="h-2" />)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 rounded-[1.5rem] px-5 py-4 text-sm rounded-tl-none border border-white/5 text-slate-400 animate-pulse flex items-center gap-2">
              <MessageCircle size={14} className="animate-bounce" />
              Проводник настраивает канал связи...
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-950/50 border-t border-white/5">
        <div className="relative flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Спросите о будущем..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm outline-none focus:border-purple-500 transition-all placeholder:text-slate-600"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-500 p-4 rounded-2xl transition-all disabled:opacity-50 shadow-lg active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvisorChat;
