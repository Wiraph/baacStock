import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  selector: 'app-report-29-dividend-payment-notice',
  standalone: true,
  imports: [CommonModule, FormsModule, ThaiCalendarComponent],
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
  ],
  templateUrl: './report-29-dividend-payment-notice.html',
  styleUrl: './report-29-dividend-payment-notice.css'
})
export class Report29DividendPaymentNotice implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Form fields
  idCardNumber: string = '';
  firstName: string = '';
  lastName: string = '';
  selectedYear: string = '2568';
  selectedDate: Date | null = null;
  showDateCalendar: boolean = false;
  selectedSignatory: string = 'นางสาววนิดา น้อยเสนา';
  pdfSrc: string | null = null;

  // Options
  years: number[] = Array.from({ length: 2568 - 2554 + 1 }, (_, index) => 2568 - index);
  
  yearOptions = this.years.map(year => ({
    value: year.toString(),
    label: year.toString()
  }));

  signatoryOptions = [
    { value: 'นางสาววนิดา น้อยเสนา', label: 'นางสาววนิดา น้อยเสนา' },
    { value: 'นายสมชาย ใจดี', label: 'นายสมชาย ใจดี' },
    { value: 'นางสมหญิง รักงาน', label: 'นางสมหญิง รักงาน' }
  ];

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    this.selectedDate = new Date();
  }

  sendHead(): void {
    this.headerChange.emit("รายงานแจ้งเตือนการจ่ายเงินปันผล");
  }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.showDateCalendar = false;
  }

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

  onConfirm(): void {
    console.log('Confirm with:', {
      idCardNumber: this.idCardNumber,
      firstName: this.firstName,
      lastName: this.lastName,
      year: this.selectedYear,
      date: this.selectedDate,
      signatory: this.selectedSignatory
    });
    alert('ดำเนินการสำเร็จ');
  }

  onCancel(): void {
    this.goBack();
  }

  goBack(): void {
    this.back.emit();
  }
}