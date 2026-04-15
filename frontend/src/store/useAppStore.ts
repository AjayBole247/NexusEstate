"use client";

import { create } from "zustand";

type Filters = {
  city: string;
  category: string;
  budget: string;
  beds: string;
};

type User = {
  name: string;
};

type AppState = {
  user: User | null;
  isAuthenticated: boolean;
  filters: Filters;
  wishlist: string[];
  setUser: (user: User | null) => void;
  logout: () => void;
  updateFilters: (values: Partial<Filters>) => void;
  toggleWishlist: (propertyId: string) => void;
  resetFilters: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  filters: {
    city: "",
    category: "Buy",
    budget: "Any",
    beds: "Any",
  },
  wishlist: [],
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateFilters: (values) =>
    set((state) => ({ filters: { ...state.filters, ...values } })),
  toggleWishlist: (propertyId) =>
    set((state) => ({
      wishlist: state.wishlist.includes(propertyId)
        ? state.wishlist.filter((id) => id !== propertyId)
        : [...state.wishlist, propertyId],
    })),
  resetFilters: () =>
    set({
      filters: {
        city: "",
        category: "Buy",
        budget: "Any",
        beds: "Any",
      },
    }),
}));
