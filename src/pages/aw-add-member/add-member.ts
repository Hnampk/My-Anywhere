import { CircleController } from './../../providers/circle-controller/circle-controller';
import { AppController } from './../../providers/app-controller/app-controller';
import { UserController } from './../../providers/user-controller/user-controller';
import { Circle } from './../../providers/models/circle';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { User } from '../../providers/models/user';

enum MemberStatus {
  ADDED, NOT_MEMBER
}

class ResultMember extends User {
  status: MemberStatus = MemberStatus.NOT_MEMBER;
}

@IonicPage()
@Component({
  selector: 'page-add-member',
  templateUrl: 'add-member.html',
})
export class AddMemberPage {
  @ViewChild('code1') _code1: ElementRef;
  @ViewChild('code2') _code2: ElementRef;
  @ViewChild('code3') _code3: ElementRef;
  @ViewChild('code4') _code4: ElementRef;
  @ViewChild('code5') _code5: ElementRef;

  mTexts = {
    title: "Thêm thành viên",
    code: "Mã kết nối",
    message: "Nhập mã mã kết nối của thành viên để thêm thành viên vào vòng kết nối"
  }

  mDatas: {
    input: string,
    elements: Array<HTMLInputElement>,
    emptyValue: string,
    onLoading: boolean
  } = {
      input: "",
      elements: [],
      emptyValue: "_",
      onLoading: false
    }

  circle: Circle;
  resultMembers: Array<ResultMember> = [];

  constructor(public navCtrl: NavController,
    private mUserController: UserController,
    private mAppController: AppController,
    private mCircleController: CircleController,
    // private mAwModule: AwModule,
    public navParams: NavParams) {
    if (navParams.data['circle']) {
      this.circle = navParams.data['circle'];
    }
  }

  ionViewDidEnter() {
    this.mDatas.elements = [this.code1, this.code2, this.code3, this.code4, this.code5];
    this.resetAll();
  }

  get code1() {
    return this._code1.nativeElement
  }

  get code2() {
    return this._code2.nativeElement
  }

  get code3() {
    return this._code3.nativeElement
  }

  get code4() {
    return this._code4.nativeElement
  }

  get code5() {
    return this._code5.nativeElement
  }

  changed(index: number) {
    let elm = this.mDatas.elements[index];
    elm.setSelectionRange(1, 1);
    if (elm.value == "" || elm.value == this.mDatas.emptyValue) {
      this.resetInput(elm);
      if (index != 0) {
        // if (index != this.mDatas.elements.length - 1) {
        //   this.resetInput(this.mDatas.elements[index - 1]);
        // }
        this.mDatas.elements[index - 1].focus();
      }
    }
    else {
      elm.value = elm.value.match(/[^_]/)[0];
      if (index != this.mDatas.elements.length - 1) {
        this.mDatas.elements[index + 1].focus();
      }
      else {
        this.mDatas.input = "";
        this.mDatas.elements.forEach(element => {
          element.blur();
          this.mDatas.input += element.value;
        });


        this.onRequestFindUser(this.mDatas.input);;
      }
    }
  }

  async onRequestFindUser(code: string) {

    console.log(code);
    this.showLoading();

    try {
      let users = await this.mUserController.findUsersByStaticCode(code) as Array<any>;
      console.log(users);
      this.onShowMembers(users);
    } catch (e) {
      this.mAppController.showToast("Invalid code!");
    }

    // console.log(user);
    // setTimeout(() => {

    this.hideLoading();
    // }, 2000);
    // this.mAwModule.requestJoinCircle(code).then(() => {
    //   this.navCtrl.pop();
    // });
  }

  resetInput(element: HTMLInputElement) {
    element.value = "_";
  }

  resetAll() {
    this.resetInput(this.code1);
    this.resetInput(this.code2);
    this.resetInput(this.code3);
    this.resetInput(this.code4);
    this.resetInput(this.code5);
  }

  showLoading() {
    this.mDatas.onLoading = true;
  }

  hideLoading() {
    this.mDatas.onLoading = false;
  }

  onClickClose() {
    this.navCtrl.pop();
  }

  onClickCodeContainer() {
    this.resetAll();
    for (let i = 0; i < this.mDatas.elements.length; i++) {
      let element = this.mDatas.elements[i];

      if ((element.value == this.mDatas.emptyValue) || (i == (this.mDatas.elements.length - 1))) {
        element.focus();
        break;
      }
    }
  }

  onShowMembers(members: Array<any>) {
    this.resultMembers = [];

    members.forEach(element => {
      let resultMember = new ResultMember(element._id, element.phonenumber);
      resultMember.onResponseData(element);

      let isMember = this.circle.getMembers().find(member => { return member.id == element._id });

      if (isMember) resultMember.status = MemberStatus.ADDED;

      console.log(resultMember)

      this.resultMembers.push(resultMember);
    });
  }

  async onClickAdd(resultMember: ResultMember) {
    this.showLoading();

    // let member = new User()
    try {
      await this.mCircleController.addMemberToCircle(this.circle, resultMember);
      resultMember.status = MemberStatus.ADDED;
    } catch (e) {
      this.mAppController.showToast("Xảy ra lỗi!");
      this.resultMembers = [];
      this.resetAll();
    }

    this.hideLoading();
  }

}
