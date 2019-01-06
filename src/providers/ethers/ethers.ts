import { ToastController } from 'ionic-angular';
import { MapProvider } from './../map/map';
import { Injectable } from '@angular/core';

import { ethers, Wallet } from 'ethers';
import { Location } from '../models/location';

@Injectable()
export class EthersProvider {

  /**
   * Infura provider to make transaction
   */
  private provider;
  private wallet;
  private contract;
  private contractWithSigner;
  private mnemonic = null;

  constructor(private mapProvider: MapProvider, private toastController:  ToastController) {

  }

  getWallet() {
    return this.wallet;
  }

  getMnemonic() {
    return this.mnemonic;
  }

  getWalletAddress() {
    return this.wallet.address;
  }

  async initProvider() {
    let abi = JSON.parse("[{\"constant\":false,\"inputs\":[{\"name\":\"date\",\"type\":\"uint256\"},{\"name\":\"step\",\"type\":\"string\"}],\"name\":\"addStep\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"targetAddr\",\"type\":\"address\"},{\"name\":\"addr\",\"type\":\"address\"}],\"name\":\"getExpirationTime\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"addr\",\"type\":\"address\"},{\"name\":\"date\",\"type\":\"uint256\"},{\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"getStep\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"getTemp\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"addr\",\"type\":\"address\"},{\"name\":\"newTime\",\"type\":\"uint256\"}],\"name\":\"renewExpirationTime\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"date\",\"type\":\"string\"},{\"name\":\"newHistory\",\"type\":\"string\"}],\"name\":\"editHistory\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"getNow\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"addr\",\"type\":\"address\"},{\"name\":\"time\",\"type\":\"uint256\"}],\"name\":\"getStepsValue\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"a\",\"type\":\"string\"}],\"name\":\"setTemp\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"date\",\"type\":\"string\"}],\"name\":\"getHistory\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"}]");
    let contractAddress = "0x7BED03B8904b0ec24E05a26F31AD924A98E99bA2";

    this.provider = await new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/a030972679d24b688aa3194f81abffd3");

    this.contract = await new ethers.Contract(contractAddress, abi, this.provider);
  }

  hasWallet() {
    return this.mnemonic != null;
  }

  /**
   * Create Ethereum wallet to interact with smartcontract
   * @param mnemonic 
   */
  async createWallet(mnemonic: string) {
    await this.initProvider();

    let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
    let privateKey = await mnemonicWallet.privateKey;

    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contractWithSigner = this.contract.connect(this.wallet);

    this.mnemonic = mnemonic;
  }

  /**
   * update new move
   * @param date ddmmyyyy - the day of this move
   * @param step lat,lng,time (ex: 21.027763,105.834160,1538758453973)
   */
  async addStep(date: string, step: string) {
    try {
      let tx = await this.contractWithSigner.addStep(date, step);
      // let before = await this.wallet.getBalance().then(balance => { return balance });
      console.log(tx);
      await tx.wait();
      // let after = await this.wallet.getBalance().then(balance => { return balance });
      console.log("mined");
    }
    catch (e) {
      // await this.addStep(date, step);
    }
  }

  /**
   * Get User's move on a date
   * @param address Ethereum wallet address
   * @param date specific date: "23112018"
   * @param value the number of steps on that date, call 'getStepsValue' function to get it
   */
  async getStepsOnDate(address: string, date: string, value?: number | any) {
    console.log("--------getStepsOnDate", address, date);
    
    if (!value) {
      value = await this.getStepsValue(address, date);
      value = value.toNumber();
    }

    let steps: Array<Location> = [];

    for (let i = 0; i < value; i++) {
      let stepResult: string = "";
      try {
        stepResult = await this.getStep(address, date, i);
      }
      catch (e) {

        let toast = this.toastController.create({
          message: e,
          duration: 2000
        });

        toast.present();
        break;
      }
      // the stepResult looks like: "20.9925054,105.8436936,1543244179496" = lat,lng,time
      // => split by "," => ["20.9925054", "105.8436936", "1543244179496"]
      let stepElements = stepResult.split(",");
      let addressContent = await this.mapProvider.requestAddress(
        {
          lat: parseFloat(stepElements[0]),
          lng: parseFloat(stepElements[1])
        }
      );

      let step = new Location(parseFloat(stepElements[0]), parseFloat(stepElements[1]), null);
      step.setTime(parseInt(stepElements[2]));
      step.address = addressContent;

      steps.push(step);
    }

    return steps;
  }

  async getStep(address: string, date: string, index: number) {
    try {
      return await this.contractWithSigner.getStep(address, date, index);
    }
    catch (e) {
      throw new Error("Không thể xem lịch sử của thành viên này!");
    }
    // return this.contractWithSigner.getStep(address, date, index);
  }

  /**
   * Get the number of steps on a specific date
   */
  getStepsValue(address: string, date: string) {
    return this.contractWithSigner.getStepsValue(address, date);
  }

  getExpirationTime(targetAddress: string, requiredAddress: string){
    return this.contractWithSigner.getExpirationTime(targetAddress, requiredAddress)
  }

  async renewExpirationTime(requiredAddress: string, time: number){
    try{
      await this.contractWithSigner.renewExpirationTime(requiredAddress, time);
    }
    catch(e){

    }
  }
}
