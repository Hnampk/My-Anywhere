import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddRoutePage } from './add-route';

@NgModule({
  declarations: [
    AddRoutePage,
  ],
  imports: [
    IonicPageModule.forChild(AddRoutePage),
    ComponentsModule
  ],
})
export class AddRoutePageModule {}
