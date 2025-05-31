'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-context';

// Define types
type Advertiser = {
  id: string;
  name: string;
  image: string;
};

type FavoriteNote = {
  advertiserId: string;
  note: string;
  createdAt: string;
};

type FavoriteCollection = {
  id: string;
  name: string;
  advertisers: string[]; // Array of advertiser IDs
};

type FavoritesContextType = {
  favorites: string[]; // Array of advertiser IDs
  collections: FavoriteCollection[];
  notes: FavoriteNote[];
  addToFavorites: (advertiserId: string) => void;
  removeFromFavorites: (advertiserId: string) => void;
  isFavorite: (advertiserId: string) => boolean;
  createCollection: (name: string) => void;
  deleteCollection: (collectionId: string) => void;
  renameCollection: (collectionId: string, newName: string) => void;
  addToCollection: (collectionId: string, advertiserId: string) => void;
  removeFromCollection: (collectionId: string, advertiserId: string) => void;
  isInCollection: (collectionId: string, advertiserId: string) => boolean;
  addNote: (advertiserId: string, note: string) => void;
  updateNote: (advertiserId: string, note: string) => void;
  deleteNote: (advertiserId: string) => void;
  getNote: (advertiserId: string) => FavoriteNote | undefined;
};

// Create the context with default values
const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  collections: [],
  notes: [],
  addToFavorites: () => {},
  removeFromFavorites: () => {},
  isFavorite: () => false,
  createCollection: () => {},
  deleteCollection: () => {},
  renameCollection: () => {},
  addToCollection: () => {},
  removeFromCollection: () => {},
  isInCollection: () => false,
  addNote: () => {},
  updateNote: () => {},
  deleteNote: () => {},
  getNote: () => undefined,
});

// Create the provider component
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [collections, setCollections] = useState<FavoriteCollection[]>([]);
  const [notes, setNotes] = useState<FavoriteNote[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      try {
        const storedFavorites = localStorage.getItem(`favorites-${user.id}`);
        const storedCollections = localStorage.getItem(`collections-${user.id}`);
        const storedNotes = localStorage.getItem(`notes-${user.id}`);

        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }

        if (storedCollections) {
          setCollections(JSON.parse(storedCollections));
        } else {
          // Create a default collection
          const defaultCollection = {
            id: 'default',
            name: 'Favorites',
            advertisers: [],
          };
          setCollections([defaultCollection]);
          localStorage.setItem(`collections-${user.id}`, JSON.stringify([defaultCollection]));
        }

        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        // Reset to defaults if there's an error
        setFavorites([]);
        setCollections([{ id: 'default', name: 'Favorites', advertisers: [] }]);
        setNotes([]);
      }
    } else {
      // Reset when user is not logged in
      setFavorites([]);
      setCollections([]);
      setNotes([]);
    }
  }, [user]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem(`favorites-${user.id}`, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  // Save collections to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem(`collections-${user.id}`, JSON.stringify(collections));
    }
  }, [collections, user]);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem(`notes-${user.id}`, JSON.stringify(notes));
    }
  }, [notes, user]);

  // Add an advertiser to favorites
  const addToFavorites = (advertiserId: string) => {
    if (!favorites.includes(advertiserId)) {
      setFavorites([...favorites, advertiserId]);
    }
  };

  // Remove an advertiser from favorites
  const removeFromFavorites = (advertiserId: string) => {
    setFavorites(favorites.filter(id => id !== advertiserId));

    // Also remove from all collections
    setCollections(
      collections.map(collection => ({
        ...collection,
        advertisers: collection.advertisers.filter(id => id !== advertiserId),
      })),
    );

    // Remove any notes
    setNotes(notes.filter(note => note.advertiserId !== advertiserId));
  };

  // Check if an advertiser is in favorites
  const isFavorite = (advertiserId: string) => {
    return favorites.includes(advertiserId);
  };

  // Create a new collection
  const createCollection = (name: string) => {
    const newCollection = {
      id: `collection-${Date.now()}`,
      name,
      advertisers: [],
    };
    setCollections([...collections, newCollection]);
  };

  // Delete a collection
  const deleteCollection = (collectionId: string) => {
    setCollections(collections.filter(collection => collection.id !== collectionId));
  };

  // Rename a collection
  const renameCollection = (collectionId: string, newName: string) => {
    setCollections(
      collections.map(collection =>
        collection.id === collectionId ? { ...collection, name: newName } : collection,
      ),
    );
  };

  // Add an advertiser to a collection
  const addToCollection = (collectionId: string, advertiserId: string) => {
    setCollections(
      collections.map(collection =>
        collection.id === collectionId && !collection.advertisers.includes(advertiserId)
          ? { ...collection, advertisers: [...collection.advertisers, advertiserId] }
          : collection,
      ),
    );

    // Also add to favorites if not already there
    if (!favorites.includes(advertiserId)) {
      setFavorites([...favorites, advertiserId]);
    }
  };

  // Remove an advertiser from a collection
  const removeFromCollection = (collectionId: string, advertiserId: string) => {
    setCollections(
      collections.map(collection =>
        collection.id === collectionId
          ? {
              ...collection,
              advertisers: collection.advertisers.filter(id => id !== advertiserId),
            }
          : collection,
      ),
    );
  };

  // Check if an advertiser is in a collection
  const isInCollection = (collectionId: string, advertiserId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection ? collection.advertisers.includes(advertiserId) : false;
  };

  // Add a note to an advertiser
  const addNote = (advertiserId: string, note: string) => {
    const newNote = {
      advertiserId,
      note,
      createdAt: new Date().toISOString(),
    };
    setNotes([...notes, newNote]);

    // Also add to favorites if not already there
    if (!favorites.includes(advertiserId)) {
      setFavorites([...favorites, advertiserId]);
    }
  };

  // Update a note
  const updateNote = (advertiserId: string, note: string) => {
    setNotes(
      notes.map(n =>
        n.advertiserId === advertiserId ? { ...n, note, createdAt: new Date().toISOString() } : n,
      ),
    );
  };

  // Delete a note
  const deleteNote = (advertiserId: string) => {
    setNotes(notes.filter(note => note.advertiserId !== advertiserId));
  };

  // Get a note for an advertiser
  const getNote = (advertiserId: string) => {
    return notes.find(note => note.advertiserId === advertiserId);
  };

  const value = {
    favorites,
    collections,
    notes,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    createCollection,
    deleteCollection,
    renameCollection,
    addToCollection,
    removeFromCollection,
    isInCollection,
    addNote,
    updateNote,
    deleteNote,
    getNote,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

// Create a hook to use the favorites context
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
