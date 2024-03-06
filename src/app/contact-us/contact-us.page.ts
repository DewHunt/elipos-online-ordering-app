import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HomeService } from './../home/services/home.service';
import { MyAccountService } from './../my-account/services/my-account.service';
import { LoaderService } from './../shared/services/loader.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
})
export class ContactUsPage implements OnInit {
  pageInfo: any;
  pageTitle = 'CONTACT US';
  url: any;

  constructor(
    private homeService: HomeService,
    private loaderService: LoaderService,
    private myAccountService: MyAccountService
  ) {}

  async ngOnInit() {
    await this.loaderService.showLoader();
    this.url = `${environment.webUrl}contact_us/app`;
    this.pageInfo = await this.homeService.getPageByComponentName(
      'ContactUsPage'
    );
    this.pageTitle = (await this.pageInfo)
      ? await this.pageInfo.title.toUpperCase()
      : this.pageTitle;
  }

  async dismissLoading() {
    await this.loaderService.hideLoader();
  }
}
