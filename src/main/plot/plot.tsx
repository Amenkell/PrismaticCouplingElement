import React, {memo, useEffect, useMemo, useRef, useCallback} from 'react';
import ReactECharts from 'echarts-for-react';
import type { ECharts } from 'echarts';
import {DEFAULT_I18N, PlotGraphProps} from "./plot.interface";
import './plot.css';

function formatTooltip(params: any, zUnit: string, deltaLabel: string): string {
    if (Array.isArray(params) && params.length > 0) {
        const param = params[0];
        if (param.value && Array.isArray(param.value) && param.value.length >= 2) {
            return `z: ${Number(param.value[0]).toFixed(3)} ${zUnit}<br/>${deltaLabel}: ${Number(param.value[1]).toFixed(6)}`;
        }
    }
    return '';
}

const PlotGraph: React.FC<PlotGraphProps> = ({ results, showModesPoints, onGetChartDataUrlRef, width = '100%', height = '60vh', i18n }) => {
    const strings = useMemo(() => ({ ...DEFAULT_I18N, ...(i18n || {}) }), [i18n]);
    const echartsInstanceRef = useRef<ECharts | null>(null);

    // Формируем данные для графика из результатов расчёта
    const { hasData, chartOption } = useMemo(() => {
        if (!results || !results.prismResults) {
            return {
                profileData: [],
                modesData: [],
                hasData: false,
                chartOption: {}
            };
        }

        const { z, N, zm, Nm } = results.prismResults;
        const Ne = results.NeNeff;

        // Данные профиля: z (глубина) vs ΔN (разность показателей преломления)
        // Фильтруем NaN и Infinity
        // Фильтруем отрицательные z
        let profileData: number[][] = z
            .map((zi, i) => [Number(zi), Number(N[i] - Ne)])
            .filter(point => 
                isFinite(point[0]) && 
                isFinite(point[1]) && 
                !isNaN(point[0]) && 
                !isNaN(point[1]) &&
                point[0] >= 0
            );
        
        // Сортируем по x для правильного отображения линии
        profileData.sort((a, b) => a[0] - b[0]);

        // Данные мод
        const modesData: number[][] = zm
            .map((zi, i) => [Number(zi), Number(Nm[i] - Ne)])
            .filter(point => 
                isFinite(point[0]) && 
                isFinite(point[1]) && 
                !isNaN(point[0]) && 
                !isNaN(point[1])
            );

        // Конфигурация ECharts
        const series: Array<{
            name: string;
            type: 'line' | 'scatter';
            data: number[][];
            smooth?: boolean;
            symbol?: string;
            symbolSize?: number;
            lineStyle?: { color: string; width: number };
            itemStyle?: { color: string };
        }> = [
            {
                name: strings.seriesProfile,
                type: 'line',
                data: profileData,
                smooth: true,
                symbol: 'none',
                lineStyle: {
                    color: '#2196F3',
                    width: 2
                },
                itemStyle: {
                    color: '#2196F3'
                }
            }
        ];

        if (showModesPoints && modesData.length > 0) {
            series.push({
                name: strings.seriesModes,
                type: 'scatter',
                data: modesData,
                symbolSize: 10,
                itemStyle: {
                    color: '#F44336'
                }
            });
        }

        const option = {
            tooltip: {
                trigger: 'axis' as const,
                axisPointer: {
                    type: 'cross' as const
                },
                formatter: (params: any) => formatTooltip(params, strings.tooltipZUnit, strings.tooltipDeltaNe)
            },
            grid: {
                left: '80px',
                right: '50px',
                top: '50px',
                bottom: '50px',
                containLabel: false
            },
            xAxis: {
                type: 'value' as const,
                name: strings.xAxis,
                nameLocation: 'middle' as const,
                nameGap: 35,
                nameTextStyle: {
                    fontSize: 14
                }
            },
            yAxis: {
                type: 'value' as const,
                name: strings.yAxis,
                nameLocation: 'middle' as const,
                nameGap: 55,
                nameTextStyle: {
                    fontSize: 14
                }
            },
            series: series
        };

        return {
            hasData: true,
            chartOption: option
        };
    }, [results, showModesPoints, strings]);

    useEffect(() => {
        if (!onGetChartDataUrlRef) return;
        const getter = () => {
            const inst = echartsInstanceRef.current;
            if (!inst) return null;
            try {
                return inst.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#ffffff' });
            } catch {
                return null;
            }
        };
        onGetChartDataUrlRef(getter);
        return () => {
            try { onGetChartDataUrlRef(null as any); } catch {}
        };
    }, [onGetChartDataUrlRef]);

    const handleChartReady = useCallback((inst: ECharts) => {
        echartsInstanceRef.current = inst;
    }, []);

    // Отображаем заглушку если нет данных
    if (!hasData) {
        return (
            <div>
                <h2>{strings.noDataTitle}</h2>
                <div style={{ 
                    width: typeof width === 'number' ? `${width}px` : width,
                    height: typeof height === 'number' ? `${height}px` : height,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9'
                }}>
                    <p style={{ color: '#666', fontSize: '16px' }}>{strings.noDataHint}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2>{strings.title}</h2>
            {results && results.prismResults && (
                <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                    <strong>{strings.summaryHeader}</strong>
                    <div>{strings.summaryAlpha} = {results.prismResults.calculatedAlpha.toFixed(4)}</div>
                    <div>{strings.summaryGamma} = {results.prismResults.calculatedGamma.toFixed(4)}</div>
                    <div>{strings.summaryN0} = {results.prismResults.n0.toFixed(4)}</div>
                    <div>{strings.summaryDeltaN0} = {(results.prismResults.N[0] - results.NeNeff).toFixed(6)}</div>
                </div>
            )}
            <ReactECharts
                onChartReady={handleChartReady}
                option={chartOption}
                style={{ 
                    width: typeof width === 'number' ? `${width}px` : width,
                    height: typeof height === 'number' ? `${height}px` : height
                }}
                opts={{ renderer: 'canvas' }}
                notMerge={true}
            />
        </div>
    );
};

export default memo(PlotGraph);