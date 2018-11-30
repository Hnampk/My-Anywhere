import { CircleController } from './../../providers/circle-controller/circle-controller';
import { MapProvider } from './../../providers/map/map';
import { LatLng, CameraPosition, MarkerIcon } from '@ionic-native/google-maps';

import { Component, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  Platform,
  ModalController,
  ActionSheetController, Picker,
  AlertController,
  App,
  PickerOptions,
  PickerColumn,
  Config,
  MenuController
} from 'ionic-angular';
import {
  LocationService,
  GoogleMapOptions,
  GoogleMaps,
  GoogleMapsEvent,
  GoogleMap,
  ILatLng,
  PolylineOptions,
  MarkerOptions,
  Marker,
  Polyline
} from '@ionic-native/google-maps';
import { Location } from '../../providers/models/location';
import { LocationWithMarker, Route } from '../../providers/models/route';
import { RouteController } from '../../providers/route-controller/route-controller';


@IonicPage()
@Component({
  selector: 'page-add-route',
  templateUrl: 'add-route.html',
})
export class AddRoutePage {

  @ViewChild('routeContainer') routeContainer: ElementRef;
  map: GoogleMap;

  mTexts = {
    title: "Lộ trình",
    titleStart: "Điểm xuất phát",
    titleEnd: "Đích đến",
    checkPoint: "Checkpoint",
    search: "Tìm kiếm",
    addButton: "Thêm",
    reorderButton: "Reorder",
    saveButton: "Lưu",
    cancelButton: "Hủy",
    doneButton: "Xong",
    empty: "Chưa có lộ trình"
  }

  mDatas: {
    route: Array<LocationWithMarker>,
    isOnAddStep: boolean,
    tempStep: Location,
    isOnReorder: boolean,
    isShowingDatePicker: boolean,
    polyline: Polyline,
    onLoading: boolean
  } = {
      route: [],
      isOnAddStep: false,
      tempStep: null,
      isOnReorder: false,
      isShowingDatePicker: false,
      polyline: null,
      onLoading: false
    }

  constructor(public navCtrl: NavController,
    private mPlatform: Platform,
    private mModalController: ModalController,
    private mAlertController: AlertController,
    private mMenuController: MenuController,
    private mapProvider: MapProvider,
    private mApp: App,
    private circleController: CircleController,
    private routeController: RouteController,
    private mActionSheetController: ActionSheetController,
    private mChangeDetectorRef: ChangeDetectorRef,
    // private mAwModule: AwModule,
    public navParams: NavParams) { }

  ionViewDidEnter() {
    this.mPlatform.ready().then(() => {
      if (this.mPlatform.is('android') || this.mPlatform.is('ios')) {
        this.loadMap();
      }
    });
  }

  ionViewWillLeave() {
    if (this.map) {
      this.map.remove();
    }
  }

  loadMap() {
    if (this.map) {
      this.map.remove().then(() => {
        this.loadMap();
      });
    }
    else {
      this.showLoading();

      let mapElement = document.getElementById("map-route");

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

        this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
          this.hideLoading();
          console.log("map is ready");
        }).catch(e => {
          this.hideLoading();
          console.log("map is not ready", e);
        });

        this.map.on(GoogleMapsEvent.MAP_DRAG_END).subscribe(() => {
          if (this.mDatas.isOnAddStep) {
            this.onMapViewChanged(this.map.getCameraTarget());
          }
        });

