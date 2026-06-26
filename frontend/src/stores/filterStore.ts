import { create } from 'zustand';

export interface DateRange {
  from: string;
  to: string;
}

export interface DomainFilters {
  [key: string]: string | number | boolean | string[] | undefined;
}

interface FilterState {
  globalDateRange: DateRange;
  globalDistrict: string;
  crimeFilters: DomainFilters;
  cyberFilters: DomainFilters;
  mapFilters: DomainFilters;
  networkFilters: DomainFilters;
  setGlobalDateRange: (range: DateRange) => void;
  setGlobalDistrict: (district: string) => void;
  setCrimeFilters: (filters: DomainFilters) => void;
  setCyberFilters: (filters: DomainFilters) => void;
  setMapFilters: (filters: DomainFilters) => void;
  setNetworkFilters: (filters: DomainFilters) => void;
  resetFilters: () => void;
}

const initialFilters = {
  globalDateRange: { from: '2026-01-01', to: '2026-06-24' },
  globalDistrict: 'All Karnataka',
  crimeFilters: {},
  cyberFilters: {},
  mapFilters: {},
  networkFilters: {},
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialFilters,
  setGlobalDateRange: (globalDateRange) => set({ globalDateRange }),
  setGlobalDistrict: (globalDistrict) => set({ globalDistrict }),
  setCrimeFilters: (crimeFilters) => set((state) => ({ crimeFilters: { ...state.crimeFilters, ...crimeFilters } })),
  setCyberFilters: (cyberFilters) => set((state) => ({ cyberFilters: { ...state.cyberFilters, ...cyberFilters } })),
  setMapFilters: (mapFilters) => set((state) => ({ mapFilters: { ...state.mapFilters, ...mapFilters } })),
  setNetworkFilters: (networkFilters) => set((state) => ({ networkFilters: { ...state.networkFilters, ...networkFilters } })),
  resetFilters: () => set(initialFilters),
}));
