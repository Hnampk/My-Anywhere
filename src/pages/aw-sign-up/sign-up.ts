import { AppController } from './../../providers/app-controller/app-controller';
import { AuthenticationProvider } from './../../providers/authentication/authentication';
// import { AwModule } from './../../providers/anywhere/aw-module/aw-module';
import { AccountValidators } from './../../validators/account.validators';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, MenuController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html',
})
export class SignUpPage {

  mTexts = {
    phonenumber: "Số điện thoại",
    password: "Mật khẩu",
    confirm: "Xác nhận mật khẩu",
    logIn: "Đã có tài khoản",
    signUp: "Đăng ký",
    create: "Tạo tài khoản"
  }

  mDatas = {
    minPassword: 6,
    onLoading: false,
    onVerifying: false,
    lastGetOtp: 0,
    lastSentPhonenumber: ""
  }

  form = new FormGroup({
    phonenumber: new FormControl('', [
      Validators.required,
      AccountValidators.isValidPhoneNumber
    ]),
    passwordGroup: new FormGroup({
      password: new FormControl("", [Validators.required, Validators.minLength(this.mDatas.minPassword)]),
      confirm: new FormControl("", [Validators.required])
    }, null, AccountValidators.passwordShouldMatch)
  });

  constructor(public navCtrl: NavController,
    private mAuthenticationProvider: AuthenticationProvider,
    private mAppController: AppController,
    private mMenuController: MenuController,
    private mToastController: ToastController) {
  }

  ionViewDidLoad() {
    this.mMenuController.enable(false);
  }

  get phonenumber() {
    return this.form.get("phonenumber");
  }

  get password() {
    return this.form.get("passwordGroup").get("password");
  }

  get confirm() {
    return this.form.get("passwordGroup").get("confirm");
  }

  get passwordGroup() {
    return this.form.get("passwordGroup");
  }

  async onClickSignUp() {
    if (this.form.valid) {
      this.showLoading();

      let phonenumber = "0" + this.form.value.phonenumber;
      let password = this.passwordGroup.value.password;

      try {
        await this.mAuthenticationProvider.signUp(phonenumber, password);
        this.mAppController.showToast("Đăng ký thành công!")
        this.navCtrl.setRoot("UpdateAddressPage");
      }
      catch (error) {
        if (error) this.mAppController.showToast(error);
      }
      this.hideLoading();
    }
    else {
      if (this.phonenumber.errors) {
        this.mAppController.showToast("Số điện thoại không hợp lệ");
      }
      else if (this.password.errors) {
        this.mAppController.showToast("Mật khẩu dài tối thiểu " + this.mDatas.minPassword + " ký tự");
      }
      else if (this.passwordGroup.errors) {
        this.mAppController.showToast("Mật khẩu xác nhận không khớp");
      }
    }
  }

  isAvailableSendOtp() {
    let phonenumber = "0" + this.form.value.phonenumber;
    return (((new Date().getTime() - this.mDatas.lastGetOtp) >= 6000)
      || (this.mDatas.lastSentPhonenumber != phonenumber))
  }

  sendOtpToUser(phonenumber: string) {
    // this.mAwModule.getOtp(phonenumber).then((data) => {
    //   console.log("dataaaaa: ", data);

    //   if (data) {
    //     this.hideLoading();
    //     this.mDatas.lastGetOtp = new Date().getTime();
    //     this.mDatas.lastSentPhonenumber = "0" + this.form.value.phonenumber;
    //     this.showVerify();
    //   }
    //   else {
    //     this.hideLoading();
    //     this.showToast("Vui lòng kiểm tra kết nối mạng")
    //   }
    // }).catch(e => {
    //   this.hideLoading();
    //   this.showToast("Vui lòng kiểm tra kết nối mạng")
    // })
  }

  onClickLogin() {
    this.navCtrl.pop({ animation: 'ios-transition' });
  }

  showLoading() {
    this.mDatas.onLoading = true;
  }

  hideLoading() {
    this.mDatas.onLoading = false;
  }

  showVerify() {
    this.mDatas.onVerifying = true;
  }

  hideVerify() {
    this.mDatas.onVerifying = false;
  }

  onCancelVerify() {
    this.hideVerify();
  }

  onVerify(e) {
    console.log(e.otp);

    let phonenumber = "0" + this.form.value.phonenumber;
    let password = this.passwordGroup.value.password;

    // this.mAwModule.signUp(phonenumber, password, e.otp).then(data => {
    //   this.hideLoading();
    //   if (data['success']) {
    //     this.navCtrl.setRoot("AwCreateLocationPage");
    //   }
    //   else {
    //     if (data['msg']) {
    //       this.showToast(data['msg']);
    //     }
    //   }
    // }).catch(e => {
    //   this.hideLoading();
    //   this.showToast("Vui lòng kiểm tra kết nối mạng")
    // });
    // this.hideVerify();
  }

  onResend() {
    let phonenumber = "0" + this.form.value.phonenumber;
    if (this.isAvailableSendOtp())
      this.sendOtpToUser(phonenumber);
    else {
      this.mAppController.showToast("Thời gian tối thiểu là 60 giây");
    }
  }
}
