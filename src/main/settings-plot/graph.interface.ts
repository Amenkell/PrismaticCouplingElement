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

export interface GraphSettingsProps {
    onSettingsChange?: (settings: GraphSettingsType) => void;
}