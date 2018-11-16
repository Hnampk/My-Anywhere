import { LocationBase } from './location-base';
import { Location } from './location';

export class User {
    name: string;
    avatar: string;
    address: LocationBase;
    staticCode: string;
    lastestLocation: Location;
    isOnline: boolean = false;

    constructor(private _id: string, private _phonenumber: string) { }

    get id() {
        return this._id;
    }

    get phonenumber() {
        return this._phonenumber;
    }

    onResponseData(data) {
        console.log(data);
        if (data.name) {
            this.name = data.name;
        }

        if (data.avatar) {
            this.avatar = data.avatar;
        }

        if(data.static_code){
            this.staticCode = data.static_code;
        }

        if (data.address) {
            this.address = {
                lat: data.address.lat,
                lng: data.address.lng,
                address: data.address.content
            }
        }

        if(data.lastest_location){
            this.lastestLocation = new Location(data.lastest_location._lat, data.lastest_location._lng, data.lastest_location._address);
            this.lastestLocation.setTime(data.lastest_location.time);
        }
    }

    updateLastestLocation(location: Location){
        console.log(location);
        this.lastestLocation.update(location);
    }
}