import { TracesProvider } from './../../providers/traces/traces';
import { SocketProvider } from './../../providers/socket/socket';
import { BackgroundProvider } from './../../providers/background/background';
import { Circle } from './../../providers/models/circle';
import { CircleController } from './../../providers/circle-controller/circle-controller';
import { UserController } from './../../providers/user-controller/user-controller';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ActionSheetController, Events, Platform } from 'ionic-angular';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { User } from '../../providers/models/user';
import { Location } from '../../providers/models/location';
import { GoogleMap, GoogleMapOptions, GoogleMaps, GoogleMapsEvent, LocationService, CameraPosition, ILatLng, MarkerOptions, LatLng, MarkerIcon, Marker } from '@ionic-native/google-maps';
import { EthersProvider } from '../../providers/ethers/ethers';
import { Storage } from '@ionic/storage';

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
    private storage: Storage,
    private tracesProvider: TracesProvider,
    private ethersProvider: EthersProvider,
    private mAuthenticationProvider: AuthenticationProvider,
    private backgroundProvider: BackgroundProvider,
    private userController: UserController,
    private mCircleController: CircleController,
    private mActionSheetController: ActionSheetController,
    private socketProvider: SocketProvider,
    public navParams: NavParams) {
    menu.enable(true);
    ethersProvider.createWallet("rose suit over suffer bubble cinnamon gossip simple wink way sock cloud");
  }

  ngOnInit() {
    this.events.subscribe("circles:show", async data => {
      console.log("SHOW: ", data.circle);

      this.showLoading();

      if (this.circle) this.circle.hideMembersMarker();

      let circle = await this.mCircleController.getCircleByIdFromServer(data.circle.id)
      this.mCircleController.setCurrentCircle(circle);

      this.onUpdateCircleData(circle);

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
      })
        .catch(e => {
          console.log(e);
          this.hideLoading();
        });
    });

    this.mPlatform.ready().then(() => {
      if (this.mPlatform.is('android') || this.mPlatform.is('ios')) {
        /**
         * TODO: 
         * - Load Googlemaps
         * - Enable background service
         * - Start update position realtime
         * - Start update history move
         */
        this.loadMap();
      }
    });
  }

  ionViewWillEnter() {
    this.socketProvider.newMessageReceived().subscribe(data => {
      console.log("Received new message", data);
    });
  }

  ionViewWillLeave() {
    console.log("leave ne```````````````````````");

    this.menu.enable(false);
    this.events.unsubscribe("circles:show");
  }

  async ionViewDidEnter() {
    this.menu.enable(true);
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
        setTimeout(() => {
          this.backgroundProvider.startWatchPosition();
          this.tracesProvider.startTrace();
        }, 2000);
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
    this.menu.open();
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
          this.navCtrl.push("AddRoutePage", { animation: 'ios-transition' });
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
      console.log(this.mDatas.circleMembers.length);
      for (let i = 0; i < this.mDatas.circleMembers.length; i++) {
        let member = this.mDatas.circleMembers[i];

        if (!member.marker) {
          // let icon: MarkerIcon = {
          //   url: "./assets/test.JPG",
          //   size: {
          //     width: 30,
          //     height: 30
          //   }
          // };

          if (member.lastestLocation) {
            // Add member marker
            let markerOptions: MarkerOptions = {
              icon: "",//member.avatar,
              position: new LatLng(member.lastestLocation.lat, member.lastestLocation.lng),
            }

            this.map.addMarker(markerOptions).then(marker => {
              member.setMarker(marker);
            })
              .catch(error => {
                console.log(error);
              });
          }
          else {
            let markerOptions: MarkerOptions = {
              icon: "",//member.avatar,
              position: new LatLng(0, 0)
            }

            this.map.addMarker(markerOptions).then((marker: Marker) => {
              marker.setVisible(false);
              member.setMarker(marker);
            })
              .catch(error => {
                console.log(error);
              });
          }
        }
        else {
          member.updateMarkerPosition();
        }
      }
    }
  }

  onClickSendMessage() {
    try {
      this.socketProvider.sendMessage(this.mDatas.circleId, this.userController.getOwner().id);
    } catch (e) {
      console.log(e);
    }
  }

  onClickChat() {
    // console.log("onClickChat");
    this.storage.get("steps-" + this.userController.getOwner().id).then(data => {
      console.log("steps: ", data);
      
    });
  }

  onClickTitle() {
    console.log("onClickTitle");
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
