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
    easy: "Nivel Inicial (4-5 años): Enfoque en vocales y palabras bisílabas simples (CV+CV) como 'mesa', 'pato', 'luna'. Repetición directa.",
    medium: "Nivel Intermedio (5-6 años): Palabras de 2-3 sílabas con fonemas más variados. Identificación visual de objetos cotidianos.",
    hard: "Nivel Avanzado (6-8 años): Palabras con fonemas complejos (RR, L, D al final) o grupos consonánticos (TR, PL, BR) como 'tren', 'plátano', 'perro', 'mariposa'. Enfoque en completar letras faltantes."
  };

  const prompt = `Actúa como un logopeda pediátrico experto. 
  Genera ${count} actividades para un niño de 4 a 8 años con dificultades de habla, nivel: ${difficulty}.
  ${difficultyDesc[difficulty]}.

  REGLAS DE VOCABULARIO:
  1. Usa palabras que un niño de esa edad conozca perfectamente.
  2. Evita conceptos abstractos. Solo objetos, animales o acciones visibles.
  3. Para 'hard', usa palabras que tengan sonidos que suelen costar (R, RR, grupos con L o R como 'globo' o 'fresa').
  4. 'image' debe ser un emoji que el niño reconozca al instante. Incluye SIEMPRE un emoji en 'image' para todos los niveles.
  5. 'syllables' debe estar dividido claramente: 'ma... ri... po... sa'.
  6. 'instruction' debe ser muy dulce y motivadora. NUNCA incluyas guiones bajos (_) ni símbolos técnicos en este campo, ya que se leerán en voz alta. Si quieres referirte a una palabra incompleta, di simplemente "esta palabra" o su nombre real. EVITA mencionar personajes o a ti mismo.
  7. Para 'medium', las 'options' deben ser palabras visualmente distintas.
  
  JSON SCHEMA: Devuelve un arreglo JSON con: id, title, word, syllables, points, hint, pronunciationTip, instruction, image, options (solo medium), displayChallenge (solo hard, ej: 'MA_IP_SA'). El campo displayChallenge SÍ puede tener guiones bajos.

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
