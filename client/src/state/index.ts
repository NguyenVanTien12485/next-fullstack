import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
export interface FiltersState {
    location: string;
    beds: string;
    baths: string;
    propertyType: string;
    amenities: string[];
    availableFrom: string;
    priceRange: [number, number] | [null, null];
    squareFeet: [number, number] | [null, null];
    coordinates: [number, number];
}

interface InitialStateTypes {
    filters: FiltersState;
    isFiltersFullOpen: boolean;
    viewMode: 'grid' | 'list';
}

export const initialState: InitialStateTypes = {
    filters: {
        location: 'Los Angeles',
        beds: 'any',
        baths: 'any',
        propertyType: 'any',
        amenities: [],
        availableFrom: 'any',
        priceRange: [null, null],
        squareFeet: [null, null],
        coordinates: [-118.25, 34.05], // Default coordinates for Los Angeles
    },
    isFiltersFullOpen: false,
    viewMode: 'grid', // Default view mode
};

export const globalSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        toggleFiltersFullOpen: (state) => {
            state.isFiltersFullOpen = !state.isFiltersFullOpen;
        },
        setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
            state.viewMode = action.payload;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
    },
});

export const { setFilters, toggleFiltersFullOpen, setViewMode, resetFilters } =
    globalSlice.actions;

export default globalSlice.reducer;
