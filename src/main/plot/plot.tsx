import React, {memo, useEffect, useMemo, useRef} from 'react';
import ReactECharts from 'echarts-for-react';
import {PlotGraphProps} from "./plot.interface";
import './plot.css';

const PlotGraph: React.FC<PlotGraphProps> = ({ results, showModesPoints, onGetChartDataUrlRef }) => {
    const chartRef = useRef<ReactECharts>(null);

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
                name: 'Профиль',
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
                name: 'Моды',
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
                formatter: (params: any) => {
                    if (Array.isArray(params) && params.length > 0) {
                        const param = params[0];
                        if (param.value && Array.isArray(param.value) && param.value.length >= 2) {
                            return `z: ${param.value[0].toFixed(3)} мкм<br/>Δne: ${param.value[1].toFixed(6)}`;
                        }
                    }
                    return '';
                }
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
                name: 'Глубина z, мкм',
                nameLocation: 'middle' as const,
                nameGap: 35,
                nameTextStyle: {
                    fontSize: 14
                }
            },
            yAxis: {
                type: 'value' as const,
                name: 'Δne',
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
    }, [results, showModesPoints]);

    useEffect(() => {
        if (!onGetChartDataUrlRef) return;
        onGetChartDataUrlRef(() => {
            const inst = chartRef.current?.getEchartsInstance?.();
            if (!inst) return null;
            try {
                return inst.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#ffffff' });
            } catch (e) {
                return null;
            }
        });
    }, [onGetChartDataUrlRef, chartOption]);

    // Отображаем заглушку если нет данных
    if (!hasData) {
        return (
            <div>
                <h2>График профиля показателя преломления</h2>
                <div style={{ 
                    width: '800px', 
                    height: '400px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9'
                }}>
                    <p style={{ color: '#666', fontSize: '16px' }}>
                        Нажмите "Старт" для выполнения расчёта и построения графика
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2>График профиля Δn<sub>e</sub>(z)</h2>
            {results && results.prismResults && (
                <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                    <strong>Результаты расчёта:</strong>
                    <div>α = {results.prismResults.calculatedAlpha.toFixed(4)}</div>
                    <div>B/A = {results.prismResults.calculatedGamma.toFixed(4)}</div>
                    <div>n₀ (поверхность) = {results.prismResults.n0.toFixed(4)}</div>
                    <div>Δn₀ = {(results.prismResults.N[0] - results.NeNeff).toFixed(6)}</div>
                </div>
            )}
            <ReactECharts
                ref={chartRef as any}
                option={chartOption}
                style={{ width: '1200px', height: '600px' }}
                opts={{ renderer: 'canvas' }}
                notMerge={true}
            />
        </div>
    );
};

export default memo(PlotGraph);