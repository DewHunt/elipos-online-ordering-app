import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-view-order',
  templateUrl: './view-order.component.html',
  styleUrls: ['./view-order.component.scss'],
})
export class ViewOrderComponent implements OnInit {
  order: any;
  orderDetails: any;
  dealDetails: any;
  deliverOrCollectionTimeLabel: string = '';
  deliverOrCollectionTime: string = '';
  momentJs: any = moment;

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    console.log('this.order: ', this.order);

    if (this.order) {
      this.orderDetails = this.order.order_details;
      this.dealDetails = this.order.dealDetails;

      if (this.order.order_type == 'delivery') {
        this.deliverOrCollectionTimeLabel = 'Delivery Time';
        if (this.order.delivery_time == '0000-00-00 00:00:00') {
          this.deliverOrCollectionTime = 'ASAP/1 hour';
        } else {
          this.deliverOrCollectionTime = this.momentJs(
            this.order.delivery_time
          ).format('DD/MM/YYYY, h:mm a');
        }
      } else {
        this.deliverOrCollectionTimeLabel = 'Collection Time';

        if (this.order.delivery_time == '0000-00-00 00:00:00') {
          this.deliverOrCollectionTime = 'ASAP/30 mins';
        } else {
          this.deliverOrCollectionTime = this.momentJs(
            this.order.delivery_time
          ).format('DD/MM/YYYY, h:mm a');
        }
      }
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

  getItemsDetails(itemsDetails) {
    // console.log(JSON.parse(itemsDetails));
    return JSON.parse(itemsDetails);
  }

  getOrderStatus(orderType) {
    let newOrderType = orderType;
    if (orderType == 'accept') {
      newOrderType = 'Accepted';
    } else if (orderType == 'reject') {
      newOrderType = 'Rejected';
    } else if (orderType == 'pending') {
      newOrderType = 'Pending';
    }
    return newOrderType;
  }
}
