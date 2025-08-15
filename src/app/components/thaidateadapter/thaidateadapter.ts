import { Component, Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-thaidateadapter',
  imports: [],
  templateUrl: './thaidateadapter.html',
  styleUrl: './thaidateadapter.css'
})
@Injectable()
export class Thaidateadapter extends NativeDateAdapter {
  override getYearName(date: Date): string {
    return (date.getFullYear() + 543).toString();
  }

  override format(date: Date, displayFormat: any): string {
    const day = date.getDate();
    const month = this.getMonthNames('long')[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  }
}
