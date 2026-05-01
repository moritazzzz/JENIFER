export const AVATARS = [
  { id: 'lion', icon: '🦁', color: 'bg-orange-100' },
  { id: 'rabbit', icon: '🐰', color: 'bg-pink-100' },
  { id: 'panda', icon: '🐼', color: 'bg-gray-100' },
  { id: 'fox', icon: '🦊', color: 'bg-orange-50' },
  { id: 'owl', icon: '🦉', color: 'bg-blue-50' },
  { id: 'unicorn', icon: '🦄', color: 'bg-purple-50' },
];

export const THEME_COLORS = [
  { name: 'Azul Mágico', value: '#3B82F6' },
  { name: 'Verde Bosque', value: '#10B981' },
  { name: 'Rosa Dulce', value: '#EC4899' },
  { name: 'Naranja Aventura', value: '#F59E0B' },
  { name: 'Morado Fantasía', value: '#8B5CF6' },
];

export const WORLDS = {
  easy: {
    name: 'Isla de las Vocales',
    description: 'Explora los sonidos básicos',
    color: 'from-yellow-400 to-orange-500',
    icon: '🏝️',
    activities: [
      { id: 'v-1', title: 'Sonido A', word: 'Ala', syllables: 'A... la', points: 10, hint: 'Como un pájaro', pronunciationTip: 'Abre bien la boquita como si fueras a comer algo muy rico.' },
      { id: 'v-2', title: 'Sonido E', word: 'Estrella', syllables: 'Es... tre... lla', points: 10, hint: 'Brilla en el cielo', pronunciationTip: 'Sonríe un poquito y di E.' },
      { id: 'v-3', title: 'Sonido I', word: 'Isla', syllables: 'Is... la', points: 20, hint: 'Rodeada de agua', pronunciationTip: 'Muestra tus dientitos y di I.' },
      { id: 'v-4', title: 'Sonido O', word: 'Oso', syllables: 'O... so', points: 20, hint: 'Es muy peludo', pronunciationTip: 'Pon tus labios redonditos como un círculo.' },
      { id: 'v-5', title: 'Sonido U', word: 'Uva', syllables: 'U... va', points: 20, hint: 'Fruta redondita', pronunciationTip: 'Lleva tus labios hacia adelante como un silbido.' },
    ]
  },
  medium: {
    name: 'Bosque de Palabras',
    description: 'Descubre objetos y animales',
    color: 'from-green-400 to-blue-500',
    icon: '🌳',
    activities: [
      { id: 'm-1', title: 'Amigo León', image: '🦁', word: 'León', syllables: 'Le... ón', points: 30, pronunciationTip: 'Recuerda subir la puntita de la lengua para la L.' },
      { id: 'm-2', title: 'Manzana Roja', image: '🍎', word: 'Manzana', syllables: 'Man... za... na', points: 30, pronunciationTip: 'Cierra los labios suavemente para la M.' },
      { id: 'm-3', title: 'Coche Veloz', image: '🚗', word: 'Carro', syllables: 'Ca... rro', points: 30, pronunciationTip: 'Haz que tu lengua vibre suavemente para la R.' },
      { id: 'm-4', title: 'Elefante Grande', image: '🐘', word: 'Elefante', syllables: 'E... le... fan... te', points: 40, pronunciationTip: 'Pega los dientes de arriba con el labio de abajo para la F.' },
      { id: 'm-5', title: 'Mariposa Colorida', image: '🦋', word: 'Mariposa', syllables: 'Ma... ri... po... sa', points: 40, pronunciationTip: 'M junta los labios, S como una serpiente.' },
    ]
  },
  hard: {
    name: 'Montaña del Desafío',
    description: 'Frases y deletreo mágico',
    color: 'from-purple-500 to-pink-600',
    icon: '🌋',
    activities: [
      { id: 'h-1', title: 'Mi Hogar', word: 'La casa es azul', points: 50, pronunciationTip: 'Tómate tu tiempo en cada palabra, respira profundo.' },
      { id: 'h-2', title: 'Mejor Amigo', word: 'El perro corre', points: 50, pronunciationTip: 'Haz mucha fuerza con la lengua para que vibre fuerte la R.' },
      { id: 'h-3', title: 'Aprender', word: 'Voy a la escuela', points: 60, pronunciationTip: 'Escucha los sonidos S en medio de las palabras.' },
      { id: 'h-4', title: 'Diversión', word: 'Juego en el parque', points: 60, pronunciationTip: 'La J suena como un suspiro fuerte desde la garganta.' },
      { id: 'h-5', title: 'Cena Rica', word: 'Como mucha fruta', points: 70, pronunciationTip: 'Une todas las palabras suavemente como un caminito.' },
    ]
  }
};
