import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-member-popover',
  templateUrl: 'member-popover.html',
})
export class MemberPopoverPage {

  constructor(public viewCtrl: ViewController) {
  }

  onClickMakeAdmin() {
    this.viewCtrl.dismiss({ makeAdmin: true });
  }

  onClickRemove() {
    this.viewCtrl.dismiss({ remove: true });
  }
}
