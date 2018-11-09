import { CircleController } from './../../providers/circle-controller/circle-controller';
import { UserController } from './../../providers/user-controller/user-controller';
import { StatusBar } from '@ionic-native/status-bar';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ActionSheetController } from 'ionic-angular';
import { AuthenticationProvider } from '../../providers/authentication/authentication';

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
    // circleMembers: Array<Member>,
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
      // circleMembers: [],
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

  constructor(public navCtrl: NavController,
    statusBar: StatusBar,
    private mAuthenticationProvider: AuthenticationProvider,
    private mUserController: UserController,
    private mCircleController: CircleController,
    private mMenuController: MenuController,
    private mActionSheetController: ActionSheetController,
    public navParams: NavParams) {
      if(!statusBar.isVisible){
        statusBar.show();
      }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
    this.mMenuController.enable(true);
  }

  onClickMenu() {
    console.log("onClickMenu")
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
        text: "Cài đặt chia sẻ",
        handler: () => {

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

  onClickUpdateAddress(){
    this.navCtrl.push("UpdateAddressPage", { animation: 'ios-transition' });
  }

  onClickGetCircles(){
    this.mCircleController.getMyCircles();
    // this.mCircleController.getCirclesByUserId("5bd467aedcc5a71c8c59bb6b");
  }

  async onClickTestLogin(){
    // login
    await this.mAuthenticationProvider.login("0377115027", "hoainam");
    // get circles from server
    await this.mCircleController.getMyCircles();
  }
}
