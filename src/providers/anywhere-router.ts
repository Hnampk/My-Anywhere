export class AnywhereRouter{
    // public static SERVICE_URL: string = "http://168.63.254.198:8080";
    public static SERVICE_URL: string = "http://localhost:8080";

    // Authentication
    public static LOGIN: string = "/api/users/login/";
    public static SIGN_UP: string = "/api/users/sign_up/";

    // User
    public static USER: string = "/api/users/"; //:id
    public static UPDATE_USERINFO: string = "/api/users/update/"; //:id
    public static FIND_USER_BY_PHONENUMBER: string = "/api/users/by_phonenumber/"; //:phonenumber
    public static FIND_USER_BY_STATIC_CODE: string = "/api/users/by_static_code/"; //:static_code

    // Circle
    public static CREATE_CIRCLE: string = "/api/circles/create/";
    public static ADD_MEMBER_TO_CIRCLE: string = "/api/circles/add_member/"; //:circle_id
    public static GET_CIRCLES_BY_USER_ID: string = "/api/circles/by_user_id/"; //:id
    public static GET_CIRCLE_BY_ID: string = "/api/circles/"; //:circle_id
}