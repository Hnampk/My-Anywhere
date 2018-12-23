import { SocketProvider } from './../providers/socket/socket';
import { Circle } from './../providers/models/circle';
import { CircleController } from './../providers/circle-controller/circle-controller';
import { UserController } from './../providers/user-controller/user-controller';
import { Component } from '@angular/core';
import { Platform, MenuController, App, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = "LoadingPage";
  // rootPage: any = "AddAddressPage";

  menuTexts = {
    circle: "Vòng kết nối",
    function: "Chức năng",
    new: "Thêm mới",
    saveMoves: "Ghi lại lịch sử di chuyển",
  }

  menuDatas = {
    username: "",
    avatar: "",
    circles: [],
    currentCircleId: "",
    functions: [{
      id: 1,
      name: "Hướng dẫn sử dụng",
      component: ""
    }, {
      id: 2,
      name: "Câu hỏi thường gặp",
      component: ""
    }, {
      id: 3,
      name: "Cài đặt",
      component: ""
    }]
  }

  constructor(platform: Platform,
    statusBar: StatusBar,
    private menu: MenuController,
    private app: App,
    private events: Events,
    private mUserController: UserController,
    private mCircleController: CircleController,
    private socketProvider: SocketProvider,
    splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (platform.is('ios'))
        statusBar.styleDefault();
      else
        statusBar.styleLightContent();

      splashScreen.hide();

      events.subscribe('user:updated', () => {
        this.menuDatas.username = mUserController.getOwner().name;
        this.menuDatas.avatar = mUserController.getOwner().avatar;

        console.log('user:updated', this.menuDatas);
      });

      events.subscribe('circles:updated', (data: { circle: Circle }) => {
        console.log(data)
        this.menuDatas.circles = this.mCircleController.getCircles();
        if (this.menuDatas.circles.length > 0) {
          this.menuDatas.currentCircleId = this.menuDatas.circles[0].id;

          // emit event
          this.onShowCircle(data.circle);

        }
        console.log('circles:updated', this.menuDatas);
      });

    });
  }

  openPage(page) {
    if (page.id != this.rootPage.id) {
      this.rootPage = page.component;
      // this.mSelectedMenuId = page.id;
    }
    // close the menu when clicking a link from the menu
    this.menu.close();
  }

  private onClickUserInfo() {
    this.app.getRootNav().push("UserInfoPage", { animation: 'ios' });
    this.menu.close();
  }

  private onClickAddCircle() {
    this.app.getRootNav().push("CreateCirclePage", { 'isSignUp': false }, { animation: 'ios' });
    this.menu.close();
  }

  private onClickSaveMoves() {
    this.app.getRootNav().push("SaveMovesPage", { animation: 'ios' });
    this.menu.close();
  }

  private onClickCircle(circle: Circle) {
    this.socketProvider.leaveCircleRoom(this.menuDatas.currentCircleId, this.mUserController.getOwner().id);

    // emit event
    this.onShowCircle(circle);
    this.menu.close();
  }

  /**
   * Emit "circles:show" event
   * @param circle 
   */
  private onShowCircle(circle: Circle) {
    this.socketProvider.joinCircleRoom(circle.id, this.mUserController.getOwner().id);
    // update current circle id
    this.menuDatas.currentCircleId = circle.id;

    // settimeout for the first time login
    setTimeout(() => {
      this.mCircleController.onShowCircle(circle);
    }, 100);
  }
}

