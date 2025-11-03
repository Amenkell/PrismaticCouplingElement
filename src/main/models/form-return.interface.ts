import React from "react";

export interface UseFormReturn<T> {
    values: T;
    handleChange: <K extends keyof T>(name: K, value: T[K]) => void;
    resetForm: () => void;
    setValues: React.Dispatch<React.SetStateAction<T>>;
}