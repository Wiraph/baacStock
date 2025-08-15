import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Divident } from '../../../services/divident';
import Swal from 'sweetalert2';
import flatpickr from 'flatpickr';
import { Thai } from 'flatpickr/dist/l10n/th.js';
import { Thaidateadapter } from '../../thaidateadapter/thaidateadapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThaiCalendarComponent } from '../../thai-calendar-component/thai-calendar-component';

export const THAI_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'd MMMM yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'd MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  standalone: true,
  selector: 'app-annualdividendcalculator',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    CommonModule,
    FormsModule,
    ThaiCalendarComponent
  ],
  templateUrl: './annualdividendcalculator.html',
  styleUrls: ['./annualdividendcalculator.css'], // แก้เป็น styleUrls
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    {
      provide: MAT_DATE_FORMATS, useValue: {
        parse: { dateInput: 'L' },
        display: { dateInput: 'dd/MM/yyyy', monthYearLabel: 'MMMM yyyy', dateA11yLabel: 'LL', monthYearA11yLabel: 'MMMM yyyy' }
      }
    },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnualdividendcalculatorComponent implements OnInit {
  dividend: any = '';
  selectedDate: Date | null = new Date(2568 - 543, 7, 15);
  readonly startDate = new Date();
  loading = false;
  showCalendar = false;
  activeView = '';

  constructor(
    private readonly dividendService: Divident,
    private readonly cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.dividendService.getAllDividend().subscribe({
      next: (res) => {
        this.dividend = res[0];
        this.selectedDate = this.thaiNumberToDate(this.dividend?.dateMEET);
        console.log("dividend", this.dividend);
        this.loading = false;
        this.activeView = 'data';
        this.cd.detectChanges();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'โปรดติดต่อผู้พัฒนา'
        })
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // แปลงปี ค.ศ. → พ.ศ.
    const toThaiYear = (date: Date) => {
      const d = new Date(date);
      d.setFullYear(d.getFullYear() + 543);
      return d;
    };

    flatpickr("#thaiDateInput", {
      locale: Thai,
      dateFormat: "d F Y",
      altInput: true,
      altFormat: "d F Y",
      defaultDate: new Date(),
      onChange: function (selectedDates, dateStr, instance) {
        if (selectedDates.length > 0) {
          const thaiDate = toThaiYear(selectedDates[0]);
          instance.input.value = `${thaiDate.getDate()} ${Thai.months.longhand[thaiDate.getMonth()]} ${thaiDate.getFullYear()}`;
        }
      },
      formatDate: function (date, format, locale) {
        const thaiDate = toThaiYear(date);
        return `${thaiDate.getDate()} ${locale.months.longhand[thaiDate.getMonth()]} ${thaiDate.getFullYear()}`;
      }
    });
  }




  onDatePicked(date: Date) {
    this.selectedDate = date;
    this.showCalendar = false; // ปิด popup หลังเลือกวัน
  }

  /**
 * แปลงเลขวันที่แบบ YYYYMMDD (พ.ศ.) เป็น Date object
 * @param thaiDateNumber เช่น 25680815
 * @returns Date object
 */
  thaiNumberToDate(thaiDateNumber: number): Date {
    const str = thaiDateNumber.toString();
    if (str.length !== 8) {
      throw new Error('รูปแบบวันที่ไม่ถูกต้อง ต้องเป็น 8 หลัก YYYYMMDD');
    }

    const year = parseInt(str.slice(0, 4)) - 543; // พ.ศ. → ค.ศ.
    const month = parseInt(str.slice(4, 6)) - 1;  // JavaScript month (0-11)
    const day = parseInt(str.slice(6, 8));

    return new Date(year, month, day);
  }
}
