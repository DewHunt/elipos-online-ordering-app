import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-order-submit-message',
  templateUrl: './order-submit-message.component.html',
  styleUrls: ['./order-submit-message.component.scss'],
})
export class OrderSubmitMessageComponent implements OnInit {
  isOrderSuccess: boolean = false;
  message: string = '';
  orderType: string = '';
  shopName: string = '';

  constructor(
    private modalController: ModalController,
    private router: Router
  ) {}

  ngOnInit() {}

  closeModal() {
    this.router.navigate(['/menu'], { replaceUrl: true });
    // this.navController.navigateForward('menu', {
    //   state: { isOrderSubmited: true },
    // });
    this.modalController.dismiss();
  }
}
