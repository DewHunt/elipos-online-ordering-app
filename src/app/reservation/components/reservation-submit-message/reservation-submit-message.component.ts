import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-reservation-submit-message',
  templateUrl: './reservation-submit-message.component.html',
  styleUrls: ['./reservation-submit-message.component.scss'],
})
export class ReservationSubmitMessageComponent implements OnInit {
  pageTitle: string = '';
  shopName: string = '';

  constructor(
    private modalController: ModalController,
    private router: Router
  ) {}

  ngOnInit() {}

  closeModal() {
    // this.router.navigate(['/reservation'], { replaceUrl: true });
    this.modalController.dismiss({}, 'cancle');
  }
}
