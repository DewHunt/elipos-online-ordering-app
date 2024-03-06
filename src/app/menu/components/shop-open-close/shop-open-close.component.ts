import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-shop-open-close',
  templateUrl: './shop-open-close.component.html',
  styleUrls: ['./shop-open-close.component.scss'],
})
export class ShopOpenCloseComponent implements OnInit {
  isShopMaintenanceMode: any;
  isShopClosed: any;
  isShopWeekendOff: any;
  message: any;
  imageUrl: any;
  shopTimingList: any;
  constructor(
    private loaderService: LoaderService,
    private modalController: ModalController,
    private menuService: MenuService
  ) {}

  async ngOnInit() {
    await this.getShopOpenCloseTimeList();
  }

  async getShopOpenCloseTimeList() {
    await this.menuService.getShopOpenCloseTimeList().subscribe({
      next: (result) => {
        this.shopTimingList = result.data;
      },
      error: (error) => {
        console.log('error: ', error);
      },
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  setPreOrder() {
    const isPreOrder = { status: true };
    localStorage.setItem('isPreOrder', JSON.stringify(isPreOrder));
    let data = {
      isPreOrder: true,
    };
    this.modalController.dismiss(data, 'cancel');
  }
}
