import {CalculationResults} from "../models/prism.interface";

export interface PlotGraphProps {
    results: CalculationResults | null;
    showModesPoints: boolean;
    onGetChartDataUrlRef?: (getter: () => string | null) => void;
}