import {
    setFilters,
    setViewMode,
    toggleFiltersFullOpen,
    type FiltersState,
} from '@/state';
import { useAppDispatch, useAppSelector } from '@/state/redux';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { debounce } from 'lodash';
import { Button } from '@/components/ui/button';
import { cn, formatPriceValue } from '@/lib/utils';
import { Filter, Grid, List, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PropertyTypeIcons } from '@/lib/constants';

function FiltersBar() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathName = usePathname();
    const filters = useAppSelector((state) => state.global.filters);
    const isFiltersFullOpen = useAppSelector(
        (state) => state.global.isFiltersFullOpen,
    );
    const viewMode = useAppSelector((state) => state.global.viewMode);

    // const viewMode = useAppSelector((state) => state.global.viewMode);
    const [searchInput, setSearchInput] = React.useState(filters.location);
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
                const index = isMin ? 0 : 1;
                currentArrayRange[index] =
                    value === 'any' ? null : Number(value);
            }
            newValue = currentArrayRange;
        } else if (key === 'coordinates') {
            newValue = value === 'any' ? [0, 0] : value.map(Number);
        } else {
            newValue = value === 'any' ? 'any' : value;
        }

        const newFilters = { ...filters, [key]: newValue };
        dispatch(setFilters(newFilters));
        updateURL(newFilters);
    };
    return (
        <div className="flex justify-between items-center w-full py-5">
            {/* Filters */}
            <div className="flex justify-between items-center gap-4 p-2">
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

                {/* Search Location */}
                <div className="flex items-center">
                    <Input
                        placeholder="Search location..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-40 rounded-l-xl rounded-r-none border-primary-400 border-r-0 focus:border-primary-500 focus:ring-0 focus:outline-none hover:border-primary-500 hover:ring-0"
                    />
                    <Button
                        className="rounded-l-none rounded-r-xl border-primary-400 border-l-none shadow-none border hover:bg-primary-700 hover:text-primary-50"
                        // onClick={() => {
                        //     handleFilterChange('location', searchInput, null);
                        // }}
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                </div>

                {/* Price Range */}
                <div className="flex gap-1">
                    {/* Minimum Price Selector */}
                    <Select
                        value={filters.priceRange[0]?.toString() || 'any'}
                        onValueChange={(value) =>
                            handleFilterChange('priceRange', value, true)
                        }
                    >
                        <SelectTrigger className="w-22 rounded-xl border-primary-400">
                            <SelectValue>
                                {formatPriceValue(filters.priceRange[0], true)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="any">Any Min Price</SelectItem>
                            {[500, 1000, 1500, 2000, 3000, 5000, 10000].map(
                                (price) => (
                                    <SelectItem
                                        key={price}
                                        value={price.toString()}
                                    >
                                        ${price / 1000}k+
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>

                    {/* Maximum Price Selector */}
                    <Select
                        value={filters.priceRange[1]?.toString() || 'any'}
                        onValueChange={(value) =>
                            handleFilterChange('priceRange', value, false)
                        }
                    >
                        <SelectTrigger className="w-22 rounded-xl border-primary-400">
                            <SelectValue>
                                {formatPriceValue(filters.priceRange[1], false)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="any">Any Max Price</SelectItem>
                            {[1000, 2000, 3000, 5000, 10000].map((price) => (
                                <SelectItem
                                    key={price}
                                    value={price.toString()}
                                >
                                    &lt;${price / 1000}k
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Beds and Baths */}
                <div className="flex gap-1">
                    {/* Beds */}
                    <Select
                        value={filters.beds}
                        onValueChange={(value) =>
                            handleFilterChange('beds', value, null)
                        }
                    >
                        <SelectTrigger className="w-26 rounded-xl border-primary-400">
                            <SelectValue placeholder="Beds" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="any">Any Beds</SelectItem>
                            <SelectItem value="1">1+ bed</SelectItem>
                            <SelectItem value="2">2+ beds</SelectItem>
                            <SelectItem value="3">3+ beds</SelectItem>
                            <SelectItem value="4">4+ beds</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Baths */}
                    <Select
                        value={filters.baths}
                        onValueChange={(value) =>
                            handleFilterChange('baths', value, null)
                        }
                    >
                        <SelectTrigger className="w-26 rounded-xl border-primary-400">
                            <SelectValue placeholder="Baths" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="any">Any Baths</SelectItem>
                            <SelectItem value="1">1+ bath</SelectItem>
                            <SelectItem value="2">2+ baths</SelectItem>
                            <SelectItem value="3">3+ baths</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Property Type */}
                    <Select
                        value={filters.propertyType || 'any'}
                        onValueChange={(value) =>
                            handleFilterChange('propertyType', value, null)
                        }
                    >
                        <SelectTrigger className="w-32 rounded-xl border-primary-400">
                            <SelectValue placeholder="Home Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="any">
                                Any Property Type
                            </SelectItem>
                            {Object.entries(PropertyTypeIcons).map(
                                ([type, Icon]) => (
                                    <SelectItem key={type} value={type}>
                                        <div className="flex items-center">
                                            <Icon className="w-4 h-4 mr-2" />
                                            <span>{type}</span>
                                        </div>
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {/* View Mode */}
            <div className="flex justify-between items-center gap-4 p-2">
                <div className="flex border rounded-xl">
                    <Button
                        variant="ghost"
                        className={cn(
                            'px-3 py-1 rounded-none rounded-l-xl hover:bg-primary-600 hover:text-primary-50',
                            viewMode === 'list'
                                ? 'bg-primary-700 text-primary-50'
                                : '',
                        )}
                        onClick={() => dispatch(setViewMode('list'))}
                    >
                        <List className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn(
                            'px-3 py-1 rounded-none rounded-r-xl hover:bg-primary-600 hover:text-primary-50',
                            viewMode === 'grid'
                                ? 'bg-primary-700 text-primary-50'
                                : '',
                        )}
                        onClick={() => dispatch(setViewMode('grid'))}
                    >
                        <Grid className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default FiltersBar;
