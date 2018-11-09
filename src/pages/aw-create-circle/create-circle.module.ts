import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateCirclePage } from './create-circle';

@NgModule({
  declarations: [
    CreateCirclePage,
  ],
  imports: [
    IonicPageModule.forChild(CreateCirclePage),
    ComponentsModule
  ],
})
export class CreateCirclePageModule {}
