'use client';
import { Swords, BrainCircuit, Shield, Zap } from 'lucide-react';
import type { Character, SuperArt } from './types';

export const ROLES = {
  DUELIST: { name: 'Duelist', icon: Swords },
  CONTROLLER: { name: 'Controller', icon: BrainCircuit },
  SENTINEL: { name: 'Sentinel', icon: Shield },
  INITIATOR: { name: 'Initiator', icon: Zap },
};

export type CharacterRole = keyof typeof ROLES;

export const CHARACTERS: Character[] = [
    {
        "id": "char-bombardero",
        "name": "Bombardero",
        "role": "DUELIST",
        "image": "https://picsum.photos/seed/bombardero/200/200",
        "hint": "cyborg soldier",
        "description": "Un exotraje fuertemente armado listo para la aniquilación total."
    },
    {
        "id": "char-espadachin",
        "name": "Espadachin",
        "role": "DUELIST",
        "image": "https://picsum.photos/seed/espadachin/200/200",
        "hint": "demonic swordsman",
        "description": "Un guerrero ágil que canaliza poder demoníaco en su espada."
    },
    {
        "id": "char-piloto",
        "name": "Piloto",
        "role": "DUELIST",
        "image": "https://picsum.photos/seed/piloto/200/200",
        "hint": "beast master",
        "description": "Un nómada que invoca bestias fantasmales para luchar a su lado."
    },
    {
        "id": "char-arquero",
        "name": "Arquero",
        "role": "SENTINEL",
        "image": "https://picsum.photos/seed/arquero/200/200",
        "hint": "spirit archer",
        "description": "Un arquero místico cuyas flechas manipulan el alma y la luz."
    },
    {
        "id": "char-cazador",
        "name": "Cazador",
        "role": "DUELIST",
        "image": "https://picsum.photos/seed/cazador/200/200",
        "hint": "toxic trapper",
        "description": "Un estratega que utiliza toxinas y trampas para debilitar a sus presas."
    },
    {
        "id": "char-ninja",
        "name": "Ninja",
        "role": "DUELIST",
        "image": "https://picsum.photos/seed/ninja/200/200",
        "hint": "stealth assassin",
        "description": "Un asesino sigiloso que usa el engaño y la tecnología para eliminar objetivos."
    },
    {
        "id": "char-paladin",
        "name": "Paladin",
        "role": "CONTROLLER",
        "image": "https://picsum.photos/seed/paladin/200/200",
        "hint": "holy knight",
        "description": "Un caballero sagrado que protege a sus aliados con luz divina."
    },
    {
        "id": "char-salvaje",
        "name": "Salvaje",
        "role": "SENTINEL",
        "image": "https://picsum.photos/seed/salvaje/200/200",
        "hint": "gravity bruiser",
        "description": "Un bruto que manipula la gravedad para controlar el campo de batalla."
    },
    {
        "id": "char-piromano",
        "name": "Piromano",
        "role": "SENTINEL",
        "image": "https://picsum.photos/seed/piromano/200/200",
        "hint": "fire elemental",
        "description": "Una entidad de fuego puro, capaz de desatar el infierno."
    },
    {
        "id": "char-ahogado",
        "name": "Ahogado",
        "role": "DUELIST",
        "image": "https://picsum.photos/seed/ahogado/200/200",
        "hint": "oceanic warrior",
        "description": "Un guerrero de las profundidades que comanda la furia del océano."
    },
    {
        "id": "char-clerigo",
        "name": "Clerigo",
        "role": "CONTROLLER",
        "image": "https://picsum.photos/seed/clerigo/200/200",
        "hint": "space bender",
        "description": "Un monje que manipula el espacio-tiempo para reposicionar aliados y enemigos."
    },
    {
        "id": "char-explorador",
        "name": "Explorador",
        "role": "SENTINEL",
        "image": "https://picsum.photos/seed/explorador/200/200",
        "hint": "hell summoner",
        "description": "Un invocador que abre portales para traer criaturas infernales."
    },
    {
        "id": "char-bruja",
        "name": "Bruja",
        "role": "CONTROLLER",
        "image": "https://picsum.photos/seed/bruja/200/200",
        "hint": "curse witch",
        "description": "Una hechicera que utiliza maldiciones y magia dracónica."
    }
];

