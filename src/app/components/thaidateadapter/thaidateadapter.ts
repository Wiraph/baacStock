import { Component } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-thaidateadapter',
  imports: [],
  templateUrl: './thaidateadapter.html',
  styleUrl: './thaidateadapter.css'
})
export class Thaidateadapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    const day = date.getDate();
    const month = this.getMonthNames('long')[date.getMonth()];
    const year = date.getFullYear() + 543;  // แสดงปี พ.ศ. เท่านั้น
    return `${day} ${month} ${year}`;
  }
}
