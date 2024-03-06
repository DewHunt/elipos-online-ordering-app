export interface ContentInterface {
  title?: string;
  details?: string[];
  values?: { [key: string]: string };
}

export interface ButtonInterface {
  text: string;
  params?: { [key: string]: string | number };
  cssClass?: string;
  disabled?: boolean;
  handler: ($event) => void;
}

export interface ModalContentInterface {
  title?: string;
  fullScreen?: boolean;
  contents?: ContentInterface[];
  actionButtons?: ButtonInterface[];
  onDidDismiss?: (data) => void;
  data?: any;
}

export interface ModalComponentPropsInterface {
  componentProps: ModalContentInterface;
}
