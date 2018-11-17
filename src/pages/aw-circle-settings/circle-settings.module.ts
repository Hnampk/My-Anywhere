import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CircleSettingsPage } from './circle-settings';

@NgModule({
  declarations: [
    CircleSettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(CircleSettingsPage),
    ComponentsModule
  ],
})
export class CircleSettingsPageModule {}
