import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http';
import {
  ILatLng, LatLng,
  GeocoderRequest, Geocoder, GeocoderResult,
  LatLngBounds
} from '@ionic-native/google-maps';

@Injectable()
export class MapProvider {

  constructor(public http: HTTP) {
    http.setDataSerializer('json');
  }

  requestAddress(location: ILatLng) {
    return new Promise<string>((res, rej) => {
      let geoRequest: GeocoderRequest = {
        position: location
      }

      Geocoder.geocode(geoRequest).then((data: GeocoderResult[]) => {
        if (data && data.length > 0 && data[0]['extra'].lines.length > 0) {
          let address = data[0]['extra'].lines[0];
          res(address);
        }
        res("");
      }).catch(err => {
        rej("");
      });
    }).catch(e => {
      return "";
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

  async requestAddressHttp(location: ILatLng) {
    let latlng = location.lat + "," + location.lng;

    try {
      let response = await this.http.get("https://maps.googleapis.com/maps/api/geocode/json", { "latlng": latlng, "key": "AIzaSyCCxm27bUK2yZNPqALoGai2vC7NXPiZCYk" }, {});

      if (response) {
        let jsonData = JSON.parse(response.data);

        if (jsonData && jsonData.results.length > 0) {
          let result = jsonData.results[0]
          return result.formatted_address;
        }
        return "";
      }
    }
    catch (e) {
      return "";
    }
  }

  public static getCenterPoint(locations: Array<ILatLng>) {
    let bound = new LatLngBounds();

    for (let i = 0; i < locations.length; i++) {
      let location = locations[i]

      bound.extend(location);
    }

    return bound.getCenter();
  }

  public static calculateDistance(lat1, lng1, lat2, lng2) {
    let r = 6371; // earth radius in kilometers

    let dLat = this.degreeToRadian(lat2 - lat1); // delta latitude
    let dLng = this.degreeToRadian(lng2 - lng1); // delta longitude
    let tlat1 = this.degreeToRadian(lat1);
    let tlat2 = this.degreeToRadian(lat2);

    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(tlat1) * Math.cos(tlat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    return (r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  public static degreeToRadian(value) {
    return value * Math.PI / 180;
  }

  public static radianToDegree(value) {
    return value * 180 / Math.PI;
  }
}
