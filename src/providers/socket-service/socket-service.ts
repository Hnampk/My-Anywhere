import { Circle } from './../models/circle';
import { Injectable } from '@angular/core';

import { Location } from './../models/location';
import { CircleController } from './../circle-controller/circle-controller';
import { UserController } from './../user-controller/user-controller';
import { AnywhereRouter } from './../anywhere-router';

import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

@Injectable()
export class SocketService {

  private socket = io(AnywhereRouter.SERVICE_URL);

  constructor(private mUserController: UserController,
    private mCircleController: CircleController) {
    this.updateMemberLocationEventReceived().subscribe(data => {
        console.log("Received new member's location", data);

        let targetCircle = this.mCircleController.getCircleById(data.circle_id);
        
        targetCircle.updateLocation(data.from, data.location);
    })
  }

  joinCircleRoom(circleId: string) {
    console.log("Join circle room: ", circleId);

    let data = {
      circle_id: circleId,
      sender_id: this.mUserController.getOwner().id
    }

    let a = this.socket.emit('join', data);
    console.log(a);
  }

  leaveCircleRoom(circleId: string) {
    console.log("Leave circle room: ", circleId);
    let data = {
      circle_id: circleId,
      sender_id: this.mUserController.getOwner().id
    }

    this.socket.emit('leave', data);
  }

  sendMessage(circleId: string) {
    console.log(this.socket.disconnected);

    let data = {
      circle_id: circleId,
      sender_id: this.mUserController.getOwner().id,
      message: "Hello from " + this.mUserController.getOwner().name
    }

    try {
      this.socket.emit('message', data);
    }
    catch (e) {
      console.log("error", e);
    }
  }

  newMessageReceived() {
    return new Observable<{ from: string, message: string }>(observer => {
      this.socket.on('new-message', data => {
        observer.next(data);
      });

      return () => {
        this.socket.disconnect();
      };
    });
  }

  updateMyLocation(location: Location, circleIds: Array<string>) {
    let data = {
      sender_id: this.mUserController.getOwner().id,
      circles: circleIds,
      location: location
    }

    this.socket.emit('update-location', data);
  }

  updateMemberLocationEventReceived() {
    return new Observable<{ from: string, location: Location, circle_id: string }>(observer => {
      this.socket.on('new-location', data => {
        observer.next(data);
      });

      return () => {
        this.socket.disconnect();
      };
    });

  }



}
