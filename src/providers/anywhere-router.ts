export class AnywhereRouter{
    public static SERVICE_URL: string = "http://52.187.32.90:8080";
    // public static SERVICE_URL: string = "http://localhost:8080";

    // Authentication
    public static LOGIN: string = "/api/users/login/";
    public static SIGN_UP: string = "/api/users/sign_up/";

    // User
    public static USER: string = "/api/users/"; //:id
    public static UPDATE_USERINFO: string = "/api/users/update/"; //:id
    public static FIND_USER_BY_PHONENUMBER: string = "/api/users/by_phonenumber/"; //:phonenumber
    public static FIND_USER_BY_STATIC_CODE: string = "/api/users/by_static_code/"; //:static_code
    public static UPDATE_WALLET_ADDRESS: string = "/api/users/update_wallet_address/" // :id

    // Circle
    public static CREATE_CIRCLE: string = "/api/circles/create/";
    public static ADD_MEMBER_TO_CIRCLE: string = "/api/circles/add_member/"; //:circle_id
    public static REMOVE_MEMBER_FROM_CIRCLE: string = "/api/circles/remove_member/"; //:circle_id
    public static GET_CIRCLES_BY_USER_ID: string = "/api/circles/by_user_id/"; //:id
    public static GET_CIRCLE_BY_ID: string = "/api/circles/"; //:circle_id
    public static MAKE_CIRCLE_ADMIN: string = "/api/circles/make_admin/"; //:circle_id

    // Update location
    public static UPDATE_LOCATION: string = "/api/update_location/";

    // Route
    public static CREATE_ROUTE: string = "/api/routes/create/";
    public static GET_ROUTE_BY_ID: string = "/api/routes/"; //:route_id
    public static UPDATE_ROUTE: string = "/api/routes/update/"; //:route_id
}