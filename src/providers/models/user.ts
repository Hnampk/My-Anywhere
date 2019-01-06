import { LocationBase } from './location-base';
import { Location } from './location';
import { Marker, LatLng } from '@ionic-native/google-maps';

export class User {
    name: string;
    avatar: string;
    address: LocationBase;
    staticCode: string;
    lastestLocation: Location;
    marker: Marker;
    isOnline: boolean = false;
    walletAddress: string = "";
    password: string = "";
    distance: string = "";

    constructor(private _id: string, private _phonenumber: string) { }

    get id() {
        return this._id;
    }

    get phonenumber() {
        return this._phonenumber;
    }

    onResponseData(data, distance: string) {
        if (data.name) {
            this.name = data.name;
        }

        if (data.avatar) {
            this.avatar = data.avatar;
        }

        if (data.static_code) {
            this.staticCode = data.static_code;
        }

        if (data.address) {
            this.address = {
                lat: data.address.lat,
                lng: data.address.lng,
                address: data.address.content
            }
        }

        if (data.lastest_location) {
            this.lastestLocation = new Location(data.lastest_location._lat, data.lastest_location._lng, data.lastest_location._address);
            this.lastestLocation.setTime(data.lastest_location.time);
        }

        if(data.wallet_address){
            this.walletAddress = data.wallet_address;
        }

        if(distance){
            this.distance = distance;
        }
    }

    updateLastestLocation(location: Location, distanceOnMeters?: string) {
        if (!this.lastestLocation) {
            this.lastestLocation = new Location(null, null, null);
        }

        this.distance = distanceOnMeters;
        this.lastestLocation.update(location);
        this.updateMarkerPosition();
    }

    setPassword(password: string){
        this.password = password;
    }

    // Google Maps

    setMarker(marker: Marker) {
        this.marker = marker;
    }

    updateMarkerPosition() {
        if (this.marker) {
            this.marker.setPosition(new LatLng(this.lastestLocation.lat, this.lastestLocation.lng));
            // this.marker.setVisible(true);
        }
    }
}