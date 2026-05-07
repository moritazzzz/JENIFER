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
      { id: 'v-1', title: 'Sonido A', image: '🦅', word: 'Ala', syllables: 'A-la', points: 10, hint: 'Como un pájaro', pronunciationTip: 'Abre bien la boquita como si fueras a comer algo muy rico.' },
      { id: 'v-2', title: 'Sonido E', image: '⭐', word: 'Estrella', syllables: 'Es-tre-lla', points: 10, hint: 'Brilla en el cielo', pronunciationTip: 'Sonríe un poquito y di E.' },
      { id: 'v-3', title: 'Sonido I', image: '🏝️', word: 'Isla', syllables: 'Is-la', points: 20, hint: 'Rodeada de agua', pronunciationTip: 'Muestra tus dientitos y di I.' },
      { id: 'v-4', title: 'Sonido O', image: '🐻', word: 'Oso', syllables: 'O-so', points: 20, hint: 'Es muy peludo', pronunciationTip: 'Pon tus labios redonditos como un círculo.' },
      { id: 'v-5', title: 'Sonido U', image: '🍇', word: 'Uva', syllables: 'U-va', points: 20, hint: 'Fruta redondita', pronunciationTip: 'Lleva tus labios hacia adelante como un silbido.' },
      { id: 'v-6', title: 'Luna Llena', image: '🌙', word: 'Luna', syllables: 'Lu-na', points: 15, hint: 'Sale de noche', pronunciationTip: 'Sube la puntita de la lengua al techo de la boca.' },
      { id: 'v-7', title: 'Sol Brillante', image: '☀️', word: 'Sol', syllables: 'Sol', points: 15, hint: 'Sale de día', pronunciationTip: 'Sopla aire entre tus dientes suavemente.' },
      { id: 'v-8', title: 'Mesa Madera', image: '🪑', word: 'Mesa', syllables: 'Me-sa', points: 15, hint: 'Donde comemos', pronunciationTip: 'Junta tus labios con fuerza y haz un sonido.' },
      { id: 'v-9', title: 'Pato Loco', image: '🦆', word: 'Pato', syllables: 'Pa-to', points: 15, hint: 'Hace cuac-cuac', pronunciationTip: 'Explota tus labios para la P y sopla para la T.' },
      { id: 'v-10', title: 'Sapo Salta', image: '🐸', word: 'Sapo', syllables: 'Sa-po', points: 15, hint: 'Salta en el agua', pronunciationTip: 'Sopla como una serpiente y luego explota los labios.' },
      { id: 'v-11', title: 'Dedo Mágico', image: '☝️', word: 'Dedo', syllables: 'De-do', points: 15, hint: 'Parte de la mano', pronunciationTip: 'Pon la lengua entre los dientes suavemente para la D.' },
      { id: 'v-12', title: 'Nene Duerme', image: '👶', word: 'Nene', syllables: 'Ne-ne', points: 10, hint: 'Un bebé pequeñito', pronunciationTip: 'Sube la lengua al techo y haz un sonido nasal.' },
      { id: 'v-13', title: 'Casa Linda', image: '🏠', word: 'Casa', syllables: 'Ca-sa', points: 15, hint: 'Donde vivimos', pronunciationTip: 'Haz el sonido K desde atrás y sopla como serpiente.' },
      { id: 'v-14', title: 'Bota Azul', image: '🥾', word: 'Bota', syllables: 'Bo-ta', points: 15, hint: 'Para los pies', pronunciationTip: 'Junta los labios suave para la B.' },
      { id: 'v-15', title: 'Rosa Roja', image: '🌹', word: 'Rosa', syllables: 'Ro-sa', points: 25, hint: 'Una flor hermosa', pronunciationTip: 'Haz que tu lengua vibre un poquito para la R.' },
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
      { id: 'm-6', title: 'Panda Comelón', image: '🐼', word: 'Panda', syllables: 'Pan... da', points: 35, pronunciationTip: 'Explota tus labios para la P.' },
      { id: 'm-7', title: 'Banano Dulce', image: '🍌', word: 'Banano', syllables: 'Ba... na... no', points: 35, pronunciationTip: 'Junta los labios suave para la B.' },
      { id: 'm-8', title: 'Gato Suave', image: '🐱', word: 'Gato', syllables: 'Ga... to', points: 35, pronunciationTip: 'Haz el sonido desde el fondo de tu garganta.' },
      { id: 'm-9', title: 'Helado Frío', image: '🍦', word: 'Helado', syllables: 'He... la... do', points: 35, pronunciationTip: 'La H no suena, concéntrate en la L y la D.' },
      { id: 'm-10', title: 'Pelota Redonda', image: '⚽', word: 'Pelota', syllables: 'Pe... lo... ta', points: 30, pronunciationTip: 'Explota la P y sube la lengua para la L.' },
      { id: 'm-11', title: 'Conejo Saltón', image: '🐰', word: 'Conejo', syllables: 'Co... ne... jo', points: 40, pronunciationTip: 'La J suena como un suspiro fuerte.' },
      { id: 'm-12', title: 'Guitarra Musical', image: '🎸', word: 'Guitarra', syllables: 'Gui... ta... rra', points: 45, pronunciationTip: 'La RR necesita que tu lengua vibre mucho.' },
      { id: 'm-13', title: 'Tiburón Feroz', image: '🦈', word: 'Tiburón', syllables: 'Ti... bu... rón', points: 45, pronunciationTip: 'Sopla suave para la T y vibra para la R.' },
      { id: 'm-14', title: 'Zapato Nuevo', image: '👟', word: 'Zapato', syllables: 'Za... pa... to', points: 35, pronunciationTip: 'Usa el sonido S para la Z.' },
      { id: 'm-15', title: 'Queso Rico', image: '🧀', word: 'Queso', syllables: 'Que... so', points: 35, pronunciationTip: 'Haz el sonido K y luego el de la serpiente.' },
    ]
  },
  hard: {
    name: 'Montaña del Desafío',
    description: 'Frases y deletreo mágico',
    color: 'from-purple-500 to-pink-600',
    icon: '🌋',
    activities: [
      { id: 'h-1', title: 'Mi Hogar', image: '🏠', word: 'Casa', syllables: 'Ca-sa', points: 50, pronunciationTip: 'Tómate tu tiempo en cada palabra, respira profundo.' },
      { id: 'h-2', title: 'Mejor Amigo', image: '🐶', word: 'Perro', syllables: 'Pe-rro', points: 50, pronunciationTip: 'Haz mucha fuerza con la lengua para que vibre fuerte la R.' },
      { id: 'h-3', title: 'Aprender', image: '🏫', word: 'Escuela', syllables: 'Es-cue-la', points: 60, pronunciationTip: 'Escucha los sonidos S en medio de las palabras.' },
      { id: 'h-4', title: 'Diversión', image: '🌳', word: 'Parque', syllables: 'Par-que', points: 60, pronunciationTip: 'La J suena como un suspiro fuerte desde la garganta.' },
      { id: 'h-5', title: 'Comida', image: '🍎', word: 'Manzana', syllables: 'Man-za-na', points: 70, pronunciationTip: 'Une todas las palabras suavemente como un caminito.' },
      { id: 'h-6', title: 'Cielo', image: '☁️', word: 'Nube', syllables: 'Nu-be', points: 75, pronunciationTip: 'Recuerda enfatizar la L al final de las palabras.' },
      { id: 'h-7', title: 'Familia', image: '👩‍👦', word: 'Mamá', syllables: 'Ma-má', points: 50, pronunciationTip: 'Pronuncia bien cada vocal.' },
      { id: 'h-8', title: 'Clima', image: '☀️', word: 'Sol', syllables: 'Sol', points: 65, pronunciationTip: 'No te olvides de la L al final de sol.' },
      { id: 'h-9', title: 'Transporte', image: '🚂', word: 'Tren', syllables: 'Tren', points: 80, pronunciationTip: 'Práctica el sonido TR uniendo la lengua al techo.' },
      { id: 'h-10', title: 'Naturaleza', image: '🌺', word: 'Flores', syllables: 'Flo-res', points: 80, pronunciationTip: 'El sonido FL necesita un soplo suave.' },
      { id: 'h-11', title: 'Animales', image: '🦒', word: 'Jirafa', syllables: 'Ji-ra-fa', points: 70, pronunciationTip: 'La CH suena como un pequeño estornudo suave.' },
      { id: 'h-12', title: 'Espacio', image: '🚀', word: 'Cohete', syllables: 'Co-he-te', points: 90, pronunciationTip: 'Es una palabra larga, tómate tu tiempo.' },
    ]
  }
};
