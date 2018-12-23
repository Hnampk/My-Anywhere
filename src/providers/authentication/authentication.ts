import { CircleController } from './../circle-controller/circle-controller';
import { UserController } from './../user-controller/user-controller';
import { AppController } from './../app-controller/app-controller';
import { AnywhereRouter } from './../anywhere-router';
import { Account } from './../models/account';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';


@Injectable()
export class AuthenticationProvider {
  private serviceUrl = AnywhereRouter.SERVICE_URL;
  private token: string;

  constructor(public http: HttpClient,
    private mUserController: UserController,
    private mCircleController: CircleController,
    public mAppcontroller: AppController
  ) { }

  getToken() {
    return this.token;
  }


  hasAddress() {
    return this.mUserController.getOwner().address != undefined;
  }

  signUp(phonenumber: string, password: string) {
    return new Promise((res, rej) => {
      // if (!this.mAppcontroller.hasInternet()) {
      //   rej();
      // }

      let encodedPassword = this.encodePassword(password);
      let account: Account = { phonenumber: phonenumber, password: encodedPassword };
      this.http.post(this.serviceUrl + AnywhereRouter.SIGN_UP, account)
        .pipe(map((result) => {
          return {
            id: result["info"]._id,
            phonenumber: result["info"].phonenumber,
            static_code: result["info"].static_code,
            name: result["info"].name,
            avatar: result["info"].avatar,
            token: result["token"]
          }
        }))
        .subscribe(response => {
          this.token = response.token;
          this.mUserController.createOwner(response.id, response.phonenumber);
          this.mUserController.getOwner().onResponseData(response);;

          console.log(this.mUserController.getOwner());
          this.mUserController.onUserUpdated();
          res();
        }, (error) => {
          console.log(error);
          if (error.error.error && error.error.error.message) {
            // mongoose autogenerate unique error
            rej("Signup failed!")
          }
          else {
            this.mAppcontroller.onConnectionFailure();
          }
          rej();
        });
    });

  }

  login(phonenumber: string, password: string) {
    return new Promise((res, rej) => {
      // if (!this.mAppcontroller.hasInternet()) {
      //   rej();
      // }

      let encodedPassword = this.encodePassword(password);
      let account: Account = { phonenumber: phonenumber, password: encodedPassword };

      this.http.post<{ token: string, info: any }>(this.serviceUrl + AnywhereRouter.LOGIN, account)
        .pipe(map((loginData) => {
          return {
            token: loginData.token,
            id: loginData.info._id,
            phonenumber: loginData.info.phonenumber,
            address: loginData.info.address,
            name: loginData.info.name,
            avatar: loginData.info.avatar,
            static_code: loginData.info.static_code,
            wallet_address: loginData.info.wallet_address
          }
        }))
        .subscribe(response => {

          this.token = response.token;
          // update user info
          this.mUserController.createOwner(response.id, response.phonenumber);
          this.mUserController.getOwner().onResponseData(response);
          this.mUserController.onUserUpdated();

          this.mUserController.getOwner().setPassword(encodedPassword);
          
          res();
        }, (error) => {
          if (error.error.message) {
            rej(this.errorConverter(error));
          }
          else {
            this.mAppcontroller.onConnectionFailure();
          }
          rej();
        });
    });
  }

  logout() {
    return new Promise((res, rej)=>{
      // clear token
      this.token = "";
      // remove owner
      this.mUserController.removeOwner();
      // clear circles
      this.mCircleController.clearCircles();

      res();
    });
  }


  errorConverter(error: HttpErrorResponse) {
    return error.error.message;
  }

  private encodePassword(password: string) {
    return this.mAppcontroller.md5Hash(password);
  }

}
