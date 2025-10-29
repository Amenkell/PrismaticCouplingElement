import React, {memo} from 'react';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from 'victory';
import {VictoryDataPoint} from "./plot.interface";
import './plot.css';

const PlotGraph: React.FC = () => {

    const data: VictoryDataPoint[] = [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 15 },
        { x: 4, y: 25 },
        { x: 5, y: 18 },
        { x: 6, y: 30 },
    ];

    return (
        <div>
            <h2>График</h2>
            <VictoryChart
                theme={VictoryTheme.material}
                containerComponent={
                    <VictoryVoronoiContainer
                        voronoiDimension="x"
                        labels={({ datum }) => `X: ${datum.x}, Y: ${datum.y}`}
                    />
                }
                width={800}
                height={400}
            >
                <VictoryAxis
                    label="Ось X"
                    tickValues={[1, 2, 3, 4, 5, 6]}
                />
                <VictoryAxis
                    dependentAxis
                    label="Ось Y"
                />
                <VictoryLine
                    data={data}
                    style={{
                        data: { stroke: "#c43a31" },
                        parent: { border: "1px solid #ccc" }
                    }}
                    animate={{
                        duration: 2000,
                        onLoad: { duration: 1000 }
                    }}
                />
            </VictoryChart>
        </div>
    );
};

export default memo(PlotGraph);