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
  selectedDateMeet: Date | null = new Date(2568 - 543, 7, 15);
  selectedDatePaid: Date | null = new Date(2568 - 543, 7, 15);
  readonly startDate = new Date();
  loading: boolean = false;
  showCalendarMeet: boolean = false;
  showCalendarPaid: boolean = false;
  activeView = '';
  dataForm: any = {
    year: null,
    time: null,
    dividend: null
  };

  constructor(
    private readonly dividendService: Divident,
    private readonly cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.changeLoading(true);
    this.loadDevidend();
  }

  loadDevidend(): void {
    this.dividendService.getAllDividend().subscribe({
      next: (res: any) => {
        this.dividend = res;
        this.selectedDateMeet = this.thaiNumberToDate(this.dividend?.dateMEET);
        this.selectedDatePaid = this.thaiNumberToDate(this.dividend?.datePAiD);
        console.log("dividend", this.dividend);
        this.dataForm.year = this.dividend.stkYEARc;
        this.dataForm.time = this.dividend.stkTIME;
        this.dataForm.dividend = this.dividend.stkRATE;
        this.activeView = 'data';
        this.changeLoading(false);
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




  onDatePickedMeet(date: Date) {
    this.selectedDateMeet = date;
    this.showCalendarMeet = false;
  }

  onDatePickedPaid(date: Date) {
    this.selectedDatePaid = date;
    this.showCalendarPaid = false;
  }

  submit(): void {
    this.cd.detectChanges();
    let message: string[] = [];

    // ตรวจ stkYEARc
    if (
      !this.dataForm.year ||
      isNaN(Number(this.dataForm.year)) ||
      String(this.dataForm.year).length !== 4
    ) {
      message.push('ปีบัญชีที่จ่ายเงินปันผล ต้องเป็นตัวเลข 4 หลัก (พ.ศ.)');
    }
    // ตรวจ stkTIME
    if (!this.dataForm.time || isNaN(Number(this.dataForm.time))) {
      message.push('ครั้งที่จ่ายเงินปันผล ต้องเป็นตัวเลขเท่านั้น');
    }
    // ตรวจ valueDividend
    if (!this.dataForm.dividend || isNaN(Number(this.dataForm.dividend))) {
      message.push('อัตราเงินปันผล ต้องเป็นตัวเลขเท่านั้น');
    }
    console.log(message);
    // แสดง message ถ้ามี
    if (message.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ตรวจสอบข้อมูล',
        html: message.join('<br>')
      });
    } else {
      Swal.fire({
        icon: 'question',
        text: `ท่านต้องการคำนวณเงินปันผลจ่ายหุ้นสามัญ ประจำปี ${this.dividend.stkYEARc} ครั้งที่ ${this.dividend.stkTIME} ใช่หรือไม่?`,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          return
        }
      })
    }


  }


  /**
  * แปลงเลขวันที่แบบ YYYYMMDD (พ.ศ.) เป็น Date object
  * @param thaiDateNumber เช่น 25680815
  * @returns Date object
  */
  thaiNumberToDate(thaiDateNumber?: number): Date | null {
    if (thaiDateNumber === null || thaiDateNumber === undefined) {
      console.error("thaiDateNumber is null/undefined");
      return null;
    }

    const str = thaiDateNumber.toString();
    if (str.length !== 8) {
      throw new Error('รูปแบบวันที่ไม่ถูกต้อง ต้องเป็น 8 หลัก YYYYMMDD');
    }

    const year = parseInt(str.slice(0, 4), 10) - 543; // พ.ศ. → ค.ศ.
    const month = parseInt(str.slice(4, 6), 10) - 1;  // JS month (0-11)
    const day = parseInt(str.slice(6, 8), 10);

    return new Date(year, month, day);
  }

  changeLoading(status: boolean) {
    this.loading = status;
  }

  formatDate(date: string): string {
    if (!date) return "";

    const monthsThai = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];

    // แปลง string → Date
    const d = new Date(date);
    if (isNaN(d.getTime())) return ""; // กัน error ถ้าวันที่ไม่ถูกต้อง

    const day = d.getDate();
    const month = monthsThai[d.getMonth()];
    const year = d.getFullYear() + 543;

    return `${day} ${month} ${year}`;
  }


}
