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
  selector: 'app-report-26-pnd2',
  standalone: true,
  imports: [CommonModule, FormsModule, ThaiCalendarComponent],
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
  ],
  templateUrl: './report-26-pnd2.html',
  styleUrl: './report-26-pnd2.css'
})
export class Report26Pnd2 implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Form fields
  selectedYear: string = '2568';
  selectedMonth: string = '1';
  selectedDivision: string = 'สำนักงานใหญ่';
  selectedProvince: string = '';
  selectedBranch: string = '';
  filingDate: Date | null = null;
  showFilingCalendar: boolean = false;
  selectedSignatory: string = 'นางสาววนิดา น้อยเสนา';
  pdfSrc: string | null = null;

  // Options
  years: number[] = Array.from({ length: 2568 - 2554 + 1 }, (_, index) => 2568 - index);
  
  yearOptions = this.years.map(year => ({
    value: year.toString(),
    label: year.toString()
  }));

  monthOptions = [
    { value: '1', label: 'ม.ค.' },
    { value: '2', label: 'ก.พ.' },
    { value: '3', label: 'มี.ค.' },
    { value: '4', label: 'เม.ย.' },
    { value: '5', label: 'พ.ค.' },
    { value: '6', label: 'มิ.ย.' },
    { value: '7', label: 'ก.ค.' },
    { value: '8', label: 'ส.ค.' },
    { value: '9', label: 'ก.ย.' },
    { value: '10', label: 'ต.ค.' },
    { value: '11', label: 'พ.ย.' },
    { value: '12', label: 'ธ.ค.' }
  ];

  divisionOptions = [
    { value: 'สำนักงานใหญ่', label: 'สำนักงานใหญ่' },
    { value: 'สาขา 001', label: 'สาขา 001' },
    { value: 'สาขา 002', label: 'สาขา 002' }
  ];

  signatoryOptions = [
    { value: 'นางสาววนิดา น้อยเสนา', label: 'นางสาววนิดา น้อยเสนา' },
    { value: 'นายสมชาย ใจดี', label: 'นายสมชาย ใจดี' },
    { value: 'นางสมหญิง รักงาน', label: 'นางสมหญิง รักงาน' }
  ];

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    // Set default filing date to current date
    this.filingDate = new Date();
  }

  sendHead(): void {
    this.headerChange.emit("ใบแนบ ภ.ง.ด. 2");
  }

  onFilingDateSelected(date: Date): void {
    this.filingDate = date;
    this.showFilingCalendar = false;
  }

  // แสดงผลไทย เช่น 17 กย. 2568
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
      year: this.selectedYear,
      month: this.selectedMonth,
      division: this.selectedDivision,
      province: this.selectedProvince,
      branch: this.selectedBranch,
      filingDate: this.filingDate,
      signatory: this.selectedSignatory
    });
  }

  goBack(): void {
    this.back.emit();
  }
}