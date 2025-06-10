import { setFilters, toggleFiltersFullOpen, type FiltersState } from '@/state';
import { useAppDispatch, useAppSelector } from '@/state/redux';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { debounce } from 'lodash';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';

function FiltersBar() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathName = usePathname();
    const filters = useAppSelector((state) => state.global.filters);
    const isFiltersFullOpen = useAppSelector(
        (state) => state.global.isFiltersFullOpen,
    );

    // const viewMode = useAppSelector((state) => state.global.viewMode);
    // const [searchInput, setSearchInput] = React.useState(filters.location);
    const updateURL = debounce((newFilters: FiltersState) => {
        const cleanedFilters = Object.fromEntries(
            Object.entries(newFilters).filter(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ([_, value]) => value !== null && value !== 'any',
            ),
        );
        const udateSearchParams = new URLSearchParams();

        Object.entries(cleanedFilters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                udateSearchParams.set(key, value.join(','));
            } else {
                udateSearchParams.set(key, String(value));
            }
        });
        router.push(`${pathName}?${udateSearchParams.toString()}`);
    }, 300);
    const handleFilterChange = (
        key: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any,
        isMin: boolean | null,
    ) => {
        let newValue = value;
        if (key === 'priceRange' || key === 'squareFeet') {
            const currentArrayRange = [...filters[key]];
            if (isMin !== null) {
                if (isMin) {
                    const index = isMin ? 0 : 1;
                    currentArrayRange[index] =
                        value === 'any' ? null : Number(value);
                } else {
                    currentArrayRange[1] = value;
                }
                newValue = currentArrayRange;
            }
        } else if (key === 'coordinates') {
            newValue = value === 'any' ? [0, 0] : value.map(Number);
        } else {
            newValue = value === 'any' ? null : value;
        }

        const newFilters = {
            ...filters,
            [key]: newValue,
        };
        dispatch(setFilters(newFilters));
        updateURL(newFilters);
    };
    return (
        <div className="flex justify-center items-center w-full py-5">
            {/* Filters */}
            <div className="flex justify-center items-center gap-4 p-2">
                {/* All Filters */}
                <Button
                    variant="outline"
                    className={cn(
                        'gap-2 rounded-xl border-primary-400 hover:bg-primary-500 hover:text-primary-100',
                        isFiltersFullOpen && 'bg-primary-700 text-primary-100',
                    )}
                    onClick={() => {
                        dispatch(toggleFiltersFullOpen());
                    }}
                >
                    <Filter className="h-4 w-4" />
                    <span>All Filters</span>
                </Button>
            </div>
        </div>
    );
}

export default FiltersBar;
