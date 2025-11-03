import React, { useEffect } from 'react';
import './graph-settings.css';
import {GraphSettingsProps, GraphSettingsType} from "./graph.interface";
import NumberInput from "../controls/number-input/number-input";
import useForm from "../custom-hooks/useForm";
import Checkbox from "../controls/checkbox/checkbox";
import CustomButton from "../controls/button/button";
import {buttonVariants} from "../controls/button/button.interface";

const GraphSettings: React.FC<GraphSettingsProps> = ({onSettingsChange}) => {

    const { values, handleChange, resetForm } = useForm<GraphSettingsType>({
        prism: 1172400,
        alfa: 0.51,
        BA: 0.01,
        substrate: 1772544,
        reflectedIndexPrism: 2.5445,
        volume: 1174204,
        poliarization: false,
        modesPoints: false,
    });

    useEffect(() => {
        onSettingsChange?.(values);
    }, [values, onSettingsChange]);

    const handleNumberChange = (name: string, value: number | string) => {
        handleChange(name as keyof GraphSettingsType, value as any);
    };
    const handleBooleanChange = (name: string, value: boolean) => {
        handleChange(name as keyof GraphSettingsType, value as any);
    };

    return (
        <div className="graph-settings">
            <div className="settings-header">
                <h3>Настройки графика</h3>
                <CustomButton
                    onClick={resetForm} variant={buttonVariants.danger}>
                    Сбросить
                </CustomButton>
            </div>

            <div className="settings-grid">
                {/* Секция основных параметров */}
                <div className="settings-section">
                    <h4>Основные параметры</h4>

                    <div className="setting-group">
                        <Checkbox
                            value={values.poliarization}
                            onChange={handleBooleanChange}
                            propertyName={'poliarization'}
                            title={`Поляризация ${values.poliarization ? 'TM' : 'TE'}`}
                        />
                    </div>

                    <div className="setting-group">
                        <Checkbox
                            value={values.modesPoints}
                            onChange={handleBooleanChange}
                            propertyName={'modesPoints'}
                            title={'Точки построения'}
                        />
                    </div>
                </div>

                {/* Секция текстовых настроек */}
                <div className="settings-section">
                    <h4>Настройки параметров</h4>

                    <div className="setting-group">
                        <NumberInput
                            value={values.reflectedIndexPrism}
                            propertyName={'reflectedIndexPrism'}
                            onChange={handleNumberChange}
                            title={'ПП призмы'}
                            step={"any"}
                        />
                    </div>

                    <div className="setting-group">
                        <NumberInput
                            value={values.substrate}
                            propertyName={'substrate'}
                            onChange={handleNumberChange}
                            title={'Подложка'}
                        />
                    </div>

                    <div className="setting-group">
                        <NumberInput
                            value={values.prism}
                            propertyName={'prism'}
                            onChange={handleNumberChange}
                            title={'Призма'}
                        />
                    </div>

                    <div className="setting-group">
                        <NumberInput
                            value={values.volume}
                            propertyName={'volume'}
                            onChange={handleNumberChange}
                            title={'Объём'}
                        />
                    </div>
                </div>

                {/* Секция числовых параметров */}
                <div className="settings-section">
                    <h4>Дополнительные данные</h4>

                    <div className="setting-group">
                        <NumberInput
                            value={values.alfa}
                            propertyName={'alfa'}
                            onChange={handleNumberChange}
                            title={'Alfa'}
                        />
                    </div>

                    <div className="setting-group">
                        <NumberInput
                            value={values.BA}
                            propertyName={'BA'}
                            onChange={handleNumberChange}
                            title={'B/A'}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GraphSettings;