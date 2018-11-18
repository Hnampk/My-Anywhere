import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { AwLoadingComponent } from './aw-loading/aw-loading';
import { AwVerifyOtpComponent } from './aw-verify-otp/aw-verify-otp';
import { AwDatePickerComponent } from './aw-date-picker/aw-date-picker';
@NgModule({
	declarations: [AwLoadingComponent,
    AwVerifyOtpComponent,
    AwDatePickerComponent],
	imports: [IonicPageModule],
	exports: [AwLoadingComponent,
    AwVerifyOtpComponent,
    AwDatePickerComponent]
})
export class ComponentsModule {}
