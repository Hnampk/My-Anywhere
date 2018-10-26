import { AccountValidators } from './../../validators/account.validators';
// import { AwModule } from './../../providers/anywhere/aw-module/aw-module';
import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, MenuController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationProvider } from '../../providers/authentication/authentication';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  mTexts = {
    phonenumber: "Số điện thoại",
    password: "Mật khẩu",
    savePassword: "Ghi nhớ mật khẩu",
    logIn: "Đăng nhập",
    signUp: "Tạo tài khoản"
  };

  mDatas = {
    isSavingPassword: false,
    onLoading: false,
    minPassword: 6
  };

  form = new FormGroup({
    phonenumber: new FormControl('', [
      Validators.required,
      AccountValidators.isValidPhoneNumber
    ]),
    password: new FormControl("", [Validators.required, Validators.minLength(this.mDatas.minPassword)])
  });

  constructor(public navCtrl: NavController,
    // private mAwModule: AwModule,
    private mAuthenticationProvider: AuthenticationProvider,
    private mToastController: ToastController,
    private mMenuController: MenuController) {
  }

  ionViewDidLoad() {
    this.mMenuController.enable(false);
  }

  get phonenumber() {
    return this.form.get('phonenumber');
  }

  get password() {
    return this.form.get('password');
  }

  showLoading() {
    this.mDatas.onLoading = true;
  }

  hideLoading() {
    this.mDatas.onLoading = false;
  }

  showToast(message: string, duration?: number) {
    let toast = this.mToastController.create({
      message: message,
      duration: duration ? duration : 2000
    });

    toast.present();
  }

  onClickSignUp() {
    this.navCtrl.push("SignUpPage", null, { animation: 'ios-transition' });
  }

  onClickSavePassword() {
    this.mDatas.isSavingPassword = !this.mDatas.isSavingPassword;
  }

  async onClickLogin() {
    if (this.form.valid) {
  //     this.showLoading();

      let phonenumber = "0" + this.form.value.phonenumber;
      let password = this.form.value.password;

      await this.mAuthenticationProvider.login(phonenumber, password);
      this.navCtrl.push("HomePage");
  //     this.mAwModule.login(phonenumber, password).then((data) => {
  //       this.hideLoading();

  //       if (data['success']) {
  //         this.navCtrl.setRoot("AwHomePage");
  //       }

  //       if (data['msg']) {
  //         this.showToast(data['msg'])
  //       }
  //     }).catch(e => {
  //       this.hideLoading();
  //       this.showToast("Vui lòng kiểm tra kết nối mạng")
  //     });
  //   }
  //   else {
  //     if (this.phonenumber.errors) {
  //       this.showToast("Số điện thoại không hợp lệ");
  //     }
  //     else if (this.password.errors) {
  //       this.showToast("Mật khẩu dài tối thiểu " + this.mDatas.minPassword + " ký tự");
  //     }
    }
  }
}
