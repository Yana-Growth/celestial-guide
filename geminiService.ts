import { GoogleGenAI, Type, Schema } from '@google/genai';
import { BirthData, NatalChartData, NumerologyData, DailyForecast, FatefulMoment, MonthForecast } from '../types';

// Используемые версии по требованию пользователя (исправлены на точные названия в API)
const PRO_MODEL = 'gemini-3.1-pro-preview';
const FLASH_MODEL = 'gemini-3-flash-preview';

// Запасные стабильные модели на случай 503 ошибки
const FALLBACK_PRO_MODEL = 'gemini-2.5-pro';
const FALLBACK_FLASH_MODEL = 'gemini-2.5-flash';

const getAPIKey = () => typeof process !== 'undefined' ? process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY : (import.meta as any).env?.VITE_API_KEY;

let aiClient: GoogleGenAI | null = null;
const getClient = () => {
  if (!aiClient) {
    const apiKey = getAPIKey();
    if (!apiKey) throw new Error("API KEY is missing");
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const callGeminiWithFallback = async (options: any, isPro = true) => {
  const client = getClient();
  try {
    return await client.models.generateContent({
      ...options,
      model: isPro ? PRO_MODEL : FLASH_MODEL
    });
  } catch (error: any) {
    if (error.status === 503 || error.status === 'UNAVAILABLE' || error.message?.includes('503') || error.message?.includes('UNAVAILABLE')) {
      console.warn(`[Gemini API] Primary model overloaded (503). Retrying with fallback model ${isPro ? FALLBACK_PRO_MODEL : FALLBACK_FLASH_MODEL}...`);
      return await client.models.generateContent({
        ...options,
        model: isPro ? FALLBACK_PRO_MODEL : FALLBACK_FLASH_MODEL
      });
    }
    throw error;
  }
};

// --- Схемы ---

const natalChartSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    sunSign: { type: Type.STRING },
    moonSign: { type: Type.STRING },
    ascendant: { type: Type.STRING },
    planets: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          planet: { type: Type.STRING },
          sign: { type: Type.STRING },
          house: { type: Type.INTEGER },
          degree: { type: Type.INTEGER },
          retrograde: { type: Type.BOOLEAN },
          logic: { type: Type.STRING }
        },
        required: ["planet", "sign", "house", "degree", "retrograde"]
      }
    },
    summary: { type: Type.STRING },
    progressScales: {
      type: Type.OBJECT,
      properties: {
        missing: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.INTEGER }, color: { type: Type.STRING } } } },
        excess: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.INTEGER }, color: { type: Type.STRING } } } },
        workOn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.INTEGER }, color: { type: Type.STRING } } } },
        focusOn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.INTEGER }, color: { type: Type.STRING } } } }
      }
    },
    elements: {
      type: Type.OBJECT,
      properties: {
        fire: { type: Type.INTEGER },
        earth: { type: Type.INTEGER },
        air: { type: Type.INTEGER },
        water: { type: Type.INTEGER }
      }
    },
    calculationLogic: { type: Type.STRING }
  },
  required: ["sunSign", "moonSign", "ascendant", "planets", "summary", "progressScales", "elements", "calculationLogic"]
};

// Изменённая схема для QuickEsoterics (добавлено поле artifacts c массивом stones)
const quickEsotericsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    natalChart: natalChartSchema,
    numerology: {
      type: Type.OBJECT,
      properties: {
        lifePath: { type: Type.INTEGER },
        destinyNumber: { type: Type.INTEGER },
        soulNumber: { type: Type.INTEGER },
        matrixDescription: { type: Type.STRING }
      },
      required: ["lifePath", "destinyNumber", "soulNumber", "matrixDescription"]
    },
    artifacts: {
      type: Type.OBJECT,
      properties: {
        stones: { type: Type.ARRAY, items: { type: Type.STRING } },
        activityField: { type: Type.STRING },
        sports: { type: Type.ARRAY, items: { type: Type.STRING } },
        hobbies: { type: Type.ARRAY, items: { type: Type.STRING } },
        bestCity: { type: Type.STRING }
      },
      required: ["stones", "activityField", "bestCity"]
    }
  },
  required: ["natalChart", "numerology", "artifacts"]
};

const dailyForecastSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    date: { type: Type.STRING },
    lunarPhase: { type: Type.STRING },
    lunarDay: { type: Type.INTEGER },
    moonPhaseDescription: { type: Type.STRING },
    mood: { type: Type.STRING },
    energyScale: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.INTEGER },
        difficulty: { type: Type.STRING }, // 'легкий' | 'средний' | 'сложный' | 'критический'
        description: { type: Type.STRING }
      },
      required: ["value", "difficulty", "description"]
    },
    warnings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          title: { type: Type.STRING },
          advice: { type: Type.STRING }
        }
      }
    },
    recommendations: {
      type: Type.OBJECT,
      properties: {
        career: { type: Type.STRING },
        love: { type: Type.STRING },
        health: { type: Type.STRING },
        spirituality: { type: Type.STRING },
        haircut: { type: Type.STRING },
        sports: { type: Type.STRING },
        nutrition: { type: Type.STRING },
        activity: { type: Type.STRING },
        communication: { type: Type.STRING }
      },
      required: ["career", "love", "health", "spirituality", "haircut", "sports", "nutrition", "activity", "communication"]
    },
    justification: { type: Type.STRING }
  },
  required: ["date", "lunarPhase", "lunarDay", "moonPhaseDescription", "energyScale", "recommendations"]
};

const deepEsotericsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fatefulMoments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          period: { type: Type.STRING },
          event: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { type: Type.STRING }
        }
      }
    },
    yearlyForecast: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          month: { type: Type.STRING },
          prediction: { type: Type.STRING }
        }
      }
    }
  },
  required: ["fatefulMoments", "yearlyForecast"]
};

// Строго просим ИИ проверять точное время и место для предотвращения галлюцинаций с зодиаком
const getSystemInstruction = () => {
  const today = new Date();
  return `Ты - опытный эзотерический и астрологический помощник. Текущая дата: ${today.toLocaleDateString('ru-RU')}. Текущий год: ${today.getFullYear()}. При расчёте натальной карты СТРОГО учитывай точное время и место рождения пользователя, используя астрономические правила (а не примерные!), чтобы правильно определить асцендент и знак зодиака Луны на переходных датах. Камни, сферу деятельности, спорт, хобби, лучший город для жизни подбирай на основе силы планет. Формируй данные строго в запрошенном JSON формате, без добавления лишнего текста. Заполняй все поля.`;
};

export const analyzeQuickEsoterics = async (data: BirthData) => {
  const client = getClient();
  const prompt = `Рассчитай точную натальную карту, нумерологическое ядро и подходящие камни силы для: ${data.name}, рожд. ${data.birthDate} в ${data.birthTime}, город: ${data.birthPlace}. В нумерологии рассчитай Число Жизненного Пути, Число Судьбы и Число Души. Камни, сферу деятельности, спорт, хобби, лучший город для жизни подбери по анализу планет.`;

  const response = await callGeminiWithFallback({
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(),
      responseMimeType: "application/json",
      responseSchema: quickEsotericsSchema,
      temperature: 0.2
    }
  }, true);

  const text = response.text;
  if (!text) throw new Error("Empty response");
  return JSON.parse(text);
};

export const analyzeDeepEsoterics = async (data: BirthData) => {
  const client = getClient();
  const currentYear = new Date().getFullYear();
  const prompt = `Построй прогноз на год по месяцам (строго на ${currentYear} год, начиная с текущего месяца) и выдели 3-5 ключевых вех судьбы для: ${data.name}, рожд. ${data.birthDate} в ${data.birthTime}, город: ${data.birthPlace}. В прогнозе указывай актуальный год (например, "Июнь ${currentYear}").`;

  const response = await callGeminiWithFallback({
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(),
      responseMimeType: "application/json",
      responseSchema: deepEsotericsSchema,
      temperature: 0.3
    }
  }, true);

  const text = response.text;
  if (!text) throw new Error("Empty response");
  return JSON.parse(text);
};

export const getDailyForecast = async (data: BirthData, natalChart: any, date: string) => {
  const client = getClient();
  const prompt = `Создай дневной прогноз на ${date} для человека (рожд. ${data.birthDate}, место ${data.birthPlace}, город текущий ${data.currentCity}). Учти текущие лунные сутки и лунную фазу на эту дату. Сформируй рекомендации ровно по всем 9 категориям (haircut, sports, nutrition, health, love, career, communication, spirituality, activity).`;

  const response = await callGeminiWithFallback({
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(),
      responseMimeType: "application/json",
      responseSchema: dailyForecastSchema,
      temperature: 0.4
    }
  }, false);

  const text = response.text;
  if (!text) throw new Error("Empty response");
  return JSON.parse(text);
};

export const getPersonalCalendar = async (data: BirthData, natalChart: any, type: string, month: string) => {
  const client = getClient();
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      events: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            status: { type: Type.STRING },
            comment: { type: Type.STRING }
          },
          required: ["date", "status", "comment"]
        }
      }
    },
    required: ["events"]
  };

  const prompt = `Создай персональный календарь для сферы '${type}' на месяц '${month}' для (рожд. ${data.birthDate} ${data.birthTime} ${data.birthPlace}). Выбери 5-7 ключевых дней в заданном месяце текущего года.`;

  const response = await callGeminiWithFallback({
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(),
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.3
    }
  }, false);

  const text = response.text;
  if (!text) throw new Error("Empty response");
  return JSON.parse(text);
};

export const getAdvisorChat = async (history: any[], userMessage: string, context: any) => {
  const contextStr = JSON.stringify(context, null, 2);

  let formattedHistory = history.map(m => `${m.role === 'user' ? 'Пользователь' : 'Проводник'}: ${m.text}`).join('\n');
  const finalPrompt = `[СИСТЕМНЫЙ КОНТЕКСТ ДАННЫХ ПОЛЬЗОВАТЕЛЯ]:\n${contextStr}\n\n[ИСТОРИЯ ДИАЛОГА]:\n${formattedHistory}\nПользователь: ${userMessage}\nПроводник:`;

  const response = await callGeminiWithFallback({
    contents: finalPrompt,
    config: {
      systemInstruction: `Ты - Небесный Проводник. Ты говоришь прямо, без загадок и ненужных слов. Не выходи за рамки роли. Давай точные советы и четкие рекомендации основываясь СТРОГО на системном контексте данных пользователя (его натальной карте, нумерологии и т.д.). Отвечай на вопрос максимально персонализировано. Уточни у пользователя детали, если это необходимо. \n\n${getSystemInstruction()}`,
      temperature: 0.6
    }
  }, false);

  const text = response.text;
  return text || "Связь со звездами нестабильна. Повторите позже.";
};