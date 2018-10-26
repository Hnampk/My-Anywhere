import { Account } from './../models/account';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable()
export class AuthenticationProvider {
  private url = "http://localhost:3000/api/users/";
  private token: string;

  constructor(public http: HttpClient) {
  }

  getToken() {
    return this.token;
  }

  signUp(phonenumber: string, password: string) {
    let encodedPassword = this.encodePassword(password);
    let account: Account = { phonenumber: phonenumber, password: encodedPassword };

    this.http.post(this.url, account, { headers: { 'Content-Type': 'application/json' } })
      .subscribe(response => {
        console.log(response);
      });
  }

  login(phonenumber: string, password: string) {
    return new Promise((res, rej) => {
      let encodedPassword = this.encodePassword(password);
      let account: Account = { phonenumber: phonenumber, password: encodedPassword };

      this.http.post<{ token: string }>(this.url + "login/", account, { headers: { 'Content-Type': 'application/json' } })
        .subscribe(response => {
          this.token = response.token;
          res();
        });
    })
  }

  test(){
    this.http.get(this.url).subscribe(data=>{
      console.log(data);
      
    })
  }

  encodePassword(password: string) {
    return <string>Md5.hashStr(password);
  }
}
