// Типы для настроек
import React from "react";

export interface GraphSettingsType {
    prism: number;
    alfa: number;
    BA: number;
    substrate: number;
    reflectedIndexPrism: number;
    volume: number;
    poliarization: boolean;
    modesPoints: boolean;
}

// Пропсы компонента
export interface GraphSettingsProps {
    onSettingsChange?: (settings: GraphSettingsType) => void;
}

export interface UseFormReturn<T> {
    values: T;
    handleChange: <K extends keyof T>(name: K, value: T[K]) => void;
    resetForm: () => void;
    setValues: React.Dispatch<React.SetStateAction<T>>;
}