import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  isLoaderSaw: boolean = false;
  loading: HTMLIonLoadingElement;

  constructor(private loadingController: LoadingController) {}

  async showLoader(message = 'Please Wait...') {
    // console.log('From Loader Service: Show Loader: ', message);
    if (this.isLoaderSaw === false) {
      this.loading = await this.loadingController.create({
        spinner: 'circles',
        message,
        translucent: true,
        cssClass: 'custom-class custom-loading',
        backdropDismiss: false,
      });
      await this.loading.present();
      this.isLoaderSaw = true;
    }
  }

  async hideLoader(whereFrom = 0) {
    // console.log('From Loader Service: Hide Loader From', whereFrom);
    if (this.isLoaderSaw === true) {
      await this.loading.dismiss();
      this.isLoaderSaw = false;
    }
  }
}
