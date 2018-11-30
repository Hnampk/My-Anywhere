import { AnywhereRouter } from './../anywhere-router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Route } from '../models/route';

@Injectable()
export class RouteController {
  private serviceUrl = AnywhereRouter.SERVICE_URL;

  private routes: Array<Route> = [];

  constructor(private http: HttpClient) {

  }

  createRoute(route: Route) {
    return new Promise<Route>((res, rej) => {
      // if (!this.mAppcontroller.hasInternet()) {
      //   rej();
      // }

      let newRoute = {
        "circle_id": route.cỉcleId,
        "name": route.name,
        "locations": route.locations
      }

      // send request to create new circle
      this.http.post<{ route: any }>(this.serviceUrl + AnywhereRouter.CREATE_ROUTE, newRoute)
        .subscribe(response => {
          if (response.route) {
            route.id = response.route._id;

            this.routes.push(route);
          }
        }, error => {
          rej(error);
        });
    });
  }

}
