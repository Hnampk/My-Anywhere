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
  /**
   * Locally store all the Circles of User
   */
  private circles: Array<Circle> = [];

  constructor(public http: HttpClient,
    private mUserController: UserController,
    private events: Events
  ) { }

  clearCircles() {
    this.circles = [];
  }

  getCircles() {
    return this.circles;
  }

  /**
   * Make request to create new Circle
   * @param name 
   */
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
          this.addNewCircle(response.info)
          this.onCirclesUpdated();
          res();
        }, error => {
          rej(error);
        });
    });
  }

  addMemberToCircle(circle: Circle, member: User){
    return new Promise((res, rej)=>{

      // send request to create new circle
      this.http.patch<{ info: any }>(this.serviceUrl + AnywhereRouter.ADD_MEMBER_TO_CIRCLE + circle.id, {member_id: member.id})
        .subscribe(response => {
          circle.addMember(member);
          console.log(circle);

          res();
        }, error => {
          rej(error);
        });
    });
  }

  /**
   * Get all circles of User
   * This will call getCirclesByUserId() function with current User's id
   */
  getMyCircles() {
    return new Promise((res, rej) => {
      this.getCirclesByUserId(this.mUserController.getOwner().id)
        .then(() => {
          res();
        });
    });
  }

  /**
   * Get Circles of a User From Server, By User Id
   * @param userId 
   */
  private getCirclesByUserId(userId: string) {
    console.log("getCirclesByUserId")
    return new Promise((res, rej) => {
      // if (!this.mAppcontroller.hasInternet()) {
      //   rej();
      // }

      this.http.get<{ circles: Array<any> }>(this.serviceUrl + AnywhereRouter.GET_CIRCLES_BY_USER_ID + userId)
        .subscribe(response => {
          // merge circles
          this.circles = [];

          response.circles.forEach(element => {
            this.addNewCircle(element);
          });
          this.onCirclesUpdated();
          res();
          // console.log(this.circles);
        }, error => {
          rej(error);
        });
    });
  }

  getCircleById(circleId: string) {
    return new Promise((res, rej) => {
      // if (!this.mAppcontroller.hasInternet()) {
      //   rej();
      // }

      this.http.get<{ circle: any }>(this.serviceUrl + AnywhereRouter.GET_CIRCLE_BY_ID + circleId)
        .subscribe(async response => {
          let resultCircle = <Circle>await this.updateCircle(response.circle);

          res(resultCircle);
        }, error => {
          console.log(error);
          rej(error);
        });
    });
  }

  /**
   * add circle to local variable
   * @param circleData 
   */
  private addNewCircle(circleData) {
    // update circle info
    let circle = new Circle(circleData._id);
    circle.onResponseData(circleData);

    this.circles.push(circle);
  }

  private updateCircle(circleData) {
    return new Promise((res, rej) => {
      for (let i = 0; i < this.circles.length; i++) {
        if (this.circles[i].id == circleData._id) {
          let circle = this.circles[i];

          circle.onResponseData(circleData);
          circle.clearMembers();
          console.log("-----------------")
          // update circle's members
          circleData.members.forEach((memberId: string) => {
            console.log(memberId);
            this.mUserController.getUserInfoById(memberId)
              .then(userInfo => {
                // update member info
                let member = new User(memberId, userInfo['phonenumber']);
                member.onResponseData(userInfo);

                circle.addMember(member);
                console.log(circle.getMembers())
              });
          });

          res(circle);
        }
      }
    });

  }

  /**
   * Emit "circles:updated" event
   * => Update Menu
   */
  private onCirclesUpdated() {
    this.events.publish("circles:updated");
  }

}
