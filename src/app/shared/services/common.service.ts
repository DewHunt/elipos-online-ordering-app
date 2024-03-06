import { Injectable } from '@angular/core';
import {
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    public toastController: ToastController
  ) {}

  async showLoading(message = 'Please Wait!') {
    const loading = await this.loadingController.create({
      message,
      duration: 120000,
      translucent: true,
      cssClass: 'custom-class custom-loading',
    });
    return await loading.present();
  }

  async closeLoading() {
    await this.loadingController.dismiss();
  }

  async connectionAlert() {
    const alert = await this.alertController.create({
      header: 'Connection !',
      message: 'Please connect with you router or network.',
      cssClass: 'connection-alert',
      mode: 'ios',
      backdropDismiss: false,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          },
        },
      ],
    });
    await alert.present();
  }

  async messageAlert(message) {
    const alert = await this.alertController.create({
      header: 'Message',
      message,
      cssClass: 'message-alert',
      mode: 'ios',
      backdropDismiss: false,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          },
        },
      ],
    });
    await alert.present();
  }

  async presentDeleteAlertConfirm() {
    let choice: any;
    const alert = await this.alertController.create({
      header: 'Are Yoy Sure?',
      message: '<strong>You wont be able to revert this!!!</strong>',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            // console.log("Confirm Cancel: blah");
            choice = false;
          },
        },
        {
          text: 'Yes, delete it!',
          handler: () => {
            // console.log("Confirm Okay");
            choice = true;
          },
        },
      ],
    });

    await alert.present();
    await alert.onDidDismiss();
    return choice;
  }

  async showToastMessage(message, time = 2000) {
    const toast = await this.toastController.create({
      message,
      position: 'middle',
      duration: time,
      cssClass: 'toast-order-message',
      buttons: [
        {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
    await toast.present();
  }

  getLoggedInUserInfo() {
    const loggedInUserInfo = JSON.parse(
      localStorage.getItem('loggedInUserInfo')
    );
    return loggedInUserInfo;
  }

  removeLoggedInUserInfo() {
    localStorage.setItem('loggedInUserInfo', null);
  }

  removeOrderService() {
    localStorage.setItem('loggedInUserInfo', null);
  }

  getDateRangeOptions() {
    const dateRange: any[] = [
      { optionName: 'Today', optionValue: 'today' },
      { optionName: 'Yesterday', optionValue: 'yesterday' },
      { optionName: 'This Week', optionValue: 'this_week' },
      { optionName: 'Last Week', optionValue: 'last_week' },
      { optionName: 'Last 7 Days', optionValue: 'last_7_days' },
      { optionName: 'Last 30 Days', optionValue: 'last_30_days' },
      { optionName: 'This Month', optionValue: 'this_month' },
      { optionName: 'Last Month', optionValue: 'last_month' },
    ];

    return dateRange;
  }

  getFirstDayOfCurrentWeekDate() {
    const currentDate: any = new Date();

    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    const firstDayOfCurrentWeek = new Date(currentDate.setDate(diff));

    return firstDayOfCurrentWeek;
  }

  getPreviousDate(date) {
    date.setDate(date.getDate() - 1);
    return date;
  }

  getNextDate(date) {
    date.setDate(date.getDate() + 1);
    return date;
  }

  getTodayDate() {
    const currentDate: any = new Date();
    return currentDate;
  }

  getYeaterdayDate() {
    const currentDate: any = new Date();
    const diff = currentDate.getDate() - 1;
    const yesterdayDate = new Date(currentDate.setDate(diff));

    return yesterdayDate;
  }

  getThisWeekDate() {
    let dataArray: any = {};
    const firstDayOfThisWeek = this.getFirstDayOfCurrentWeekDate();
    const lastDayOfThisWeek = this.getFirstDayOfCurrentWeekDate();
    lastDayOfThisWeek.setDate(lastDayOfThisWeek.getDate() + 6);
    dataArray = {
      firstDayOfThisWeek,
      lastDayOfThisWeek,
    };
    return dataArray;
  }

  getLastWeekDate() {
    let dataArray: any = {};
    const firstDayOfLastWeek = this.getFirstDayOfCurrentWeekDate();
    firstDayOfLastWeek.setDate(firstDayOfLastWeek.getDate() - 7);
    const lastDayOfLastWeek = this.getFirstDayOfCurrentWeekDate();
    lastDayOfLastWeek.setDate(lastDayOfLastWeek.getDate() - 1);
    dataArray = {
      firstDayOfLastWeek,
      lastDayOfLastWeek,
    };
    return dataArray;
  }

  getLast7DaysDate() {
    const startTime: any = new Date();
    const endTime: any = new Date();
    let dataArray: any = {};
    startTime.setDate(startTime.getDate() - 6);

    dataArray = {
      startTime,
      endTime,
    };

    return dataArray;
  }

  getLast30DaysDate() {
    const startTime: any = new Date();
    const endTime: any = new Date();
    let dataArray: any = {};
    startTime.setDate(startTime.getDate() - 29);

    dataArray = {
      startTime,
      endTime,
    };

    return dataArray;
  }

  getThisMonthDate() {
    const currentDate: any = new Date();
    const year: any = currentDate.getFullYear();
    const month: any = currentDate.getMonth();
    let dataArray: any = {};

    const firstDayOfThisMonth = new Date(year, month, 1);
    const lastDayOfThisMonth = new Date(year, month + 1, 0);

    dataArray = {
      firstDayOfThisMonth,
      lastDayOfThisMonth,
    };

    return dataArray;
  }

  getLastMonthDate() {
    const currentDate: any = new Date();
    const year: any = currentDate.getFullYear();
    const month: any = currentDate.getMonth();
    let dataArray: any = {};

    const firstDayOfLastMonth = new Date(year, month - 1, 1);
    const lastDayOfLastMonth = new Date(year, month, 0);

    dataArray = {
      firstDayOfLastMonth,
      lastDayOfLastMonth,
    };

    return dataArray;
  }

  generateRandomString(
    length = 5,
    dashedNumber = 0,
    stringType = 'all',
    userDefCharacters = ''
  ) {
    let characters =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';
    let dashCounter = 0;
    let wordCounter = 0;

    if (stringType == 'num') {
      characters = '0123456789';
    } else if (stringType == 'up') {
      characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    } else if (stringType == 'low') {
      characters = 'abcdefghijklmnopqrstuvwxyz';
    } else if (stringType == 'num-up') {
      characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    } else if (stringType == 'num-low') {
      characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    } else if (stringType == 'up-low') {
      characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    } else if (stringType == 'user-def') {
      characters = userDefCharacters;
    }
    const charactersLength = characters.length;

    if (dashedNumber > 0) {
      while (dashCounter <= dashedNumber) {
        while (wordCounter < length) {
          randomString += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
          wordCounter++;
        }
        if (dashCounter !== dashedNumber) {
          randomString += '-';
        }
        dashCounter++;
        wordCounter = 0;
      }
    } else {
      while (wordCounter < length) {
        randomString += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
        wordCounter++;
      }
    }

    return randomString;
  }
}
