import React, {useState, useCallback, useRef} from 'react';
import './App.css';
import ModalAlert from './main/ui/modal-alert/modal-alert';
import UpdateOverlay from './main/ui/update-overlay/update-overlay';
import {useAutoUpdater} from './main/custom-hooks/useAutoUpdater';
import GraphSettings from "./main/settings-plot/settings-main";
import {GraphSettingsType} from "./main/settings-plot/graph.interface";
import FooterActions from "./main/footer/footer-actions";
import {ButtonAction, ButtonActions} from "./main/footer/footer-actions.interface";
import SettingsModes from "./main/settings-modes/settings-modes";
import {IMode} from "./main/settings-modes/settings-modes.interface";
import PlotGraph from "./main/plot/plot";
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import {calculatePrismCoupling} from "./main/utils/prism-calculations";
import {calculateNeffFromAngles, parseIfDMS} from "./main/utils/angle-to-neff";
import {CalculationResults, PrismInputParams} from "./main/models/prism.interface";
import {getAppVersion, getAppVersionAsync} from "./main/utils/app-version";

const App = () => {
    const { updateStatus, isUpdating, checkCompleted } = useAutoUpdater();
    const [appVersion, setAppVersion] = useState<string>(getAppVersion());

    // Получаем актуальную версию асинхронно при монтировании
    React.useEffect(() => {
        getAppVersionAsync().then(version => {
            if (version) {
                setAppVersion(version);
            }
        });
    }, []);

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

  // Получение изображения графика из PlotGraph (через ref, чтобы не терять между рендерами)
  const chartGetterRef = useRef<(() => string | null) | null>(null);
  const handleChartGetterRef = useCallback((getter: any) => {
    chartGetterRef.current = getter || null;
  }, []);

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
    }, [settings, modes, showAlert]);

    const exportResults = useCallback(async () => {
        if (!(calculationResults && calculationResults.prismResults && settings)) return;
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

        const modesSheetData = [['z (мкм)', 'Neff Modes']];
        for (let i = 0; i < results.zm.length; i++) {
            const zVal = results.zm[i].toFixed(6);
            const dneVal = results.Nm[i].toFixed(6);
            modesSheetData.push([zVal, dneVal]);
        }
        const wsModes = XLSX.utils.aoa_to_sheet(modesSheetData);

        const profileSheetData = [['z (мкм)', 'Δne']];
        for (let i = 0; i < results.z.length; i++) {
            const zVal = results.z[i].toFixed(6);
            const dneVal = (results.N[i] - inputParams.Ne).toFixed(6);
            profileSheetData.push([zVal, dneVal]);
        }
        const wsProfile = XLSX.utils.aoa_to_sheet(profileSheetData);

        const chartDataUrl = chartGetterRef.current ? chartGetterRef.current() : null;
        const fileName = `prism-results-${new Date().toISOString().split('T')[0]}.xlsx`;

        if (chartDataUrl) {
            const wb = new ExcelJS.Workbook();
            const ws1 = wb.addWorksheet('Summary');
            const ws2 = wb.addWorksheet('Modes');
            const ws3 = wb.addWorksheet('Profile');
            ws1.addRows(summaryData);
            ws2.addRows(modesSheetData);
            ws3.addRows(profileSheetData);
            const wsChart = wb.addWorksheet('Chart');
            const imageId = wb.addImage({ base64: chartDataUrl, extension: 'png' });
            wsChart.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 1200, height: 600 } });
            const buffer = await wb.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = fileName; a.click();
            URL.revokeObjectURL(url);
        } else {
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
            XLSX.utils.book_append_sheet(wb, wsModes, 'Modes');
            XLSX.utils.book_append_sheet(wb, wsProfile, 'Profile');
            XLSX.writeFile(wb, fileName);
        }
    }, [calculationResults, settings, modes]);

    const handleButtonClick = useCallback((action: ButtonAction) => {
        switch (action) {
            case ButtonActions.start:
                performCalculation();
                break;
            case ButtonActions.edit:
                setCalculationResults(null);
                break;
            case ButtonActions.upload:
                exportResults();
                break;
            case ButtonActions.download:
                exportResults();
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
    }, [performCalculation, exportResults, showAlert]);

  return (
      <div className={'app__body'}>
          {isUpdating && <UpdateOverlay status={updateStatus} />}
          {!checkCompleted && !isUpdating && (
              <UpdateOverlay status={{ isChecking: true, isDownloading: false, isInstalling: false }} />
          )}
          {checkCompleted && !isUpdating && (
              <>
                  <div>
                      <div className="app__header">
                          <h1>Расчёт призменного элемента связи</h1>
                          <span className="app__version">v{appVersion}</span>
                      </div>
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
              </>
          )}
      </div>
  );
};

export default App;
