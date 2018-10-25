import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ToastController } from 'ionic-angular';

@Component({
  selector: 'aw-verify-otp',
  templateUrl: 'aw-verify-otp.html'
})
export class AwVerifyOtpComponent {
  @Input('timestamp') timestamp: number = 0;
  @Output() cancel = new EventEmitter();
  @Output() verify = new EventEmitter();
  @Output() resend = new EventEmitter();

  mTexts = {
    message: "Mã xác thực đã được gửi đến số điện thoại của bạn",
    placeholder: "Mã xác thực OTP",
    verify: "Xác thực",
    resend: "Gửi lại"
  }

  mDatas = {
    otp: "",
    intervalObj: null
  }

  constructor(private mToastController: ToastController) {

  }

  showToast(message: string, duration?: number) {
    let toast = this.mToastController.create({
      message: message,
      duration: duration ? duration : 2000
    });

    toast.present();
  }

  onClickContainer() {
    event.stopPropagation();
  }

  onClickVerify() {
    this.verify.emit({ otp: this.mDatas.otp });
  }

  onClickResend() {
    this.resend.emit();
  }

  onClickBackdrop() {
    this.cancel.emit();
  }

}
