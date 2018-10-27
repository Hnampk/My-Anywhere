import { UserController } from './../user-controller/user-controller';
import { AppController } from './../app-controller/app-controller';
import { AnywhereRouter } from './../anywhere-router';
import { Account } from './../models/account';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';

import { Md5 } from 'ts-md5/dist/md5';

@Injectable()
export class AuthenticationProvider {
  private serviceUrl = AnywhereRouter.SERVICE_URL;
  private token: string;

  constructor(public http: HttpClient,
    public mUserController: UserController,
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

      this.http.post(this.serviceUrl + AnywhereRouter.SIGN_UP, account, { headers: { 'Content-Type': 'application/json' } })
        .pipe(map((result) => {
          return {
            id: result["info"]._id,
            phonenumber: result["info"].phonenumber,
          }
        }))
        .subscribe(response => {
          this.mUserController.createOwner(response.id, response.phonenumber);

          res();
        }, (error) => {
          if (error.error.error && error.error.error.message) {
            // mongoose autogenerate unique error
            rej("Signup failed!")
          }
          this.mAppcontroller.onConnectionFailure();
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

      this.http.post<{ token: string, info: any }>(this.serviceUrl + AnywhereRouter.LOGIN, account, { headers: { 'Content-Type': 'application/json' } })
        .pipe(map((loginData) => {
          console.log(loginData);

          return {
            token: loginData.token,
            id: loginData.info._id,
            phonenumber: loginData.info.phonenumber,
            address: loginData.info.address
          }
        }))
        .subscribe(response => {
          this.token = response.token;
          this.mUserController.createOwner(response.id, response.phonenumber);
          this.mUserController.getOwner().onResponseData(response);

          console.log(this.mUserController.getOwner());

          res();
        }, (error) => {
          if (error.error.message) {
            rej(this.errorConverter(error));
          }
          this.mAppcontroller.onConnectionFailure();
          rej();
        });
    });
  }

  logout() {

  }


  errorConverter(error: HttpErrorResponse) {
    return error.error.message;
  }

  private encodePassword(password: string) {
    return <string>Md5.hashStr(password);
  }

}
