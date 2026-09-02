"use client";

interface SizeOption {
  label: string;
  value: string;
}

interface SizeSelectorProps {
  options: SizeOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function SizeSelector({
  options,
  selected,
  onChange,
}: SizeSelectorProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-all cursor-pointer ${
              isSelected
                ? "bg-[#171717] text-white border-[#171717]"
                : "bg-[#FAFAF7] text-[#6F6F69] border-[#E8E6DF] hover:border-[#D8CBB8] hover:bg-[#F2EFE8]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
