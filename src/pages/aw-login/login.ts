import { CircleController } from './../../providers/circle-controller/circle-controller';
import { AppController } from './../../providers/app-controller/app-controller';
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
    private mAppController: AppController,
    private mAuthenticationProvider: AuthenticationProvider,
    private mCircleController: CircleController,
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


  onClickSignUp() {
    this.navCtrl.push("SignUpPage", null, { animation: 'ios-transition' });
  }

  onClickSavePassword() {
    this.mDatas.isSavingPassword = !this.mDatas.isSavingPassword;
  }

  async onClickLogin() {
    if (this.form.valid) {
      this.showLoading();

      let phonenumber = "0" + this.form.value.phonenumber;
      let password = this.form.value.password;

      try {
        // login
        await this.mAuthenticationProvider.login(phonenumber, password);
        // get circles from server
        await this.mCircleController.getMyCircles();

        this.navCtrl.setRoot("HomePage");

        this.mAppController.showToast("Đăng nhập thành công!");
        // if (!this.mAuthenticationProvider.hasAddress()) {
        //   this.navCtrl.setRoot("UpdateAddressPage");
        // }
        // else {
        //   this.navCtrl.setRoot("HomePage");
        // }
      }
      catch (error) {
        if (error) this.mAppController.showToast(error);
      }
      this.hideLoading();
    }
    else {
      if (this.phonenumber.errors) {
        this.mAppController.showToast("Số điện thoại không hợp lệ!");
      }
      else if (this.password.errors) {
        this.mAppController.showToast("Mật khẩu dài tối thiểu " + this.mDatas.minPassword + " ký tự!");
      }
    }
  }
}