        this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe(() => {
          if (this.mDatas.isOnAddStep) {
            this.onMapViewChanged(this.map.getCameraTarget());
          }
        });
      });
    }
  }

  showRouteOnMap(steps: Array<LocationWithMarker>) {

    if (steps.length > 0) {
      let latLngs: Array<LatLng> = [];

      steps.forEach(step => {
        latLngs.push(new LatLng(step.location.lat, step.location.lng));
      });

      let polylineOptions: PolylineOptions = {
        points: latLngs,
        color: "#20ACFF",
        width: 4
      }

      this.map.addPolyline(polylineOptions).then(polyline => {
        this.mDatas.polyline = polyline;
      });
    }
  }

  hideRouteOnMap() {
    if (this.mDatas.polyline) {
      this.mDatas.polyline.remove();
      this.mDatas.polyline = null;
    }
  }

  addStepOnMap(step: LocationWithMarker, isCheckPoint: boolean) {
    let icon: MarkerIcon = {
      url: isCheckPoint ? "./assets/imgs/route-point.png" : "./assets/imgs/route-start.png",
      size: {
        width: 20,
        height: 20
      }
    };

    let markerOptions: MarkerOptions = {
      icon: icon,
      position: { lat: step.location.lat, lng: step.location.lng },
      anchor: [10, 10]
    }

    this.map.addMarker(markerOptions).then((marker: Marker) => {
      step.marker = marker;
    });
  }

  removeStep(step: LocationWithMarker) {
    let index = this.mDatas.route.indexOf(step);

    if (this.map) {
      step.marker.remove();
    }
    this.mDatas.route.splice(index, 1);
  }

  showStepsOnMap(steps: Array<LocationWithMarker>) {
    if (this.map) {
      steps.forEach(step => {
        if (!step.marker) {
          let icon: MarkerIcon = {
            url: ((steps.indexOf(step) == 0) || (steps.indexOf(step) == (steps.length - 1))) ? "./assets/imgs/route-start.png" : "./assets/imgs/route-point.png",
            size: {
              width: 20,
              height: 20
            }
          };

          let markerOptions: MarkerOptions = {
            icon: icon,
            position: { lat: step.location.lat, lng: step.location.lng },
            anchor: [10, 10],
          }

          this.map.addMarker(markerOptions).then((marker: Marker) => {
            step.marker = marker;
          });
        }
        else {
          step.marker.setPosition({ lat: step.location.lat, lng: step.location.lng });
          step.marker.setVisible(true);
        }
      });
    }
  }

  hideStepsOnMap() {
    if (this.mDatas.route.length > 0) {
      this.mDatas.route.forEach(step => {
        step.marker.setVisible(false);
      });
    }
  }

  removeStepsOnMap() {
    if (this.map) {
      if (this.mDatas.route.length > 0) {
        this.mDatas.route.forEach(step => {
          step.marker.remove();

        });
      }
    }
  }

  removeSteps() {
    this.mDatas.route = [];
  }

  setData(address: string, location: ILatLng, move?: boolean) {
    this.mDatas.tempStep = new Location(location.lat, location.lng, address);
    this.mDatas.tempStep.setTime(Date.now());

    if (move) {
      this.map.setCameraTarget(location);
    }
  }

  resetTempStep() {
    this.mDatas.tempStep = null;
  }

  onMapViewChanged(location: ILatLng) {
    this.mapProvider.requestAddress(location).then((address: string) => {
      if (address && address.length > 0) {
        this.setData(address, this.map.getCameraTarget());
      }
      else {
        this.resetTempStep();
      }

      this.mChangeDetectorRef.detectChanges();
    }).catch(e => {
      this.resetTempStep();
    });
  }

  reorderItems(indexes) {
    let element = this.mDatas.route[indexes.from];
    this.mDatas.route.splice(indexes.from, 1);
    this.mDatas.route.splice(indexes.to, 0, element);
  }

  scrollRouteToTop() {
    if (this.routeContainer) {
      this.routeContainer.nativeElement.scrollTop = 0;
    }
  }

  onSaveRoute() {
    console.log(this.mDatas.route);

    let route = new Route();
    route.onResponseData(this.mDatas.route);
    route.cỉcleId = this.circleController.getCurrentCircle().id;

    this.routeController.createRoute(route);
  }

  onShowDatePicker() {
    let pickerColumnMonth: PickerColumn = {
      columnWidth: "144px",
      name: "month",
      options: [
        { text: "January", value: 1 },
        { text: "February", value: 2 },
        { text: "March", value: 3 },
        { text: "April", value: 4 },
      ],
      selectedIndex: 0
    }
    let pickerColumnYear: PickerColumn = {
      columnWidth: "144px",
      name: "year",
      options: [
        { text: "2017", value: 2017 },
        { text: "2018", value: 2018 },
        { text: "2019", value: 2019 },
        { text: "2020", value: 2020 },
      ],
      selectedIndex: 0
    }
    let pickerOptions: PickerOptions = {
      buttons: [],
      columns: [pickerColumnMonth, pickerColumnYear]
    }
    let config = new Config();
    config.init("pickerEnter", this.mPlatform);
    let mPicker = new Picker(this.mApp, pickerOptions, config);

    mPicker.present().then(data => {
      console.log(data);
    });
  }

  onEditStep(slidingItem, step: LocationWithMarker) {
    slidingItem.close();

    let alert = this.mAlertController.create({
      title: 'Thông tin địa điểm',
      message: step.location.address,
      inputs: [
        {
          name: 'title',
          placeholder: 'Title'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            step.location.setName(data.title);
          }
        }
      ]
    });

    alert.present();
  }

  onClickDeleteStep(slidingItem, step: LocationWithMarker) {
    slidingItem.close();

    // clear map
    this.hideRouteOnMap();
    this.hideStepsOnMap();

    // remove step from array
    let index = this.mDatas.route.indexOf(step);
    step.marker.remove();
    this.mDatas.route.splice(index, 1);

    // show new data
    this.showStepsOnMap(this.mDatas.route);
    this.showRouteOnMap(this.mDatas.route);
  }

  onClickTitle() {
    this.onShowDatePicker();
  }

  onClickSearch() {
    let modal = this.mModalController.create("SearchAddressPage");

    modal.onWillDismiss((data) => {
      this.resetTempStep();
      if (data && data['address']) {
        this.mapProvider.requestLatLng(data['address']).then((location: ILatLng) => {
          this.setData(data['address'], location, true);
        });
      }
    })
    modal.present();
  }

  onClickAddStep() {
    this.mDatas.isOnAddStep = true;
    this.hideRouteOnMap();
    this.onMapViewChanged(this.map.getCameraTarget());
  }

  onClickReorder() {
    this.mDatas.isOnReorder = true;
    this.scrollRouteToTop();
    this.hideRouteOnMap();
  }

  onClickSaveStep() {
    let location = new Location(this.mDatas.tempStep.lat, this.mDatas.tempStep.lng, this.mDatas.tempStep.address);
    location.setTime(this.mDatas.tempStep.time);
    let step = new LocationWithMarker(location);
    let currentStepsNumber = this.mDatas.route.length;

    if (currentStepsNumber < 2) {
      this.mDatas.route.push(step);
      this.addStepOnMap(step, false);
    }
    else {
      this.mDatas.route.splice(currentStepsNumber - 1, 0, step);
      this.addStepOnMap(step, true);
    }

    this.mDatas.isOnAddStep = false;
    this.resetTempStep();
    this.showRouteOnMap(this.mDatas.route);
  }

  onClickCancel() {
    this.mDatas.isOnAddStep = false;
    this.showRouteOnMap(this.mDatas.route);
  }

  onClickDoneReorder() {
    this.mDatas.isOnReorder = false;
    this.scrollRouteToTop();

    this.hideStepsOnMap();
    this.showStepsOnMap(this.mDatas.route);
    this.showRouteOnMap(this.mDatas.route);
  }

  onClickStep(step: LocationWithMarker) {
    let cameraPosition: CameraPosition<ILatLng> = {
      target: new LatLng(step.location.lat, step.location.lng),
      duration: 500,
      zoom: 17
    }
    console.log(step);

    this.map.animateCamera(cameraPosition);
  }

  onClickMore() {
    let action = this.mActionSheetController.create({
      title: "Tùy chọn",
      buttons: [{
        text: "Lưu lại",
        handler: () => {
          this.onSaveRoute();
          this.navCtrl.pop();
        }
      }, {
        text: "Đảo ngược lộ trình",
        handler: () => {
          this.hideRouteOnMap();
          this.hideStepsOnMap();

          this.mDatas.route.reverse();
          this.showStepsOnMap(this.mDatas.route);
          this.showRouteOnMap(this.mDatas.route);
        }
      }],
      enableBackdropDismiss: true
    });

    action.present();
  }

  onClickClose() {
    let alert = this.mAlertController.create({
      title: 'Bạn muốn lưu lộ trình này?',
      buttons: [
        {
          text: 'Thoát',
          handler: () => {
            this.navCtrl.pop();
          }
        },
        {
          text: 'Lưu',
          handler: () => {
            this.onSaveRoute();
            this.navCtrl.pop();
          }
        }
      ]
    });

    alert.present();
  }

  editingStep: LocationWithMarker;
  editingTime: Date;
  onClickChangeTime(step: LocationWithMarker) {
    this.mMenuController.enable(false);
    this.editingStep = step;
    this.editingTime = new Date(step.location.time);
    this.mDatas.isShowingDatePicker = true;
  }

  onCancelDatePicker() {
    this.mDatas.isShowingDatePicker = false;
    this.mMenuController.enable(true);
  }

  onDatePickerChanged(data) {
    let newTime = new Date(data['year'], data['month'] - 1, data['date'], data['hour'], data['minute']);

    this.mDatas.isShowingDatePicker = false;
    this.editingStep.location.time = newTime.getTime();
    this.mMenuController.enable(true);
  }

  showLoading() {
    this.mDatas.onLoading = true;
  }

  hideLoading() {
    this.mDatas.onLoading = false;
  }
}
