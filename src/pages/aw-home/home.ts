import { SocketService } from './../../providers/socket-service/socket-service';
import { Circle } from './../../providers/models/circle';
import { CircleController } from './../../providers/circle-controller/circle-controller';
import { UserController } from './../../providers/user-controller/user-controller';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ActionSheetController, Events, Platform } from 'ionic-angular';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { User } from '../../providers/models/user';
import { Location } from '../../providers/models/location';
import { GoogleMap, GoogleMapOptions, GoogleMaps, GoogleMapsEvent, LocationService, CameraPosition, ILatLng, MarkerOptions, LatLng, MarkerIcon } from '@ionic-native/google-maps';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  map: GoogleMap

  mTexts = {
    title: "Vòng kết nối",
    chatButton: "Trò chuyện nhóm",
    pickDate: "Ngày cần xem",
    notPublic: "Người dùng này không chia sẻ lộ trình",
    emptyRoute: "Không có dữ liệu"
  }

  mDatas: {
    circleId: string,
    circleName: string,
    circleMembers: Array<User>,
    circleNewMessages: number,
    isOnDetail: boolean,
    // memberDetail: Member,
    onLoading: boolean,
    isShowingDatePicker: boolean,
    currentDateView: Date,
    currentTrace: Array<Location>,
    // currentRoute: Polyline,
    // currentSteps: Array<Marker>
  } = {
      circleId: "",
      circleName: "",
      circleMembers: [],
      circleNewMessages: 0,
      isOnDetail: false,
      // memberDetail: null,
      onLoading: false,
      isShowingDatePicker: false,
      currentDateView: new Date(),
      currentTrace: [],
      // currentRoute: null,
      // currentSteps: []
    }

  circle: Circle;

  constructor(public navCtrl: NavController,
    public menu: MenuController,
    public mPlatform: Platform,
    private events: Events,
    private mAuthenticationProvider: AuthenticationProvider,
    private mUserController: UserController,
    private mCircleController: CircleController,
    private mMenuController: MenuController,
    private mActionSheetController: ActionSheetController,
    private mSocketService: SocketService,
    public navParams: NavParams) {
    menu.enable(true);
  }

  ngOnInit() {
    this.events.subscribe("circles:show", data => {
      this.showLoading();

      this.mCircleController.getCircleByIdFromServer(data.circle.id)
        .then((circle: Circle) => {
          this.onUpdateCircleData(circle);

          if (LocationService) {
            LocationService.getMyLocation({ enableHighAccuracy: true }).then(location => {
              if (this.map) {
                let cameraPosition: CameraPosition<ILatLng> = {
                  target: location.latLng,
                  duration: 300,
                  zoom: 17
                }

                this.onSetupMap(circle);

                this.map.animateCamera(cameraPosition)
                  .then(() => {
                    this.hideLoading();
                  })
                  .catch(e => {
                    this.hideLoading();
                  });
              }
            });
          }
          else {
            this.hideLoading();
          }
        });
    });
  }

  ionViewWillEnter() {
    this.mSocketService.newMessageReceived().subscribe(data => {
      console.log("Received new message", data);
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
    this.mMenuController.enable(true);
  }

  ionViewWillLeave() {
    this.events.unsubscribe("circles:show");
  }

  async ionViewDidEnter() {

    this.mPlatform.ready().then(() => {
      if (this.mPlatform.is('android') || this.mPlatform.is('ios')) {
        this.loadMap();
      }
    });

    // REMOVE THIS, for test
    // {
    //   // login
    //   await this.mAuthenticationProvider.login("0377115027", "hoainam");
    //   // get circles from server
    //   await this.mCircleController.getMyCircles();
    // }
  }

  loadMap() {
    if (!this.map) {
      this.showLoading();

      let mapElement = document.getElementById("map");

      let mapOption: GoogleMapOptions = {
        mapType: 'MAP_TYPE_ROADMAP',
        controls: {
          compass: true,
          myLocation: true,
          myLocationButton: true,
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
        // camera: {
        //   target: location.latLng,
        //   zoom: 17,
        //   duration: 1000
        // },
        preferences: {
          zoom: {
            minZoom: 10,
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
    }
  }

  showLoading() {
    this.mDatas.onLoading = true;
  }

  hideLoading() {
    this.mDatas.onLoading = false;
  }

  onClickMenu() {
    this.mMenuController.open();
  }

  onClickMemberPosition(member: User) {
    console.log(member);
  }

  onClickMore() {
    let action = this.mActionSheetController.create({
      title: "Tùy chọn",
      buttons: [{
        text: "Tạo mới lộ trình/địa điểm",
        handler: () => {
          this.navCtrl.push("AwCreateRoutePage", { animation: 'ios-transition' });
        }
      }, {
        text: this.mDatas.isOnDetail ? "Vị trí thành viên" : "Lộ trình thành viên",
        handler: () => {
          if (!this.mDatas.isOnDetail) {
            // this.onClickViewDetail();
          }
          else {
            // this.onClickCloseViewDetail();
          }
        }
      }, {
        text: "Cài đặt",
        handler: () => {
          this.navCtrl.push("CircleSettingsPage", { circle: this.circle }, { animation: "ios-transition" });
        }
      }, {
        text: "Đo khoảng cách",
        handler: () => {

        }
      }, {
        text: "Rời vòng kết nối",
        role: "destructive",
        handler: () => {

        }
      }, {
        text: "Quay lại",
        role: "cancel",
        handler: () => {

        }
      }],
      enableBackdropDismiss: true
    });

    action.present();
  }

  onUpdateCircleData(circle: Circle) {
    this.circle = circle;
    this.mDatas.circleId = circle.id;
    this.mDatas.circleName = circle.name;
    this.mDatas.circleMembers = circle.getMembers();
  }

  onSetupMap(circle: Circle) {
    if (this.map) {
      let members = circle.getMembers();

      members.forEach(member => {
        if (member.lastestLocation) {
          if(!member.marker){
            // let icon: MarkerIcon = {
            //   url: "./assets/test.JPG",
            //   size: {
            //     width: 30,
            //     height: 30
            //   }
            // };

            let markerOptions: MarkerOptions = {
              icon: "",//member.avatar,
              position: new LatLng(member.lastestLocation.lat, member.lastestLocation.lng),
            }
  
            this.map.addMarker(markerOptions).then(marker => {
              member.setMarker(marker);
            })
            .catch(error=>{
  
            });
          }
          else{
            member.updateMarkerPosition();
          }
        }
      });
    }
  }

  onClickSendMessage() {
    try {
      this.mSocketService.sendMessage(this.mDatas.circleId);
    } catch (e) {
      console.log(e);
    }
  }

  onClickChat() {
    let newLocation = new Location(20.992590, 105.843700, "135 Nguyen An Ninh, Tuong Mai, Hoang Mai, Ha Noi");
    newLocation.setTime(Date.now());
    let circles = this.mCircleController.getCircles().map(circle => { return circle.id });

    this.mSocketService.updateMyLocation(newLocation, circles)
  }

  // 00:00 this day in milliseconds
  private now() {
    let now = new Date();
    now.setHours(0, 0, 0, 0);

    return now.getTime();
  }

  // check if time is today or not
  private isShortTime(time: number) {
    return this.now() < time;
  }
}
