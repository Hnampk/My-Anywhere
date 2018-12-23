import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SaveMovesPage } from './save-moves';

@NgModule({
  declarations: [
    SaveMovesPage,
  ],
  imports: [
    IonicPageModule.forChild(SaveMovesPage),
    ComponentsModule
  ],
})
export class SaveMovesPageModule {}
