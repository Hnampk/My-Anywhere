import { UserController } from './../../providers/user-controller/user-controller';
import { User } from './../../providers/models/user';
import { EthersProvider } from './../../providers/ethers/ethers';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, AlertController } from 'ionic-angular';

export class PrivateMember {
  expirationTime: number = 0;
  info: User;

  constructor(member: User) {
    this.info = member;
  }
}

@IonicPage()
@Component({
  selector: 'page-renew-permission',
  templateUrl: 'renew-permission.html',
})
export class RenewPermissionPage {

  mTexts = {
    title: "Quyền truy cập lộ trình"
  }

  mDatas = {
    members: [],
    owner: null,
    isShowingDatePicker: false,
    currentDateView: new Date(),
    onChoseMember: null,
    onLoading: false
  }

  constructor(public navCtrl: NavController,
    private ethersProvider: EthersProvider,
    private userController: UserController,
    private menu: MenuController,
    private alertController: AlertController,
    public navParams: NavParams) {
    this.mDatas.owner = userController.getOwner();

    if (navParams.data['members']) {
      for (let i = 0; i < navParams.data['members'].length; i++) {
        let privateMember = new PrivateMember(navParams.data['members'][i]);

        this.mDatas.members.push(privateMember);
      }
      this.getMemberExpiration();
    }
  }

  onClickClose() {
    this.navCtrl.pop({ animation: "ios-transition" });
  }


  async getMemberExpiration() {
    for (let i = 0; i < this.mDatas.members.length; i++) {
      let member: PrivateMember = this.mDatas.members[i];

      member.expirationTime = (await this.ethersProvider.getExpirationTime(this.mDatas.owner.walletAddress, member.info.walletAddress)).toNumber();
    }
  }

  onClickDatePicker() {
    this.mDatas.isShowingDatePicker = true;
  }

  onCancelDatePicker() {
    this.mDatas.isShowingDatePicker = false;
  }

  onClickMember(member: PrivateMember){
    if(member.info.id != this.userController.getOwner().id){
      this.mDatas.isShowingDatePicker = true;
      this.mDatas.onChoseMember = member;
    }
  }

  onDatePickerChanged(data) {
    this.showLoading();

    this.mDatas.isShowingDatePicker = false;
    let date = new Date(data['year'], data['month'] - 1, data['date']);

    this.ethersProvider.renewExpirationTime(this.mDatas.onChoseMember.info.walletAddress, date.getTime());

    setTimeout(() => {
      this.mDatas.onChoseMember = null;
      this.hideLoading();
      this.showAlert();
    }, 2000);
  }

  showAlert() {
    const alert = this.alertController.create({
      title: 'Thông báo',
      subTitle: 'Việc gia hạn sẽ có hiệu lực sau khoảng 30s',
      buttons: ['OK']
    });
    alert.present();
  }

  showLoading() {
    this.mDatas.onLoading = true;
  }

  hideLoading() {
    this.mDatas.onLoading = false;
  }

}
