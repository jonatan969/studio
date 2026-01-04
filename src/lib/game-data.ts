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
    { id: 'char-aether', name: 'Aether', role: 'DUELIST', image: 'https://picsum.photos/seed/aether/200/200', hint: 'cosmic warrior' },
    { id: 'char-onyx', name: 'Onyx', role: 'DUELIST', image: 'https://picsum.photos/seed/onyx/200/200', hint: 'shadow rogue' },
    { id: 'char-solara', name: 'Solara', role: 'CONTROLLER', image: 'https://picsum.photos/seed/solara/200/200', hint: 'sun mage' },
    { id: 'char-cypher', name: 'Cypher', role: 'CONTROLLER', image: 'https://picsum.photos/seed/cypher/200/200', hint: 'tech operative' },
    { id: 'char-terra', name: 'Terra', role: 'SENTINEL', image: 'https://picsum.photos/seed/terra/200/200', hint: 'nature guardian' },
    { id: 'char-riptide', name: 'Riptide', role: 'SENTINEL', image: 'https://picsum.photos/seed/riptide/200/200', hint: 'water fighter' },
    { id: 'char-ignis', name: 'Ignis', role: 'INITIATOR', image: 'https://picsum.photos/seed/ignis/200/200', hint: 'fire brawler' },
    { id: 'char-zenith', name: 'Zenith', role: 'INITIATOR', image: 'https://picsum.photos/seed/zenith/200/200', hint: 'wise monk' },
    { id: 'char-void', name: 'Void', role: 'DUELIST', image: 'https://picsum.photos/seed/void/200/200', hint: 'dimensional being' },
    { id: 'char-crag', name: 'Crag', role: 'SENTINEL', image: 'https://picsum.photos/seed/crag/200/200', hint: 'stone golem' },
    { id: 'char-zephyr', name: 'Zephyr', role: 'INITIATOR', image: 'https://picsum.photos/seed/zephyr/200/200', hint: 'wind scout' },
    { id: 'char-luna', name: 'Luna', role: 'CONTROLLER', image: 'https://picsum.photos/seed/luna/200/200', hint: 'moon illusionist' },
];

