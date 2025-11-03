import React, {memo} from "react";
import {
    ButtonAction,
    ButtonActions,
    IFooterActionsProps
} from "./footer-actions.interface";
import TextInput from "../controls/text-input/text-input";
import CustomButton from "../controls/button/button";
import {buttonVariants} from "../controls/button/button.interface";
import './footer-actions.css';

const FooterActions: React.FC<IFooterActionsProps> = ({comment, onCommentChange, onButtonClick}) => {

    const handleTextChange = (name: string, value: string) => {
        onCommentChange(value);
    };

    const handleButtonAction = (action: ButtonAction) => {
        onButtonClick(action);
    };

    return (
        <div className={'footer-actions__container'}>
            <TextInput title={'Комментарий к файлу'} value={comment} onChange={handleTextChange} />
            <div className={'footer-actions__buttons'}>
                <CustomButton
                    onClick={() => handleButtonAction(ButtonActions.help)} variant={buttonVariants.primary}>
                    Помощь
                </CustomButton>
                <CustomButton
                    onClick={() => handleButtonAction(ButtonActions.upload)} variant={buttonVariants.primary}>
                    Загрузить
                </CustomButton>
                <CustomButton
                    onClick={() => handleButtonAction(ButtonActions.download)} variant={buttonVariants.primary}>
                    Скачать
                </CustomButton>
                <CustomButton
                    onClick={() => handleButtonAction(ButtonActions.edit)} variant={buttonVariants.primary}>
                    Отредактировать
                </CustomButton>
                <CustomButton
                    onClick={() => handleButtonAction(ButtonActions.start)} variant={buttonVariants.primary}>
                    Старт
                </CustomButton>
            </div>
        </div>
    )
}

export default memo(FooterActions);