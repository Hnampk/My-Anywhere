import { AppController } from './../../providers/app-controller/app-controller';
import { UserController } from './../../providers/user-controller/user-controller';
import { User } from './../../providers/models/user';
import { CircleController } from './../../providers/circle-controller/circle-controller';
import { Circle } from './../../providers/models/circle';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';

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
    circleMembers: [],
    onLoading: false
  }

  circle: Circle;

  constructor(public navCtrl: NavController,
    public popoverCtrl: PopoverController,
    private mAppController: AppController,
    private mCircleController: CircleController,
    private mUserController: UserController,
    public navParams: NavParams) {
    if (navParams.data['circle']) {
      this.onUpdateCircleData(navParams.data['circle']);
    }
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

  onClickMemberMore(myEvent, member: User) {
    let popover = this.popoverCtrl.create("MemberPopoverPage");

    popover.onWillDismiss((data => {
      if (data) {
        if (data.makeAdmin) {
          this.makeAdmin(member);
        }

        if (data.remove) {
          this.removeMember(member);
        }
      }
    }));

    popover.present({
      ev: myEvent
    });
  }

  makeAdmin(member: User) {
    this.showLoading();

    this.mCircleController.makeAdmin(member.id, this.circle.id)
      .then(() => {
        this.hideLoading();
      })
      .catch(e => {
        this.hideLoading();
        this.mAppController.showToast("Xảy ra lỗi");
      });
  }

  removeMember(member: User) {
    this.showLoading();

    this.mCircleController.removeMemberFromCircle(this.circle, member)
      .then(() => {
        this.hideLoading();
      })
      .catch(e => {
        this.hideLoading();
        this.mAppController.showToast("Xảy ra lỗi");
      });
  }

  isAdmin(member: User) {
    return this.circle.getAdminId() == member.id;
  }

  showLoading() {
    this.mDatas.onLoading = true;
  }

  hideLoading() {
    this.mDatas.onLoading = false;
  }
}
