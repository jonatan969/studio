'use client';
import { Swords, BrainCircuit, Shield, Zap } from 'lucide-react';
import type { Character as CharacterType, SuperArt as SuperArtType } from '@/lib/types';

export const ROLES = {
  DUELIST: { name: 'Duelist', icon: Swords },
  CONTROLLER: { name: 'Controller', icon: BrainCircuit },
  SENTINEL: { name: 'Sentinel', icon: Shield },
  INITIATOR: { name: 'Initiator', icon: Zap },
};

export type CharacterRole = keyof typeof ROLES;
export type Character = Omit<CharacterType, 'id'> & { id: string };
export type SuperArt = Omit<SuperArtType, 'id'> & { id: string };

export const CHARACTERS: Character[] = [
    {
        id: "aether",
        name: "Aether",
        role: "Duelist",
        image: "https://images.unsplash.com/photo-1636654302178-da23e21243dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjb3NtaWMlMjB3YXJyaW9yfGVufDB8fHx8MTc2NzA2Njc4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "cosmic warrior",
        description: "Un guerrero estoico envuelto en energía cósmica."
    },
    {
        id: "onyx",
        name: "Onyx",
        role: "Duelist",
        image: "https://images.unsplash.com/photo-1651335944644-33c89ed94cc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzaGFkb3clMjByb2d1ZXxlbnwwfHx8fDE3NjcwNjY3ODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "shadow rogue",
        description: "Un pícaro sombrío con dagas brillantes."
    },
    {
        id: "solara",
        name: "Solara",
        role: "Controller",
        image: "https://images.unsplash.com/photo-1619198138175-2a7625348df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzdW4lMjBtYWdlfGVufDB8fHx8MTc2NzA2Njc4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "sun mage",
        description: "Una maga radiante que empuña el poder del sol."
    },
    {
        id: "cypher",
        name: "Cypher",
        role: "Sentinel",
        image: "https://images.unsplash.com/photo-1655036387197-566206c80980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx0ZWNoJTIwb3BlcmF0aXZlfGVufDB8fHx8MTc2NzA2Njc4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "tech operative",
        description: "Un operativo de alta tecnología con pantallas holográficas."
    },
    {
        id: "terra",
        name: "Terra",
        role: "Sentinel",
        image: "https://images.unsplash.com/photo-1622550106256-5613d43d6687?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxuYXR1cmUlMjBndWFyZGlhbnxlbnwwfHx8fDE3NjcwNjY3ODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "nature guardian",
        description: "Una guardiana de la naturaleza, cubierta de musgo y piedra."
    },
    {
        id: "riptide",
        name: "Riptide",
        role: "Initiator",
        image: "https://images.unsplash.com/photo-1758291462752-3a726bf1067b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8d2F0ZXIlMjBmaWdodGVyfGVufDB8fHx8MTc2NzA2Njc4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "water fighter",
        description: "Un luchador veloz que controla el agua."
    },
     {
        id: "ignis",
        name: "Ignis",
        role: "Duelist",
        image: "https://images.unsplash.com/photo-1746003040766-535e55013dae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxmaXJlJTIwYnJhd2xlcnxlbnwwfHx8fDE3NjcwNjY3ODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "fire brawler",
        description: "Un luchador ardiente con puños volcánicos."
    },
    {
        id: "zenith",
        name: "Zenith",
        role: "Controller",
        image: "https://images.unsplash.com/photo-1764413475320-22e3532a49ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHx3aXNlJTIwbW9ua3xlbnwwfHx8fDE3NjcwNjY3ODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "wise monk",
        description: "Un monje sabio que levita con poder sereno."
    },
    {
        id: "void",
        name: "Void",
        role: "Controller",
        image: "https://images.unsplash.com/photo-1759266925025-28ef643c497e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxkaW1lbnNpb25hbCUyMGJlaW5nfGVufDB8fHx8MTc2NzA2Njc4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "dimensional being",
        description: "Un ser misterioso de otra dimensión."
    },
    {
        id: "crag",
        name: "Crag",
        role: "Sentinel",
        image: "https://images.unsplash.com/photo-1713815726796-5149beeb12fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxzdG9uZSUyMGdvbGVtfGVufDB8fHx8MTc2Njk4ODIxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "stone golem",
        description: "Un golem masivo, una fortaleza andante."
    },
    {
        id: "zephyr",
        name: "Zephyr",
        role: "Initiator",
        image: "https://images.unsplash.com/photo-1703243052289-6c7940c3d481?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHx3aW5kJTIwc2NvdXR8ZW58MHx8fHwxNzY3MDY2Nzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "wind scout",
        description: "Un explorador ágil que comanda el viento."
    },
    {
        id: "luna",
        name: "Luna",
        role: "Initiator",
        image: "https://images.unsplash.com/photo-1759545809864-f5f766827780?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxtb29uJTIwaWxsdXNpb25pc3R8ZW58MHx8fHwxNzY3MDY2Nzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        hint: "moon illusionist",
        description: "Una ilusionista que teje hechizos con la luz de la luna."
    }
];

