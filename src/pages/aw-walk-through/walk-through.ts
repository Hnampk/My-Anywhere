import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { TracesProvider } from '../../providers/traces/traces';
import { EthersProvider } from '../../providers/ethers/ethers';

@IonicPage()
@Component({
  selector: 'page-walk-through',
  templateUrl: 'walk-through.html',
})
export class WalkThroughPage {

  mTexts = {
    next: "next"
  }

  mDatas = {
    slides: [
      {
        icon: "./assets/imgs/connection.png",
        title: "Connecting people",
        subTitle: "Connect people together by sharing locations, routes to setup a meeting, a trip "
      },
      {
        icon: "./assets/imgs/travel.png",
        title: "Location",
        subTitle: "Share real-time location to a groups, friends and family"
      }
    ]
  }

  constructor(public navCtrl: NavController) {
  }

  onClickNext() {
    this.navCtrl.setRoot("LoginPage");
  }
}
