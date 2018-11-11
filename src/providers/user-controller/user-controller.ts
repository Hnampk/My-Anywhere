import { User } from './../models/user';
import { AppController } from './../app-controller/app-controller';
import { LocationBase } from './../models/location-base';
import { AnywhereRouter } from './../anywhere-router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';
import { Events } from 'ionic-angular';

@Injectable()
export class UserController {
  private serviceUrl = AnywhereRouter.SERVICE_URL;
  /**
   * The user who logged in on this device
   */
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
   * Get user's info from Server
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
   * Update user's info: Home Address
   * @param location 
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

  /**
   * Update user's info: Display name
   * @param name 
   */
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

  updateUserInfo(name: string, avatarImage: File) {
    let userData = new FormData();

    userData.append('name', name);
    userData.append('image', avatarImage, this.owner.phonenumber);
    console.log("dcmmm", userData.get("name"))
    console.log("dcmmm", userData.get("image"))

    

    // let testHeader = new HttpHeaders();
    // testHeader.append('Access-Control-Allow-Origin', 'http://localhost:8100');
    
    this.http.post(this.serviceUrl + AnywhereRouter.UPDATE_USERINFO, userData)
      .subscribe(response => {
        console.log(response);
      }, error => {
        console.log(error);
      })
  }

  /**
   * Emit "user:updated" event
   * => Update Menu
   */
  onUserUpdated() {
    this.events.publish("user:updated");
  }

}