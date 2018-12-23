import { Component, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Slides } from 'ionic-angular';

@Component({
  selector: 'aw-date-picker',
  templateUrl: 'aw-date-picker.html'
})
export class AwDatePickerComponent {

  @ViewChild('date') dateElm: ElementRef;
  @ViewChild('month') monthElm: ElementRef;
  @ViewChild('year') yearElm: ElementRef;
  @ViewChild('hour') hourElm: ElementRef;
  @ViewChild('minute') minuteElm: ElementRef;
  @ViewChild(Slides) slides: Slides;

  @Input('time') time: Date;
  @Input('enableTime') isEnableTime = false; // With Time Picker
  @Output() cancel = new EventEmitter();
  @Output() done = new EventEmitter();

  itemHeight = 50; // height of item in pixel (CSS)

  mTexts = {
    done: "OK",
    cancel: "Cancel",
    next: "Next",
    previous: "Previous",
    DATE: 1,
    MONTH: 2,
    YEAR: 3,
    HOUR: 4,
    MINUTE: 5
  }

  mViews = {
    isLoading: true,
    currentSlide: 0
  }

  mDatas: {
    dates: Array<number>,
    months: Array<number>,
    years: Array<number>,
    hours: Array<number>,
    minutes: Array<number>,
    currentDate: number,
    currentMonth: number,
    currentYear: number,
    currentHour: number,
    currentMinute: number
  } = {
      dates: [],
      months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 0],
      years: [0],
      hours: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, -1],
      minutes: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, -1],
      currentDate: 0,
      currentMonth: 0,
      currentYear: 0,
      currentHour: 0,
      currentMinute: 0
    }

  private month30 = [4, 6, 9, 11];
  private month31 = [1, 3, 5, 7, 8, 10, 12];
  private date28 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 0];
  private date29 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 0];
  private date30 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 0];
  private date31 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 0];

  ngOnInit() {
    this.slides.lockSwipes(!this.isEnableTime);
    this.mDatas.currentDate = this.time.getDate();
    this.mDatas.currentMonth = this.time.getMonth() + 1;
    this.mDatas.currentYear = this.time.getFullYear();
    this.mDatas.currentHour = this.time.getHours();
    this.mDatas.currentMinute = this.time.getMinutes();
    this.setupYears();
    this.updateDates().then(() => {
      this.mViews.isLoading = false;

      let tempAnimFrame = requestAnimationFrame(() => {
        cancelAnimationFrame(tempAnimFrame);
        this.dateElm.nativeElement.scrollTop = this.itemHeight * (this.mDatas.dates.indexOf(this.mDatas.currentDate) - 1);
      });
      this.monthElm.nativeElement.scrollTop = this.itemHeight * (this.mDatas.months.indexOf(this.mDatas.currentMonth) - 1);
      this.yearElm.nativeElement.scrollTop = this.itemHeight * (this.mDatas.years.indexOf(this.mDatas.currentYear) - 1);
      this.hourElm.nativeElement.scrollTop = this.itemHeight * (this.mDatas.hours.indexOf(this.mDatas.currentHour) - 1);
      this.minuteElm.nativeElement.scrollTop = this.itemHeight * (this.mDatas.minutes.indexOf(this.mDatas.currentMinute) - 1);
    });
  }

  setupYears() {
    // this app has been developed in 2018
    for (let i = 2018; i <= this.mDatas.currentYear + 1; i++) {
      this.mDatas.years.push(i);
    }
    this.mDatas.years.push(0);
  }

  updateDates() {
    return new Promise((res, rej) => {
      if (this.month30.indexOf(this.mDatas.currentMonth) > -1) {
        this.mDatas.dates = this.date30;
      }
      else if (this.month31.indexOf(this.mDatas.currentMonth) > -1) {
        this.mDatas.dates = this.date31;
      }
      else {
        if (this.mDatas.currentYear % 4 == 0) {
          this.mDatas.dates = this.date29;
        }
        else {
          this.mDatas.dates = this.date28;
        }
      }
      res();
    })
  }

  onChangeMonth() {
    this.updateDates();
    this.updateDateByScrollTop();
  }

  private updateDateByScrollTop() {
    let arrIndex = Math.floor(this.dateElm.nativeElement.scrollTop / this.itemHeight) + 1;
    this.mDatas.currentDate = this.mDatas.dates[arrIndex];
  }

  private updateMonthByScrollTop() {
    let arrIndex = Math.floor(this.monthElm.nativeElement.scrollTop / this.itemHeight) + 1;
    this.mDatas.currentMonth = this.mDatas.months[arrIndex];
  }

  private updateYearByScrollTop() {
    let arrIndex = Math.floor(this.yearElm.nativeElement.scrollTop / this.itemHeight) + 1;
    this.mDatas.currentYear = this.mDatas.years[arrIndex];
  }

  private updateHourByScrollTop() {
    let arrIndex = Math.floor(this.hourElm.nativeElement.scrollTop / this.itemHeight) + 1;
    this.mDatas.currentHour = this.mDatas.hours[arrIndex];
  }

  private updateMinuteByScrollTop() {
    let arrIndex = Math.floor(this.minuteElm.nativeElement.scrollTop / this.itemHeight) + 1;
    this.mDatas.currentMinute = this.mDatas.minutes[arrIndex];
  }


  isScrolling: boolean = false;
  isScrollDone: boolean = true;
  onTouchStart(ev) {
    this.isScrolling = true;
  }

  onTouchEnd(ev, elm: HTMLDivElement, index: number) {
    this.isScrolling = false;
    this.isScrollDone = false;
    this.onScrollDone(elm, index);
  }

  onScroll(ev, index: number) {
    if (!this.isScrolling) {
      this.isScrollDone = false;
      this.onScrollDone(ev.target, index);
    }
  }

  timeOutObject: any;
  count = 0;
  onScrollDone(elm: HTMLElement, index: number) {
    //end of touch. May be end of scrolling. Just reset count. 
    //Frame counts continuous so we reset it after every frame
    if (this.timeOutObject) {
      cancelAnimationFrame(this.timeOutObject);
      this.count = 0;
    }

    this.countDown(elm, index);
  }

  countDown(elm: HTMLElement, index: number) {
    this.timeOutObject = requestAnimationFrame(() => {
      this.count++;
      // this will happened when the scrolling is stopped (count variable isn't resetted) 
      if (this.count == 2) {
        cancelAnimationFrame(this.timeOutObject);
        this.count = 0;
        this.calScrollTop(elm);
        this.isScrollDone = true;
        if (index == this.mTexts.DATE) {
          this.updateDateByScrollTop();
        }
        else if (index == this.mTexts.MONTH) {
          this.updateMonthByScrollTop();
          this.onChangeMonth();
        }
        else if (index == this.mTexts.YEAR) {
          this.updateYearByScrollTop();
        }
        else if (index == this.mTexts.HOUR) {
          this.updateHourByScrollTop();
        }
        else if (index == this.mTexts.MINUTE) {
          this.updateMinuteByScrollTop();
        }
      }
      else {
        this.timeOutObject = requestAnimationFrame(() => {
          this.countDown(elm, index);
        });
      }
    });
  }

  calScrollTop(elm: HTMLElement) {
    let currentScrollTop = elm.scrollTop;

    let decimalPart = currentScrollTop / this.itemHeight - Math.floor(currentScrollTop / this.itemHeight);

    let fixedScrollTop;

    if (decimalPart >= 0.5) {
      fixedScrollTop = Math.ceil(currentScrollTop / this.itemHeight) * this.itemHeight;
    }
    else {
      fixedScrollTop = Math.floor(currentScrollTop / this.itemHeight) * this.itemHeight;
    }

    let delta = Math.floor(Math.abs((fixedScrollTop - currentScrollTop) / 2));

    this.fixScrollTop(elm, currentScrollTop, fixedScrollTop, this.delta);
  }

  delta = 2; // px
  requestObject: any;
  fixScrollTop(elm, currentScrollTop, newScrollTop, delta: number) {
    if (currentScrollTop <= newScrollTop) {
      currentScrollTop += delta;
      if (currentScrollTop >= newScrollTop) {
        elm.scrollTop = newScrollTop;
        cancelAnimationFrame(this.requestObject);
      }
      else {
        elm.scrollTop = currentScrollTop;
        this.requestObject = requestAnimationFrame(() => {
          this.fixScrollTop(elm, currentScrollTop, newScrollTop, delta)
        });
      }
    } else {
      currentScrollTop -= delta;
      if (currentScrollTop <= newScrollTop) {
        elm.scrollTop = newScrollTop;
        cancelAnimationFrame(this.requestObject);
      }
      else {
        elm.scrollTop = currentScrollTop;
        this.requestObject = requestAnimationFrame(() => {
          this.fixScrollTop(elm, currentScrollTop, newScrollTop, delta)
        });
      }
    }
  }

  slideChanged() {
    this.mViews.currentSlide = this.slides.getActiveIndex();
  }

  onClickBackdrop() {
    this.cancel.emit();
  }

  onClickContent() {
    event.stopPropagation();
  }

  onClickCancel() {
    this.cancel.emit();
  }

  onClickDone() {
    this.done.emit({
      date: this.mDatas.currentDate,
      month: this.mDatas.currentMonth,
      year: this.mDatas.currentYear,
      hour: this.mDatas.currentHour,
      minute: this.mDatas.currentMinute
    });
  }

  onClickNext() {
    this.slides.slideNext();
  }

  onClickPrevious() {
    this.slides.slidePrev();
  }
}
