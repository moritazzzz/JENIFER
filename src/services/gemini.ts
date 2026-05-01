import { GoogleGenAI } from "@google/genai";
import { type ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getAssistantResponse(messages: ChatMessage[], childName: string, performance: string) {
  const systemInstruction = `Eres un asistente virtual empático y divertido para una aplicación terapéutica de lenguaje para niños de 4 a 8 años. 
  Tu nombre es "Guía Mágico". Debes hablar de forma sencilla, motivadora y alegre.
  El niño se llama ${childName}. 
  Su desempeño actual es: ${performance}.
  Si el niño lo hace bien, celébralo con entusiasmo.
  Si el niño se equivoca, dale ánimos y dile que está aprendiendo y que lo importante es intentarlo.
  Evita respuestas largas. Usa frases cortas y emojis.`;

  try {
    const chat = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages.map(m => ({ role: m.role == 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
      config: {
        systemInstruction,
      }
    });

    const response = await chat;
    return response.text || "¡Vamos, tú puedes!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "¡Lo estás haciendo genial, explorador!";
  }
}
