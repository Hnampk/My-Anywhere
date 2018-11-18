import { User } from "./user";
import { Route } from "./route";
import { Location } from "./location";

export class Circle {
    private admin_id: string;
    private members: Array<User> = [];
    private routes: Array<Route> = [];
    name: string;

    constructor(private _id: string) {

    }

    get id() {
        return this._id;
    }

    getMembers() {
        return this.members;
    }

    clearMembers() {
        this.members = [];
    }

    setAdmin(adminId: string) {
        this.admin_id = adminId;
    }

    getAdminId() {
        return this.admin_id;
    }

    /**
     * Update data for circle
     * @param data : {admin_id, members, name}
     */
    onResponseData(data) {
        // console.log(data);

        if (data.name) {
            this.name = data.name;
        }

        if (data.admin_id) {
            this.admin_id = data.admin_id;
        }
    }

    addMember(member: User) {
        this.members.push(member);
    }

    removeMember(member: User) {
        let index = this.members.findIndex(element => { return member.id == element.id });
        this.members.splice(index, 1);
    }

    updateLocation(memberId: string, location: Location) {
        let member = this.members.find(member => { return member.id == memberId });

        member.updateLastestLocation(location);
    }

    hideMembersMarker(){
        this.members.forEach(member=>{
            if(member.marker){
                member.marker.setVisible(false);
            }
        });
    }
}