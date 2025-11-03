import React, {useState, useCallback} from 'react';
import './App.css';
import ModalAlert from './main/ui/modal-alert/modal-alert';
import GraphSettings from "./main/settings-plot/settings-main";
import {GraphSettingsType} from "./main/settings-plot/graph.interface";
import FooterActions from "./main/footer/footer-actions";
import {ButtonAction, ButtonActions} from "./main/footer/footer-actions.interface";
import SettingsModes from "./main/settings-modes/settings-modes";
import {IMode} from "./main/settings-modes/settings-modes.interface";
import PlotGraph from "./main/plot/plot";
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import {calculatePrismCoupling, formatResultsAsText} from "./main/utils/prism-calculations";
import {calculateNeffFromAngles, parseIfDMS} from "./main/utils/angle-to-neff";
import {CalculationResults, PrismInputParams} from "./main/models/prism.interface";

const App = () => {

    const [comment, setComment] = useState('');
    const [modes, onChangeModes] = useState<IMode[]>([
        {value: 1043420, active: true},
        {value: 1111046, active: true},
        {value: 1152642, active: true}
    ]);
    const [settings, setSettings] = useState<GraphSettingsType | null>(null);
    const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState<string | undefined>(undefined);
    const [alertMessage, setAlertMessage] = useState<React.ReactNode>('');

    const showAlert = useCallback((message: React.ReactNode, title?: string) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertOpen(true);
    }, []);

  const handleSettingsChange = (newSettings: GraphSettingsType) => {
        setSettings(newSettings);
    };

  // Получение изображения графика из PlotGraph
  let getChartDataUrl: (() => string | null) | null = null;
  const handleChartGetterRef = (getter: () => string | null) => {
    getChartDataUrl = getter;
  };

    const performCalculation = useCallback(() => {
        if (!settings) {
            showAlert('Настройки не заданы', 'Ошибка');
            return;
        }

        // Собираем активные моды
        let activeModes = modes.filter(m => m.active).map(m => m.value);
        
        if (activeModes.length < 2) {
            showAlert('Необходимо минимум 2 активные моды для расчёта', 'Ошибка');
            return;
        }

        const nPrism = settings.reflectedIndexPrism;
        const prismAngle = parseIfDMS(settings.prism);
        const NeAngle = parseIfDMS(settings.substrate);
        const volumeAngle = parseIfDMS(settings.volume);
        const modeAngles = activeModes.map(m => parseIfDMS(m));

        // Конвертируем углы мод в Neff и NeNeff
        const [modesNeff, NeNeff] = calculateNeffFromAngles(
            modeAngles,
            NeAngle,
            prismAngle,
            volumeAngle,
            nPrism
        );

        // Используем распарсенные значения для расчёта
        const inputParams: PrismInputParams = {
            nPrism: settings.reflectedIndexPrism,
            modesNeff: modesNeff,
            Ne: NeNeff,
            alpha: settings.alfa,
            gamma: settings.BA,
            polarization: settings.poliarization
        };

        try {
            const results = calculatePrismCoupling(inputParams);

            setCalculationResults({
                NeNeff: NeNeff,
                prismResults: results,
                isCalculated: true,
                timestamp: new Date()
            });

        } catch (error) {
            showAlert('Ошибка при расчёте: ' + (error as Error).message, 'Ошибка');
        }
    }, [settings, modes]);

    const handleButtonClick = (action: ButtonAction) => {
        switch (action) {
            case ButtonActions.start:
                performCalculation();
                break;
            case ButtonActions.edit:
                setCalculationResults(null);
                break;
            case ButtonActions.write:
                if (calculationResults && calculationResults.prismResults && settings) {
                    const activeModes = modes.filter(m => m.active).map(m => m.value);
                    const inputParams: PrismInputParams = {
                        nPrism: settings.reflectedIndexPrism,
                        modesNeff: activeModes,
                        Ne: calculationResults.NeNeff,
                        alpha: settings.alfa,
                        gamma: settings.BA,
                        polarization: settings.poliarization
                    };

                    const results = calculationResults.prismResults;

                    // Summary sheet
                    const summaryData = [
                        ['Дата', new Date().toLocaleString()],
                        ['Поляризация', inputParams.polarization ? 'TM' : 'TE'],
                        ['Neff (активные моды)', inputParams.modesNeff.join(', ')],
                        ['Ne (подложка)', inputParams.Ne],
                        ['n0 (поверхность)', results.n0],
                        ['α (степень)', results.calculatedAlpha],
                        ['B/A', results.calculatedGamma],
                        ['Ошибка', results.error]
                    ];
                    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

                    // Modes sheet (zm, Δne for modes)
                    const modesSheetData = [['z (мкм)', 'Δne']];
                    for (let i = 0; i < results.zm.length; i++) {
                        const zVal = results.zm[i].toFixed(6);
                        const dneVal = (results.Nm[i] - inputParams.Ne).toFixed(6);
                        modesSheetData.push([zVal, dneVal]);
                    }
                    const wsModes = XLSX.utils.aoa_to_sheet(modesSheetData);

                    // Profile sheet (z, Δne profile) – ограничим до первых 2000 точек для веса
                    const profileSheetData = [['z (мкм)', 'Δne']];
                    const maxRows = Math.min(results.z.length, 2000);
                    for (let i = 0; i < maxRows; i++) {
                        const zVal = results.z[i].toFixed(6);
                        const dneVal = (results.N[i] - inputParams.Ne).toFixed(6);
                        profileSheetData.push([zVal, dneVal]);
                    }
                    const wsProfile = XLSX.utils.aoa_to_sheet(profileSheetData);

                    // Если доступно изображение графика – используем exceljs, чтобы встроить картинку
                    const chartDataUrl = typeof getChartDataUrl === 'function' ? getChartDataUrl() : null;
                    if (chartDataUrl) {
                        const wb = new ExcelJS.Workbook();
                        const ws1 = wb.addWorksheet('Summary');
                        const ws2 = wb.addWorksheet('Modes');
                        const ws3 = wb.addWorksheet('Profile');

                        ws1.addRows(summaryData);
                        ws2.addRows(modesSheetData);
                        ws3.addRows(profileSheetData);

                        // Добавляем картинку на отдельный лист Chart
                        const wsChart = wb.addWorksheet('Chart');
                        const imageId = wb.addImage({
                            base64: chartDataUrl,
                            extension: 'png'
                        });
                        wsChart.addImage(imageId, {
                            tl: { col: 0, row: 0 },
                            ext: { width: 1200, height: 600 }
                        });

                        const fileName = `prism-results-${new Date().toISOString().split('T')[0]}.xlsx`;
                        wb.xlsx.writeBuffer().then((buffer) => {
                            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = fileName;
                            a.click();
                            URL.revokeObjectURL(url);
                        });
                    } else {
                        // Fallback: SheetJS без графика
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
                        XLSX.utils.book_append_sheet(wb, wsModes, 'Modes');
                        XLSX.utils.book_append_sheet(wb, wsProfile, 'Profile');
                        const fileName = `prism-results-${new Date().toISOString().split('T')[0]}.xlsx`;
                        XLSX.writeFile(wb, fileName);
                    }
                }
                break;
            case ButtonActions.download:
                handleButtonClick(ButtonActions.write);
                break;
            case ButtonActions.help:
                showAlert(
                    (
                        <div>
                            <div>Программа расчёта призменного элемента связи</div>
                            <br/>
                            <div><strong>Порядок работы:</strong></div>
                            <ol>
                                <li>Настройте параметры (ПП призмы, подложка, объём)</li>
                                <li>Задайте моды (значения Neff)</li>
                                <li>
                                    Задайте α и B/A:
                                    <ul>
                                        <li>α = -100, B/A = 0: автооптимизация обоих</li>
                                        <li>α = значение, B/A = 0: оптимизация B/A</li>
                                        <li>α = значение, B/A = значение: фиксированные</li>
                                    </ul>
                                </li>
                                <li>Нажмите «Старт» для расчёта</li>
                                <li>Используйте «Записать» для экспорта результатов</li>
                            </ol>
                        </div>
                    ),
                    'Справка'
                );
                break;
            default:
                break;
        }
    };

  return (
      <div className={'app__body'}>
          <div>
              <h1>Расчёт призменного элемента связи</h1>
              <GraphSettings
                  onSettingsChange={handleSettingsChange}
              />
          </div>
          <div>
              <PlotGraph
                  results={calculationResults}
                  showModesPoints={settings?.modesPoints ?? false}
                  onGetChartDataUrlRef={handleChartGetterRef}
              />
          </div>
          <div className={'app__action-container'}>
              <SettingsModes modes={modes} modesChange={onChangeModes}/>
              <FooterActions comment={comment} onCommentChange={setComment} onButtonClick={handleButtonClick}/>
          </div>
          <ModalAlert
              open={alertOpen}
              title={alertTitle}
              message={alertMessage}
              onClose={() => setAlertOpen(false)}
          />
      </div>
  );
};

export default App;
