import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  constructor(private http: HttpClient) {}

  getShopTimingInfo(): Observable<any> {
    const url = `${environment.serviceUrl}get_settings/get_opening_closing_time_data`;
    return this.http.post<any>(url, '');
  }

  setReservation(data): Observable<any> {
    const url = `${environment.serviceUrl}reservations/set`;
    return this.http.post<any>(url, data);
  }

  substractMinutesFromTime(time, substractMinutes) {
    // console.log('time: ', time);
    let timeArray = time.split(':');
    let hours = parseInt(timeArray[0]);
    let minutes = parseInt(timeArray[1]);
    let seconds = timeArray[2];
    let totalMinutes = hours * 60 + minutes;

    totalMinutes = totalMinutes - substractMinutes;
    let hoursStr = Math.floor(totalMinutes / 60).toString() + ':';
    let newMinutes = Math.floor(totalMinutes % 60);
    let minutesStr = '00:';
    if (newMinutes > 0) {
      if (newMinutes <= 9) {
        minutesStr = '0' + newMinutes.toString() + ':';
      } else {
        minutesStr = newMinutes.toString() + ':';
      }
    }
    let newTime = hoursStr + minutesStr + seconds;
    return newTime;
  }

  isShopClosedAsTime(time, date, orderType) {
    let bookingSettingsDetails: any = this.getBookingSettingsDetails();
    let isClosed = true;
    let previousDayNumber = -1;
    let initDate = new Date(date);
    let dayNumber = initDate.getDay();
    let today = new Date();
    let year = today.getFullYear();
    let month = `0${today.getMonth() + 1}`.slice(-2);
    let day = `0${today.getDate()}`.slice(-2);
    let hour = `0${today.getHours()}`.slice(-2);
    let min = `0${today.getMinutes()}`.slice(-2);
    let currentTime = `${hour}:${min}`;
    let currentDate = `${year}-${month}-${day}`;
    let isValidTime = true;

    if (orderType === '') {
      orderType = 'collection';
    }

    if (dayNumber == 0) {
      previousDayNumber = 6;
    } else {
      previousDayNumber = dayNumber - 1;
    }
    let shopTiming = this.getShopTimingAsDayNumber(dayNumber, orderType);
    let prevDayShopTiming = this.getShopTimingAsDayNumber(
      previousDayNumber,
      orderType
    );

    if (currentDate === date) {
      if (time < currentTime) {
        isValidTime = false;
      }
    }

    if (isValidTime) {
      if (shopTiming) {
        let openTime = '';
        let closeTime = '';
        if (shopTiming.hasOwnProperty('open_time')) {
          openTime = shopTiming.open_time;
        }

        if (shopTiming.hasOwnProperty('close_time')) {
          closeTime = shopTiming.close_time;
          closeTime = this.substractMinutesFromTime(closeTime, 15);
        }
        console.log('openTime: ', openTime);
        console.log('closeTime: ', closeTime);

        if (openTime > closeTime) {
          if (openTime <= time) {
            isClosed = false;
          }
        } else {
          if (time >= openTime && time <= closeTime) {
            isClosed = false;
          }
        }

        if (!prevDayShopTiming && !prevDayShopTiming.length) {
          let prevDayCloseTime = '';
          if (prevDayShopTiming.hasOwnProperty('close_time')) {
            prevDayCloseTime = prevDayShopTiming.close_time;
          }

          if (time <= '12:00' && prevDayCloseTime <= '12:00') {
            if (prevDayCloseTime >= time && openTime >= time) {
              isClosed = false;
            }
          }
        }
      }
    }
    let message = '';
    if (bookingSettingsDetails) {
      message = bookingSettingsDetails.message;
    }
    return { isClosed, message };
  }

  isShopClosedAsWeekend(dayNumber) {
    let weekendOffDetails: any = this.getWeekendOffDetails();
    let todayDate = new Date().toISOString().split('T')[0];

    if (weekendOffDetails) {
      if (weekendOffDetails.hasOwnProperty('day_ids')) {
        let dayIds = weekendOffDetails.day_ids;
        if (dayIds !== null && dayIds.includes(dayNumber.toString())) {
          return true;
        }
      }

      if (weekendOffDetails.hasOwnProperty('is_closed_for_today')) {
        let isClosedForToday: any = weekendOffDetails.is_closed_for_today;
        if (
          isClosedForToday.hasOwnProperty('status') &&
          isClosedForToday.hasOwnProperty('date') &&
          isClosedForToday.hasOwnProperty('day_id') &&
          isClosedForToday.status == 1 &&
          isClosedForToday.date &&
          dayNumber == isClosedForToday.day_id
        ) {
          if (todayDate == isClosedForToday.date) {
            return true;
          }
        }
      }

      if (weekendOffDetails.hasOwnProperty('is_closed_for_tomorrow')) {
        let isClosedForTomorrow: any = weekendOffDetails.is_closed_for_tomorrow;
        if (
          isClosedForTomorrow.hasOwnProperty('status') &&
          isClosedForTomorrow.hasOwnProperty('date') &&
          isClosedForTomorrow.hasOwnProperty('day_id') &&
          isClosedForTomorrow.status == 1 &&
          isClosedForTomorrow.date &&
          dayNumber == isClosedForTomorrow.day_id
        ) {
          if (todayDate <= isClosedForTomorrow.date) {
            return true;
          }
        }
      }

      if (weekendOffDetails.hasOwnProperty('is_closed_for_this_weeks')) {
        let isClosedForThisWeek: any =
          weekendOffDetails.is_closed_for_this_weeks;
        if (
          isClosedForThisWeek.hasOwnProperty('status') &&
          isClosedForThisWeek.hasOwnProperty('start_date') &&
          isClosedForThisWeek.hasOwnProperty('end_date') &&
          isClosedForThisWeek.hasOwnProperty('day_ids') &&
          isClosedForThisWeek.status === 1 &&
          isClosedForThisWeek.start_date &&
          isClosedForThisWeek.end_date &&
          isClosedForThisWeek.day_ids.includes(dayNumber.toString())
        ) {
          if (
            todayDate >= isClosedForThisWeek.start_date &&
            todayDate <= isClosedForThisWeek.end_date
          ) {
            return true;
          }
        }
      }
      return false;
    }
    return false;
  }

  isBookingClosed(date) {
    let bookingSettingsDetails: any = this.getBookingSettingsDetails();
    let isClosed = false;
    let message = '';

    if (bookingSettingsDetails) {
      if (
        bookingSettingsDetails.hasOwnProperty('is_closed') &&
        bookingSettingsDetails.hasOwnProperty('closing_date') &&
        bookingSettingsDetails.is_closed === '1' &&
        bookingSettingsDetails.closing_date
      ) {
        message = bookingSettingsDetails.message;
        let closingDates = bookingSettingsDetails.closing_date;
        closingDates = closingDates.split(',');
        // console.log('bookingSettingsDetails: ', bookingSettingsDetails);
        if (closingDates.indexOf(date) >= 0) {
          isClosed = true;
        }
      }
    }
    return { isClosed, message };
  }

  getShopTimingAsDayNumber(dayNumber, orderType) {
    let shopTimingDetails: any = this.getShopTimingDetails();
    let selectedShopTimingDetails: any = {};
    for (let shopTiming of shopTimingDetails) {
      if (
        shopTiming.day_id == dayNumber &&
        shopTiming.order_type == orderType
      ) {
        selectedShopTimingDetails = shopTiming;
      }
    }
    return selectedShopTimingDetails;
  }

  getShopTimingDetails() {
    return JSON.parse(localStorage.getItem('shopOpeningClosingDetails'));
  }

  getWeekendOffDetails() {
    return JSON.parse(localStorage.getItem('weekendOffDetails'));
  }

  getBookingSettingsDetails() {
    return JSON.parse(localStorage.getItem('bookingSettingsDetails'));
  }
}
