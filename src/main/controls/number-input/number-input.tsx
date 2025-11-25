import React, {memo, useId, useState} from "react";
import './number-input.css';

interface NumberInputProps {
    value: number;
    propertyName?: string;
    onChange: (name: string, value: number, index?: number) => void;
    title?: string;
    placeholder?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number | "any";
    index?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({ value, propertyName, onChange, title, placeholder, disabled, min, max, step, index }) => {
    const id = useId();
    const [displayValue, setDisplayValue] = useState<string>(value.toString());

    const parseNumber = (str: string): number => {
        if (str === "" || str === "-" || str === ".") return NaN;
        // Заменяем запятую на точку для корректного парсинга
        const normalized = str.replace(/,/g, '.');
        return parseFloat(normalized);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        setDisplayValue(raw);

        const parsed = parseNumber(raw);
        if (!isNaN(parsed)) {
            const property = propertyName ?? '';
            onChange(property, parsed, index);
        }
    };

    const handleBlur = () => {
        const parsed = parseNumber(displayValue);
        let finalValue = isNaN(parsed) ? 0 : parsed;

        if (min !== undefined && finalValue < min) finalValue = min;
        if (max !== undefined && finalValue > max) finalValue = max;

        const property = propertyName ?? '';
        onChange(property, finalValue, index);

        setDisplayValue(formatDisplay(finalValue));
    };

    const formatDisplay = (num: number): string => {
        if (isNaN(num)) return "";

        return num.toString();
    };

    return (
        <label className="input-label" htmlFor={id}>
            {title}
            <input
                id={id}
                type="text"
                value={displayValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                max={max}
                step={step}
                inputMode="decimal"
            />
        </label>
    );
};

export default memo(NumberInput);