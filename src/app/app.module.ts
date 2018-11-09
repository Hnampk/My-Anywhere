import { AuthInterceptor } from './../providers/authentication/auth-interceptor';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Network } from '@ionic-native/network';
import { GoogleMaps } from '@ionic-native/google-maps';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { MyApp } from './app.component';
import { AuthenticationProvider } from '../providers/authentication/authentication';
import { MapServices } from '../providers/map-services/map-services';
import { UserController } from '../providers/user-controller/user-controller';
import { AppController } from '../providers/app-controller/app-controller';
import { CircleController } from '../providers/circle-controller/circle-controller';

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    FormsModule,
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Network,
    GoogleMaps,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    AuthenticationProvider,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    MapServices,
    UserController,
    AppController,
    CircleController,
  ]
})
export class AppModule { }
