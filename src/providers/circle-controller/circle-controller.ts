import { AnywhereRouter } from './../anywhere-router';
import { User } from './../models/user';
import { Circle } from './../models/circle';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserController } from '../user-controller/user-controller';
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

  getCircleById(circleId: string) {
    return this.circles.find(circle => { return circle.id == circleId });
  }

  /**
   * Make request to create new Circle
   * @param name 
   */
  createCircle(name: string) {
    return new Promise<Circle>((res, rej) => {
      // if (!this.mAppcontroller.hasInternet()) {
      //   rej();
      // }

      let newCircle = {
        "admin_id": this.mUserController.getOwner().id,
        "name": name
      }

      // send request to create new circle
      this.http.post<{ info: any }>(this.serviceUrl + AnywhereRouter.CREATE_CIRCLE, newCircle)
        .subscribe(async response => {
          let circle = await this.addNewCircle(response.info)

          this.onCirclesUpdated(this.circles[this.circles.length - 1]);
          res(circle);
        }, error => {
          rej(error);
        });
    });
  }

  addMemberToCircle(circle: Circle, member: User) {
    return new Promise((res, rej) => {

      // send request to create new circle
      this.http.patch<{ info: any }>(this.serviceUrl + AnywhereRouter.ADD_MEMBER_TO_CIRCLE + circle.id, { member_id: member.id })
        .subscribe(response => {
          circle.addMember(member);
          console.log(circle);

          res();
        }, error => {
          rej(error);
        });
    });
  }

  removeMemberFromCircle(circle: Circle, member: User) {
    return new Promise((res, rej) => {

      // send request to create new circle
      this.http.patch<{ info: any }>(this.serviceUrl + AnywhereRouter.REMOVE_MEMBER_FROM_CIRCLE + circle.id, { member_id: member.id })
        .subscribe(response => {
          // circle.addMember(member);
          // console.log(circle);
          console.log(response);
          circle.removeMember(member);
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
      this.getCirclesByUserIdFromServer(this.mUserController.getOwner().id)
        .then(() => {
          res();
        });
    });
  }

  /**
   * Get Circles of a User From Server, By User Id
   * @param userId 
   */
  private getCirclesByUserIdFromServer(userId: string) {
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
          this.onCirclesUpdated(this.circles[0]);
          res();
          // console.log(this.circles);
        }, error => {
          rej(error);
        });
    });
  }

  getCircleByIdFromServer(circleId: string) {
    return new Promise<Circle>((res, rej) => {
      // if (!this.mAppcontroller.hasInternet()) {
      //   rej();
      // }

      this.http.get<{ circle: any }>(this.serviceUrl + AnywhereRouter.GET_CIRCLE_BY_ID + circleId)
        .subscribe(async response => {
          let resultCircle = <Circle>await this.updateCircle(response.circle);

          res(resultCircle);
        }, error => {
          rej(error);
        });
    });
  }

  makeAdmin(memberId: string, circleId: string) {
    return new Promise((res, rej) => {
      // if (!this.mAppcontroller.hasInternet()) {
      //   rej();
      // }

      let reqBody = {
        member_id: memberId
      }

      this.http.patch(this.serviceUrl + AnywhereRouter.MAKE_CIRCLE_ADMIN + circleId, reqBody)
        .subscribe(response => {
          let circle = this.circles.find(circle => { return circle.id == circleId });
          
          circle.setAdmin(memberId);
          
          res();
        }, error => {
          rej(error);

        })
    });
  }

  /**
   * add circle to local variable
   * @param circleData 
   */
  private addNewCircle(circleData) {
    return new Promise<Circle>((res, rej) => {
      // update circle info
      let circle = new Circle(circleData._id);
      circle.onResponseData(circleData);

      this.circles.push(circle);
      res(circle);
    });
  }

  private updateCircle(circleData) {
    return new Promise((res, rej) => {
      for (let i = 0; i < this.circles.length; i++) {
        if (this.circles[i].id == circleData._id) {
          let circle = this.circles[i];

          circle.onResponseData(circleData);
          circle.clearMembers();
          // update circle's members
          circleData.members.forEach((memberId: string) => {
            this.mUserController.getUserInfoById(memberId)
              .then(userInfo => {
                // update member info
                let member = new User(memberId, userInfo['phonenumber']);
                member.onResponseData(userInfo);

                circle.addMember(member);
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
   * @param circle current view circle
   */
  onCirclesUpdated(circle: Circle) {
    this.events.publish("circles:updated", { circle });
  }

  onShowCircle(circle: Circle) {
    this.events.publish("circles:show", { circle });
  }

}
