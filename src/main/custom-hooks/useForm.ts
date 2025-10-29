import {useState} from "react";
import {UseFormReturn} from "../settings-plot/graph.interface";

const useForm = <T extends object>(initialValues: T): UseFormReturn<T> => {
    const [values, setValues] = useState<T>(initialValues);

    const handleChange = <K extends keyof T>(name: K, value: T[K]): void => {
        setValues(prev => ({
            ...prev,
            [name]: value,
        } as T));
    };

    const resetForm = (): void => {
        setValues(initialValues);
    };

    return {
        values,
        handleChange,
        resetForm,
        setValues
    };
};

export default useForm;