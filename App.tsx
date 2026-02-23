import React, { useState, useEffect } from 'react';
import {
  Compass, Star, Calendar, MapPin, Clock, User, Loader2, Sparkles, BookOpen,
  LogOut, CalendarDays, Zap, Heart, Activity, Target, Users, Scissors,
  Dumbbell, Coffee, MessageSquare, TrendingUp, Lightbulb, Settings, X, Gem, ChevronDown,
  PlusCircle, Shield, Hash
} from 'lucide-react';
import StarBackground from './components/StarBackground';
import AdvisorChat from './components/AdvisorChat';
import { BirthData, UserState, DailyForecast } from './types';
import { analyzeQuickEsoterics, analyzeDeepEsoterics, getDailyForecast, getPersonalCalendar } from './services/geminiService';

const STORAGE_KEY = 'celestial_guide_v6';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'general' | 'fateful' | 'extra'>('daily');
  const [step, setStep] = useState<'welcome' | 'form' | 'loading' | 'dashboard' | 'profile_edit'>('welcome');
  const [progress, setProgress] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showFateful, setShowFateful] = useState(false);

  const [calType, setCalType] = useState('haircut');
  const [calMonth, setCalMonth] = useState('2026-03');
  const [calData, setCalData] = useState<any[]>([]);
  const [isCalLoading, setIsCalLoading] = useState(false);
  const [isDeepLoading, setIsDeepLoading] = useState(false);

  const [formData, setFormData] = useState<BirthData>({
    name: '', maidenName: '', birthDate: '', birthTime: '', birthPlace: '', currentCity: '', gender: 'female'
  });

  const [userState, setUserState] = useState<UserState & { artifacts?: any, numerology?: any }>({
    birthData: null, natalChart: null, numerology: null, dailyForecast: null, fatefulMoments: null, yearlyForecast: null, artifacts: null
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.birthData) { setUserState(parsed); setFormData(parsed.birthData); setStep('dashboard'); }
      } catch (e) { localStorage.removeItem(STORAGE_KEY); }
    }
  }, []);

  useEffect(() => {
    if (step === 'loading') {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 100;
          if (prev >= 99) return 99;
          return prev + Math.random() * 2;
        });
      }, 400);
      return () => clearInterval(timer);
    }
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setProgress(15);
    try {
      const [quick, forecast] = await Promise.all([
        analyzeQuickEsoterics(formData),
        getDailyForecast(formData, null, selectedDate)
      ]);

      const newState = {
        ...userState,
        birthData: formData,
        natalChart: quick.natalChart,
        numerology: quick.numerology,
        artifacts: quick.artifacts,
        dailyForecast: forecast
      };
      setUserState(newState);
      setProgress(100);
      setTimeout(() => setStep('dashboard'), 500);

    } catch (err) {
      console.error("Gemini Error:", err);
      alert("Ошибка соединения. Лимит запросов исчерпан или нет сети.");
      setStep('form');
    }
  };

  const loadCal = async () => {
    if (!userState.birthData || !userState.natalChart) return;
    setIsCalLoading(true);
    try {
      const res = await getPersonalCalendar(userState.birthData, userState.natalChart, calType, calMonth);
      setCalData(res.events || []);
    } finally { setIsCalLoading(false); }
  };

  const loadDeepEsoterics = async () => {
    if (!userState.birthData) return;
    setIsDeepLoading(true);
    try {
      const deep = await analyzeDeepEsoterics(userState.birthData);
      setUserState(prev => {
        const final = { ...prev, fatefulMoments: deep.fatefulMoments, yearlyForecast: deep.yearlyForecast };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(final));
        return final;
      });
      setShowFateful(true);
    } catch (err) {
      console.error(err);
      alert("Не удалось загрузить прогноз. Попробуйте еще раз.");
    } finally {
      setIsDeepLoading(false);
    }
  };

  const difficultyMap: Record<string, number> = { 'легкий': 2, 'средний': 5, 'сложный': 8, 'критический': 10 };
  const diffLevel = difficultyMap[userState.dailyForecast?.energyScale?.difficulty?.toLowerCase() || ''] || 2;

  return (
    <div className="min-h-screen relative bg-[#020617] text-slate-100 font-sans selection:bg-purple-500/30">
      <StarBackground />
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">

        {step === 'welcome' && (
          <div className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-8 animate-in fade-in duration-1000">
            <Compass className="w-24 h-24 text-purple-400 animate-spin-slow" />
            <h1 className="text-6xl md:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 tracking-tighter">Celestial Guide</h1>
            <button onClick={() => setStep('form')} className="px-12 py-5 bg-purple-600 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-xl">Открыть портал</button>
          </div>
        )}

        {(step === 'form' || step === 'profile_edit') && (
          <div className="max-w-2xl mx-auto glass p-8 md:p-12 rounded-[2.5rem] border border-white/10 mt-6 shadow-2xl relative animate-in zoom-in-95">
            {step === 'profile_edit' && <button onClick={() => setStep('dashboard')} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>}
            <h2 className="text-3xl font-serif mb-10 text-center text-purple-200">Параметры рождения</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <FormInput label="ФИО" value={formData.name} onChange={(v: any) => setFormData({ ...formData, name: v })} />
              <FormInput label="ФИО при рождении" value={formData.maidenName || ''} onChange={(v: any) => setFormData({ ...formData, maidenName: v })} />
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase px-1 tracking-widest">Дата рождения</label>
                <input required type="date" className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm [color-scheme:dark]" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />
              </div>
              <FormInput label="Точное время" type="time" value={formData.birthTime} onChange={(v: any) => setFormData({ ...formData, birthTime: v })} />
              <FormInput label="Место рождения" value={formData.birthPlace} onChange={(v: any) => setFormData({ ...formData, birthPlace: v })} />
              <FormInput label="Город проживания" value={formData.currentCity} onChange={(v: any) => setFormData({ ...formData, currentCity: v })} />
              <button className="md:col-span-2 py-5 bg-purple-600 rounded-2xl font-bold text-lg mt-4 shadow-xl active:scale-95 transition-all">
                {step === 'profile_edit' ? 'Обновить данные' : 'Построить жизнь'}
              </button>
            </form>
          </div>
        )}

        {step === 'loading' && (
          <div className="max-w-lg mx-auto text-center mt-32 space-y-12">
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-purple-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="font-serif text-4xl">{Math.round(progress)}%</div>
            </div>
            <h2 className="text-2xl font-serif text-purple-200 animate-pulse">Анализируем Небесную Сферу...</h2>
          </div>
        )}

        {step === 'dashboard' && userState.birthData && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col lg:flex-row justify-between items-center glass p-6 rounded-[2.5rem] border border-white/5 shadow-2xl gap-6">
              <button onClick={() => setStep('profile_edit')} className="flex items-center gap-4 hover:bg-white/5 p-2 rounded-2xl transition-all group text-left">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-serif shadow-lg">{userState.birthData.name[0]}</div>
                <div>
                  <h2 className="text-xl font-serif flex items-center gap-2 group-hover:text-purple-300 transition-colors">
                    {userState.birthData.name} <Settings size={14} className="text-slate-500" />
                  </h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Личный профиль</p>
                </div>
              </button>
              <nav className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'daily', label: 'Прогноз', icon: <Zap size={14} /> },
                  { id: 'general', label: 'Паспорт', icon: <User size={14} /> },
                  { id: 'fateful', label: 'Вехи', icon: <Star size={14} /> },
                  { id: 'extra', label: 'Календари', icon: <PlusCircle size={14} /> },
                ].map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-100'}`}>
                    {t.icon}<span>{t.label}</span>
                  </button>
                ))}
              </nav>
              <button onClick={() => { localStorage.clear(); setStep('welcome'); }} className="p-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 transition-all"><LogOut size={20} /></button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">

                {activeTab === 'daily' && (
                  <div className="space-y-8 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-5 glass p-8 rounded-[2rem] flex flex-col justify-between shadow-xl text-left">
                        <div>
                          <h3 className="text-lg font-serif mb-6 text-purple-200 flex items-center gap-2"><Calendar size={18} /> Выбор даты</h3>
                          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm [color-scheme:dark] outline-none focus:border-purple-500 transition-all" />
                        </div>
                        <div className="mt-8 text-center p-6 bg-purple-900/10 rounded-3xl border border-purple-500/10 shadow-inner">
                          <p className="text-2xl font-serif text-purple-300">{userState.dailyForecast?.moonPhaseDescription || "Луна в расчете..."}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">{userState.dailyForecast?.lunarDay || 0} Лунный день</p>
                        </div>
                      </div>
                      <div className="md:col-span-7 glass p-8 rounded-[2rem] space-y-8 shadow-2xl relative overflow-hidden text-left">
                        <h3 className="text-2xl font-serif">Энергия Дня</h3>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-purple-400 tracking-widest"><span>Ресурс</span><span>{userState.dailyForecast?.energyScale?.value || 0}%</span></div>
                            <div className="h-4 w-full bg-slate-900 rounded-full border border-white/5 p-0.5 shadow-inner"><div className="h-full bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-1000" style={{ width: `${userState.dailyForecast?.energyScale?.value || 0}%` }}></div></div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-red-400 tracking-widest"><span>Давление</span><span>{userState.dailyForecast?.energyScale?.difficulty || "..."}</span></div>
                            <div className="flex gap-2 h-3">{[...Array(10)].map((_, i) => (<div key={i} className={`flex-1 rounded-sm transition-all duration-700 ${i < diffLevel ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-slate-800'}`}></div>))}</div>
                            <p className="text-xs text-slate-400 italic bg-white/5 p-4 rounded-2xl border border-dashed border-white/10 leading-relaxed">{userState.dailyForecast?.energyScale?.description || "Загрузка космических данных..."}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
                      <h3 className="text-2xl font-serif mb-10 text-purple-200 flex items-center gap-3"><Star className="text-purple-400" /> Советы Небосвода</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <AdviceCard icon={<Scissors className="text-pink-400" />} title="Стрижка" text={userState.dailyForecast?.recommendations?.haircut || "..."} />
                        <AdviceCard icon={<Dumbbell className="text-emerald-400" />} title="Спорт" text={userState.dailyForecast?.recommendations?.sports || "..."} />
                        <AdviceCard icon={<Coffee className="text-orange-400" />} title="Питание" text={userState.dailyForecast?.recommendations?.nutrition || "..."} />
                        <AdviceCard icon={<Activity className="text-sky-400" />} title="Здоровье" text={userState.dailyForecast?.recommendations?.health || "..."} />
                        <AdviceCard icon={<Heart className="text-red-400" />} title="Любовь" text={userState.dailyForecast?.recommendations?.love || "..."} />
                        <AdviceCard icon={<TrendingUp className="text-indigo-400" />} title="Карьера" text={userState.dailyForecast?.recommendations?.career || "..."} />
                        <AdviceCard icon={<MessageSquare className="text-rose-400" />} title="Общение" text={userState.dailyForecast?.recommendations?.communication || "..."} />
                        <AdviceCard icon={<Sparkles className="text-violet-400" />} title="Духовность" text={userState.dailyForecast?.recommendations?.spirituality || "..."} />
                        <AdviceCard icon={<Shield className="text-amber-400" />} title="Активность" text={userState.dailyForecast?.recommendations?.activity || "..."} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'general' && (
                  <div className="space-y-8 animate-in fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass p-8 rounded-[2.5rem] shadow-2xl text-left">
                        <h3 className="text-xl font-serif mb-8 text-purple-200 flex items-center gap-2"><Compass size={18} /> Космический Паспорт</h3>
                        <PassportRow label="Знак Солнца" val={userState.natalChart?.sunSign} />
                        <PassportRow label="Знак Луны" val={userState.natalChart?.moonSign} />
                        <PassportRow label="Асцендент" val={userState.natalChart?.ascendant} />
                        <div className="mt-8 space-y-2">
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Положения планет</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {userState.natalChart?.planets?.map((p: any, i: number) => (
                              <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between text-[11px] shadow-inner">
                                <span className="text-slate-500 uppercase tracking-tighter">{p.planet}</span>
                                <span className="text-white font-bold">{p.sign} {p.degree}°</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="glass p-8 rounded-[2.5rem] shadow-2xl border-l border-indigo-500/20 text-left">
                        <h3 className="text-xl font-serif mb-8 text-indigo-200 flex items-center gap-2"><Hash size={18} /> Числовое Ядро</h3>
                        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                          <NumBox label="Путь" val={userState.numerology?.lifePath} />
                          <NumBox label="Судьба" val={userState.numerology?.destinyNumber} />
                          <NumBox label="Душа" val={userState.numerology?.soulNumber} />
                        </div>
                        <div className="glass p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 mb-6">
                          <p className="text-xs text-slate-300 leading-relaxed italic">{userState.numerology?.matrixDescription || "Числа готовят расшифровку..."}</p>
                        </div>
                        <div className="glass p-5 rounded-3xl border border-purple-500/20">
                          <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Gem size={14} /> Талисманы Силы</h4>
                          <div className="flex flex-wrap gap-2">
                            {userState.artifacts?.stones?.map((stone: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-[10px] font-bold">{stone}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'extra' && (
                  <div className="space-y-8 animate-in fade-in">
                    <div className="glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/5 text-left">
                      <h3 className="text-2xl font-serif mb-10 flex items-center gap-3"><CalendarDays className="text-purple-400" /> Личный Календарь</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase px-1 tracking-widest">Сфера планирования</label>
                          <select value={calType} onChange={e => setCalType(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm outline-none focus:border-purple-500 shadow-inner">
                            <option value="haircut">💇‍♀️ Красота и Стрижки</option>
                            <option value="shopping">🛍 Покупки и Траты</option>
                            <option value="business">💼 Сделки и Карьера</option>
                            <option value="health">🍏 Детокс и Спорт</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase px-1 tracking-widest">Месяц</label>
                          <input type="month" value={calMonth} onChange={e => setCalMonth(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm [color-scheme:dark] shadow-inner" />
                        </div>
                        <div className="flex items-end">
                          <button onClick={loadCal} disabled={isCalLoading} className="w-full py-4 bg-purple-600 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-purple-500 transition-all active:scale-95 shadow-lg">
                            {isCalLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} Рассчитать дни
                          </button>
                        </div>
                      </div>

                      {calData.length > 0 && (
                        <div className="space-y-4">
                          {calData.map((ev, i) => (
                            <div key={i} className="flex gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group shadow-inner">
                              <div className="flex flex-col items-center justify-center min-w-[75px] h-[75px] bg-slate-900 rounded-2xl border border-white/5">
                                <span className="text-2xl font-serif text-white">{new Date(ev.date).getDate()}</span>
                                <span className="text-[9px] uppercase text-slate-500 font-bold tracking-tighter">{new Date(ev.date).toLocaleDateString('ru-RU', { month: 'short' })}</span>
                              </div>
                              <div className="flex-1 py-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${ev.status?.toLowerCase().includes('благо') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{ev.status}</span>
                                <p className="text-sm text-slate-300 mt-2 leading-relaxed italic">"{ev.comment}"</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'fateful' && (
                  <div className="space-y-12 animate-in fade-in">

                    {!userState.yearlyForecast && !isDeepLoading && (
                      <div className="glass p-12 rounded-[2.5rem] border border-white/5 shadow-2xl text-center flex flex-col items-center justify-center min-h-[400px]">
                        <Star className="w-16 h-16 text-indigo-400 mb-6 opacity-80" />
                        <h3 className="text-3xl font-serif mb-6 text-purple-200">Глубокий анализ судьбы</h3>
                        <p className="text-slate-400 mb-10 max-w-lg leading-relaxed">Рассчитайте детальный прогноз на год по месяцам и узнайте ключевые вехи, переломные моменты вашей жизни. Эти вычисления требуют сложных нейросетевых связей и запускаются по отдельному запросу.</p>
                        <button onClick={loadDeepEsoterics} className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-all text-white flex items-center gap-3">
                          <Sparkles size={20} /> Рассчитать прогноз и вехи
                        </button>
                      </div>
                    )}

                    {isDeepLoading && (
                      <div className="glass p-12 rounded-[2.5rem] border border-white/5 shadow-2xl text-center flex flex-col items-center justify-center min-h-[400px]">
                        <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-6" />
                        <p className="text-2xl font-serif text-purple-200 animate-pulse">Звезды формируют линии судьбы...</p>
                        <p className="text-sm text-slate-500 mt-4 max-w-sm">Строим прогнозы на 12 месяцев и анализируем жизненные циклы. Пожалуйста, подождите.</p>
                      </div>
                    )}

                    {userState.yearlyForecast && !isDeepLoading && (
                      <>
                        <div className="glass p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-950/20 to-transparent border border-white/5 shadow-2xl text-left">
                          <h3 className="text-2xl font-serif mb-10 flex items-center gap-3 text-indigo-300"><CalendarDays size={24} /> Циклы 2026 года</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {userState.yearlyForecast?.map((m: any, i: number) => (
                              <div key={i} className="p-8 bg-slate-900/60 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 transition-all shadow-lg group">
                                <div className="flex items-center gap-4 mb-4">
                                  <span className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-sm font-bold shadow-inner">{i + 1}</span>
                                  <h4 className="font-serif text-2xl group-hover:text-indigo-200 transition-colors">{m.month}</h4>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed italic">{m.prediction}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="glass p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 text-left">
                            <h3 className="text-2xl font-serif text-purple-200 flex items-center gap-3"><Star className="text-purple-400" /> Вехи судьбы</h3>
                            {!showFateful && <button onClick={() => setShowFateful(true)} className="px-8 py-3 bg-purple-600/20 border border-purple-500/30 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-purple-600 transition-all group">Показать важные периоды <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" /></button>}
                          </div>
                          {showFateful && (
                            <div className="space-y-12 relative before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 animate-in slide-in-from-top-4 text-left">
                              {userState.fatefulMoments?.map((m: any, i: number) => (
                                <div key={i} className="flex gap-8 relative z-10 group">
                                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 shadow-xl group-hover:scale-110 transition-transform">
                                    {m.type?.toLowerCase().includes('love') ? <Heart size={24} /> : <Compass size={24} />}
                                  </div>
                                  <div className="pb-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.period}</span>
                                    <h4 className="text-2xl font-serif text-white/90 mt-1 mb-2 group-hover:text-purple-300 transition-colors">{m.event}</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{m.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <aside className="lg:col-span-4 sticky top-10">
                <AdvisorChat userState={userState} />
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const FormInput = ({ label, value, onChange, type = 'text' }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-bold text-slate-500 uppercase px-1 tracking-widest">{label}</label>
    <input required type={type} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm outline-none focus:border-purple-500 transition-all shadow-inner" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const PassportRow = ({ label, val }: any) => (
  <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors shadow-inner">
    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{label}</span>
    <span className="text-white font-bold">{val || '...'}</span>
  </div>
);

const NumBox = ({ label, val }: any) => (
  <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-inner">
    <span className="block text-[9px] text-indigo-400 uppercase font-bold mb-1 tracking-widest">{label}</span>
    <span className="text-3xl font-serif text-white">{val || '0'}</span>
  </div>
);

const AdviceCard = ({ icon, title, text }: any) => (
  <div className="p-6 bg-slate-900/40 rounded-[2rem] border border-white/5 flex flex-col group hover:bg-slate-900/80 transition-all shadow-lg text-left">
    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">{icon}</div>
    <h5 className="text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-2">{title}</h5>
    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all">{text || "Расчет..."}</p>
  </div>
);

export default App;