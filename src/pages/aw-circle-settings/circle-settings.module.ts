import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CircleSettingsPage } from './circle-settings';

@NgModule({
  declarations: [
    CircleSettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(CircleSettingsPage),
  ],
})
export class CircleSettingsPageModule {}
