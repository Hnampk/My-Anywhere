import { User } from './../models/user';
import { Circle } from './../models/circle';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserController } from '../user-controller/user-controller';
import { AnywhereRouter } from '../anywhere-router';
import { Events } from 'ionic-angular';

import { map } from 'rxjs/operators';

@Injectable()
export class CircleController {
  private serviceUrl = AnywhereRouter.SERVICE_URL;
  private circles = [];


  constructor(public http: HttpClient,
    private mUserController: UserController,
    private events: Events
  ) { }

  clearCircles(){
    this.circles = [];
  }

  createCircle(name: string) {
    return new Promise((res, rej) => {
      // if (!this.mAppcontroller.hasInternet()) {
      //   rej();
      // }

      let newCircle = {
        "admin_id": this.mUserController.getOwner().id,
        "name": name
      }

      // send request to create new circle
      this.http.post<{ info: any }>(this.serviceUrl + AnywhereRouter.CREATE_CIRCLE, newCircle)
        .subscribe(response => {
          this.fetchNewCircle(response.info)
          this.onCirclesUpdated();
          res();
        });
    })
  }

  getCircles() {
    return this.circles;
  }

  getMyCircles() {
    return new Promise((res, rej) => {
      console.log(this.mUserController.getOwner().id);

      this.getCirclesByUserId(this.mUserController.getOwner().id)
        .then(() => {
          res();
        });
    });
  }

  /**
   * Get Circles From Server, By User Id
   * @param userId 
   */
  getCirclesByUserId(userId: string) {
    return new Promise((res, rej) => {
      // if (!this.mAppcontroller.hasInternet()) {
      //   rej();
      // }

      this.http.get<{ circles: Array<any> }>(this.serviceUrl + AnywhereRouter.GET_CIRCLES_BY_USER_ID + userId)
        .subscribe(response => {
          console.log(response);
          // merge circles
          this.circles = [];

          response.circles.forEach(element => {
            this.fetchNewCircle(element);
          });
          this.onCirclesUpdated();
          res();
          // console.log(this.circles);
        });
    });
  }

  /**
   * add circle to local variable
   * @param circleData 
   */
  fetchNewCircle(circleData) {
    // update circle info
    let circle = new Circle(circleData._id);
    circle.onResponseData(circleData);

    // update circle's members
    circleData.members.forEach((memberId: string) => {
      this.mUserController.getUserInfo(memberId)
        .then(userInfo => {
          // update member info
          let member = new User(memberId, userInfo['phonenumber']);
          member.onResponseData(userInfo);

          circle.addMember(member);
        });
    });

    this.circles.push(circle);
  }

  onCirclesUpdated() {
    this.events.publish("circles:updated");
  }

}
