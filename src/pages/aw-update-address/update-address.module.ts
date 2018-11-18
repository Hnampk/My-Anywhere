import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpdateAddressPage } from './update-address';

@NgModule({
  declarations: [
    UpdateAddressPage,
  ],
  imports: [
    IonicPageModule.forChild(UpdateAddressPage),
    ComponentsModule
  ],
})
export class UpdateAddressPageModule {}
