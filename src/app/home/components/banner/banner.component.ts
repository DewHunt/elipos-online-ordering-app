import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { register } from 'swiper/element';
import { environment } from './../../../../environments/environment';

register();
@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent implements OnInit {
  promoOffers: any = [];
  bannerImages: any = [];
  showSlider = false;
  slideOpts = {
    slidesPerView: 1,
    autoplay: true,
    speed: 500,
    paginationClickable: true,
    pagination: {
      el: '.swiper-pagination',
    },
  };
  constructor(private modalController: ModalController) {}

  async ngOnInit() {
    console.log('this.promoOffers: ', this.promoOffers);
    this.getBannerImageLists(this.promoOffers);
  }

  closeModal() {
    this.modalController.dismiss();
  }

  getBannerImageLists(promoOffers) {
    if (promoOffers.length > 0) {
      this.promoOffers.forEach((offer) => {
        this.bannerImages.push({
          imagePath: `${environment.webUrl + offer.apps_image}`,
        });
      });
    }
  }
}
