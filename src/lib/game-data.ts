'use client';
import { PlaceHolderImages } from './placeholder-images';
import { Swords, BrainCircuit, Shield, Zap } from 'lucide-react';

export const ROLES = {
  DUELIST: { name: 'Duelist', icon: Swords },
  CONTROLLER: { name: 'Controller', icon: BrainCircuit },
  SENTINEL: { name: 'Sentinel', icon: Shield },
  INITIATOR: { name: 'Initiator', icon: Zap },
};

export type CharacterRole = keyof typeof ROLES;

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  image: string;
  hint: string;
  description: string;
}

export const CHARACTERS: Character[] = [
  { id: 'char-aether', name: 'Aether', role: 'DUELIST', image: PlaceHolderImages.find(p => p.id === 'char-aether')?.imageUrl!, hint: 'cosmic warrior', description: 'A stoic warrior cloaked in cosmic energy' },
  { id: 'char-onyx', name: 'Onyx', role: 'DUELIST', image: PlaceHolderImages.find(p => p.id === 'char-onyx')?.imageUrl!, hint: 'shadow rogue', description: 'A shadowy rogue with glowing daggers' },
  { id: 'char-solara', name: 'Solara', role: 'CONTROLLER', image: PlaceHolderImages.find(p => p.id === 'char-solara')?.imageUrl!, hint: 'sun mage', description: 'A radiant mage wielding the power of the sun' },
  { id: 'char-cypher', name: 'Cypher', role: 'CONTROLLER', image: PlaceHolderImages.find(p => p.id === 'char-cypher')?.imageUrl!, hint: 'tech operative', description: 'A high-tech operative with holographic displays' },
  { id: 'char-terra', name: 'Terra', role: 'SENTINEL', image: PlaceHolderImages.find(p => p.id === 'char-terra')?.imageUrl!, hint: 'nature guardian', description: 'A guardian of nature, covered in moss and stone' },
  { id: 'char-riptide', name: 'Riptide', role: 'INITIATOR', image: PlaceHolderImages.find(p => p.id === 'char-riptide')?.imageUrl!, hint: 'water fighter', description: 'A swift fighter who controls water' },
  { id: 'char-ignis', name: 'Ignis', role: 'DUELIST', image: PlaceHolderImages.find(p => p.id === 'char-ignis')?.imageUrl!, hint: 'fire brawler', description: 'A fiery brawler with volcanic fists' },
  { id: 'char-zenith', name: 'Zenith', role: 'SENTINEL', image: PlaceHolderImages.find(p => p.id === 'char-zenith')?.imageUrl!, hint: 'wise monk', description: 'A wise monk who levitates with serene power' },
  { id: 'char-void', name: 'Void', role: 'CONTROLLER', image: PlaceHolderImages.find(p => p.id === 'char-void')?.imageUrl!, hint: 'dimensional being', description: 'A mysterious being from another dimension' },
  { id: 'char-crag', name: 'Crag', role: 'SENTINEL', image: PlaceHolderImages.find(p => p.id === 'char-crag')?.imageUrl!, hint: 'stone golem', description: 'A massive golem, a walking fortress' },
  { id: 'char-zephyr', name: 'Zephyr', role: 'INITIATOR', image: PlaceHolderImages.find(p => p.id === 'char-zephyr')?.imageUrl!, hint: 'wind scout', description: 'An agile scout who commands the wind' },
  { id: 'char-luna', name: 'Luna', role: 'INITIATOR', image: PlaceHolderImages.find(p => p.id === 'char-luna')?.imageUrl!, hint: 'moon illusionist', description: 'An illusionist who weaves moonlight into spells' },
];

export interface SuperArt {
  id: string;
  name: string;
  description: string;
  color: string;
  roman: string;
}

export const SUPER_ARTS: SuperArt[] = [
  { id: 'super-1', name: 'Galactic Fury', description: 'Unleash a torrent of cosmic energy, dealing massive damage to a single target.', color: 'yellow', roman: 'I' },
  { id: 'super-2', name: 'Temporal Shift', description: 'Rewind time by 3 seconds, resetting health, position, and cooldowns.', color: 'red', roman: 'II' },
  { id: 'super-3', name: 'Aegis Protocol', description: 'Create an unbreakable shield around your entire team for 5 seconds.', color: 'blue', roman: 'III' },
];
