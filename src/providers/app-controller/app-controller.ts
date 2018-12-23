import { Network } from '@ionic-native/network';
import { ToastController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Md5 } from 'ts-md5/dist/md5';

declare var JSEncrypt;

@Injectable()
export class AppController {

  priv = "MIICWgIBAAKBgFdRbgnYvUc1hwKlH0ySqHXZR6KfYn7b17spbl7YyObwOQKWKl7r3Gf9xSCtUWMl69escUGVySmkCmi6Q06V/GRx1SByt0QbELujoHjK0PNh1QpC1MSOYi8nQZVif8ClqyXviT0SQY/sL2eFOQNU4dnC2YrNG3kq4nQAlNA0TE7zAgMBAAECgYBD+Z1rRvJa3B3Fflw2VTmVvNeaju+ziFuSVXeZmLQVrE8FZ3eGu6CyyAjNHn/sapoGJTVp9DxNEWoVC2PYasS3WCGul0acIoS44rVwFaa6zaLQ4pqO9LehoD89UXmH3mb06JT840mrSsB/qVPzMFXChpUxvDaomHKCRvzu/RI12QJBAJ0NL5UKVI+OmdGRVY3F7AhQ2OAH+/Naiue77tVfbBb+lvmuLQgiC+LQwmW528jmBSlMBWdFWu8+85ZP3RtYPR0CQQCOVPNlI269LLP9eJJH0nYibbSwIY9+B4ZDQs50Ke66SLqd9JsI1z4MDNvbfkTNxsx23yIMryve4qBLmtkvk89PAkAddDKfTg+r2L+qWQpli2AH8zmpUnYDHtD8Qve41quL6HViIDNb2h7GjAZZU7EPjWwcYaCFzLEQO4stfo7mKPdVAkA90UelNa5zG2dRP3zJFO+aJGvF082uvzXhILLqYQv+fHgRApwTSuj38t3Khxz7AszrFB6Fw88aDvPv4mFR+LChAkA1NTGVh5yzRqL7xdlXydiwN/Q4Y3jmWnWhZw6wLjkaUtET5SjMZEjNFGdQiQ0Z8pN+U1G2bm4H+XfaPKc5rB97"
  pub = "MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgFdRbgnYvUc1hwKlH0ySqHXZR6KfYn7b17spbl7YyObwOQKWKl7r3Gf9xSCtUWMl69escUGVySmkCmi6Q06V/GRx1SByt0QbELujoHjK0PNh1QpC1MSOYi8nQZVif8ClqyXviT0SQY/sL2eFOQNU4dnC2YrNG3kq4nQAlNA0TE7zAgMBAAE=";

  constructor(public http: HttpClient,
    public network: Network,
    public mToastController: ToastController
  ) { }

  showToast(message: string, duration?: number) {
    let toast = this.mToastController.create({
      message: message,
      duration: duration ? duration : 2000
    });

    toast.present();
  }

  hasInternet() {
    if (!this.network.type || this.network.type == "none") {
      this.onInternetProblem();
      return false;
    }
    else {
      return true;
    }
  }

  onInternetProblem() {
    this.showToast("Internet connection failure!");
  }

  onConnectionFailure() {
    this.showToast("There was an error connection!");
  }

  encrypt(data: string) {
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(this.pub);
    var encrypted = encrypt.encrypt(data);

    return encrypted
  }

  decrypt(encrypted: string) {
    var decrypt = new JSEncrypt();
    decrypt.setPrivateKey(this.priv);
    var uncrypted = decrypt.decrypt(encrypted);

    return uncrypted;
  }

  md5Hash(data: string) {
    return <string>Md5.hashStr(data);
  }
}
