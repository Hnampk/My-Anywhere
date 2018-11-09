import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CircleController } from '../../providers/circle-controller/circle-controller';

@IonicPage()
@Component({
  selector: 'page-create-circle',
  templateUrl: 'create-circle.html',
})
export class CreateCirclePage {

  mTexts = {
    title: "Tạo vòng kết nối của bạn",
    nameTitle: "Tên vòng kết nối",
    inputHolder: "Chưa nhập tên",
    suggestTitle: "Chọn nhanh",
    suggests: ["Gia đình", "Người ấy", "Bạn bè", "Cơ quan", "Du lịch", "Vui chơi"],
    start: "Bắt đầu sử dụng"
  }

  mDatas = {
    circleName: "",
    isSignUp: false,
    onLoading: false
  }

  constructor(public navCtrl: NavController,
    public mCircleController: CircleController,
    public navParams: NavParams) {
    if (navParams.get('isSignUp')) {
      this.mDatas.isSignUp = navParams.get('isSignUp');
    }
  }

  onClickSuggestItem(item) {
    this.mDatas.circleName = item;
  }

  async onClickNext() {
    this.showLoading();
    await this.mCircleController.createCircle(this.mDatas.circleName);
    this.hideLoading();
    this.navCtrl.setRoot("HomePage");
  }
  
  onClickClose(){
    this.navCtrl.pop({ animation: 'ios-transition' });
  }

  showLoading() {
    this.mDatas.onLoading = true;
  }

  hideLoading() {
    this.mDatas.onLoading = false;
  }
}
