import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HomeService } from './../home/services/home.service';
import { LoaderService } from './../shared/services/loader.service';

@Component({
  selector: 'app-helps',
  templateUrl: './helps.page.html',
  styleUrls: ['./helps.page.scss'],
})
export class HelpsPage implements OnInit {
  pageInfo: any;
  pageTitle = 'HELP';
  url: any;
  constructor(
    private homeService: HomeService,
    private loaderService: LoaderService
  ) {}

  async ngOnInit() {
    await this.loaderService.showLoader();
    this.url = `${environment.webUrl}help/app`;
    this.pageInfo = await this.homeService.getPageByComponentName('HelpsPage');
    this.pageTitle = (await this.pageInfo)
      ? await this.pageInfo.title.toUpperCase()
      : this.pageTitle;
  }

  async dismissLoading() {
    await this.loaderService.hideLoader();
  }
}
