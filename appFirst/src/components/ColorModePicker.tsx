import { Palette } from "lucide-react";
import { colorModes, type ColorMode } from "@/hooks/useColorMode";
import { cn } from "@/lib/utils";

interface ColorModePickerProps {
  mode: ColorMode;
  onModeChange: (mode: ColorMode) => void;
}

const ColorModePicker = ({ mode, onModeChange }: ColorModePickerProps) => {
  return (
    <div className="rounded-2xl bg-card/80 border border-border p-3 sm:p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4 text-primary" />
        <h3 className="font-heading text-sm font-semibold">Color Mode</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {colorModes.map((option) => (
          <button
            key={option.value}
            onClick={() => onModeChange(option.value)}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
              "hover:border-primary hover:-translate-y-0.5",
              mode === option.value
                ? "border-primary bg-primary text-primary-foreground shadow-glow"
                : "border-border bg-secondary text-secondary-foreground",
            )}
          >
            <span className="mr-1">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorModePicker;
