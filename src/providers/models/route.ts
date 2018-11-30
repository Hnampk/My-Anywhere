import { Marker } from '@ionic-native/google-maps';
import { Location } from "./location";


export class Route {
    private _id: string;
    name: string;
    private _circleId: string;
    private _locations: Array<Location> = [];

    onResponseData(locations: Array<LocationWithMarker>) {
        for (let i = 0; i < locations.length; i++) {
            let locationData = locations[i];

            this._locations.push(locationData.location);


        }
    }

    set id(id: string){
        this._id = id;
    }

    set cỉcleId(circleId: string){
        this._circleId = circleId;
    }
    
    get locations(){
        return this._locations;
    }
}

export class LocationWithMarker {
    private _location: Location;
    private _marker: Marker;

    constructor(location: Location) {
        this._location = location;
    }

    get location() {
        return this._location;
    }

    set marker(marker: Marker) {
        this._marker = marker;
    }

    get marker() {
        return this._marker;
    }
}