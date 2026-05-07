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

export async function generateSessionActivities(
  difficulty: 'easy' | 'medium' | 'hard', 
  learningLevel: string,
  age: number,
  learningStyle: string,
  avoidWords: string[] = [],
  count: number = 10
): Promise<GeneratedActivity[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const levelSpecifics = {
    'presilábico': "Usa palabras muy cortas (1-2 sílabas), extremadamente familiares en ESPAÑOL (mamá, sol, pan, ojo) y asegura que el emoji sea muy claro.",
    'silábico': "Usa palabras de 2 a 3 sílabas en ESPAÑOL. Divide las sílabas visualmente con guiones (PA-TO).",
    'alfabético': "Usa palabras completas de variada complejidad en ESPAÑOL. El enfoque es la formación y lectura fluida."
  };

  const styleSpecifics = {
    'visual': "Asegúrate de que las pistas ('hint') sean muy visuales y descriptivas de la imagen.",
    'auditivo': "Las instrucciones deben centrarse en los sonidos iniciales y la rima. Ej: '¿Qué palabra empieza con el sonido SSS?'",
    'escritura': "Genera pistas que animen a identificar las letras que componen la palabra."
  };

  const prompt = `Actúa como un logopeda pediátrico experto de habla HISPANA. 
  Genera ${count} actividades ÚNICAS, CREATIVAS y VARIADAS para un niño de ${age} años.
  
  CONTEXTO CLAVE:
  - Nivel de Dificultad (Mundo): ${difficulty.toUpperCase()}
  - Nivel de Aprendizaje (Etapa Lectoescritora): ${learningLevel} (${levelSpecifics[learningLevel as keyof typeof levelSpecifics] || ''})
  - Estilo de Aprendizaje: ${learningStyle} (${styleSpecifics[learningStyle as keyof typeof styleSpecifics] || ''})
  - Edad del niño: ${age} años
  ${avoidWords.length > 0 ? `- EVITA ESTAS PALABRAS (ya usadas recientemente): ${avoidWords.join(', ')}` : ''}
  
  REGLAS DE VOCABULARIO Y TERAPIA (CRÍTICO):
  1. TODAS las palabras y frases deben ser en ESPAÑOL DE ESPAÑA/LATAM. NUNCA uses inglés (no uses 'hard', 'easy', etc. como palabras del reto).
  2. Adapta el contenido específicamente para un niño de ${age} años.
  3. NIVEL PRESILÁBICO: Prioriza reconocimiento de imagen y sonido inicial.
  4. NIVEL SILÁBICO: Divide claramente con guiones: 'PA-TO'.
  5. NIVEL ALFABÉTICO: Palabras completas y retos de formación.
  6. ESTILO VISUAL: Referencias directas a la forma y color de la imagen.
  7. ESTILO AUDITIVO: Centrado en onomatopeyas, rimas y sonidos.
  8. ESTILO ESCRITURA: Centrado en las letras y su orden.
  9. VARIABILIDAD TOTAL: Usa comida, objetos del hogar, ropa, partes del cuerpo, animales, transporte.
  10. Si la dificultad es 'HARD', usa PALABRAS CORTAS O MEDIANAS (máximo 10 letras) que sean retos interesantes (ej: 'guitarra', 'conejo'). EVITA FRASES LARGAS.
  11. 'displayChallenge' (solo en HARD): Debe ser la palabra con 2 o 3 letras reemplazadas por guiones bajos (ej: 'GU_TA_RA').
  
  JSON SCHEMA: Devuelve un arreglo JSON con: id, title, word, syllables, points, hint, pronunciationTip, instruction, image, options (solo mediano), displayChallenge (solo difícil, ej: 'M_RC_ÉL_GO').
  
  EJEMPLO JSON:
  [
    {"id": "ai-1", "title": "Amigo del Hogar", "word": "Silla", "image": "🪑", "syllables": "Si-lla", "points": 15, "hint": "Sirve para sentarse y tiene 4 patas", "pronunciationTip": "Pon tus dientes juntos y sopla SSS", "instruction": "¡Mira esta silla! ¿Cómo se dice?"}
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
