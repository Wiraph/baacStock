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
  selector: 'app-report-10-balance-confirm-letter',
  imports: [CommonModule, FormsModule, ThaiCalendarComponent],
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
  ],
  templateUrl: './report-balance-confirm-letter.html',
  styleUrl: './report-balance-confirm-letter.css'
})
export class Report10BalanceConfirmLetter implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();


  // เพิ่ม property สำหรับจัดการการแสดง input fields
  selectedCustomerType: string = 'cus-group';
  selectedGroup: string = '';

  // วันที่ยืนยัน
  showConfirmDate = false;
  selectedConfirmDate: Date = new Date();
  confirmDateString: string = '';

  // ผู้ลงนาม
  signatory: string = '';

  // Signatory options
  signatoryOptions = [
    { value: 'นาย A', label: 'นาย A' },
    { value: 'นาย B', label: 'นาย B' },
    { value: 'นาย C', label: 'นาย C' }
  ];

  constructor(
    private readonly cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    // ค่าเริ่มต้น: วันนี้
    this.confirmDateString = this.formatDateToString(this.selectedConfirmDate);
  }

  sendHead() {
    this.headerChange.emit("หนังสือยืนยันยอดหุ้น");
  }

  // เพิ่ม method สำหรับจัดการการเปลี่ยนประเภทลูกค้า
  onCustomerTypeChange(event: any): void {
    this.selectedCustomerType = event.target.value;
  }

  // เพิ่ม method สำหรับจัดการการเปลี่ยนกลุ่ม
  onGroupChange(event: any): void {
    this.selectedGroup = event.target.value;
  }

  // วันที่ยืนยัน
  onConfirmDateSelected(date: Date): void {
    this.selectedConfirmDate = date;
    this.confirmDateString = this.formatDateToString(date);
    this.showConfirmDate = false;
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
