import React, {memo, useId} from "react";
import './checkbox.css';

interface CheckboxProps {
    value: boolean;
    propertyName?: string;
    onChange: (name: string, value: boolean, index?: number) => void;
    title?: string;
    disabled?: boolean;
    index?: number;
}

const Checkbox: React.FC<CheckboxProps> = ({ value, propertyName, onChange, title, disabled, index }) => {
    const id = useId();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        const property = propertyName ?? '';
        onChange(property, checked, index);
    };

    return (
        <label className="checkbox-label" htmlFor={id}>
            <input
                id={id}
                type="checkbox"
                checked={value}
                onChange={handleInputChange}
                disabled={disabled}
            />
            <span className="checkmark"></span>
            {title}
        </label>
    );
};

export default memo(Checkbox);