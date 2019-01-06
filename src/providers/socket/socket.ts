import { Platform } from 'ionic-angular';
// import { BackgroundGeolocation, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import { Circle } from './../models/circle';
import { Injectable } from '@angular/core';

import { Location } from './../models/location';
import { CircleController } from './../circle-controller/circle-controller';
import { UserController } from './../user-controller/user-controller';
import { AnywhereRouter } from './../anywhere-router';

import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

@Injectable()
export class SocketProvider {

  private onWatchPosition = false;
  private onStartingBackground = false;

  private socket = io(AnywhereRouter.SERVICE_URL);;

  constructor(
    public platform: Platform
  ) {
  }

  connect() {
    if (!this.socket.disconnected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  joinCircleRoom(circleId: string, senderId: string) {
    console.log("Join circle room: ", circleId);

    let data = {
      circle_id: circleId,
      sender_id: senderId
    }

    let a = this.socket.emit('join', data);
  }

  leaveCircleRoom(circleId: string, senderId: string) {
    console.log("Leave circle room: ", circleId);
    let data = {
      circle_id: circleId,
      sender_id: senderId
    }

    this.socket.emit('leave', data);
  }

  sendMessage(circleId: string, senderId: string) {
    console.log(this.socket.disconnected);

    let data = {
      circle_id: circleId,
      sender_id: senderId,
      message: "Hello from " + senderId
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

  updateMyLocation(location: Location, circleIds: Array<string>, senderId: string) {
    let data = {
      sender_id: senderId,
      circles: circleIds,
      location: location
    }

    if (this.socket.disconnected)
      this.socket.open();

    this.socket.emit('update-location', data);
  }

  updateMemberLocationEventReceived() {
    return new Observable<{ from: string, location: any, circle_id: string }>(observer => {
      this.socket.on('new-location', data => {
        observer.next(data);
      });

      return () => {
        this.socket.disconnect();
      };
    });
  }

}
