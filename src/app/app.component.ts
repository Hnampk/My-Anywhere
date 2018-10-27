import { Component } from '@angular/core';
import { Platform, MenuController, App } from 'ionic-angular';
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
    join: "Tham gia vòng kết nối mới",
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
    splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      if(statusBar.isVisible){
        statusBar.hide();
      }
      splashScreen.hide();
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
    // this.app.getRootNav().push("AwUserInfoPage");
    this.menu.close();
  }

  private onClickAddCircle() {
    // this.app.getRootNav().push("AwCreateCirclePage", { isSignUp: false });
    this.menu.close();
  }

  private onClickJoinCircle() {
    // this.app.getRootNav().push("AwJoinCirclePage");
    this.menu.close();
  }
}

