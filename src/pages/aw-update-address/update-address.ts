import { MapProvider } from './../../providers/map/map';
import { LocationBase } from './../../providers/models/location-base';
import { AuthenticationProvider } from './../../providers/authentication/authentication';
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
    isSignUp: boolean,
    onLoading: boolean
  } = {
      address: "",
      location: null,
      isSignUp: true,
      onLoading: false
    }

  constructor(public navCtrl: NavController,
    statusBar: StatusBar,
    private mapProvider: MapProvider,
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

  ionViewDidLoad() {
    this.mPlatform.ready().then(() => {
      if (this.mPlatform.is('android') || this.mPlatform.is('ios')) {
        this.loadMap();
      }
    });
  }

  ionViewDidLeave() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  loadMap() {
    if (!this.map) {
      let mapElement = document.getElementById("map-update");

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

  showLoading() {
    this.mDatas.onLoading = true;
  }

  hideLoading() {
    this.mDatas.onLoading = false;
  }

  onMapViewChanged(location: ILatLng) {
    this.mapProvider.requestAddress(location).then((address: string) => {
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
    this.showLoading();

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
      this.hideLoading();

      if (this.mDatas.isSignUp) {
        this.navCtrl.push("CreateCirclePage", { isSignUp: true }, { animation: 'ios-transition' });
      }
      else{
        this.navCtrl.pop({ animation: 'ios-transition' });
      }

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
        this.mapProvider.requestLatLng(data['address']).then((location: ILatLng) => {
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
