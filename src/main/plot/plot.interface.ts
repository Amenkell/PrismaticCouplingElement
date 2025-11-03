import {CalculationResults} from "../models/prism.interface";

export interface PlotGraphProps {
    results: CalculationResults | null;
    showModesPoints: boolean;
    onGetChartDataUrlRef?: (getter: () => string | null) => void;
    width?: number | string;
    height?: number | string;
    i18n?: {
        title?: string;
        noDataTitle?: string;
        noDataHint?: string;
        xAxis?: string;
        yAxis?: string;
        seriesProfile?: string;
        seriesModes?: string;
        tooltipZUnit?: string; // e.g., 'мкм'
        tooltipDeltaNe?: string; // e.g., 'Δne'
        summaryHeader?: string;
        summaryAlpha?: string;
        summaryGamma?: string;
        summaryN0?: string;
        summaryDeltaN0?: string;
    };
}

export const DEFAULT_I18N = {
    title: 'График профиля Δn\u2091(z)',
    noDataTitle: 'График профиля показателя преломления',
    noDataHint: 'Нажмите "Старт" для выполнения расчёта и построения графика',
    xAxis: 'Глубина z, мкм',
    yAxis: 'Δne',
    seriesProfile: 'Профиль',
    seriesModes: 'Моды',
    tooltipZUnit: 'мкм',
    tooltipDeltaNe: 'Δne',
    summaryHeader: 'Результаты расчёта:',
    summaryAlpha: 'α',
    summaryGamma: 'B/A',
    summaryN0: 'n₀ (поверхность)',
    summaryDeltaN0: 'Δn₀'
} as const;