import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ILatLng, LatLng,
   GeocoderRequest, Geocoder, GeocoderResult,
} from '@ionic-native/google-maps';

@Injectable()
export class MapServices {

  constructor(public http: HttpClient) {
  }

  requestAddress(location: ILatLng) {
    return new Promise((res, rej) => {
      let geoRequest: GeocoderRequest = {
        position: location
      }

      Geocoder.geocode(geoRequest).then((data: GeocoderResult[]) => {
        if (data && data.length > 0 && data[0]['extra'].lines.length > 0) {
          let address = data[0]['extra'].lines[0];
          res(address);
        }
        res();
      }).catch(err => {
        rej();
      });
    }).catch(e => {
      console.log(e);
    });;
  }

  requestLatLng(address: string) {
    return new Promise((res, rej) => {
      let geoRequest: GeocoderRequest = {
        address: address
      }

      Geocoder.geocode(geoRequest).then((data: GeocoderResult[]) => {
        if (data && data.length > 0 && data[0]['position']) {
          let location = new LatLng(data[0]['position'].lat, data[0]['position'].lng);

          res(location);
        }
      }).catch(err => {
        rej();
      });
    }).catch(e => {
      console.log(e);
    });
  }
}
