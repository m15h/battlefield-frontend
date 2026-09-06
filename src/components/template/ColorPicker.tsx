interface ColorPickerProps {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ colors, value, onChange }: ColorPickerProps) {
  return (
    <div
      className="bf-colorpicker"
      role="radiogroup"
      aria-label="Ship color"
    >
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={color === value}
          className={`bf-colorpicker__swatch${
            color === value ? " bf-colorpicker__swatch--active" : ""
          }`}
          style={{ background: color }}
          onClick={() => onChange(color)}
          title={color}
        />
      ))}
    </div>
  );
}
