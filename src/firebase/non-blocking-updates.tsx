'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export async function setDocument(docRef: DocumentReference, data: any, options: SetOptions) {
  try {
    await setDoc(docRef, data, options);
  } catch(error: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', // or 'create'/'update' based on options
        requestResourceData: data,
      })
    )
    // Re-throw the original error to be caught by the caller
    throw error;
  }
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Returns the Promise for the new doc ref.
 */
export async function addDocument(colRef: CollectionReference, data: any) {
  try {
    const docRef = await addDoc(colRef, data);
    return docRef;
  } catch(error: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: data,
      })
    )
    throw error;
  }
}


/**
 * Initiates an updateDoc operation for a document reference.
 */
export async function updateDocument(docRef: DocumentReference, data: any) {
  try {
    await updateDoc(docRef, data);
  } catch(error: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data,
      })
    )
    throw error;
  }
}


/**
 * Initiates a deleteDoc operation for a document reference.
 */
export async function deleteDocument(docRef: DocumentReference) {
  try {
    await deleteDoc(docRef);
  } catch(error: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      })
    )
    throw error;
  }
}
