import { Component } from '@angular/core';

@Component({
  selector: 'aw-loading',
  templateUrl: 'aw-loading.html'
})
export class AwLoadingComponent {

  text: string;

  constructor() {
    this.text = 'Hello World';
  }

}
