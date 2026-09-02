"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";

const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Gujranwala",
  "Sialkot",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Larkana",
  "Abbottabad",
  "Mardan",
  "Mingora",
];

interface CityDropdownProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export default function CityDropdown({
  value,
  onChange,
  required = false,
  disabled = false,
}: CityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredCities = useMemo(() => {
    if (!search.trim()) return PAKISTAN_CITIES;
    const q = search.trim().toLowerCase();
    return PAKISTAN_CITIES.filter((c) => c.toLowerCase().includes(q));
  }, [search]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) item.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setSearch("");
      setHighlightedIndex(-1);
    }
  };

  const handleSelect = (city: string) => {
    onChange(city);
    setIsOpen(false);
    setSearch("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
          handleSelect(filteredCities[highlightedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredCities.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCities.length - 1
          );
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-left flex items-center justify-between transition-colors duration-150 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${isOpen ? "ring-2 ring-[#D8CBB8]" : ""} ${
          value ? "text-[#171717]" : "text-[#96958D]"
        }`}
      >
        <span className="truncate">{value || "Select city"}</span>
        <ChevronDown
          size={16}
          className={`text-[#96958D] transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[60] w-full mt-1 bg-white rounded-lg border border-[#E8E6DF] shadow-lg overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b border-[#E8E6DF]/50">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96958D]" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setHighlightedIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search city..."
                  className="w-full h-9 pl-8 pr-3 rounded-md bg-[#FAFAF7] text-[13px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-1 focus:ring-[#D8CBB8]"
                />
              </div>
            </div>

            {/* City list */}
            <div ref={listRef} className="max-h-[200px] overflow-y-auto">
              {filteredCities.length === 0 ? (
                <div className="px-4 py-3 text-[13px] text-[#96958D]">
                  No cities found
                </div>
              ) : (
                filteredCities.map((city, index) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSelect(city)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-4 py-2.5 text-left text-[13px] cursor-pointer transition-colors ${
                      city === value
                        ? "bg-[#F2EFE8] text-[#171717] font-medium"
                        : highlightedIndex === index
                          ? "bg-[#FAFAF7] text-[#171717]"
                          : "text-[#6F6F69] hover:bg-[#FAFAF7]"
                    }`}
                  >
                    {city}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
