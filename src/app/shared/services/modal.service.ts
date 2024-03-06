import { Injectable, Type } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ComponentRef } from '@ionic/core';
import { ErrorModalComponent } from './../components/error-modal/error-modal.component';
import { InfoModalComponent } from './../components/info-modal/info-modal.component';
import { ErrorResponseInterface } from './../models/error-code';
import {
  ModalComponentPropsInterface,
  ModalContentInterface,
} from './../models/modal';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private isInternetErrorModalOpened = false;
  constructor(private modalCtrl: ModalController, private router: Router) {}

  closeModalById(data: any, role: any, id: string) {
    this.modalCtrl.dismiss(data, role, id);
  }

  /**
   * Show api network error modal message
   *
   * @param errorResponse
   * @memberof ModalService
   */
  async showInfoErrorModal(
    errorResponse: ErrorResponseInterface,
    compProps?: ModalContentInterface
  ): Promise<void> {
    let componentProps: ModalContentInterface = compProps;
    if (!compProps) {
      componentProps = {
        contents: [
          {
            title: 'Error',
            details: [`${errorResponse.message}`],
          },
        ],
        actionButtons: [
          {
            text: 'error-message-module.ok-button',
            cssClass: 'white-button',
            handler: (event) => {
              this.close();
            },
          },
        ],
      };
    }
    this.openInfoModalComponent({ componentProps });
  }

  /**
   * Show api network error modal message
   *
   * @param errorResponse
   * @memberof ModalService
   */
  async showInfoModal(
    errorResponse: ErrorResponseInterface,
    compProps?: ModalContentInterface
  ): Promise<void> {
    let componentProps: ModalContentInterface = compProps;
    if (!compProps) {
      componentProps = {
        contents: [
          {
            title: 'Info',
            details: [`${errorResponse.message}`],
          },
        ],
        actionButtons: [
          {
            text: 'error-message-module.ok-button',
            cssClass: 'white-button',
            handler: (event) => {
              this.close();
            },
          },
        ],
      };
    }
    this.openInfoModalComponent({ componentProps });
  }

  async showAlertModal(
    message: string,
    compProps?: ModalContentInterface
  ): Promise<void> {
    let componentProps: ModalContentInterface = compProps;
    if (!compProps) {
      componentProps = {
        contents: [
          {
            title: 'Alert',
            details: [`${message}`],
          },
        ],
        actionButtons: [
          {
            text: 'Okay',
            cssClass: 'white-button',
            handler: (event) => {
              this.close();
            },
          },
        ],
      };
    }
    this.openInfoModalComponent({ componentProps });
  }

  async showMessageModal(
    message: string,
    pageUrl?: string,
    compProps?: ModalContentInterface
  ): Promise<void> {
    let componentProps: ModalContentInterface = compProps;
    if (!compProps) {
      componentProps = {
        contents: [
          {
            title: 'Message',
            details: [`${message}`],
          },
        ],
        actionButtons: [
          {
            text: 'Okay',
            cssClass: 'white-button',
            handler: (event) => {
              this.close();
            },
          },
        ],
        onDidDismiss: (data) => {
          if (pageUrl) {
            this.router.navigateByUrl(pageUrl, { replaceUrl: true });
          }
        },
      };
    }
    this.openInfoModalComponent({ componentProps });
  }

  async showAttendanceSuccessModal(
    message: string,
    pageUrl?: string,
    compProps?: ModalContentInterface
  ): Promise<void> {
    let componentProps: ModalContentInterface = compProps;
    if (!compProps) {
      componentProps = {
        contents: [
          {
            details: [`${message}`],
          },
        ],
        actionButtons: [
          {
            text: 'Okay',
            cssClass: 'white-button',
            handler: (event) => {
              this.close();
            },
          },
        ],
        onDidDismiss: (data) => {
          if (pageUrl) {
            this.router.navigateByUrl(pageUrl, { replaceUrl: true });
          }
        },
      };
    }
    this.openInfoModalComponent({ componentProps });
  }

  async showErrorTextModal(
    message: string,
    compProps?: ModalContentInterface
  ): Promise<void> {
    let componentProps: ModalContentInterface = compProps;
    if (!compProps) {
      componentProps = {
        contents: [
          {
            title: 'Error',
            details: [`${message}`],
          },
        ],
        actionButtons: [
          {
            text: 'Okay',
            cssClass: '',
            handler: (event) => {
              this.close();
            },
          },
        ],
      };
    }
    this.openInfoModalComponent({ componentProps });
  }

  /**
   * Show dynamic modal based on modal component
   *
   * @param {Type<any>} componentClass
   * @param {ModalContentInterface} [modalContent]
   * @param {} [onDidDismiss]
   * @memberof ModalService
   */
  /* Usage:
  const componentProps: ModalContentInterface = {
  contents: [
  {
  title: 'title',
  details: ['details1','details2'],
  values: { key: value }
  }
  ],
  actionButtons: [
  {
  text: 'text',
  cssClass: 'white-button',
  handler: (event) => {}
  }
  ],
  onDidDismiss: (data) => {}
  };
  openModal(modalComponent, componentProps, onDidDismiss: callback);
  */
  async openModal(
    componentClass: Type<any>,
    modalContent?: ModalContentInterface,
    onDidDismiss?: any
  ): Promise<void> {
    const cssClass = this.getCssClass(componentClass, modalContent);
    const modal = await this.modalCtrl.create({
      component: componentClass as ComponentRef,
      cssClass,
      backdropDismiss: false,
      componentProps: modalContent,
      id: 'common-modal',
    });
    await modal.present();
    modal.onDidDismiss().then((data) => {
      if (onDidDismiss) {
        onDidDismiss(data);
      }
      if (modalContent) {
        if (modalContent.onDidDismiss) {
          modalContent.onDidDismiss(data);
        }
      }
    });
  }

  /**
   * we are using InfoModalComponent for showing all type of app info, error, message modal
   * as a half modal [dynamic height based on content], presented from bottom of the screen
   * Feature wanted:
   * sometime we need to use InfoModalComponent as a fullScreen modal view.
   * Or other custom modal as a half modal
   * Solution: we added an optional property for modalContent as fullScreen,
   * fullScreen: boolean: if true we added full screen class
   *
   * @Caution
This is a fallback scenario function for modalService open modal view style.
   * In future we need to strictly mention fullScreen [true/false] in modalContent.
   * So we can remove this function
   * @param componentClass
   * @param modalContent
   * @returns
   * @memberof ModalService
   */
  getCssClass(
    componentClass: ComponentRef,
    modalContent: ModalContentInterface
  ): string {
    if (!modalContent || modalContent.fullScreen === undefined) {
      if (
        componentClass === InfoModalComponent ||
        componentClass === ErrorModalComponent
      ) {
        return 'modal-height-auto';
      } else {
        return 'full-modal';
      }
    } else {
      if (
        modalContent.fullScreen ||
        (componentClass === InfoModalComponent && modalContent.fullScreen)
      ) {
        return 'full-modal';
      } else if (componentClass === InfoModalComponent) {
        return 'modal-height-auto';
      } else if (componentClass === ErrorModalComponent) {
        return 'modal-height-auto';
      } else {
        return 'modal-height-auto';
      }
    }
  }

  /**
   * Show common info modal [half modal], with modal contents, buttons events, modal events
   *
   * @param {ModalComponentPropsInterface} modalComponentProps
   * @memberof ModalService
   */
  /* Usage:
  const componentProps: ModalContentInterface = {
  contents: [
  {
  title: 'title',
  details: ['details1','details2'],
  values: { key: value }
  }
  ],
  actionButtons: [
  {
  text: 'text',
  cssClass: 'white-button',
  handler: (event) => {}
  }
  ],
  onDidDismiss: (data) => {}
  };
  openInfoModalComponent({componentProps});
  */
  async openInfoModalComponent(
    modalComponentProps: ModalComponentPropsInterface
  ) {
    await this.openModal(
      InfoModalComponent,
      modalComponentProps.componentProps
    );
  }

  async openErrorModalComponent(componentProps: ModalContentInterface) {
    await this.openModal(ErrorModalComponent, componentProps);
  }

  async openInternetConnectErrorMessage() {
    if (this.isInternetErrorModalOpened) {
      return;
    }

    const component = ErrorModalComponent;
    const componentProps = {
      contents: [
        {
          title: 'Error',
          details: [
            `Network not available,Please check your internet connection`,
          ],
        },
      ],
      actionButtons: [
        {
          text: 'Okay',
          cssClass: 'white-button',
          handler: (event) => {
            this.close();
          },
        },
      ],
    };
    const cssClass = this.getCssClass(component, componentProps);
    const modal = await this.modalCtrl.create({
      component: component as ComponentRef,
      cssClass,
      backdropDismiss: false,
      componentProps,
      id: 'internet-error-modal',
    });
    this.isInternetErrorModalOpened = true;
    await modal.present();

    modal.onDidDismiss().then((data) => {
      this.setInternetErrorModalOpened(false);
    });
  }

  setInternetErrorModalOpened(status: boolean) {
    this.isInternetErrorModalOpened = status;
  }
  getInternetErrorModalOpened(): boolean {
    return this.isInternetErrorModalOpened;
  }

  /**
   * Close opened modal
   *
   * @memberof ModalService
   */
  async close(params?: any): Promise<boolean> {
    // There is a need to pass an optional params, that's why added one
    if (params) {
      return this.modalCtrl.dismiss(params);
    }
    await this.modalCtrl.dismiss();
    return false;
  }

  async closeById(id?: string): Promise<boolean> {
    if (id) {
      return this.modalCtrl.dismiss(null, null, id);
    }
    return false;
  }
  /**
   * returns the top overlay of the modal
   *
   * @returns
   * @memberof ModalService
   */
  async getTop(): Promise<HTMLIonModalElement> {
    return await this.modalCtrl.getTop();
  }
}
