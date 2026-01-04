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
        "id": "char-aether",
        "name": "Aether",
        "role": "DUELIST",
        "image": "https://picsum.photos/seed/aether/200/200",
        "hint": "cosmic warrior",
        "description": "A stoic warrior cloaked in cosmic energy."
    },
    {
        "id": "char-onyx",
        "name": "Onyx",
        "role": "DUELIST",
        "image": "https://picsum.photos/seed/onyx/200/200",
        "hint": "shadow rogue",
        "description": "A shadowy rogue with glowing daggers."
    },
    {
        "id": "char-solara",
        "name": "Solara",
        "role": "CONTROLLER",
        "image": "https://picsum.photos/seed/solara/200/200",
        "hint": "sun mage",
        "description": "A radiant mage wielding the power of the sun."
    },
    {
        "id": "char-cypher",
        "name": "Cypher",
        "role": "CONTROLLER",
        "image": "https://picsum.photos/seed/cypher/200/200",
        "hint": "tech operative",
        "description": "A high-tech operative with holographic displays."
    },
    {
        "id": "char-terra",
        "name": "Terra",
        "role": "SENTINEL",
        "image": "https://picsum.photos/seed/terra/200/200",
        "hint": "nature guardian",
        "description": "A guardian of nature, covered in moss and stone."
    },
    {
        "id": "char-riptide",
        "name": "Riptide",
        "role": "SENTINEL",
        "image": "https://picsum.photos/seed/riptide/200/200",
        "hint": "water fighter",
        "description": "A swift fighter who controls water."
    },
    {
        "id": "char-ignis",
        "name": "Ignis",
        "role": "INITIATOR",
        "image": "https://picsum.photos/seed/ignis/200/200",
        "hint": "fire brawler",
        "description": "A fiery brawler with volcanic fists."
    },
    {
        "id": "char-zenith",
        "name": "Zenith",
        "role": "INITIATOR",
        "image": "https://picsum.photos/seed/zenith/200/200",
        "hint": "wise monk",
        "description": "A wise monk who levitates with serene power."
    }
];

export const SUPER_ARTS: SuperArt[] = [
    // Aether
    { "id": "sa-aether-1", "characterId": "char-aether", "name": "Estallido Cósmico", "description": "Libera una nova de energía que daña y repele a los enemigos cercanos.", "color": "blue", "roman": "I" },
    { "id": "sa-aether-2", "characterId": "char-aether", "name": "Cometa Fugaz", "description": "Se lanza hacia adelante, dejando un rastro de energía que daña a los enemigos.", "color": "red", "roman": "II" },
    { "id": "sa-aether-3", "characterId": "char-aether", "name": "Singularidad", "description": "Crea un pequeño agujero negro que atrae a los enemigos cercanos a su centro.", "color": "yellow", "roman": "III" },
    // Onyx
    { "id": "sa-onyx-1", "characterId": "char-onyx", "name": "Manto de Sombras", "description": "Se vuelve invisible por un corto período de tiempo, aumentando su velocidad de movimiento.", "color": "blue", "roman": "I" },
    { "id": "sa-onyx-2", "characterId": "char-onyx", "name": "Dagas Espectrales", "description": "Lanza una ráfaga de dagas que atraviesan a los enemigos.", "color": "red", "roman": "II" },
    { "id": "sa-onyx-3", "characterId": "char-onyx", "name": "Marca del Abismo", "description": "Marca a un enemigo, haciendo que reciba daño adicional de todas las fuentes.", "color": "yellow", "roman": "III" },
    // Solara
    { "id": "sa-solara-1", "characterId": "char-solara", "name": "Faro Solar", "description": "Crea un orbe de luz que ciega a los enemigos que lo miran.", "color": "blue", "roman": "I" },
    { "id": "sa-solara-2", "characterId": "char-solara", "name": "Erupción Solar", "description": "Invoca un pilar de fuego solar en una ubicación, dañando a los enemigos en el área.", "color": "red", "roman": "II" },
    { "id": "sa-solara-3", "characterId": "char-solara", "name": "Bendición del Sol", "description": "Otorga a los aliados cercanos un escudo que absorbe daño.", "color": "yellow", "roman": "III" },
    // Cypher
    { "id": "sa-cypher-1", "characterId": "char-cypher", "name": "Pulso EMP", "description": "Desactiva las habilidades de los enemigos en un área amplia por un corto tiempo.", "color": "blue", "roman": "I" },
    { "id": "sa-cypher-2", "characterId": "char-cypher", "name": "Cortafuegos", "description": "Crea un muro de datos corruptos que ralentiza y daña a los enemigos que lo atraviesan.", "color": "red", "roman": "II" },
    { "id": "sa-cypher-3", "characterId": "char-cypher", "name": "Análisis de Debilidad", "description": "Revela la posición de un enemigo y aumenta el daño que recibe.", "color": "yellow", "roman": "III" },
    // Terra
    { "id": "sa-terra-1", "characterId": "char-terra", "name": "Bastión de Piedra", "description": "Crea un muro de roca indestructible por un corto período de tiempo.", "color": "blue", "roman": "I" },
    { "id": "sa-terra-2", "characterId": "char-terra", "name": "Temblores", "description": "Golpea el suelo, creando una onda de choque que ralentiza a los enemigos cercanos.", "color": "red", "roman": "II" },
    { "id": "sa-terra-3", "characterId": "char-terra", "name": "Abrazo de la Naturaleza", "description": "Crea un área que cura a los aliados dentro de ella con el tiempo.", "color": "yellow", "roman": "III" },
    // Riptide
    { "id": "sa-riptide-1", "characterId": "char-riptide", "name": "Maremoto", "description": "Invoca una gran ola que empuja a todos los enemigos que golpea.", "color": "blue", "roman": "I" },
    { "id": "sa-riptide-2", "characterId": "char-riptide", "name": "Torbellino", "description": "Crea un remolino en una ubicación que atrae y daña a los enemigos cercanos.", "color": "red", "roman": "II" },
    { "id": "sa-riptide-3", "characterId": "char-riptide", "name": "Corriente Rápida", "description": "Aumenta enormemente su velocidad de movimiento y la de los aliados cercanos.", "color": "yellow", "roman": "III" },
    // Ignis
    { "id": "sa-ignis-1", "characterId": "char-ignis", "name": "Muro de Fuego", "description": "Crea una línea de fuego que bloquea la visión y daña a quienes la cruzan.", "color": "blue", "roman": "I" },
    { "id": "sa-ignis-2", "characterId": "char-ignis", "name": "Lluvia de Meteoros", "description": "Invoca una lluvia de pequeños meteoritos en un área, causando daño repetido.", "color": "red", "roman": "II" },
    { "id": "sa-ignis-3", "characterId": "char-ignis", "name": "Marca Ígnea", "description": "Golpea a un enemigo, marcándolo. Los ataques posteriores de los aliados curan al atacante.", "color": "yellow", "roman": "III" },
    // Zenith
    { "id": "sa-zenith-1", "characterId": "char-zenith", "name": "Santuario", "description": "Crea un área de silencio donde los enemigos no pueden usar habilidades.", "color": "blue", "roman": "I" },
    { "id": "sa-zenith-2", "characterId": "char-zenith", "name": "Meditación Trascendente", "description": "Canaliza para volverse invulnerable y curarse rápidamente.", "color": "red", "roman": "II" },
    { "id": "sa-zenith-3", "characterId": "char-zenith", "name": "Guía Espiritual", "description": "Vincula a un aliado, compartiendo una parte del daño que recibe y aumentando su daño.", "color": "yellow", "roman": "III" }
];