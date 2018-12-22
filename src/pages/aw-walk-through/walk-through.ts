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

  constructor(public navCtrl: NavController,
    ethersProvider: EthersProvider,
    private tracesProvider: TracesProvider) {
    ethersProvider.createWallet("rose suit over suffer bubble cinnamon gossip simple wink way sock cloud");
  }

  onClickNext() {
    this.navCtrl.setRoot("LoginPage");
  }


  async onClickSomething() {
    console.log("onClickTitle", new Date().toLocaleDateString())
    let dateStr = new Date().toLocaleDateString().split("/").join("");

    let a = await this.tracesProvider.getTrace("0xd5F38EDc368B04bCC7E1ed15dc17aC781b79D47A", "11112018");

    console.log(a);
  }
}
