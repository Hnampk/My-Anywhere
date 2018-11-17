import { LocationBase } from './../../providers/models/location-base';
import { AuthenticationProvider } from './../../providers/authentication/authentication';
import { MapServices } from './../../providers/map-services/map-services';
import { StatusBar } from '@ionic-native/status-bar';
import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ModalController } from 'ionic-angular';

import {
  GoogleMaps, GoogleMap, GoogleMapOptions,
  LocationService,
  GoogleMapsEvent,
  ILatLng,
} from '@ionic-native/google-maps';
import { UserController } from '../../providers/user-controller/user-controller';

@IonicPage()
@Component({
  selector: 'page-update-address',
  templateUrl: 'update-address.html',
})
export class UpdateAddressPage {

  map: GoogleMap;

  mTexts = {
    title: "Chọn vị trí nhà bạn",
    search: "Tìm kiếm",
    next: "Tiếp theo",
    save: "Lưu lại",
    addStepTitle: "Chọn"
  }

  mDatas: {
    address: string,
    location: ILatLng,
    isSignUp: boolean
  } = {
      address: "",
      location: null,
      isSignUp: false
    }

  constructor(public navCtrl: NavController,
    statusBar: StatusBar,
    private mMapServices: MapServices,
    private mChangeDetectorRef: ChangeDetectorRef,
    private mPlatform: Platform,
    private mModalController: ModalController,
    private mAuthenticationProvider: AuthenticationProvider,
    private mUserController: UserController,
    public navParams: NavParams) {
    if (navParams.get('isSignUp') !== undefined) {
      this.mDatas.isSignUp = navParams.get('isSignUp');
      this.mDatas.address = this.mUserController.getOwner().address.address;
      this.mDatas.location = {
        lat: this.mUserController.getOwner().address.lat,
        lng: this.mUserController.getOwner().address.lng
      };
    }
    if (!statusBar.isVisible) {
      statusBar.show();
    }
  }

  ionViewDidEnter() {
    this.mPlatform.ready().then(() => {
      if (this.mPlatform.is('android') || this.mPlatform.is('ios')) {
        this.loadMap();
      }
    });
  }

  ionViewDidLeave() {
    if (this.map) {
      this.map.remove();
    }
  }

  loadMap() {
    if (!this.map) {
      let mapElement = document.getElementById("map");

      LocationService.getMyLocation({ enableHighAccuracy: true }).then(location => {
        let mapOption: GoogleMapOptions = {
          mapType: 'MAP_TYPE_ROADMAP',
          controls: {
            compass: true,
            myLocation: true,
            myLocationButton: false,
            indoorPicker: false,
            mapToolbar: false,
            zoom: false
          },
          gestures: {
            scroll: true,
            tile: false,
            zoom: true,
            rotate: true
          },
          camera: {
            target: location.latLng,
            zoom: 17,
            duration: 1000
          },
          preferences: {
            zoom: {
              minZoom: 12,
              maxZoom: 19
            },
            building: false,
          }
        }
        this.map = GoogleMaps.create(mapElement, mapOption);

        this.map.on(GoogleMapsEvent.MAP_DRAG_END).subscribe(() => {
          this.onMapViewChanged(this.map.getCameraTarget());
        });

        this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe(() => {
          this.onMapViewChanged(this.map.getCameraTarget());
        });
      });
    }
  }

  onMapViewChanged(location: ILatLng) {
    this.mMapServices.requestAddress(location).then((address: string) => {
      if (address && address.length > 0) {
        this.setData(address, this.map.getCameraTarget());
      }
      else {
        this.resetData();
      }

      this.mChangeDetectorRef.detectChanges();
    }).catch(e => {
      this.resetData();
    });
  }

  resetData() {
    this.mDatas.address = "";
    this.mDatas.location = null
  }

  setData(address: string, location: ILatLng, move?: boolean) {
    this.mDatas.address = address;
    this.mDatas.location = location;

    if (move) {
      this.map.setCameraTarget(this.mDatas.location);
    }
  }

  async onClickNext() {
    let userId = this.mUserController.getOwner().id;
    let newAddress: LocationBase = {
      lat: this.mDatas.location.lat,
      lng: this.mDatas.location.lng,
      address: this.mDatas.address
    }

    try {
      await this.mUserController.updateAddress(newAddress);
      // let userInfo = await this.mUserController.getUserInfo(userId);
      // console.log(userInfo);
      // this.mUserController.getOwner().onResponseData(userInfo);
      if (this.mDatas.isSignUp) {
        this.navCtrl.push("CreateCirclePage", { isSignUp: true }, { animation: 'ios-transition' });
      }
      this.navCtrl.setRoot("HomePage");

    }
    catch (error) {

    }
  }

  onClickClose() {
    this.navCtrl.pop({ animation: 'ios-transition' });
  }

  onClickSearch() {
    let modal = this.mModalController.create("SearchAddressPage");

    modal.onWillDismiss((data) => {
      this.resetData();
      if (data && data['address']) {
        this.mMapServices.requestLatLng(data['address']).then((location: ILatLng) => {
          this.setData(data['address'], location, true);
        });
      }
    })

    modal.present();
  }

  moveToMe() {
    LocationService.getMyLocation({ enableHighAccuracy: true }).then(location => {
      this.map.animateCamera({
        target: location.latLng,
        duration: 200
      });
    });
  }

  onClickMyLocation() {
    this.moveToMe();
  }
}
