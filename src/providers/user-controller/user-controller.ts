import { User } from './../models/user';
import { AppController } from './../app-controller/app-controller';
import { LocationBase } from './../models/location-base';
import { AnywhereRouter } from './../anywhere-router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';
import { Events } from 'ionic-angular';

@Injectable()
export class UserController {
  private serviceUrl = AnywhereRouter.SERVICE_URL;
  private owner: User;

  constructor(public http: HttpClient,
    private events: Events,
    private mAppcontroller: AppController) { }


  getOwner() {
    return this.owner;
  }

  removeOwner() {
    this.owner = null;
  }

  createOwner(id: string, phonenumber: string) {
    this.owner = new User(id, phonenumber);
  }

  /**
   * @param id UserId
   */
  getUserInfo(id: string) {
    return new Promise((res, rej) => {
      // if (!this.mAppcontroller.hasInternet()) {
      //   rej();
      // }

      this.http.get<{ message: string, user: any }>(this.serviceUrl + AnywhereRouter.USER + id)
        .pipe(map(result => {
          return result.user
        }))
        .subscribe(response => {
          res(response);
        }, error => {
          // console.log(error);
          rej();
        });
    });
  }

  /**
   * @param id UserId
   * @param address New address
   */
  updateAddress(location: LocationBase) {
    return new Promise((res, rej) => {
      // if (!this.mAppcontroller.hasInternet()) {
      //   rej();
      // }

      let reqBody = {
        address: {
          lat: location.lat,
          lng: location.lng,
          content: location.address
        }
      }

      this.http.patch(this.serviceUrl + AnywhereRouter.UPDATE_USERINFO + this.owner.id, reqBody)
        .subscribe(response => {
          this.owner.address = location;
          this.onUserUpdated();

          res();
        }, error => {
          console.log(error);
          this.mAppcontroller.onConnectionFailure();
          rej();
        });
    });
  }

  updateDisplayName(name: string) {
    return new Promise((res, rej) => {
      let reqBody = {
        name: name
      }

      this.http.patch(this.serviceUrl + AnywhereRouter.UPDATE_USERINFO + this.owner.id, reqBody)
        .subscribe(response => {
          this.owner.name = name;
          this.onUserUpdated();

          res();
        }, error => {
          console.log(error);
          this.mAppcontroller.onConnectionFailure();
          rej();
        });
    });
  }

  onUserUpdated() {
    this.events.publish("user:updated");
  }

}
