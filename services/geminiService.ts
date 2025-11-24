import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { CEFRLevel, ArticleData, Question, VocabularyWord } from "../types";

// Helper to safely get the AI client
// This prevents the app from crashing on load if the API Key is missing.
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    // We return a client with a dummy key to strictly prevent "undefined" errors, 
    // but the API call will fail gracefully later with a proper error message.
    return new GoogleGenAI({ apiKey: "missing-key" });
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to format prompt
const createSystemInstruction = () => `
You are an expert ESL (English as a Second Language) teacher and content creator for Chinese native speakers. 
Your goal is to create engaging, level-appropriate reading materials based on the i+1 input hypothesis.
`;

export const generateArticle = async (
  level: CEFRLevel,
  interests: string[],
  keywords: string
): Promise<ArticleData> => {
  const model = "gemini-2.5-flash";
  const ai = getAiClient();
  
  const topic = keywords ? keywords : interests.join(", ");
  
  const prompt = `
    Write an engaging article for a student at ${level} level.
    The topic should be about: ${topic}.
    
    Requirements:
    1. Length: Approximately 200-250 words.
    2. Tone: Engaging, informative.
    3. Identify 5-6 advanced vocabulary words suitable for this level.
    4. CRITICAL: In the 'content' field, wrap these specific vocabulary words in double curly braces, e.g., "The {{infrastructure}} of the city..."
    5. Provide simplified English definitions and precise Chinese translations for these words.
  `;

  const vocabSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING },
      definition: { type: Type.STRING, description: "Simple English definition" },
      translation: { type: Type.STRING, description: "Chinese translation" },
    },
    required: ["word", "definition", "translation"],
  };

  const articleSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      content: { type: Type.STRING, description: "Article text with {{words}} wrapped" },
      vocabulary: {
        type: Type.ARRAY,
        items: vocabSchema,
      },
    },
    required: ["title", "content", "vocabulary"],
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: createSystemInstruction(),
        responseMimeType: "application/json",
        responseSchema: articleSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as ArticleData;
  } catch (error) {
    console.error("Error generating article:", error);
    throw error;
  }
};

export const generateQuiz = async (articleContent: string): Promise<Question[]> => {
  const model = "gemini-2.5-flash";
  const ai = getAiClient();
  
  const prompt = `
    Based on the following article, create 3 reading comprehension questions.
    
    Article: "${articleContent}"
    
    Requirements:
    1. Question 1: Main Idea (Global comprehension)
    2. Question 2: Detail (Specific fact)
    3. Question 3: Inference or Vocabulary in Context
    4. Provide 4 options for each question.
    5. Indicate the correct index (0-3).
    6. Provide a brief explanation.
  `;

  const questionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctIndex: { type: Type.INTEGER },
      explanation: { type: Type.STRING },
    },
    required: ["id", "question", "options", "correctIndex", "explanation"],
  };

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: questionSchema
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: createSystemInstruction(),
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as Question[];
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
    // Clean the text of {{}} markers for speech
    const cleanText = text.replace(/\{\{/g, '').replace(/\}\}/g, '');
    const ai = getAiClient();

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: cleanText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio generated");
        
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech", error);
        throw error;
    }
}