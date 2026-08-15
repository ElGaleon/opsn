import {Search} from "lucide-react";
import {ReactNode, useEffect, useMemo, useState} from "react";
import {Input} from "@shared/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@app/components/ui/select";

type Filter = {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
};

export function ListFilters({
                                search,
                                onSearch,
                                filters = [],
                                children,
                                placeholder = "Cerca...",
                            }: {
    search: string;
    onSearch: (value: string) => void;
    filters?: Filter[];
    children?: ReactNode;
    placeholder?: string;
}) {
    const [ready, setReady] = useState(false);
    const storageKey = useMemo(
        () =>
            `opsn:filters:${placeholder}:${filters.map((filter) => filter.label).join(",")}`,
        [placeholder, filters],
    );

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (!saved) {
            setReady(true);
            return;
        }
        try {
            const values = JSON.parse(saved) as {
                search?: string;
                filters?: Record<string, string>;
            };
            if (values.search !== undefined) onSearch(values.search);
            filters.forEach((filter) => {
                const value = values.filters?.[filter.label];
                if (value !== undefined) filter.onChange(value);
            });
        } catch {
            localStorage.removeItem(storageKey);
        }
        setReady(true);
    }, [storageKey]);

    useEffect(() => {
        if (!ready) return;
        localStorage.setItem(
            storageKey,
            JSON.stringify({
                search,
                filters: Object.fromEntries(
                    filters.map((filter) => [filter.label, filter.value]),
                ),
            }),
        );
    }, [
        ready,
        storageKey,
        search,
        filters.map((filter) => `${filter.label}:${filter.value}`).join("|"),
    ]);

    return (
        <div className="grid gap-2 sm:flex sm:items-center">
            {children}
            <div className="relative min-w-0 sm:flex-1">
                <Search
                    className="pointer-events-none absolute left-3 top-2.5 text-stone-400"
                    size={16}
                />
                <Input
                    className="pl-9"
                    placeholder={placeholder}
                    value={search}
                    onChange={(event) => onSearch(event.target.value)}
                />
            </div>
            {filters.map((filter) => (
                <Select
                    key={filter.label}
                    value={filter.value}
                    onValueChange={(value) => {
                        if (typeof value === "string") filter.onChange(value);
                    }}
                >
                    <SelectTrigger
                        className="h-9 w-full rounded-md border-emerald-950/10 bg-white/90 px-3 text-stone-900 sm:w-44 sm:flex-none"
                        aria-label={filter.label}
                    >
                        <SelectValue>
                            {(value) =>
                                value === "all"
                                    ? filter.label
                                    : filter.options.find((option) => option.value === value)
                                        ?.label
                            }
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>{filter.label}</SelectLabel>
                            {filter.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            ))}
        </div>
    );
}
