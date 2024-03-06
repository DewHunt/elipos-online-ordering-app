import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HomeService } from './../home/services/home.service';
import { LoaderService } from './../shared/services/loader.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
})
export class PrivacyPolicyPage implements OnInit {
  pageInfo: any;
  pageTitle = 'Privacy Policy';
  url: any;

  constructor(
    private homeService: HomeService,
    private loaderService: LoaderService
  ) {}

  async ngOnInit() {
    await this.loaderService.showLoader();
    this.url = `${environment.webUrl}privacy_policy/app`;
    this.pageInfo = await this.homeService.getPageByComponentName(
      'privacy-policy'
    );
    this.pageTitle = (await this.pageInfo)
      ? await this.pageInfo.title.toUpperCase()
      : this.pageTitle;
  }

  async dismissLoading() {
    await this.loaderService.hideLoader();
  }
}
