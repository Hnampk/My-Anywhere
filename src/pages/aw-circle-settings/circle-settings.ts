import { EthersProvider } from './../../providers/ethers/ethers';
import { AppController } from './../../providers/app-controller/app-controller';
import { UserController } from './../../providers/user-controller/user-controller';
import { User } from './../../providers/models/user';
import { CircleController } from './../../providers/circle-controller/circle-controller';
import { Circle } from './../../providers/models/circle';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, Events, AlertController } from 'ionic-angular';
import { SocketProvider } from '../../providers/socket/socket';

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
  owner: User;

  constructor(public navCtrl: NavController,
    public popoverCtrl: PopoverController,
    private mAppController: AppController,
    private circleController: CircleController,
    private userController: UserController,
    private socketProvider: SocketProvider,
    private alertController: AlertController,
    private ethersProvider: EthersProvider,
    private events: Events,
    public navParams: NavParams) {
    if (navParams.data['circle']) {
      this.onUpdateCircleData(navParams.data['circle']);
    }
    this.owner = userController.getOwner();
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

    this.circleController.makeAdmin(member.id, this.circle.id)
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

    this.circleController.removeMemberFromCircle(this.circle, member)
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

  onClickLeave() {
    this.showConfirm();
  }

  showConfirm() {
    const confirm = this.alertController.create({
      title: 'Thoát vòng kết nối?',
      message: "Bạn muốn thoát vòng kết nối " + this.circle.name + "?",
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
          }
        },
        {
          text: 'Thoát',
          handler: () => {
            if (this.circleController.getCircles().length > 1) {
              this.showLoading();
              this.socketProvider.leaveCircleRoom(this.circle.id, this.userController.getOwner().id);

              this.circleController.leaveCircle(this.circle)
                .then(() => {
                  this.hideLoading();
                  this.navCtrl.pop();
                })
                .catch(e => {
                  this.hideLoading();
                  this.mAppController.showToast("Xảy ra lỗi");
                });
            }
            else {
              this.mAppController.showToast("Không thể thoát tất cả các vòng kết nối!");
            }
          }
        }
      ]
    });
    confirm.present();
  }

  onClickMovesSetting() {
    if (this.ethersProvider.hasWallet()) {
      this.navCtrl.push("RenewPermissionPage", { members: this.mDatas.circleMembers }, { animation: 'ios' });
    }
    else{
      // Did not create wallet => notice
      const confirm = this.alertController.create({
        title: 'Thêm Địa chỉ ví',
        message: 'Tài khoản của bạn phải liên kết với một ví Ethereum để có thể sử dụng tính năng này! (Menu/Ghi lại lịch sử di chuyển)',
        buttons: [
          {
            text: 'Bỏ qua',
            handler: () => {
              // console.log('Disagree clicked');
            }
          },
          {
            text: 'Thêm',
            handler: () => {
              this.navCtrl.push("SaveMovesPage", {}, { animation: 'ios' });
              // console.log('Agree clicked');
            }
          }
        ]
      });
      confirm.present();
    }
  }

  async onClickMember(member: User) {
    console.log(member)
    if (this.owner.walletAddress) {

    }
  }
}
