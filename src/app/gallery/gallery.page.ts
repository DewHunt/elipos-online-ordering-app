import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HomeService } from './../home/services/home.service';
import { LoaderService } from './../shared/services/loader.service';
import { GalleryService } from './services/gallery.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.page.html',
  styleUrls: ['./gallery.page.scss'],
})
export class GalleryPage implements OnInit {
  pageInfo: any;
  pageTitle = 'Gallery';
  header: any;
  content: any;
  loading: any;
  imagePath: string;
  images: any;
  galleryUrl: any;
  siteUrl: string;

  constructor(
    private homeService: HomeService,
    private loaderService: LoaderService,
    private galleryService: GalleryService,
    private nav: NavController // private photoViewer: PhotoViewer
  ) {}

  async ngOnInit() {
    await this.loaderService.showLoader();
    this.pageInfo = await this.homeService.getPageByComponentName(
      'GalleryPage'
    );
    this.pageTitle = (await this.pageInfo)
      ? await this.pageInfo.title.toUpperCase()
      : this.pageTitle;
    await this.getAllGalleryImages();
    await this.loaderService.hideLoader();
  }

  async getAllGalleryImages() {
    await this.galleryService
      .getAllGalleryImages()
      .subscribe(async (result) => {
        this.images = await result['images'];
        this.imagePath = await result['path'];
      });
  }

  get_url(image): string {
    return encodeURI(this.imagePath + image);
  }

  showImage(image) {
    console.log('image: ', this.imagePath + image);
    // this.photoViewer.show(this.imagePath + image);
  }
}
