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
  selector: 'app-report-22-dividend-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ThaiCalendarComponent],
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
  ],
  templateUrl: './report-22-dividend-payment.html',
  styleUrl: './report-22-dividend-payment.css'
})
export class Report22DividendPayment implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Form fields
  selectedBranch: string = '';
  selectAllBranches: boolean = false;
  selectedFromDate: Date | null = null;
  selectedToDate: Date | null = null;
  showFromCalendar: boolean = false;
  showToCalendar: boolean = false;
  shareholderName: string = '';
  shareholderLastName: string = '';

  // Branch options
  branchOptions = [
    { value: '', label: 'ทุกสาขา (*)' },
    { value: '001', label: 'สาขา 001' },
    { value: '002', label: 'สาขา 002' },
    { value: '003', label: 'สาขา 003' }
  ];

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    // Set default dates to current date
    this.selectedFromDate = new Date();
    this.selectedToDate = new Date();
  }

  sendHead() {
    this.headerChange.emit("รายงานการจ่ายเงินปันผล");
  }

  onFromDateSelected(date: Date): void {
    this.selectedFromDate = date;
    this.showFromCalendar = false;
  }

  onToDateSelected(date: Date): void {
    this.selectedToDate = date;
    this.showToCalendar = false;
  }

  // แสดงผลไทย เช่น 16 ก.ย. 2568
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

  onSearch(): void {
    console.log('Search with:', {
      branch: this.selectedBranch,
      selectAllBranches: this.selectAllBranches,
      fromDate: this.selectedFromDate,
      toDate: this.selectedToDate,
      shareholderName: this.shareholderName,
      shareholderLastName: this.shareholderLastName
    });
  }

  goBack(): void {
    this.back.emit();
  }
}
