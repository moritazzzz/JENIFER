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
  image?: string;
}

export async function generateSessionActivities(difficulty: 'easy' | 'medium' | 'hard', count: number = 5): Promise<GeneratedActivity[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const difficultyDesc = {
    easy: "palabras simples de 1 o 2 sílabas, como vocales u objetos cotidianos básicos",
    medium: "objetos y animales más complejos de 2 o 3 sílabas que se puedan representar con un solo emoji",
    hard: "frases cortas de 3 a 5 palabras sobre situaciones cotidianas"
  };

  const prompt = `Actúa como un logopeda experto para niños. 
  Genera una lista de ${count} actividades de práctica de habla para un niño en nivel ${difficulty}.
  El nivel ${difficulty} consiste en: ${difficultyDesc[difficulty]}.

  REGLAS:
  1. No repitas palabras comunes como 'ala', 'isla', 'oso', 'uva' a menos que sea necesario. Intenta ser creativo.
  2. Para el nivel 'medium', incluye un emoji representativo en el campo 'image'.
  3. El campo 'syllables' debe estar separado por '... ' (ejemplo: 'ma... sa').
  4. El campo 'pronunciationTip' debe ser un consejo corto y dulce para el niño (ejemplo: 'Pon tus labios como un círculo').
  5. Devuelve EXCLUSIVAMENTE un arreglo JSON válido con estos campos: id (string único), title (string corto), word (string), syllables (string), points (number), hint (string), pronunciationTip (string), image (string, solo para nivel medium).

  EJEMPLO JSON:
  [
    {"id": "ai-1", "title": "Objeto", "word": "Luna", "syllables": "Lu... na", "points": 15, "hint": "Brilla de noche", "pronunciationTip": "Pon la lengua en el techo", "image": "🌙"}
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
