import React, {memo} from "react";
import {ISettingsModesProps} from "./settings-modes.interface";
import Checkbox from "../controls/checkbox/checkbox";
import NumberInput from "../controls/number-input/number-input";
import CustomButton from "../controls/button/button";
import './settings-modes.css';

const SettingsModes: React.FC<ISettingsModesProps> = ({modes, modesChange}) => {

    const handleActiveChange = (_name: string, value: boolean, index: number | undefined,) => {
        const updatedModes = modes.map((mode, i) =>
            i === index ? { ...mode, active: value } : mode
        );
        modesChange?.(updatedModes);
    };

    // Обработчик изменения значения режима
    const handleValueChange = (_name: string, value: number, index: number | undefined) => {
        const updatedModes = modes.map((mode, i) =>
            i === index ? { ...mode, value } : mode
        );
        modesChange?.(updatedModes);
    };

    const handleAddMode = () => {
        const mode = {active: false, value: 0};
        const updatedModes = [...modes, mode];
        modesChange?.(updatedModes);
    };

    return (
        <div className={'settings-modes__container'}>
            <div className={'settings-modes__modes-block'}>
                <CustomButton onClick={handleAddMode}>Добавить mode</CustomButton>
                <div>
                    {modes.map((mode, index) => (
                        <div className={'settings-modes__item'} key={index}>
                            <Checkbox title={`Mode ${index + 1}`} value={mode.active} onChange={handleActiveChange} index={index} />
                            <NumberInput value={mode.value} onChange={handleValueChange} index={index} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default memo(SettingsModes);