export const SUPER_ARTS: SuperArt[] = [
    // Aether
    { id: "aether-1", characterId: "aether", name: "Estallido Cósmico", description: "Empuja a los enemigos cercanos.", color: "red", roman: "I" },
    { id: "aether-2", characterId: "aether", name: "Corriente Gravitacional", description: "Atrae a los enemigos a un punto.", color: "yellow", roman: "II" },
    { id: "aether-3", characterId: "aether", name: "Singularidad", description: "Crea un agujero negro que daña con el tiempo.", color: "blue", roman: "III" },
    // Onyx
    { id: "onyx-1", characterId: "onyx", name: "Paso Sombrío", description: "Teletranspórtate una corta distancia.", color: "red", roman: "I" },
    { id: "onyx-2", characterId: "onyx", name: "Velo de Sombras", description: "Vuélvete invisible por un corto período.", color: "yellow", roman: "II" },
    { id: "onyx-3", characterId: "onyx", name: "Danza de Cuchillas", description: "Lanza una ráfaga de dagas a tu alrededor.", color: "blue", roman: "III" },
    // Solara
    { id: "solara-1", characterId: "solara", name: "Destello Cegador", description: "Ciega a los enemigos en un cono.", color: "red", roman: "I" },
    { id: "solara-2", characterId: "solara", name: "Llamarada Solar", description: "Crea una barrera de fuego que daña a los enemigos.", color: "yellow", roman: "II" },
    { id: "solara-3", characterId: "solara", name: "Supernova", description: "Una explosión masiva que inflige gran daño.", color: "blue", roman: "III" },
    // Cypher
    { id: "cypher-1", characterId: "cypher", name: "Jaula Cibernética", description: "Ralentiza a los enemigos en un área.", color: "red", roman: "I" },
    { id: "cypher-2", characterId: "cypher", name: "Dron Espía", description: "Revela la posición de los enemigos cercanos.", color: "yellow", roman: "II" },
    { id: "cypher-3", characterId: "cypher", name: "Pulso EMP", description: "Silencia las habilidades de los enemigos por un tiempo.", color: "blue", roman: "III" },
    // Terra
    { id: "terra-1", characterId: "terra", name: "Muro de Piedra", description: "Crea un muro de terreno infranqueable.", color: "red", roman: "I" },
    { id: "terra-2", characterId: "terra", name: "Abrazo de la Naturaleza", description: "Inmoviliza a un enemigo con raíces.", color: "yellow", roman: "II" },
    { id: "terra-3", characterId: "terra", name: "Furia del Bosque", description: "Invoca enredaderas que atacan a los enemigos cercanos.", color: "blue", roman: "III" },
    // Riptide
    { id: "riptide-1", characterId: "riptide", name: "Maremoto", description: "Lanza una ola que derriba a los enemigos.", color: "red", roman: "I" },
    { id: "riptide-2", characterId: "riptide", name: "Vórtice", description: "Crea un remolino que atrae a los enemigos.", color: "yellow", roman: "II" },
    { id: "riptide-3", characterId: "riptide", name: "Tsunami", description: "Una ola masiva que cubre una gran área.", color: "blue", roman: "III" },
    // Ignis
    { id: "ignis-1", characterId: "ignis", name: "Puño Meteoro", description: "Un golpe cargado que atraviesa armaduras.", color: "red", roman: "I" },
    { id: "ignis-2", characterId: "ignis", name: "Anillo de Fuego", description: "Un aura que quema a los enemigos cercanos.", color: "yellow", roman: "II" },
    { id: "ignis-3", characterId: "ignis", name: "Erupción", description: "Golpea el suelo, creando fisuras de lava.", color: "blue", roman: "III" },
    // Zenith
    { id: "zenith-1", characterId: "zenith", name: "Santuario", description: "Crea un área que cura a los aliados.", color: "red", roman: "I" },
    { id: "zenith-2", characterId: "zenith", name: "Meditación Trascendental", description: "Te vuelves inmune al daño temporalmente.", color: "yellow", roman: "II" },
    { id: "zenith-3", characterId: "zenith", name: "Equilibrio Kármico", description: "Redirige un porcentaje del daño recibido a los atacantes.", color: "blue", roman: "III" },
    // Void
    { id: "void-1", characterId: "void", name: "Grieta Dimensional", description: "Crea un portal para el equipo.", color: "red", roman: "I" },
    { id: "void-2", characterId: "void", name: "Horror Inefable", description: "Aterroriza a los enemigos en un área.", color: "yellow", roman: "II" },
    { id: "void-3", characterId: "void", name: "Colapso de la Realidad", description: "Daña y ralentiza a todos los enemigos en el mapa.", color: "blue", roman: "III" },
    // Crag
    { id: "crag-1", characterId: "crag", name: "Embestida Imparable", description: "Carga hacia adelante, derribando enemigos.", color: "red", roman: "I" },
    { id: "crag-2", characterId: "crag", name: "Piel de Granito", description: "Aumenta drásticamente tu armadura.", color: "yellow", roman: "II" },
    { id: "crag-3", characterId: "crag", name: "Terremoto", description: "Golpea el suelo, aturdiendo a los enemigos cercanos.", color: "blue", roman: "III" },
    // Zephyr
    { id: "zephyr-1", characterId: "zephyr", name: "Ráfaga de Viento", description: "Empuja a los enemigos y proyectiles.", color: "red", roman: "I" },
    { id: "zephyr-2", characterId: "zephyr", name: "Corriente Ascendente", description: "Lanza a los aliados o a ti mismo por el aire.", color: "yellow", roman: "II" },
    { id: "zephyr-3", characterId: "zephyr", name: "Ciclón", description: "Invoca un tornado que atrapa a los enemigos.", color: "blue", roman: "III" },
    // Luna
    { id: "luna-1", characterId: "luna", name: "Doppelgänger", description: "Crea un clon de ti mismo para confundir a los enemigos.", color: "red", roman: "I" },
    { id: "luna-2", characterId: "luna", name: "Prisma Lunar", description: "Refracta la luz para hacer invisible a un aliado.", color: "yellow", roman: "II" },
    { id: "luna-3", characterId: "luna", name: "Eclipse Total", description: "Oscurece el mapa, reduciendo la visión de los enemigos.", color: "blue", roman: "III" }
];
