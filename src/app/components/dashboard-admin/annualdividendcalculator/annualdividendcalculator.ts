import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { Divident } from '../../../services/divident';
import Swal from 'sweetalert2';
import { Thai } from 'flatpickr/dist/l10n/th.js';
import { Thaidateadapter } from '../../thaidateadapter/thaidateadapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThaiCalendarComponent } from '../../thai-calendar-component/thai-calendar-component';
import { MatPaginatorModule, PageEvent  } from '@angular/material/paginator';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';

interface DividendRequest {
  setAct: number;
  stkYear: string;
  stkTime: number;
  stkRate: number;
  dateMeet: string;
  datePaid: string;
  dateApprove: string;
}

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
    ThaiCalendarComponent,
    MatPaginatorModule,
    MatButtonModule,
    MatTooltipModule
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
  dividendList: any[] = [];
  selectedDateMeet: Date | null = new Date(2568 - 543, 7, 15);
  selectedDatePaid: Date | null = new Date(2568 - 543, 7, 15);
  readonly startDate = new Date();
  loading: boolean = false;
  showCalendarMeet: boolean = false;
  showCalendarPaid: boolean = false;
  contentform: boolean = false;
  activeView = '';
  dataForm: { year: string | null; time: number | null; dividend: number | null } = {
    year: null,
    time: null,
    dividend: null
  };
  pageSize = 20;
  pageIndex = 0;
  length: number|null = null;
  pageSizeOptions = [20,40,60, 80, 100];
  dividendDesc: string = '';

  constructor(
    private readonly dividendService: Divident,
    private readonly cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) { }

  get pagedDividendList() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.dividendList.slice(start, end);
  }


  onPageChange(event: PageEvent) {
    const pageIndex: number = event.pageIndex + 1;
    this.showDetail(pageIndex, event.pageSize);
  }

  back() {
    this.activeView = 'null';
    this.ngOnInit();
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.changeLoading(true);
    this.calDividend();

  }

  ngAfterViewInit(): void {
    // แปลงปี ค.ศ. → พ.ศ.
    const toThaiYear = (date: Date) => {
      const d = new Date(date);
      d.setFullYear(d.getFullYear() + 543);
      return d;
    };
    if (isPlatformBrowser(this.platformId)) {
      import('flatpickr').then(flatpickr => {
        flatpickr.default("#myDateInput", {
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
      });
    }
  }

  onDatePickedMeet(date: Date) {
    this.selectedDateMeet = date;
    this.showCalendarMeet = false;
  }

  onDatePickedPaid(date: Date) {
    this.selectedDatePaid = date;
    this.showCalendarPaid = false;
  }

  submit(setact: number, doACT: string): void {
    console.log("DOACT", doACT);
    console.log("setact", setact);
    let message: string[] = [];
    let payload: any = {};
    let MSGs = `คำนวณหุ้นปันผลประจำปี\nปีงบประมาณ` + this.dividend.stkYEARc + ` ครั้งที่ ` + this.dividend.stkTIME;
    switch (doACT) {
      case 'DOCAL': break;
      case 'RECAL': MSGs = MSGs + ' ใหม่'; break;
      case 'APPRV': MSGs = 'อนุมัติการ' + MSGs; break;
    }

    if (setact == 2 && doACT == 'DOCAL') {
      if (
        !this.dataForm.year ||
        isNaN(Number(this.dataForm.year)) ||
        String(this.dataForm.year).length !== 4
      ) {
        message.push('ปีบัญชีที่จ่ายเงินปันผล ต้องเป็นตัวเลข 4 หลัก (พ.ศ.)');
      }
      if (!this.dataForm.time || isNaN(Number(this.dataForm.time))) {
        message.push('ครั้งที่จ่ายเงินปันผล ต้องเป็นตัวเลขเท่านั้น');
      }
      if (!this.dataForm.dividend || isNaN(Number(this.dataForm.dividend))) {
        message.push('อัตราเงินปันผล ต้องเป็นตัวเลขเท่านั้น');
      }

      if (message.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'ตรวจสอบข้อมูล',
          html: message.join('<br>')
        });
        return
      }
    }
    if (setact === 2 || setact === 3) {
      payload = {
        setAct: setact,
        stkYear: this.dataForm.year ?? '',
        stkTime: Number(this.dataForm.time ?? 0),
        stkRate: Number(this.dataForm.dividend ?? 0),
        dateMeet: this.formatDatetoString(this.selectedDateMeet),
        datePaid: this.formatDatetoString(this.selectedDatePaid),
        dateApprove: null
      };
      console.log("Payload", payload);
    }

    Swal.fire({
      icon: 'question',
      text: `ท่านต้องการ${MSGs} ใช่ หรือ ไม่?`,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        if (setact == 2 || setact == 3) {
          this.calDividend(doACT, payload);
        } else if (setact == 0 && doACT == 'RECAL') {
          this.dividendService.deleteDividendLST().subscribe({
            next: (res: any) => {
              console.log(res.message);
            }, error: (err) => {
              console.log("Err", err);
            }
          })
          window.location.reload();
        }
        else {
          this.calDividend();
        }
        this.cd.detectChanges();
      }
    })
  }

  calDividend(doact: string = "", payload: any = {}) {
    console.log("Payload", payload);
    this.dividendService.getAllDividend(payload).subscribe({
      next: (res: any) => {
        this.dividend = res;
        this.selectedDateMeet = this.thaiNumberToDate(this.dividend?.dateMEET);
        this.selectedDatePaid = this.thaiNumberToDate(this.dividend?.datePAiD);
        this.dataForm.year = this.dividend.stkYEARc;
        this.dataForm.time = this.dividend.stkTIME;
        this.dataForm.dividend = this.dividend.stkRATE;
        if (this.dividend.dType == 1 || this.dividend.dType == 0) {
          this.dividendDesc = 'ก่อนการอนุมัติ';
        } else {
          this.dividendDesc = 'หลังอนุมัติ';
        }
        this.activeView = 'data';
        if (doact != '') {
          this.ngOnInit();
        }
        this.changeLoading(false);
        this.cd.detectChanges();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'โปรดติดต่อผู้พัฒนา'
        });
      }
    });
  }

  showDetail(pgNum: number = 1, pgSize: number = 20, year: string = ""): void {
    this.activeView = 'tables';
    this.loading = true;
    const payload = {
      year: year,
      pgNum: pgNum,
      pgSize: pgSize
    }
    this.dividendService.getDividendList(payload).subscribe({
      next: (res) => {
        this.dividendList = res;
        this.length = this.dividendList[0].roWs;
        this.loading = false;
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Err", err);
      }
    })
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

  formatDate(date: string | number): string {
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

  formatDatetoString(date: Date | null): string {
    if (!date) return "";

    const d = new Date(date);

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear() + 543;

    return `${year}${month}${day}`;
  }

  formatDateNew(date: string | number): string {
    if (!date) return "";

    const monthsThai = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];

    // แปลง YYYYMMDD → Date
    const str = date.toString();
    if (str.length !== 8) return "";

    const year = parseInt(str.slice(0, 4)) - 543; // แปลง พ.ศ. → ค.ศ.
    const month = parseInt(str.slice(4, 6)) - 1;  // เดือน 0-11
    const day = parseInt(str.slice(6, 8));

    const d = new Date(year, month, day);
    if (isNaN(d.getTime())) return "";

    return `${day} ${monthsThai[month]} ${parseInt(str.slice(0, 4))}`; // แสดงปี พ.ศ.
  }
}


