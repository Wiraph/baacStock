import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ThaiCalendarComponent } from '../../../thai-calendar-component/thai-calendar-component';
import { Thaidateadapter } from '../../../thaidateadapter/thaidateadapter';

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

  constructor(
    private readonly cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    // ค่าเริ่มต้น: วันนี้
    this.filters.from = this.formatDateToString(this.selectedDateFrom);
    this.filters.to = this.formatDateToString(this.selectedDateTo);
  }

  sendHead() {
    this.headerChange.emit("รายงานการจัดทำหนังสือยืนยันยอดหุ้น");
  }


  onDateFromSelected(date: Date): void {
    this.selectedDateFrom = date;
    this.filters.from = this.formatDateToString(date);
    this.showCalendarFrom = false;
  }

  onDateToSelected(date: Date): void {
    this.selectedDateTo = date;
    this.filters.to = this.formatDateToString(date);
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

  goBack(): void {
    this.back.emit();
  }
}
