import { AnywhereRouter } from './../anywhere-router';
import { UserController } from './../user-controller/user-controller';
import { CircleController } from './../circle-controller/circle-controller';
import { MapProvider } from './../map/map';
import { EthersProvider } from './../ethers/ethers';
import { HTTP } from '@ionic-native/http';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { PowerManagement } from '@ionic-native/power-management';

import BackgroundGeolocation from 'cordova-plugin-mauron85-background-geolocation';
import { Location } from '../models/location';

@Injectable()
export class BackgroundProvider {
  private lastestUpdate: number;
  private onBackground = false;
  // private localSteps = [];
  private isUpdating = false; // update local step to blockchain status
  private counting = 0; // try to reupdate 5 times
  onHistoryTrace = false;
  private intervalTime = 600000; // minimum time in milliseconds to get a history step. 30mins = 1800000ms

  constructor(
    public platform: Platform,
    private storage: Storage,
    private http: HTTP,
    private mapProvider: MapProvider,
    private ethersProvider: EthersProvider,
    private circleController: CircleController,
    private userController: UserController,
    public powerManagement: PowerManagement) {
    http.setDataSerializer('json');

    platform.ready().then(() => {
      this.configBackgroundGeolocation();
      this.getLastest();
    });
  }

  startTrace() {
    this.onHistoryTrace = true;
  }

  stopTrace() {
    this.onHistoryTrace = false;
  }

  private configBackgroundGeolocation() {
    let config = {
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stopOnTerminate: false,
      // stationaryRadius: 50,
      // distanceFilter: 50,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      debug: false,
      interval: 10000,
      fastestInterval: 20000,
      activitiesInterval: 10000,
      stopOnStillActivity: false
    };

    BackgroundGeolocation.configure(config);

    BackgroundGeolocation.on('location', async (response) => {
      // handle your locations here
      // to perform long running operation on iOS
      // you need to create background task
      BackgroundGeolocation.startTask(async (taskKey) => {
        let address = await this.mapProvider.requestAddressHttp({ lat: response.latitude, lng: response.longitude });
        let location = new Location(response.latitude, response.longitude, address ? address : "");
        location.setTime(response.time);
        let circleIds = this.circleController.getCircles().map(circle => { return circle.id });

        this.updateMyLocation(location, circleIds, this.userController.getOwner().id);

        if (this.onHistoryTrace) {
          if (!this.lastestUpdate)
            await this.getLastest();

          let deltaTime = response.time - this.lastestUpdate; // difference btwn times

          if (deltaTime > 1800000) {
            // > 30 minutes
            let newStep = response.latitude + "," + response.longitude + "," + Date.now();
            let dateStr = new Date().toLocaleDateString().split("/").join("");

            // new step
            let step = { step: newStep, dateStr: dateStr };

            // get the steps from local storage
            this.storage.get('steps-' + this.userController.getOwner().id).then(val => {
              this.lastestUpdate = response.time;

              if (!val) {
                val = [];
              }

              let mySteps = val;
              mySteps.push(step);

              // add new step to local storage
              this.storage.set('steps-' + this.userController.getOwner().id, mySteps).then(() => {

              });
            });
          }
          else {
            // try to update only on foreground mode
            if (!this.onBackground) {
              this.tryToUpdate();
            }
          }
        }
        // execute long running task
        // eg. ajax post location
        // IMPORTANT: task has to be ended by endTask
        BackgroundGeolocation.endTask(taskKey);
      });
    });

    BackgroundGeolocation.on('start', () => {
      this.circleController.joinCurrentCircleRoom();

      console.log('[INFO] BackgroundGeolocation service has been started');
    });

    BackgroundGeolocation.on('stop', () => {
      this.circleController.leaveCurrentCircleRoom();
      console.log('[INFO] BackgroundGeolocation service has been stopped');
    });

    BackgroundGeolocation.on('error', (error) => {
      console.log("ERROR", error)
    });

    BackgroundGeolocation.on('background', () => {
      this.powerManagement.dim().then(() => {
        console.log('enablebackground: Wakelock acquired');
        this.powerManagement.setReleaseOnPause(false).then(() => {
          console.log('enablebackground: setReleaseOnPause success');
        }).catch(error => {
          console.log('enablebackground: setReleaseOnPause Failed to set');
        });
      }).catch(error => {
        console.log('enablebackground: Failed to acquire wakelock');
      });

      this.onBackground = true;
      this.circleController.leaveCurrentCircleRoom();

      console.log('[INFO] App is in background', this.onBackground);
      // you can also reconfigure service (changes will be applied immediately)
      // BackgroundGeolocation.configure({ debug: true });
    });

    BackgroundGeolocation.on('foreground', () => {
      this.powerManagement.release().then(() => {
        console.log('disableBackground: Wakelock released');
      }).catch((error) => {
        console.log('disableBackground: Failed to release wakelock');
      });

      this.onBackground = false;
      // this.circleController.joinAllCircleRooms();
      this.circleController.joinCurrentCircleRoom();

      console.log('[INFO] App is in foreground', this.onBackground);

      BackgroundGeolocation.configure({ debug: false });
    });
  }

