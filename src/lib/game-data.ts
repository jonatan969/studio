'use client';
import { Swords, BrainCircuit, Shield, Zap } from 'lucide-react';

export const ROLES = {
  DUELIST: { name: 'Duelist', icon: Swords },
  CONTROLLER: { name: 'Controller', icon: BrainCircuit },
  SENTINEL: { name: 'Sentinel', icon: Shield },
  INITIATOR: { name: 'Initiator', icon: Zap },
};

export type CharacterRole = keyof typeof ROLES;

// Estos datos ahora se cargan desde Firestore. Este archivo se mantiene solo para
// la definición de ROLES y los tipos, pero los arrays de CHARACTERS y SUPER_ARTS están vacíos.
// La data real vive en las colecciones /characters y /super_arts en Firestore.
