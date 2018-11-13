export class AnywhereRouter{
    // public static SERVICE_URL: string = "http://168.63.254.198:8080/api";
    public static SERVICE_URL: string = "http://localhost:8080/api";

    // Authentication
    public static LOGIN: string = "/users/login/";
    public static SIGN_UP: string = "/users/sign_up/";

    // User
    public static USER: string = "/users/"; //:id
    public static UPDATE_USERINFO: string = "/users/update/"; //:id
    public static FIND_USER_BY_PHONENUMBER: string = "/users/by_phonenumber/"; //:phonenumber
    public static FIND_USER_BY_STATIC_CODE: string = "/users/by_static_code/"; //:static_code


    // Circle
    public static CREATE_CIRCLE: string = "/circles/create/";
    public static ADD_MEMBER_TO_CIRCLE: string = "/circles/add_member/"; //:circle_id
    public static GET_CIRCLES_BY_USER_ID: string = "/circles/by_user_id/"; //:id
    public static GET_CIRCLE_BY_ID: string = "/circles/"; //:circle_id
}