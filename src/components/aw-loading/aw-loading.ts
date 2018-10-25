import { Component } from '@angular/core';

/**
 * Generated class for the AwLoadingComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'aw-loading',
  templateUrl: 'aw-loading.html'
})
export class AwLoadingComponent {

  text: string;

  constructor() {
    console.log('Hello AwLoadingComponent Component');
    this.text = 'Hello World';
  }

}
