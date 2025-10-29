export interface IFooterActionsProps {
    comment: string;
    onCommentChange: (value: string) => void;
    onButtonClick: (action: ButtonAction) => void;
}

export const ButtonActions = {
    help: 'help',
    download: 'download',
    write: 'write',
    edit: 'edit',
    start: 'start',
} as const;

export type ButtonAction = typeof ButtonActions[keyof typeof ButtonActions];

export type ClickAction = () => void;