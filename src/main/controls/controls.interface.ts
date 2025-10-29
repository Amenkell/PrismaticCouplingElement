export interface ControlledInputProps {
    value: number | string | boolean;
    propertyName: string;
    onChange: (name: string, value: number | string | boolean) => void;
    title: string;
    placeholder?: string;
    disabled?: boolean;
}