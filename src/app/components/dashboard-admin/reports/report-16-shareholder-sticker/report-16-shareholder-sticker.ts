import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  selector: 'app-report-16-shareholder-sticker',
  standalone: true,
  imports: [CommonModule, FormsModule, ThaiCalendarComponent],
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
  ],
  templateUrl: './report-16-shareholder-sticker.html',
  styleUrl: './report-16-shareholder-sticker.css'
})
export class Report16ShareholderSticker implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  loading: boolean = false;
  pdfSrc: SafeResourceUrl | null = null;

  // Form fields
  selectedDate: Date | null = null;
  showCalendar: boolean = false;
  idCardNumber: string = '';
  shareholderName: string = '';
  lastName: string = '';

  constructor(private readonly sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    // Set default date to current date
    this.selectedDate = new Date();
  }

  sendHead() {
    this.headerChange.emit("สติกเกอร์ผู้ถือหุ้น");
  }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.showCalendar = false;
  }

  // แสดงผลไทย เช่น 15 ก.ย. 2568
  formatThaiDate(date: Date | null): string {
    if (!date) return '';
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const d = date.getDate();
    const m = months[date.getMonth()];
    const y = date.getFullYear() + 543;
    return `${d} ${m} ${y}`;
  }

  genPdf(type: string) {
    console.log('Generating report:', type);
    console.log('As of Date:', this.formatThaiDate(this.selectedDate));
    console.log('ID Card Number:', this.idCardNumber);
    console.log('Shareholder Name:', this.shareholderName);
    console.log('Last Name:', this.lastName);
  }

  goBack(): void {
    this.back.emit();
  }
}
