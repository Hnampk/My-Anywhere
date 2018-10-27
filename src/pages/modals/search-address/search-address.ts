import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';

declare var google;

@IonicPage()
@Component({
  selector: 'page-search-address',
  templateUrl: 'search-address.html',
})
export class SearchAddressPage {
  @ViewChild('addressInput') input: ElementRef
  service = new google.maps.places.AutocompleteService();

  addressResult: Array<string> = [];

  constructor(public mViewController: ViewController) {
  }

  inputChanged(addressInput) {
    if (addressInput.value) {
      let config = {
        input: addressInput.value,
        componentRestrictions: { country: "vn" }
      }

      this.service.getPlacePredictions(config, (predictions, status) => {
        this.addressResult = [];
        if (status == google.maps.places.PlacesServiceStatus.OK && predictions) {

          predictions.forEach(element => {
            this.addressResult.push(element['description']);
          });
        }
      });
    }
    else {
      this.addressResult = [];
    }
  }

  onChooseItem(item) {
    this.mViewController.dismiss({ address: item })
  }

  onClickClose() {
    this.mViewController.dismiss();
  }

}
