import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RenewPermissionPage } from './renew-permission';

@NgModule({
  declarations: [
    RenewPermissionPage,
  ],
  imports: [
    IonicPageModule.forChild(RenewPermissionPage),
    ComponentsModule
  ],
})
export class RenewPermissionPageModule {}
