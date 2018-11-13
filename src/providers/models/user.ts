import { LocationBase } from './location-base';

export class User {
    name: string;
    avatar: string;
    address: LocationBase;
    staticCode: string;

    constructor(private _id: string, private _phonenumber: string) { }

    get id() {
        return this._id;
    }

    get phonenumber() {
        return this._phonenumber;
    }

    onResponseData(data) {
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
    }
}