export const SUPER_ARTS: SuperArt[] = [
    { id: 'sa-aether-1', characterId: 'char-aether', name: 'Cosmic Rift', description: 'Corta la realidad para teletransportarse a corta distancia.', color: 'blue', roman: 'I' },
    { id: 'sa-aether-2', characterId: 'char-aether', name: 'Stardust Burst', description: 'Desata una explosión de energía estelar que repele a los enemigos.', color: 'red', roman: 'II' },
    { id: 'sa-aether-3', characterId: 'char-aether', name: 'Celestial Judgment', description: 'Invoca un meteorito que cae en el área objetivo.', color: 'yellow', roman: 'III' },
    { id: 'sa-onyx-1', characterId: 'char-onyx', name: 'Shadowstep', description: 'Vuélvete invisible y aumenta tu velocidad de movimiento por un corto tiempo.', color: 'blue', roman: 'I' },
    { id: 'sa-onyx-2', characterId: 'char-onyx', name: 'Venom Strike', description: 'Tus próximos ataques aplican un veneno que daña con el tiempo.', color: 'red', roman: 'II' },
    { id: 'sa-onyx-3', characterId: 'char-onyx', name: 'Assassins Instinct', description: 'Marca a un enemigo. Teletranspórtate detrás de él para un ataque crítico.', color: 'yellow', roman: 'III' },
    { id: 'sa-solara-1', characterId: 'char-solara', name: 'Solar Flare', description: 'Ciega a los enemigos en un cono frente a ti.', color: 'blue', roman: 'I' },
    { id: 'sa-solara-2', characterId: 'char-solara', name: 'Healing Radiance', description: 'Crea un aura que cura a los aliados cercanos.', color: 'yellow', roman: 'II' },
    { id: 'sa-solara-3', characterId: 'char-solara', name: 'Supernova', description: 'Después de una carga, desata una explosión masiva que daña a todos en un área grande.', color: 'red', roman: 'III' },
    { id: 'sa-cypher-1', characterId: 'char-cypher', name: 'System Shock', description: 'Lanza un pulso EMP que silencia las habilidades enemigas brevemente.', color: 'blue', roman: 'I' },
    { id: 'sa-cypher-2', characterId: 'char-cypher', name: 'Overclock', description: 'Aumenta drásticamente tu velocidad de ataque y recarga.', color: 'red', roman: 'II' },
    { id: 'sa-cypher-3', characterId: 'char-cypher', name: 'Firewall', description: 'Crea una barrera de datos que bloquea proyectiles y ralentiza a los enemigos.', color: 'yellow', roman: 'III' },
    { id: 'sa-terra-1', characterId: 'char-terra', name: 'Earthen Wall', description: 'Crea un muro de roca infranqueable en la ubicación objetivo.', color: 'yellow', roman: 'I' },
    { id: 'sa-terra-2', characterId: 'char-terra', name: 'Quake', description: 'Golpea el suelo, lanzando por el aire a los enemigos cercanos.', color: 'red', roman: 'II' },
    { id: 'sa-terra-3', characterId: 'char-terra', name: 'Natures Grasp', description: 'Invoca enredaderas que inmovilizan a los enemigos en un área.', color: 'blue', roman: 'III' },
    { id: 'sa-riptide-1', characterId: 'char-riptide', name: 'Tidal Wave', description: 'Envía una ola que empuja a los enemigos.', color: 'blue', roman: 'I' },
    { id: 'sa-riptide-2', characterId: 'char-riptide', name: 'Aqua Prison', description: 'Atrapa a un enemigo en una burbuja de agua, aturdiéndolo.', color: 'yellow', roman: 'II' },
    { id: 'sa-riptide-3', characterId: 'char-riptide', name: 'Maelstrom', description: 'Crea un vórtice de agua que atrae y daña a los enemigos cercanos.', color: 'red', roman: 'III' },
    { id: 'sa-ignis-1', characterId: 'char-ignis', name: 'Meteor Punch', description: 'Se lanza hacia adelante con un puñetazo ardiente.', color: 'red', roman: 'I' },
    { id: 'sa-ignis-2', characterId: 'char-ignis', name: 'Ring of Fire', description: 'Crea un anillo de fuego que daña a los enemigos que lo cruzan.', color: 'yellow', roman: 'II' },
    { id: 'sa-ignis-3', characterId: 'char-ignis', name: 'Eruption', description: 'Hace que el suelo bajo un enemigo entre en erupción, lanzándolo por el aire.', color: 'blue', roman: 'III' },
    { id: 'sa-zenith-1', characterId: 'char-zenith', name: 'Tranquility', description: 'Canaliza para curarte a ti mismo y a un aliado cercano.', color: 'yellow', roman: 'I' },
    { id: 'sa-zenith-2', characterId: 'char-zenith', name: 'Ki-Blast', description: 'Lanza un orbe de energía que ralentiza al primer enemigo golpeado.', color: 'blue', roman: 'II' },
    { id: 'sa-zenith-3', characterId: 'char-zenith', name: 'Enlightenment', description: 'Gana una mayor reducción de daño y control por un corto tiempo.', color: 'red', roman: 'III' },
    { id: 'sa-void-1', characterId: 'char-void', name: 'Dimensional Tear', description: 'Abre un portal a través del cual solo tú puedes viajar.', color: 'blue', roman: 'I' },
    { id: 'sa-void-2', characterId: 'char-void', name: 'Entropy Field', description: 'Crea un campo que reduce la velocidad de ataque de los enemigos en su interior.', color: 'yellow', roman: 'II' },
    { id: 'sa-void-3', characterId: 'char-void', name: 'Collapse', description: 'Implosiona un área, atrayendo a los enemigos al centro y dañándolos.', color: 'red', roman: 'III' },
    { id: 'sa-crag-1', characterId: 'char-crag', name: 'Boulder Toss', description: 'Lanza una roca que aturde al primer enemigo golpeado.', color: 'red', roman: 'I' },
    { id: 'sa-crag-2', characterId: 'char-crag', name: 'Granite Shield', description: 'Gana un escudo temporal que absorbe el daño.', color: 'yellow', roman: 'II' },
    { id: 'sa-crag-3', characterId: 'char-crag', name: 'Petrify', description: 'Canaliza para convertir a un enemigo cercano en piedra, aturdiéndolo por mucho tiempo.', color: 'blue', roman: 'III' },
    { id: 'sa-zephyr-1', characterId: 'char-zephyr', name: 'Tailwind', description: 'Aumenta la velocidad de movimiento de todos los aliados cercanos.', color: 'yellow', roman: 'I' },
    { id: 'sa-zephyr-2', characterId: 'char-zephyr', name: 'Gale Force', description: 'Desata una ráfaga de viento que empuja a todos los enemigos en línea recta.', color: 'blue', roman: 'II' },
    { id: 'sa-zephyr-3', characterId: 'char-zephyr', name: 'Cyclone', description: 'Invoca un tornado que persigue a los enemigos, lanzándolos por el aire.', color: 'red', roman: 'III' },
    { id: 'sa-luna-1', characterId: 'char-luna', name: 'Mirror Image', description: 'Crea un clon de ti mismo para confundir a los enemigos.', color: 'blue', roman: 'I' },
    { id: 'sa-luna-2', characterId: 'char-luna', name: 'Crescent Moon', description: 'Lanza un proyectil de luz de luna que silencia al primer enemigo golpeado.', color: 'yellow', roman: 'II' },
    { id: 'sa-luna-3', characterId: 'char-luna', name: 'Eclipse', description: 'Oscurece un área grande, reduciendo la visión de los enemigos en su interior.', color: 'red', roman: 'III' },
];
