import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WalkThroughPage } from './walk-through';

@NgModule({
  declarations: [
    WalkThroughPage,
  ],
  imports: [
    IonicPageModule.forChild(WalkThroughPage),
  ],
})
export class WalkThroughPageModule {}
