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
                    const text = formatResultsAsText(inputParams, calculationResults.prismResults);
                    const blob = new Blob([text], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `prism-results-${new Date().toISOString().split('T')[0]}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
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
              <PlotGraph results={calculationResults} showModesPoints={settings?.modesPoints ?? false}/>
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
