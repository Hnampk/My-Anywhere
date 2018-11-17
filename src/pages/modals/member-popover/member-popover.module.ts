import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemberPopoverPage } from './member-popover';

@NgModule({
  declarations: [
    MemberPopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(MemberPopoverPage),
  ],
})
export class MemberPopoverPageModule {}
