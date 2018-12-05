import { PowerManagement } from '@ionic-native/power-management';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Clipboard } from '@ionic-native/clipboard';
import { AuthInterceptor } from './../providers/authentication/auth-interceptor';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Network } from '@ionic-native/network';
import { GoogleMaps } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';


import { MyApp } from './app.component';
import { AuthenticationProvider } from '../providers/authentication/authentication';
import { UserController } from '../providers/user-controller/user-controller';
import { AppController } from '../providers/app-controller/app-controller';
import { CircleController } from '../providers/circle-controller/circle-controller';
import { BackgroundProvider } from '../providers/background/background';
import { MapProvider } from '../providers/map/map';
import { SocketProvider } from '../providers/socket/socket';
import { EthersProvider } from '../providers/ethers/ethers';
import { TracesProvider } from '../providers/traces/traces';
import { RouteController } from '../providers/route-controller/route-controller';

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
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
    Geolocation,
    BackgroundMode,
    PowerManagement,
    HTTP,
    Clipboard,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    AuthenticationProvider,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    UserController,
    AppController,
    CircleController,
    BackgroundProvider,
    MapProvider,
    SocketProvider,
    EthersProvider,
    TracesProvider,
    RouteController,
  ]
})
export class AppModule { }
