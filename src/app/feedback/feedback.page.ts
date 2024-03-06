import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HomeService } from '../home/services/home.service';
import { LoaderService } from '../shared/services/loader.service';
import { AddFeedbackComponent } from './components/add-feedback/add-feedback.component';
import { FeedbackService } from './services/feedback.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
})
export class FeedbackPage implements OnInit {
  allApprovedFeedbacks: any;
  pageInfo: any;
  pageTitle: any;
  isFeedbackExists: boolean = false;

  constructor(
    private feedbackService: FeedbackService,
    private loaderService: LoaderService,
    private homeService: HomeService,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    this.pageInfo = await this.homeService.getPageByComponentName(
      'FeedbackPage'
    );
    this.pageTitle = this.pageInfo
      ? this.pageInfo.title.toUpperCase()
      : this.pageTitle;
    await this.getAllApprovedFeedbacks();
  }

  async doRefresh(event) {
    await this.getAllApprovedFeedbacks();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async getAllApprovedFeedbacks() {
    await this.loaderService.showLoader();
    await this.feedbackService.getAllApprovedFeedbacks().subscribe({
      next: async (result) => {
        this.allApprovedFeedbacks = result.feedbacks;
        console.log('this.allApprovedFeedbacks: ', this.allApprovedFeedbacks);
        if (this.allApprovedFeedbacks.length > 0) {
          this.isFeedbackExists = true;
        }
        await this.loaderService.hideLoader();
      },
      error: async (error) => {
        console.log('Some Text Here');
        await this.loaderService.hideLoader();
      },
    });
  }

  async addFeedBack() {
    console.log('Add Feedback');
    await this.loaderService.showLoader();
    let addFeedbackModal = await this.modalController.create({
      component: AddFeedbackComponent,
      backdropDismiss: false,
      cssClass: 'add-feedback-modal',
      componentProps: {},
    });
    addFeedbackModal.onDidDismiss().then(async (dismissalData) => {
      const { data, role } = dismissalData;
      const isSaved = data.isSaved;
      if (isSaved) {
        await this.getAllApprovedFeedbacks();
      }
    });
    addFeedbackModal.present();
    await this.loaderService.hideLoader();
  }
}
