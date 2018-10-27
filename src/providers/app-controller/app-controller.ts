import { Network } from '@ionic-native/network';
import { ToastController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AppController {

  constructor(public http: HttpClient,
    public network: Network,
    public mToastController: ToastController
  ) { }

  showToast(message: string, duration?: number) {
    let toast = this.mToastController.create({
      message: message,
      duration: duration ? duration : 2000
    });

    toast.present();
  }

  hasInternet(){
    if(!this.network.type || this.network.type == "none"){
      this.onInternetProblem();
      return false;
    }
    else{
      return true;
    }
  }

  onInternetProblem(){
    this.showToast("Internet connection failure!");
  }

  onConnectionFailure(){
    this.showToast("There was an error connection!");
  }
}
