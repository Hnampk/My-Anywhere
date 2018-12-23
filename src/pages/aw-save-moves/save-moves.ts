import { TracesProvider } from './../../providers/traces/traces';
import { EthersProvider } from './../../providers/ethers/ethers';
import { UserController } from './../../providers/user-controller/user-controller';
import { AppController } from './../../providers/app-controller/app-controller';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-save-moves',
  templateUrl: 'save-moves.html',
})
export class SaveMovesPage {

  mTexts = {
    title: "Cài đặt lịch sử di chuyển",
    saveMoves: "Ghi lại lịch sử di chuyển",
    linkWallet: "Liên kết ví Ethereum"
  }

  mDatas = {
    isSavingMoves: false,
    mnemonic: "",
    walletAddress: "",
    onLoading: false,
    confirmed: false
  }

  constructor(public navCtrl: NavController,
    private alertController: AlertController,
    private userController: UserController,
    private ethersProvider: EthersProvider,
    private appController: AppController,
    private tracesProvider: TracesProvider,
    private storage: Storage,
    public navParams: NavParams) {
  }

  async ngOnInit() {
    this.mDatas.isSavingMoves = await this.storage.get("is-saving-moves-" + this.userController.getOwner().id);
  }

  async onClickSaveMoves() {
    this.mDatas.isSavingMoves = !this.mDatas.isSavingMoves;

    await this.storage.set("is-saving-moves-" + this.userController.getOwner().id, this.mDatas.isSavingMoves);

    if (this.mDatas.isSavingMoves) {
      this.tracesProvider.startTrace();
    }
    else {
      this.tracesProvider.stopTrace();
    }
  }

  /**
   * Update wallet
   */
  onClickLinkWallet() {
    if (this.ethersProvider.hasWallet()) {
      const prompt = this.alertController.create({
        title: this.mTexts.linkWallet,
        message: "Vui lòng nhập mật khẩu",
        inputs: [
          {
            name: 'password',
            placeholder: 'password',
            type: 'password'
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
            text: 'Confirm',
            handler: data => {
              console.log('Saved clicked');

              if (this.appController.md5Hash(data.password) == this.userController.getOwner().password) {
                this.mDatas.mnemonic = this.ethersProvider.getMnemonic();
                this.mDatas.walletAddress = this.ethersProvider.getWalletAddress();

                this.mDatas.confirmed = true;
              }
              else {
                this.appController.showToast("Mật khẩu không đúng!")
              }
            }
          }
        ]
      });
      prompt.present();
    }
    else{
      this.onClickEditMnemonic();
    }
  }

  onClickEditMnemonic() {
    const prompt = this.alertController.create({
      title: this.mTexts.linkWallet,
      message: "Nhập mnemonic mới",
      inputs: [
        {
          name: 'mnemonic',
          placeholder: 'mnemonic',
          type: 'mnemonic'
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
          text: 'Confirm',
          handler: async data => {
            console.log('Saved clicked');
            this.showLoading();

            try {
              await this.ethersProvider.createWallet(data.mnemonic);
              this.mDatas.mnemonic = this.ethersProvider.getMnemonic();
              this.mDatas.walletAddress = this.ethersProvider.getWalletAddress();

              await this.storage.set("mnemonic-" + this.userController.getOwner().id, this.appController.encrypt(this.mDatas.mnemonic));

              await this.userController.updateWalletAddress(this.mDatas.walletAddress);
              this.mDatas.confirmed = true;
            }
            catch (e) {
              this.appController.showToast("mnemonic không hợp lệ!");
            }

            this.hideLoading();
          }
        }
      ]
    });
    prompt.present();
  }

  onClickClose() {
    this.navCtrl.pop({ animation: 'ios' });
  }

  showLoading() {
    this.mDatas.onLoading = true;
  }

  hideLoading() {
    this.mDatas.onLoading = false;
  }
}
