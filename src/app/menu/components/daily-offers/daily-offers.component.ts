import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HomeService } from 'src/app/home/services/home.service';
import { LoaderService } from 'src/app/shared/services/loader.service';

@Component({
  selector: 'app-daily-offers',
  templateUrl: './daily-offers.component.html',
  styleUrls: ['./daily-offers.component.scss'],
})
export class DailyOffersComponent implements OnInit {
  dailySpecialOffers: any;
  constructor(
    private loaderService: LoaderService,
    private modalController: ModalController,
    private homeService: HomeService
  ) {}

  async ngOnInit() {
    await this.loaderService.showLoader();
    await this.getDailySpecialOffers();
    await this.loaderService.hideLoader();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  async getDailySpecialOffers() {
    let shopInformation = JSON.parse(localStorage.getItem('shopInfo') || '{}');
    if (shopInformation) {
      this.dailySpecialOffers = shopInformation.dailySpecialOffers;
    }
    console.log('this.dailySpecialOffers: ', this.dailySpecialOffers);
  }
}
