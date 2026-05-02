import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface GeneratedActivity {
  id: string;
  title: string;
  word: string;
  syllables: string;
  points: number;
  hint: string;
  pronunciationTip: string;
  instruction: string;
  image?: string;
  options?: string[]; // For Level 2 (Medium)
  displayChallenge?: string; // For Level 3 (Hard)
}

export async function generateSessionActivities(difficulty: 'easy' | 'medium' | 'hard', count: number = 5): Promise<GeneratedActivity[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const difficultyDesc = {
    easy: "Identificar y Pronunciar: El niño ve una imagen y repite lo que dice la IA.",
    medium: "Seleccionar Imagen Correcta: El niño ve una imagen y elige la palabra correcta entre 3 opciones.",
    hard: "Completar la Palabra: El niño debe completar una palabra a la que le faltan letras."
  };

  const prompt = `Actúa como un logopeda experto para niños. 
  Genera una lista de ${count} actividades de práctica para un niño en nivel ${difficulty}.
  El nivel ${difficulty} consiste en: ${difficultyDesc[difficulty]}.

  REGLAS:
  1. No repitas palabras comunes. Sé creativo.
  2. Incluye SIEMPRE un emoji representativo en el campo 'image' para todos los niveles.
  3. Para 'medium', incluye el campo 'options' con 3 palabras (la correcta y 2 distractores lógicos).
  4. Para 'hard', incluye 'displayChallenge' con la palabra pero con 1 o 2 huecos usando guiones bajos (ejemplos: 'P_RR_O', 'C_S_').
  5. 'instruction' es lo que dirás al niño:
     - Easy: "¡Mira! Este es un [palabra]. ¿Puedes repetir conmigo?"
     - Medium: "¡Mira este dibujo! ¿Qué es? Elige la palabra correcta."
     - Hard: "¡Vamos a completar! ¿Qué palabra es esta? Elige las letras que faltan."
  6. Devuelve EXCLUSIVAMENTE un arreglo JSON válido con estos campos: id, title, word, syllables, points, hint, pronunciationTip, instruction, image, options (solo medium), displayChallenge (solo hard).

  EJEMPLO JSON para Easy:
  [
    {"id": "ai-e1", "title": "Animal", "word": "Perro", "image": "🐶", "syllables": "Pe... rro", "points": 10, "hint": "Dice guau", "pronunciationTip": "Mueve la punta de la lengua", "instruction": "¡Mira! Este es un perro. ¿Puedes decir: perro?"}
  ]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handling potential markdown formatting)
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const activities = JSON.parse(jsonStr);
    
    return activities.map((a: any, index: number) => ({
      ...a,
      id: `ai-${difficulty}-${Date.now()}-${index}`,
      points: a.points || (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 30 : 50)
    }));
  } catch (error) {
    console.error("Error generating activities with Gemini:", error);
    // Fallback if AI fails (shouldn't happen often but good for resilience)
    return [];
  }
}
