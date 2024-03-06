import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HomeService } from './../home/services/home.service';
import { LoaderService } from './../shared/services/loader.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.page.html',
  styleUrls: ['./about-us.page.scss'],
})
export class AboutUsPage implements OnInit {
  pageInfo: any;
  pageTitle = 'ABOUT US';
  url: any;
  constructor(
    private homeService: HomeService,
    private loaderService: LoaderService
  ) {}

  async ngOnInit() {
    await this.loaderService.showLoader();
    this.url = `${environment.webUrl}about_us/app`;
    this.pageInfo = await this.homeService.getPageByComponentName(
      'AboutUsPage'
    );
    this.pageTitle = (await this.pageInfo)
      ? await this.pageInfo.title.toUpperCase()
      : this.pageTitle;
  }

  async dismissLoading() {
    await this.loaderService.hideLoader();
  }
}
