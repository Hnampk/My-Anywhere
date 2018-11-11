export class AnywhereRouter{
    // public static SERVICE_URL: string = "http://168.63.254.198:8080/api";
    public static SERVICE_URL: string = "http://localhost:8080/api";

    // Authentication
    public static LOGIN: string = "/users/login/";
    public static SIGN_UP: string = "/users/sign_up/";

    // User
    public static USER: string = "/users/"; //:id
    public static UPDATE_USERINFO: string = "/users/update/"; //:id

    // Circle
    public static CREATE_CIRCLE: string = "/circles/create/";
    public static GET_CIRCLES_BY_USER_ID: string = "/circles/by_user_id/"; //:id
    public static GET_CIRCLE_BY_ID: string = "/circles/" //:id
}