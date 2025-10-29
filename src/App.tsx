import React, {useState} from 'react';
import './App.css';
import GraphSettings from "./main/settings-plot/settings-main";
import {GraphSettingsType} from "./main/settings-plot/graph.interface";
import FooterActions from "./main/footer/footer-actions";
import {ButtonAction, ButtonActions} from "./main/footer/footer-actions.interface";
import SettingsModes from "./main/settings-modes/settings-modes";
import {IMode} from "./main/settings-modes/settings-modes.interface";
import PlotGraph from "./main/plot/plot";

const App = () => {

    const [comment, setComment] = useState('');
    const [modes, onChangeModes] = useState<IMode[]>([{value: 0, active: false}]);

  const handleSettingsChange = (newSettings: GraphSettingsType) => {
    console.log('Новые настройки:', newSettings);
  };

    const handleButtonClick = (action: ButtonAction) => {
        switch (action) {
            case ButtonActions.start:
                break;
            case ButtonActions.edit:
                break;
            case ButtonActions.write:
                break;
            case ButtonActions.download:
                break;
            case ButtonActions.help:
                break;
            default:
                break;
        }
    };

  return (
      <div className={'app__body'}>
          <div>
              <h1>График</h1>
              <GraphSettings
                  onSettingsChange={handleSettingsChange}
              />
          </div>
          <div>
              <PlotGraph/>
          </div>
          <div className={'app__action-container'}>
              <SettingsModes modes={modes} modesChange={onChangeModes}/>
              <FooterActions comment={comment} onCommentChange={setComment} onButtonClick={handleButtonClick}/>
          </div>
      </div>
  );
};

export default App;
