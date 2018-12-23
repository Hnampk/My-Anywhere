import { UserController } from './../../providers/user-controller/user-controller';
import { CircleController } from './../../providers/circle-controller/circle-controller';
import { AppController } from './../../providers/app-controller/app-controller';
import { AccountValidators } from './../../validators/account.validators';
// import { AwModule } from './../../providers/anywhere/aw-module/aw-module';
import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, MenuController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { TracesProvider } from '../../providers/traces/traces';
import { EthersProvider } from '../../providers/ethers/ethers';
import { Storage } from '@ionic/storage';

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
    private storage: Storage,
    private userController: UserController,
    private ethersProvider: EthersProvider,
    private appController: AppController,
    private mMenuController: MenuController) {
  }

  ionViewDidLoad() {
    this.mMenuController.enable(false);
  }

  // async onClickTitle() {
  //   let result = await this.tracesProvider.getTrace("0xd5f38edc368b04bcc7e1ed15dc17ac781b79d47a", "11282018");

  //   result.map(element => {
  //     console.log(new Date(element.time))
  //   });
  //   console.log(result);
  // }

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

        await this.navCtrl.setRoot("HomePage");

        this.storage.set("password", this.appController.md5Hash(password));

        if (this.mDatas.isSavingPassword) {
          this.storage.set("auto-login", true);
        }

        this.tryToCreateWallet();
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

  /**
   * Try to get the mnemonic in local storage.
   * If it exists, create wallet.
   */
  async tryToCreateWallet() {
    let encryptedMnemonic: string = await this.storage.get("mnemonic-" + this.userController.getOwner().id);

    if (encryptedMnemonic && encryptedMnemonic.length > 0) {
      let mnemonic = this.appController.decrypt(encryptedMnemonic);

      await this.ethersProvider.createWallet(mnemonic);
      await this.userController.updateWalletAddress(this.ethersProvider.getWalletAddress());
    }
  }
}
