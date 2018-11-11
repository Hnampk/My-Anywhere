import { AppController } from './../../providers/app-controller/app-controller';
import { AuthenticationProvider } from './../../providers/authentication/authentication';
import { UserController } from './../../providers/user-controller/user-controller';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { User } from '../../providers/models/user';

@IonicPage()
@Component({
  selector: 'page-user-info',
  templateUrl: 'user-info.html',
})
export class UserInfoPage {

  mTexts = {
    title: "Thông tin người dùng",
    getCode: "Lấy mã chia sẻ",
    signOut: "Đăng xuất",
    dynamicCode: "Mã tạm thời"
  }

  mDatas: {
    user: User,
    isShowCodes: boolean,
    onLoading: boolean,
    isGettingNewCode: boolean,
    modified: boolean
  } = {
      user: null,
      isShowCodes: false,
      onLoading: false,
      isGettingNewCode: false,
      modified: false
    }


  constructor(public navCtrl: NavController,
    // private mClipboard: Clipboard,
    private mAuthentication: AuthenticationProvider,
    private mAppController: AppController,
    private mUserController: UserController,
    private mAlertController: AlertController,
    public navParams: NavParams) {
  }

  ionViewWillEnter() {
    this.updateOwnerData();
  }

  showLoading() {
    this.mDatas.onLoading = true;
  }

  hideLoading() {
    this.mDatas.onLoading = false;
  }

  async onClickClose() {
    if(this.mDatas.modified){
      await this.onModification();
    }
    this.navCtrl.pop({ animation: 'ios-transition' });
  }

  onClickGetCode() {
    this.mDatas.isShowCodes = true;
  }

  onClickBackdrop() {
    this.mDatas.isShowCodes = false;
  }

  onClickStaticCode() {
    // this.mClipboard.copy(this.staticCode).then(() => {
    //   this.showToast("Lưu vào Clipboard: " + this.staticCode, 1000);
    // });
  }

  onClickDynamicCode() {
    // if (!this.mDatas.isGettingNewCode) {
    //   this.mClipboard.copy(this.dynamicCode).then(() => {
    //     this.showToast("Lưu vào Clipboard: " + this.dynamicCode, 1000);
    //   });;
    // }
  }

  onClickRefreshDynamicCode() {
    this.mDatas.isGettingNewCode = true;

    // this.mAwModule.getNewConnectCode().then(() => {
    //   this.mDatas.isGettingNewCode = false;
    // });
  }

  onClickContainer() {
    event.stopPropagation();
  }

  onClickLogOut() {
    this.showLoading();

    this.mAuthentication.logout()
      .then(() => {
        setTimeout(() => {
          this.hideLoading();

          this.mAppController.showToast("Logged out!");
          this.navCtrl.setRoot("LoginPage");
        }, 2000);
      });
  }

  onClickRename() {
    const prompt = this.mAlertController.create({
      title: 'Edit',
      message: "Your name is",
      inputs: [
        {
          id: 'edit-name',
          name: 'name',
          placeholder: 'Display name',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: async data => {
            this.mDatas.modified = true;
            this.mDatas.user.name = data['name'];
          }
        }
      ]
    });
    prompt.present()
      .then(result => {
        document.getElementById('edit-name').setAttribute('maxlength', '30');
        document.getElementById('edit-name').setAttribute('minlength', '1');
      });;
  }

  onClickUpdateAddress() {
    this.navCtrl.push("UpdateAddressPage", { 'isSignUp': false }, { animation: 'ios-transition' });
  }

  updateOwnerData() {
    this.mDatas.user = this.mUserController.getOwner();
  }

  onClickSave() {
    this.onModification();
  }

  onModification() {
    return new Promise((res, rej) => {
      const confirm = this.mAlertController.create({
        title: 'Confirm',
        message: "Do you want to save your changes?",
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              res();
            }
          },
          {
            text: 'Save',
            handler: async data => {
              this.showLoading();
              await this.mUserController.updateDisplayName(this.mDatas.user.name);

              this.updateOwnerData();
              this.mDatas.modified = false;
              this.hideLoading();
              res();
            }
          }
        ]
      });
      confirm.present();
    })
  }

  onImageChanged(event) {
    let file = (event.target as HTMLInputElement).files[0];

    let reader = new FileReader();
    reader.onload = () => {
      this.mDatas.modified = true;
      this.mDatas.user.avatar = reader.result as string;
    }
    console.log(file)
    if (file)
      reader.readAsDataURL(file);
  }
}
