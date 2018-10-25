import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddHomePage } from './add-home';

@NgModule({
  declarations: [
    AddHomePage,
  ],
  imports: [
    IonicPageModule.forChild(AddHomePage),
  ],
})
export class AddHomePageModule {}
