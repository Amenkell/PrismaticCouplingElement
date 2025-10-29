export interface ISettingsModes {
    modes: IMode[];
}

export interface ISettingsModesProps {
    modes: IMode[];
    modesChange: (modes: IMode[]) => void;
}

export interface IMode {
    value: number;
    active: boolean;
}