import { SocketProvider } from './../socket/socket';
import { MapProvider } from './../map/map';
import { UserController } from './../user-controller/user-controller';
import { CircleController } from './../circle-controller/circle-controller';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Location } from '../models/location';


@Injectable()
export class LocationProvider {

  subscription;
  constructor(public http: HttpClient,
    private geolocation: Geolocation,
    private mapProvider: MapProvider,
    private circleController: CircleController,
    private userController: UserController,
    private socketProvider: SocketProvider) {
  }

  startWatchPosition() {
    if (!this.subscription) {
      this.subscription = this.geolocation.watchPosition().subscribe(async (data: Geoposition) => {
        let address = await this.mapProvider.requestAddress({ lat: data.coords.latitude, lng: data.coords.longitude });
        let location = new Location(data.coords.latitude, data.coords.longitude, address);
        location.setTime(data.timestamp);
        let circleIds = this.circleController.getCircles().map(circle => { return circle.id });

        this.socketProvider.updateMyLocation(location, circleIds, this.userController.getOwner().id);
        // console.log("watchPosition", data);
      });
    }
  }

  stopWatchPosition() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}
