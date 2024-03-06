import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { OpenNativeSettings } from '@awesome-cordova-plugins/open-native-settings/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { WheelSelector } from '@awesome-cordova-plugins/wheel-selector/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AnimationService, AnimatorModule } from 'css-animator';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageModule } from './auth/login/login.module';
import { RequestHeadersInterceptor } from './shared/interceptors/request-headers.interceptor';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CommonModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    LoginPageModule,
    SharedModule,
    AnimatorModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestHeadersInterceptor,
      multi: true,
    },
    StatusBar,
    CallNumber,
    Device,
    InAppBrowser,
    FormBuilder,
    Network,
    WheelSelector,
    AnimationService,
    OpenNativeSettings,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
