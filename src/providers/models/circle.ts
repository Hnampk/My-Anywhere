import { User } from "./user";
import { Route } from "./route";

export class Circle {
    private admin_id: string;
    private members: Array<User> = [];
    private routes: Array<Route> = [];
    name: string;

    constructor(private _id: string){

    }

    get id(){
        return this._id;
    }

    getMembers(){
        return this.members;
    }

    clearMembers(){
        this.members = [];
    }

    /**
     * Update data for circle
     * @param data : {admin_id, members, name}
     */
    onResponseData(data){
        // console.log(data);

        if(data.name){
            this.name = data.name;
        }

        if(data.admin_id){
            this.admin_id = data.admin_id;
        }
    }

    addMember(member: User){
        this.members.push(member);
    }
}