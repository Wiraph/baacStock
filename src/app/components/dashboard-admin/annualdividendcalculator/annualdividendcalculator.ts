import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject, PLATFORM_ID, inject, ElementRef, ViewChild } from '@angular/core';
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import { lastValueFrom } from 'rxjs';
import { NgxPrintModule } from 'ngx-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


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
    MatTooltipModule,
    NgxPrintModule
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
  @ViewChild('voucherDiv') voucherDiv!: ElementRef;
  readonly dialog = inject(MatDialog);
  pdfMake: any;
  dividend: any = '';
  dividendList: any[] = [];
  dividendOwner: any[] = [];
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
  length: number | null = null;
  pageSizeOptions = [20, 40, 60, 80, 100];
  dividendDesc: string = '';
  titlePageShowDetail: string = '';
  hidded: boolean = true;
  voucher: boolean = false;

  constructor(
    private readonly dividendService: Divident,
    private readonly cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) { }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string, item: any): void {
    this.dialog.open(DialogAnimationsExampleDialog, {
      width: '1100px',
      height: '500px',
      data: item,
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

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
    this.loading = true;
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

  submit(doACT: string): void {
    console.log(doACT);
    let setact: number | null = null;
    switch (doACT) {
      case 'DOCAL': setact = 2; break;
      case 'APPRV': setact = 3; break;
      default: setact = 0; break;
    }

    let message: string[] = [];
    let payload: any = {};
    let MSGs = `คำนวณหุ้นปันผลประจำปี\nปีงบประมาณ` + this.dividend.stkYEARc + ` ครั้งที่ ` + this.dividend.stkTIME;
    switch (doACT) {
      case 'DOCAL': break;
      case 'RECAL': MSGs = MSGs + ' ใหม่'; break;
      case 'APPRV': MSGs = 'อนุมัติการ' + MSGs; break;
    }

    if (doACT == 'DOCAL') {
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
    if (doACT == 'DOCAL') {
      payload = {
        setAct: Number(setact),
        stkYear: this.dataForm.year ?? '',
        stkTime: Number(this.dataForm.time ?? 0),
        stkRate: Number(this.dataForm.dividend ?? 0),
        dateMeet: this.formatDatetoString(this.selectedDateMeet),
        datePaid: this.formatDatetoString(this.selectedDatePaid),
      };
      console.log("Payload", payload);
    }
    if (doACT == 'APPRV') {
      payload = {
        setAct: Number(setact),
        stkYear: this.dataForm.year ?? '',
        stkTime: Number(null),
        stkRate: Number(null),
        dateMeet: String(null),
        datePaid: String(null),
      };
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
        this.cd.detectChanges();
        if (doACT === 'RECAL') {
          this.dividendService.deleteDividendLST().subscribe({
            next: (res: any) => {
              console.log(res.message);
              this.ngOnInit();
            }, error: (err) => {
              console.log("Err", err);
            }
          })
        }
        else {
          this.calDividend(doACT, payload);
        }
      }
    })
  }

  calDividend(doact: string = "", payload: any = {}) {
    this.loading = true;
    this.dividendService.getAllDividend(payload).subscribe({
      next: (res: any) => {
        this.dividend = res;
        console.log("Dividend", this.dividend);
        this.selectedDateMeet = this.thaiNumberToDate(this.dividend?.dateMEET);
        this.selectedDatePaid = this.thaiNumberToDate(this.dividend?.datePAiD);
        this.dataForm.year = this.dividend.stkYEARc;
        this.dataForm.time = this.dividend.stkTIME;
        this.dataForm.dividend = this.dividend.stkRATE;
        if (this.dividend.dateAPPROVE == '') {
          this.dividendDesc = '( ก่อนการอนุมัติ )';
        } else {
          this.dividendDesc = '( หลังอนุมัติ )';
        }
        this.activeView = 'data';
        if (doact != '') {
          this.ngOnInit();
        }
        this.loading = false;
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
    if (this.dividend.dateAPPROVE == '') {
      this.titlePageShowDetail = '( ก่อนการประชุม )';
    } else {
      this.titlePageShowDetail = '( หลังการประชุม )';
    }
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

  showDividendPer(item: any) {
    const payload = {
      stkOWNiD: item.stkOWNiD
    };
    this.dividendService.getDividendDetailPerPerson(payload).subscribe({
      next: (res) => {
        this.dividendOwner = res;
        this.openDialog('1000ms', '500ms', this.dividendOwner);
        this.cd.detectChanges();
      }
    })
  }

  /**
   * Export Excel
   */

  async exportExcel() {
    const year = this.dividend.stkYEARc;
    const dateMeet = this.formatDateNew(this.dividend.dateMEET);
    const datePaid = this.formatDateNew(this.dividend.datePAiD);
    const rate = this.dividend.stkRATE;
    let approve: string = this.dividend.dateAPPRROVE ? "( ยังไม่อนุมัติ )" : "( อนุมัติแล้ว )";

    const payload = { year: '', pgNum: Number(null), pgSize: Number(null) };

    // ✅ รอข้อมูลก่อนค่อยทำต่อ
    let dividendAllList: any[] = [];
    try {
      dividendAllList = await lastValueFrom(this.dividendService.getDividendList(payload));
    } catch (err) {
      console.error("Error", err);
      return;
    }

    // === Excel Workbook ===
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dividend', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    const headerFont = { name: 'TH SarabunPSK', size: 16, bold: true };
    const normalFont = { name: 'TH SarabunPSK', size: 14 };

    // === Title ===
    worksheet.mergeCells('A1:J1');
    worksheet.getCell('A1').value = `รายงานเงินปันผลประจำปี ${year} ${approve}`;
    worksheet.getCell('A1').font = headerFont;
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A2:J2');
    worksheet.getCell('A2').value = `ประชุมวันที่ ${dateMeet}`;
    worksheet.getCell('A2').font = normalFont;
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A3:J3');
    worksheet.getCell('A3').value = `จ่ายเงินปันผลวันที่ ${datePaid} อัตรา ${rate} บาท/หุ้น`;
    worksheet.getCell('A3').font = normalFont;
    worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };

    // === Header Row ===
    const headerRow = worksheet.addRow([
      'ลำดับ', 'รหัสผู้ถือหุ้น', 'ชื่อ-นามสกุล', 'จำนวนหุ้น', 'เงินปันผล',
      'ฐานภาษี', 'หักภาษี ณ ที่จ่าย', 'จ่ายเงินสุทธิ', 'ธนาคาร', 'หมายเหตุ'
    ]);
    headerRow.font = headerFont;
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // === Body Rows + คำนวณรวม ===
    let sumUnits = 0, sumDividend = 0, sumTax = 0, sumNet = 0;

    dividendAllList.forEach((row, i) => {
      const net = row.dvNtot - row.dvNtax;
      sumUnits += row.uNiTs;
      sumDividend += row.dvNtot;
      sumTax += row.dvNtax;
      sumNet += net;

      const dataRow = worksheet.addRow([
        i + 1,
        row.stkOWNiD,
        row.cusNAME,
        row.uNiTs,
        row.dvNtot,
        row.taXrmax,
        row.dvNtax,
        net,
        row.payABBR,
        row.remark
      ]);
      dataRow.font = normalFont;
      dataRow.eachCell((cell: any) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
    });

    // === Summary Row (รวม) ===
    const sumRow = worksheet.addRow([
      'รวม', '', '', sumUnits, sumDividend, '', sumTax, sumNet, '', ''
    ]);
    sumRow.font = { name: 'TH SarabunPSK', size: 14, bold: true };
    sumRow.alignment = { vertical: 'middle', horizontal: 'center' };
    sumRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // === Column Width ===
    worksheet.columns = [
      { width: 8 }, { width: 18 }, { width: 32 }, { width: 12 }, { width: 14 },
      { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 20 }
    ];

    // === Export ===
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Dividend_${year}.xlsx`);
  }

  exportPDF() {
    this.voucher = true;
    console.log(this.voucher);
    this.cd.detectChanges();
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

@Component({
  selector: 'dialog-animations-example-dialog',
  templateUrl: 'popup.html',
  styleUrls: ['./annualdividendcalculator.css'],
  imports: [MatButtonModule, MatDialogClose, MatDialogTitle, MatDialogContent, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogAnimationsExampleDialog {
  dividendOwner: any[] = [];
  loading = false;
  get totalUnits() {
    return this.dividendOwner.reduce((sum, row) => sum + row.stkUNiT, 0);
  }

  get totalDividend() {
    return this.dividendOwner.reduce((sum, row) => sum + row.dvnTOT, 0);
  }

  get totalTax() {
    return this.dividendOwner.reduce((sum, row) => sum + row.dvnTAX, 0);
  }

  get totalNet() {
    return this.dividendOwner.reduce((sum, row) => sum + (row.dvnTOT - (row.dvnTOT * row.taxRATE / 100)), 0);
  }
  ownerDetial = { stkOWNiD: "", cusTitle: "", cusFName: "", cusLName: "'" };
  readonly dialogRef = inject(MatDialogRef<DialogAnimationsExampleDialog>);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly cd: ChangeDetectorRef
  ) {
    this.ownerDetial.stkOWNiD = data.stkOWNiD;
    this.ownerDetial.cusTitle = data.cusTitle;
    this.ownerDetial.cusFName = data.cusFName;
    this.ownerDetial.cusLName = data.cusLName;
    this.dividendOwner = data;
  }

  onRowKeyDown(event: KeyboardEvent, row: any) {
    console.log('Key pressed:', event.key, row);
  }
}

@Component({
  selector: 'voucher-component',
  templateUrl: './voucher.html',
  styleUrls: ['./annualdividendcalculator.css'],
  imports: [],
})
export class VoucherComponent implements OnInit {
  @ViewChild('voucherDiv') voucherDiv!: ElementRef;

  ngOnInit(): void {
    const DATA: any = this.voucherDiv.nativeElement;

    html2canvas(DATA, { scale: 2 }).then(canvas => {
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const contentDataURL = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      if (imgHeight < pageHeight) {
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      } else {
        // ถ้า content ยาวเกิน pageHeight
        let heightLeft = imgHeight;
        while (heightLeft > 0) {
          pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          if (heightLeft > 0) {
            pdf.addPage();
            position = -heightLeft + pageHeight;
          }
        }
      }

      pdf.save('voucher.pdf');
    });
  }


}

