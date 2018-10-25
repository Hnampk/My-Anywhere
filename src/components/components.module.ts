import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { AwLoadingComponent } from './aw-loading/aw-loading';
import { AwVerifyOtpComponent } from './aw-verify-otp/aw-verify-otp';
@NgModule({
	declarations: [AwLoadingComponent,
    AwVerifyOtpComponent],
	imports: [IonicPageModule],
	exports: [AwLoadingComponent,
    AwVerifyOtpComponent]
})
export class ComponentsModule {}