export const SUPER_ARTS: SuperArt[] = [
    // Bombardero
    { "id": "sa-bombardero-1", "characterId": "char-bombardero", "name": "Exotraje Innecesariamente Inmortal", "description": "Activa un modo de invulnerabilidad temporal.", "color": "yellow", "roman": "I" },
    { "id": "sa-bombardero-2", "characterId": "char-bombardero", "name": "Misiles Teledirigidos", "description": "Lanza una salva de misiles que persiguen a los enemigos.", "color": "red", "roman": "II" },
    { "id": "sa-bombardero-3", "characterId": "char-bombardero", "name": "Despegue", "description": "Se eleva en el aire, ganando visión y la capacidad de atacar desde arriba.", "color": "blue", "roman": "III" },
    // Espadachin
    { "id": "sa-espadachin-1", "characterId": "char-espadachin", "name": "Pocion Demoniaca", "description": "Consume una poción que aumenta drásticamente el daño y la velocidad de ataque.", "color": "red", "roman": "I" },
    { "id": "sa-espadachin-2", "characterId": "char-espadachin", "name": "Energia Vital", "description": "Cada golpe restaura una porción de la vida del Espadachin.", "color": "yellow", "roman": "II" },
    { "id": "sa-espadachin-3", "characterId": "char-espadachin", "name": "Giro Embestida", "description": "Realiza un ataque giratorio que avanza y daña a todos los enemigos en el camino.", "color": "blue", "roman": "III" },
    // Piloto
    { "id": "sa-piloto-1", "characterId": "char-piloto", "name": "Invocar Happy Ghast", "description": "Invoca a un ghast fantasmal que dispara proyectiles explosivos.", "color": "red", "roman": "I" },
    { "id": "sa-piloto-2", "characterId": "char-piloto", "name": "Invocar Camello", "description": "Invoca a un camello resistente que puede ser usado como cobertura móvil.", "color": "yellow", "roman": "II" },
    { "id": "sa-piloto-3", "characterId": "char-piloto", "name": "Invocar Caballo", "description": "Invoca a un caballo rápido que permite un rápido reposicionamiento.", "color": "blue", "roman": "III" },
    // Arquero
    { "id": "sa-arquero-1", "characterId": "char-arquero", "name": "Ira Espiritual", "description": "Dispara una flecha que explota en un área, causando daño masivo.", "color": "red", "roman": "I" },
    { "id": "sa-arquero-2", "characterId": "char-arquero", "name": "Luces Fuera", "description": "Lanza una flecha que crea un área de oscuridad, bloqueando la visión enemiga.", "color": "blue", "roman": "II" },
    { "id": "sa-arquero-3", "characterId": "char-arquero", "name": "Hexoul", "description": "Dispara una flecha que marca a un enemigo, revelándolo y ralentizándolo.", "color": "yellow", "roman": "III" },
    // Cazador
    { "id": "sa-cazador-1", "characterId": "char-cazador", "name": "Punto Toxico", "description": "Lanza un dardo que envenena a un enemigo, causándole daño con el tiempo.", "color": "red", "roman": "I" },
    { "id": "sa-cazador-2", "characterId": "char-cazador", "name": "Red Pegajosa", "description": "Lanza una red que inmoviliza al primer enemigo que toca.", "color": "blue", "roman": "II" },
    { "id": "sa-cazador-3", "characterId": "char-cazador", "name": "Protocolo de Daños", "description": "Marca a un enemigo, haciendo que reciba más daño de todas las fuentes.", "color": "yellow", "roman": "III" },
    // Ninja
    { "id": "sa-ninja-1", "characterId": "char-ninja", "name": "Destreza", "description": "Aumenta la velocidad de ataque y de movimiento por un corto período.", "color": "red", "roman": "I" },
    { "id": "sa-ninja-2", "characterId": "char-ninja", "name": "Dispositivo de Eliminación", "description": "Se teletransporta a una ubicación cercana, volviéndose invisible brevemente.", "color": "blue", "roman": "II" },
    { "id": "sa-ninja-3", "characterId": "char-ninja", "name": "Bomba de Humo", "description": "Crea una nube de humo que bloquea la visión y silencia a los enemigos dentro.", "color": "yellow", "roman": "III" },
    // Paladin
    { "id": "sa-paladin-1", "characterId": "char-paladin", "name": "Proteccion Divina", "description": "Otorga a todos los aliados cercanos un escudo que absorbe una gran cantidad de daño.", "color": "yellow", "roman": "I" },
    { "id": "sa-paladin-2", "characterId": "char-paladin", "name": "Embiste", "description": "Carga hacia adelante, empujando a los enemigos y aturdiendo al primero que golpea.", "color": "blue", "roman": "II" },
    { "id": "sa-paladin-3", "characterId": "char-paladin", "name": "Luz Sagrada", "description": "Crea un área que cura a los aliados y daña a los enemigos con el tiempo.", "color": "red", "roman": "III" },
    // Salvaje
    { "id": "sa-salvaje-1", "characterId": "char-salvaje", "name": "Fuerza Gravitacional", "description": "Atrae a todos los enemigos cercanos hacia el Salvaje.", "color": "blue", "roman": "I" },
    { "id": "sa-salvaje-2", "characterId": "char-salvaje", "name": "Blindaje Tactico", "description": "Reduce enormemente el daño recibido por un corto período.", "color": "yellow", "roman": "II" },
    { "id": "sa-salvaje-3", "characterId": "char-salvaje", "name": "Lanzar", "description": "Agarra y lanza al enemigo más cercano, causando daño al impactar.", "color": "red", "roman": "III" },
    // Piromano
    { "id": "sa-piromano-1", "characterId": "char-piromano", "name": "Cuerpo Llama", "description": "Se vuelve invulnerable a los ataques y quema a los enemigos cercanos.", "color": "yellow", "roman": "I" },
    { "id": "sa-piromano-2", "characterId": "char-piromano", "name": "Tornado de Fuego", "description": "Crea un tornado de fuego que se mueve, dañando y ralentizando a los enemigos.", "color": "red", "roman": "II" },
    { "id": "sa-piromano-3", "characterId": "char-piromano", "name": "Onda Ignea", "description": "Libera una ola de fuego que empuja y daña a los enemigos.", "color": "blue", "roman": "III" },
    // Ahogado
    { "id": "sa-ahogado-1", "characterId": "char-ahogado", "name": "Corazon del Mar", "description": "Otorga regeneración de vida masiva por un corto tiempo.", "color": "yellow", "roman": "I" },
    { "id": "sa-ahogado-2", "characterId": "char-ahogado", "name": "Furia de los mares", "description": "Aumenta el daño de ataque basado en la vida que le falta.", "color": "red", "roman": "II" },
    { "id": "sa-ahogado-3", "characterId": "char-ahogado", "name": "Salpicar", "description": "Crea un área resbaladiza que ralentiza a los enemigos.", "color": "blue", "roman": "III" },
    // Clerigo
    { "id": "sa-clerigo-1", "characterId": "char-clerigo", "name": "Teletransporte en masa", "description": "Teletransporta a todos los aliados cercanos a una ubicación objetivo.", "color": "blue", "roman": "I" },
    { "id": "sa-clerigo-2", "characterId": "char-clerigo", "name": "Transposicion", "description": "Intercambia posiciones con un aliado o enemigo.", "color": "yellow", "roman": "II" },
    { "id": "sa-clerigo-3", "characterId": "char-clerigo", "name": "Graviton", "description": "Crea un pozo de gravedad que atrae a los enemigos cercanos.", "color": "red", "roman": "III" },
    // Explorador
    { "id": "sa-explorador-1", "characterId": "char-explorador", "name": "Invocar Ravager", "description": "Invoca a una bestia poderosa que ataca a los enemigos cercanos.", "color": "red", "roman": "I" },
    { "id": "sa-explorador-2", "characterId": "char-explorador", "name": "Invocar Llamas", "description": "Invoca llamas estacionarias que queman a los enemigos.", "color": "blue", "roman": "II" },
    { "id": "sa-explorador-3", "characterId": "char-explorador", "name": "Invocar Cabras", "description": "Invoca cabras que sirven como distracciones y bloquean proyectiles.", "color": "yellow", "roman": "III" },
    // Bruja
    { "id": "sa-bruja-1", "characterId": "char-bruja", "name": "Maldicion", "description": "Maldice a un enemigo, reduciendo su daño y curación recibida.", "color": "yellow", "roman": "I" },
    { "id": "sa-bruja-2", "characterId": "char-bruja", "name": "Furia del Dragon", "description": "Invoca el aliento de un dragón en línea recta, causando daño masivo.", "color": "red", "roman": "II" },
    { "id": "sa-bruja-3", "characterId": "char-bruja", "name": "Invocar Vex", "description": "Invoca pequeños espíritus vex que acosan a los enemigos cercanos.", "color": "blue", "roman": "III" }
];
