import { AuthenticationProvider } from './authentication';
import { HttpInterceptor, HttpRequest, HttpHandler } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private mAuthentication: AuthenticationProvider) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        // const authToken = this.mAuthentication.getToken();
        // token for test
        const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZW51bWJlciI6IjA5ODc2NTQzMjEiLCJ1c2VySWQiOiI1YmQxZDcyYWEyMjQyMjEwMzFhOTg0OTUiLCJpYXQiOjE1NDA0ODY4MTN9.hpkymlObnvfcz8hhAqqbztzB8d8s3J7H6Q0ooSPGOok";

        const authRequest = req.clone({
            headers: req.headers
                .set("Authorization", "Bearer " + authToken)
                // .append('Content-Type', 'application/json')
                // .append('Access-Control-Allow-Origin', 'http://localhost:8100')
        });
        return next.handle(authRequest);
    }
}