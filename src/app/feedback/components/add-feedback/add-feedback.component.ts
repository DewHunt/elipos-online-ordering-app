import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/services/auth.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { FeedbackService } from './../../services/feedback.service';

@Component({
  selector: 'app-add-feedback',
  templateUrl: './add-feedback.component.html',
  styleUrls: ['./add-feedback.component.scss'],
})
export class AddFeedbackComponent implements OnInit {
  addFeedbackForm: FormGroup;
  rateTaste: number = 0;
  rateService: number = 0;
  ratePrice: number = 0;
  name: string = '';
  email: string = '';
  choosedOrderTypes = [];
  orderTypes = [
    {
      type: 'Dine in',
      isChoosed: false,
    },
    {
      type: 'Take out',
      isChoosed: false,
    },
    {
      type: 'Delivery',
      isChoosed: false,
    },
  ];

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
    private commonService: CommonService,
    private feedbackService: FeedbackService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isLogged) {
      const userData = this.authService.getUserData();
      console.log('userData: ', userData);
      console.log(
        'Object.keys(userData).length: ',
        Object.keys(userData).length
      );
      if (Object.keys(userData).length > 0) {
        console.log('userData: ', userData);
        this.name = `${userData.first_name} ${userData.last_name}`;
        this.email = userData.email;
      }
    }
    this.addFeedbackForm = this.formBuilder.group({
      name: [this.name, [Validators.required]],
      email: [this.email, [Validators.required, Validators.email]],
      message: ['', []],
    });
  }

  closeModal() {
    this.modalController.dismiss({ isSaved: false }, 'cancle');
  }

  onRateChangeTaste($event) {
    this.rateTaste = $event;
  }

  onRateChangeService($event) {
    this.rateService = $event;
  }

  onRateChangePrice($event) {
    this.ratePrice = $event;
  }

  async chooseOrderType(type) {
    console.log('type: ', type);

    let index = await this.orderTypes.findIndex(
      (orderType) => orderType.type === type
    );
    if (index >= 0) {
      this.orderTypes[index].isChoosed = !this.orderTypes[index].isChoosed;
    }

    this.choosedOrderTypes = [];
    await this.orderTypes.map((orderType) => {
      if (orderType.isChoosed === true) {
        this.choosedOrderTypes.push(orderType.type);
      }
    });

    console.log('this.orderTypes: ', this.orderTypes);
    console.log('filterdOrderType: ', this.choosedOrderTypes.join(' | '));
  }

  async saveFeedback() {
    console.log('Save Feedback');
    if (
      this.rateTaste > 0 &&
      this.rateService > 0 &&
      this.ratePrice > 0 &&
      this.addFeedbackForm.valid
    ) {
      let postData = this.addFeedbackForm.value;
      postData.rateTaste = this.rateTaste;
      postData.rateService = this.rateService;
      postData.ratePrice = this.ratePrice;
      postData.choosedOrderTypes = this.choosedOrderTypes.join(' | ');
      console.log('postData: ', postData);
      await this.loaderService.showLoader();
      this.feedbackService.saveFeedback(postData).subscribe({
        next: async (result) => {
          console.log('result: ', result);
          const message = result.message;
          const isSave = result.isSave;
          this.commonService.showToastMessage(message);
          if (isSave) {
            this.modalController.dismiss({ isSaved: true }, 'cancle');
          }
          await this.loaderService.hideLoader();
        },
        error: async (error) => {
          console.log('error: ', error);
          await this.loaderService.hideLoader();
        },
      });
    }
  }
}