  private tryToUpdate() {
    console.log("tryToUpdate", this.isUpdating, this.onBackground);

    if (!this.onBackground && !this.isUpdating) {
      this.isUpdating = true;

      this.storage.get('steps-' + this.userController.getOwner().id).then(async val => {
        if (val && val.length > 0) {
          console.log("before: ", val)
          let onUpdateStep = val.splice(0, 1);
          console.log("after: ", onUpdateStep, val)
          this.storage.set('steps-' + this.userController.getOwner().id, val);

          try {
            // if got error, on pending request exist!
            await this.ethersProvider.addStep(onUpdateStep[0].dateStr, onUpdateStep[0].step);

            this.isUpdating = false;

            if (!this.onBackground && (val.length > 0)) {
              this.tryToUpdate();
            }
          }
          catch (e) {
            console.log("errorrrr", e);
            this.isUpdating = false;
          }
        }
        else {
          this.isUpdating = false;
        }
      });
    }
  }

  private updateLastest(time) {
    this.lastestUpdate = time;
    this.storage.set("lastest-updated-" + this.userController.getOwner().id, time);
  }

  async getLastest() {
    await this.storage.get("lastest-updated-" + this.userController.getOwner().id).then(val => {
      if (!val) {
        this.updateLastest(0);
      }
      else {
        this.lastestUpdate = val;
      }
    });
  }

  /**
   * Save a pending step, which is waiting to be updated to Ethereum
   * @param step 
   * @param time 
   */
  private addStepToLocal(step, time) {
    // TODO:
    //  - Get local storage steps
    //  - Add new step
    //  - Resave steps to local storage
    //  - Update lastest-time in local storage

    this.storage.get('steps-' + this.userController.getOwner().id).then((val) => {
      this.updateLastest(time);
      if (!val) {
        val = [];
      }
      val.push(step);

      this.storage.set('steps-' + this.userController.getOwner().id, val).then(() => {
        if (!this.onBackground)
          this.updateStepsFromLocal();
      });
    });
  }

  /**
   * Update pending steps from local storage to Ethereum
   * * ONLY UPDATE WHEN ON FOREGROUND!
   */
  private updateStepsFromLocal() {
    if (!this.onBackground) {
      if (!this.isUpdating) {
        this.isUpdating = true;
        this.counting = 0;

        this.storage.get('steps-' + this.userController.getOwner().id).then(async (steps: Array<any>) => {
          if (steps && (steps.length > 0)) {
            // There are steps in local storage
            // TODO:
            //  - Take the first step and update
            //  - resave steps to local storage

            let localSteps = steps;
            let onUpdateStep = { ...localSteps[0] };

            localSteps.shift();

            this.storage.set('steps-' + this.userController.getOwner().id, localSteps);
            localSteps = null;
            this.isUpdating = false;

            await this.ethersProvider.addStep(onUpdateStep.dateStr, onUpdateStep.step);

            this.updateStepsFromLocal();
          }
        });
      }
      else {
        // Try to update
        if (this.counting < 5) {
          this.counting++;

          setTimeout(() => {
            this.updateStepsFromLocal();
          }, 1000);
        }
        else {
          this.counting = 0;
        }
      }
    }
  }

  /**
   * Http request to update current location
   * When server receive this request, socket will broadcast location to circles
   * @param location 
   * @param circleIds 
   * @param senderId 
   */
  private updateMyLocation(location: Location, circleIds: Array<string>, senderId: string) {
    let postData = {
      sender_id: senderId,
      circles: circleIds,
      location: location
    }

    this.http.post(AnywhereRouter.SERVICE_URL + AnywhereRouter.UPDATE_LOCATION, postData, {});
  }

  startWatchPosition() {
    BackgroundGeolocation.start();
  }

  stopWatchPosition() {
    BackgroundGeolocation.stop();
    
      this.powerManagement.release().then(() => {
        console.log('disableBackground: Wakelock released');
      }).catch((error) => {
        console.log('disableBackground: Failed to release wakelock');
      });
  }
}
