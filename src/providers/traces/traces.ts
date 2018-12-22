import { BackgroundProvider } from './../background/background';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { EthersProvider } from '../ethers/ethers';
import { Location } from '../models/location';

@Injectable()
export class TracesProvider {
  myInterval;

  traces = new Map<string, Map<string, Array<Location>>>();

  constructor(public http: HttpClient,
    private ethersProvider: EthersProvider,
    private backgroundProvider: BackgroundProvider,
    private geolocation: Geolocation) {
  }

  startTrace() {
    this.backgroundProvider.startTrace();
  }

  stopTrace() {
    this.backgroundProvider.stopTrace();
  }

  private getCurrentPositionAndPost() {
    this.geolocation.getCurrentPosition().then((location: Geoposition) => {
      let newStep = location.coords.latitude + "," + location.coords.longitude + "," + Date.now();
      let dateStr = new Date().toLocaleDateString().split("/").join("");

      this.ethersProvider.addStep(dateStr, newStep);
    })
  }

  async getTrace(address: string, dateStr: string) {
    let numberOfSteps = 0

    if (this.traces.get(address) && this.traces.get(address).get(dateStr)) {
      numberOfSteps = this.traces.get(address).get(dateStr).length;
    }

    if (numberOfSteps > 0) {
      // check if the request date is today and has new step
      if ((dateStr === new Date().toLocaleDateString())) {
        let value = await this.ethersProvider.getStepsValue(address, dateStr);
        if (value.toNumber() != numberOfSteps) {
          await this.getStepsFromBlockchain(address, dateStr, value);
        }
      }
    }
    else {
      await this.getStepsFromBlockchain(address, dateStr);
    }
    return this.traces.get(address).get(dateStr);
  }

  async getStepsFromBlockchain(address: string, dateStr: string, value?: number) {
    let steps = await this.ethersProvider.getStepsOnDate(address, dateStr, value);

    let stepsByDate = new Map<string, Array<any>>();

    stepsByDate.set(dateStr, steps);
    this.traces.set(address, stepsByDate);
  }

}
