import { LocationBase } from './location-base';


export class Location implements LocationBase{
    name: string = "";
    time: number;

    constructor(private _lat: number, private _lng: number, private _address: string){

    }

    update(data){
        this._lat = data._lat;
        this._lng = data._lng;
        this._address = data._address;
        this.name = data.name;
        this.time = data.time;
    }

    get lat(){
        return this._lat;
    }

    get lng(){
        return this._lng;
    }

    get address(){
        return this._address;
    }
    set address(address: string){
        this._address = address;
    }

    setTime(time: number){
        this.time = time;
    }

    setName(name: string){
        this.name = name;
    }

    
}