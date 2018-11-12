import { CircleController } from './../../providers/circle-controller/circle-controller';
import { Circle } from './../../providers/models/circle';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-circle-settings',
  templateUrl: 'circle-settings.html',
})
export class CircleSettingsPage {

  mTexts = {
    title: "Cài đặt vòng kết nối",
  }

  mDatas = {
    circleId: "",
    circleName: "",
    circleMembers: []
  }

  circle: Circle;

  constructor(public navCtrl: NavController,
    private mCircleController: CircleController,
    public navParams: NavParams) {
    if (navParams.data['circle']) {
      this.onUpdateCircleData(navParams.data['circle']);
    }
  }

  ionViewDidLoad() {

  }

  onUpdateCircleData(circle: Circle) {
    this.circle = circle;
    this.mDatas.circleId = circle.id;
    this.mDatas.circleName = circle.name;
    this.mDatas.circleMembers = circle.getMembers();
  }

  onClickClose() {
    this.navCtrl.pop({ animation: "ios-transition" });
  }

  onClickAddMember() {
    this.navCtrl.push("AddMemberPage", { circle: this.circle }, { animation: "ios-transition" });
  }

}
