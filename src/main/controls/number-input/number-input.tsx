import React, {memo, useId} from "react";
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

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        const next: number = raw === "" ? 0 : Number(raw);
        const property = propertyName ?? '';
        onChange(property, next, index);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        if (raw === "") {
            // on blur, normalize empty to NaN or 0 as needed; here we choose 0 for simplicity
            const property = propertyName ?? '';
            onChange(property, 0);
        }
    };

    return (
        <label className="input-label" htmlFor={id}>
            {title}
            <input
                id={id}
                type="number"
                value={value}
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