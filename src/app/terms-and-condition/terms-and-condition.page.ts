import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HomeService } from './../home/services/home.service';
import { LoaderService } from './../shared/services/loader.service';

@Component({
  selector: 'app-terms-and-condition',
  templateUrl: './terms-and-condition.page.html',
  styleUrls: ['./terms-and-condition.page.scss'],
})
export class TermsAndConditionPage implements OnInit {
  pageInfo: any;
  pageTitle = 'Terms And Conditions';
  url: any;
  constructor(
    private homeService: HomeService,
    private loaderService: LoaderService
  ) {}

  async ngOnInit() {
    await this.loaderService.showLoader();
    this.url = `${environment.webUrl}terms_and_conditions/app`;
    this.pageInfo = await this.homeService.getPageByComponentName(
      'TermsAndConditionPage'
    );
    this.pageTitle = (await this.pageInfo)
      ? await this.pageInfo.title.toUpperCase()
      : this.pageTitle;
  }

  async dismissLoading() {
    await this.loaderService.hideLoader();
  }
}
