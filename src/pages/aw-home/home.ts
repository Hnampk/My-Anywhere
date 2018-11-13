import { Circle } from './../../providers/models/circle';
import { CircleController } from './../../providers/circle-controller/circle-controller';
import { UserController } from './../../providers/user-controller/user-controller';
import { StatusBar } from '@ionic-native/status-bar';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ActionSheetController, Events } from 'ionic-angular';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { User } from '../../providers/models/user';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

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
    // currentTrace: Array<Location>,
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
      // currentTrace: [],
      // currentRoute: null,
      // currentSteps: []
    }

  circle: Circle;

  constructor(public navCtrl: NavController,
    private events: Events,
    private mAuthenticationProvider: AuthenticationProvider,
    private mUserController: UserController,
    private mCircleController: CircleController,
    private mMenuController: MenuController,
    private mActionSheetController: ActionSheetController,
    public navParams: NavParams) {
      this.events.subscribe("circles:show", data => {
        let circle: Circle = data.circle;
  
        console.log("Show Circle: ", circle);
        this.showLoading();
  
        this.mCircleController.getCircleById(data.circle.id)
          .then((circle: Circle) => {
            this.onUpdateCircleData(circle);
  
            this.hideLoading();
          });
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
    this.mMenuController.enable(true);
  }

  ionViewWillLeave(){
    this.events.unsubscribe("circles:show");
  }

  async ionViewDidEnter() {
    // REMOVE THIS, for test
    // {
    //   // login
    //   await this.mAuthenticationProvider.login("0377115027", "hoainam");
    //   // get circles from server
    //   await this.mCircleController.getMyCircles();
    // }
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
          this.navCtrl.push("CircleSettingsPage", { circle: this.circle }, {animation: "ios-transition"});
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
}
