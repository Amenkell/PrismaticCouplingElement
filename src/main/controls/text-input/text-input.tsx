import React, {memo, useId} from "react";
import './text-input.css';

interface TextInputProps {
    value: string | undefined;
    propertyName?: string;
    onChange: (name: string, value: string) => void;
    title: string;
    placeholder?: string;
    disabled?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ value, propertyName, onChange, title, placeholder, disabled }) => {
    const id = useId();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        const property = propertyName ?? '';
        onChange(property, raw);
    };

    return (
        <label className="input-label" htmlFor={id}>
            {title}
            <input
                id={id}
                type="text"
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={disabled}
            />
        </label>
    );
};

export default memo(TextInput);