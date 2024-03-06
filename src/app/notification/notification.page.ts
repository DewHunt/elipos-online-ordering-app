import { Component, OnInit } from '@angular/core';
import { IonicSlides } from '@ionic/angular';
import { HomeService } from './../home/services/home.service';
import { LoaderService } from './../shared/services/loader.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {
  pageInfo: any;
  pageTitle = 'News/Offers';
  notifications: any = [];
  headerImage: string = './../../assets/notification-page-header.png';
  noNotificationMessage: boolean = false;
  sliderImages: any[] = [];
  swiperModules = [IonicSlides];

  constructor(
    private homeService: HomeService,
    private loaderService: LoaderService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    this.pageInfo = await this.homeService.getPageByComponentName(
      'NotificationPage'
    );
    this.pageTitle = this.pageInfo
      ? this.pageInfo.title.toUpperCase()
      : this.pageTitle;
    await this.getNotificationSliderImages();
    await this.getNotificationInfo();
  }

  doRefresh(event) {
    this.getNotificationInfo();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async getNotificationInfo() {
    await this.loaderService.showLoader();
    this.notificationService.getNotificationInfo().subscribe({
      next: async (result) => {
        this.notifications = result['notifications'];
        console.log('this.notifications: ', this.notifications);

        if (this.notifications.length > 0) {
          this.noNotificationMessage = false;
        } else {
          this.noNotificationMessage = true;
        }
        console.log('this.noNotificationMessage: ', this.noNotificationMessage);
        await this.loaderService.hideLoader();
      },
      error: async (error) => {
        console.log('error: ', error);
        await this.loaderService.hideLoader();
      },
    });
  }

  async getNotificationSliderImages() {
    this.notificationService.getNotificationImages().subscribe({
      next: (results) => {
        this.sliderImages = results.images;
        console.log('this.sliderImages: ', this.sliderImages);
      },
      error: (error) => {
        console.log('error: ', error);
      },
    });
  }
}
