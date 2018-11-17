import { Platform } from 'ionic-angular';
// import { BackgroundGeolocation, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import { MapServices } from './../map-services/map-services';
import { Circle } from './../models/circle';
import { Injectable } from '@angular/core';

import { Location } from './../models/location';
import { CircleController } from './../circle-controller/circle-controller';
import { UserController } from './../user-controller/user-controller';
import { AnywhereRouter } from './../anywhere-router';

import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import BackgroundGeolocation from 'cordova-plugin-mauron85-background-geolocation';

@Injectable()
export class SocketService {

  private onWatchPosition = false;
  private onStartingBackground = false;

  private socket = io(AnywhereRouter.SERVICE_URL);

  constructor(private mCircleController: CircleController,
    private userController: UserController,
    private mapServices: MapServices,
    public platform: Platform,
    // private backgroundGeolocation: BackgroundGeolocation
  ) {
    this.updateMemberLocationEventReceived().subscribe(data => {
      console.log("Received new member's location", data);

      let targetCircle = this.mCircleController.getCircleById(data.circle_id);

      targetCircle.updateLocation(data.from, data.location);
    });

    platform.ready().then(() => {
      let config = {
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 1,
        // url: 'http://168.63.254.198:8080/',
        // httpHeaders: {
        //   'Content-Type': 'application/json'
        // },
        debug: true, //  enable this hear sounds for background-geolocation life-cycle.
        stopOnTerminate: false, // enable this to clear background location settings when the app terminates
      };

      BackgroundGeolocation.configure(config);

      BackgroundGeolocation.on('location', (response) => {
        // handle your locations here
        // to perform long running operation on iOS
        // you need to create background task
        BackgroundGeolocation.startTask(async (taskKey) => {
          // console.log("taskKey", response);

          let address = await this.mapServices.requestAddress({ lat: response.latitude, lng: response.longitude });
          let location = new Location(response.latitude, response.longitude, address);
          location.setTime(Date.now());
          let circleIds = this.mCircleController.getCircles().map(circle => { return circle.id });

          this.updateMyLocation(location, circleIds, this.userController.getOwner().id);
          // execute long running task
          // eg. ajax post location
          // IMPORTANT: task has to be ended by endTask
          BackgroundGeolocation.endTask(taskKey);
        });
      });

      BackgroundGeolocation.on('start', () => {
        this.onWatchPosition = true;
        this.onStartingBackground = false;
        console.log('[INFO] BackgroundGeolocation service has been started');
      });

      BackgroundGeolocation.on('stop', () => {
        this.onWatchPosition = false;
        this.onStartingBackground = false;
        console.log('[INFO] BackgroundGeolocation service has been stopped');
      });

      BackgroundGeolocation.on('error', () => {
        this.onStartingBackground = false;
      });
    });
  }

  joinCircleRoom(circleId: string, senderId: string) {
    console.log("Join circle room: ", circleId);

    let data = {
      circle_id: circleId,
      sender_id: senderId
    }

    let a = this.socket.emit('join', data);
    console.log(a);
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

  startWatchPosition() {


    //   this.backgroundGeolocation.configure(config)
    //     .subscribe(async (response: BackgroundGeolocationResponse) => {

    //       // let address = await this.mapServices.requestAddress({ lat: response.latitude, lng: response.longitude });
    //       // let location = new Location(response.latitude, response.longitude, address);
    //       // let circleIds = this.mCircleController.getCircles().map(circle => { return circle.id });

    //       // this.updateMyLocation(location, circleIds, this.userController.getOwner().id);
    //       console.log(response);

    //       // this.http.post('http://168.63.254.198:8080/', newLocation, { headers: { 'Content-Type': 'application/json' } }).subscribe(data => {
    //       //   console.log(data);

    //       // });

    //       // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
    //       // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
    //       // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
    //       this.backgroundGeolocation.finish(); // FOR IOS ONLY
    //     },
    //       error => {
    //         console.log(error);
    //       });


    //   // start recording location
    if (!this.onWatchPosition && !this.onStartingBackground) {
      console.log("Let's watch position");
      this.onStartingBackground = true;
      BackgroundGeolocation.start();
    }
  }

  stopWatchPosition() {
    if (this.onWatchPosition && !this.onStartingBackground) {
      console.log("stopWatchPosition");
      BackgroundGeolocation.stop();
    }

  }

}
