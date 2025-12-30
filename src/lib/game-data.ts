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

export const TEAM_LOGOS = [
  { id: 'logo-shield', name: 'Shield', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
  { id: 'logo-swords', name: 'Swords', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5 3 6l4-4 14 14-4 4Z"/><path d="m21.5 10.5-4-4"/><path d="m14 7 3-3"/><path d="M9.5 20.5 3 14"/><path d="m17 14-3 3"/></svg>' },
  { id: 'logo-skull', name: 'Skull', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2"/><path d="M16 20a2 2 0 0 0 2 2h.5a.5.5 0 0 0 .5-.5V19a2 2 0 0 0-2-2h-1"/><path d="M3.5 13.9a.5.5 0 0 1-.5.5H2a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1.5a.5.5 0 0 1 .5.5Z"/><path d="M20.5 13.9a.5.5 0 0 0 .5.5H22a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-1.5a.5.5 0 0 0-.5.5Z"/></svg>'},
  { id: 'logo-bolt', name: 'Bolt', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>'},
];
