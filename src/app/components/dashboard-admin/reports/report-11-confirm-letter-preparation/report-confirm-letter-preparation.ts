import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ThaiCalendarComponent } from '../../../thai-calendar-component/thai-calendar-component';
import { Thaidateadapter } from '../../../thaidateadapter/thaidateadapter';
import { Reports } from '../../../../services/reports';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export const THAI_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'd MMMM yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'd MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  standalone: true,
  selector: 'app-report-11-confirm-letter-preparation',
  imports: [CommonModule, FormsModule, ThaiCalendarComponent],
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
  ],
  templateUrl: './report-confirm-letter-preparation.html',
  styleUrl: './report-confirm-letter-preparation.css'
})
export class Report11ConfirmLetterPreparation implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();


  // แสดง/ซ่อน calendar
  showCalendarFrom = false;
  showCalendarTo = false;

  // วันที่ที่เลือก (ใช้ Thai calendar adapter แสดงผล)
  selectedDateFrom: Date = new Date();
  selectedDateTo: Date = new Date();

  // ฟิลเตอร์
  filters = {
    // เก็บเป็นรูปแบบ YYYYMMDD (พ.ศ.) สำหรับเรียก API
    from: '',
    to: '',
  };

  // วันที่เก่าที่สุดที่เลือกได้: 28 ก.ค. 2557 (2014-07-28)
  readonly minSelectableDate: Date = new Date(2014, 6, 28);

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly reports: Reports,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    // ค่าเริ่มต้น: วันนี้
    this.selectedDateFrom = this.clampToMin(this.selectedDateFrom);
    this.selectedDateTo = this.clampToMin(this.selectedDateTo);
    this.filters.from = this.formatDateToString(this.selectedDateFrom);
    this.filters.to = this.formatDateToString(this.selectedDateTo);
  }

  sendHead() {
    this.headerChange.emit("รายงานการจัดทำหนังสือยืนยันยอดหุ้น");
  }


  onDateFromSelected(date: Date): void {
    this.selectedDateFrom = this.clampToMin(date);
    this.filters.from = this.formatDateToString(this.selectedDateFrom);
    this.showCalendarFrom = false;
  }

  onDateToSelected(date: Date): void {
    this.selectedDateTo = this.clampToMin(date);
    this.filters.to = this.formatDateToString(this.selectedDateTo);
    this.showCalendarTo = false;
  }

  // แปลง Date → YYYYMMDD (พ.ศ.) สำหรับส่งหา API
  private formatDateToString(date: Date): string {
    const year = date.getFullYear() + 543; // พ.ศ.
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  // แสดงผลไทย เช่น 12 กันยายน 2568
  formatThaiDate(date: Date | null): string {
    if (!date) return '';
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const d = date.getDate();
    const m = months[date.getMonth()];
    const y = date.getFullYear() + 543;
    return `${d} ${m} ${y}`;
  }

  // บังคับไม่ให้เลือกวันที่น้อยกว่า minSelectableDate
  private clampToMin(date: Date): Date {
    return date < this.minSelectableDate ? new Date(this.minSelectableDate) : date;
  }

  // สถานะโหลด และผลลัพธ์ล่าสุดจาก API
  isLoading: boolean = false;
  lastResponse: any = null;
  pdfSrc: SafeResourceUrl | null = null; // not used for download-only flow; kept for parity

  private download(url: string, filename?: string): void {
    const anchor = document.createElement('a');
    anchor.href = url;
    if (filename) anchor.setAttribute('download', encodeURI(filename));
    anchor.click();
    anchor.remove();
  }

  // เรียก API: LoadFileMenu11
  onSearch(): void {
    this.isLoading = true;
    this.lastResponse = null;
    this.pdfSrc = null;

    const payload = {
      DateStart: this.filters.from,
      DateEnd: this.filters.to
    };

    this.reports.LoadFileMenu11(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.lastResponse = res;
        // log เพื่อตรวจสอบว่าหลังบ้านส่งอะไรมา
        console.log('Report11 LoadFileMenu11 response:', res);

        const url: string | undefined = res?.fileUrl || res?.url;
        if (url) {
          const filename = (url.split('/')?.pop() || 'report.xlsx');
          this.download(url, filename);
        }
        this.cd.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Report11 LoadFileMenu11 error:', err);
        this.cd.detectChanges();
      }
    });
  }

  goBack(): void {
    this.back.emit();
  }
}
