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
  selector: 'app-report-32-wht-cert-by-name',
  standalone: true,
  imports: [CommonModule, FormsModule, ThaiCalendarComponent],
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
  ],
  templateUrl: './report-32-wht-cert-by-name.html',
  styleUrl: './report-32-wht-cert-by-name.css'
})
export class Report32WhtCertByName implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // เงื่อนไขเวลา
  timeCondition: string = 'year';
  selectedYear: string = '2568';
  selectedFromDay: string = '';
  selectedFromMonth: string = '';
  selectedFromYear: string = '';
  selectedToDay: string = '';
  selectedToMonth: string = '';
  selectedToYear: string = '';
  selectedSpecificDay: string = '';
  selectedSpecificMonth: string = '';
  selectedSpecificYear: string = '';

  // เงื่อนไขสาขา
  branchCondition: string = 'head_office';
  branchCode: string = '';
  selectedBranch: string = '';

  // ข้อมูลผู้ถือหุ้น
  idCardNumber: string = '';
  firstName: string = '';
  lastName: string = '';
  certificateIssueDate: Date = new Date();
  showDateCalendar: boolean = false;
  signatory: string = 'นางสาววนิดา น้อยเสนา';

  // Options
  years: number[] = Array.from({ length: 2568 - 2554 + 1 }, (_, index) => 2568 - index);
  days: number[] = Array.from({ length: 31 }, (_, index) => index + 1);
  months = [
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

  // Time condition options
  timeConditionOptions = [
    { value: 'year', label: 'ปี' },
    { value: 'date_range', label: 'ช่วงวันที่' },
    { value: 'date', label: 'วันที่' }
  ];

  // Branch condition options
  branchConditionOptions = [
    { value: 'national', label: 'รวมประเทศ' },
    { value: 'head_office', label: 'สำนักงานใหญ่' },
    { value: 'branch', label: 'สาขา' }
  ];

  // Signatory options
  signatoryOptions = [
    { value: 'นางสาววนิดา น้อยเสนา', label: 'นางสาววนิดา น้อยเสนา' },
    { value: 'นายสมชาย ใจดี', label: 'นายสมชาย ใจดี' },
    { value: 'นางสมหญิง รักงาน', label: 'นางสมหญิง รักงาน' }
  ];

  pdfSrc: string | null = null;

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead(): void {
    this.headerChange.emit("หนังสือรับรองการหักภาษี ณ ที่จ่าย (เรียงตามชื่อ)");
  }

  onTimeConditionChange(): void {
    // Reset date values when changing time condition
    this.selectedFromDay = '';
    this.selectedFromMonth = '';
    this.selectedFromYear = '';
    this.selectedToDay = '';
    this.selectedToMonth = '';
    this.selectedToYear = '';
    this.selectedSpecificDay = '';
    this.selectedSpecificMonth = '';
    this.selectedSpecificYear = '';
  }

  onDateSelected(date: Date): void {
    this.certificateIssueDate = date;
    this.showDateCalendar = false;
  }

  formatThaiDate(date: Date): string {
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
      timeCondition: this.timeCondition,
      year: this.selectedYear,
      fromDate: `${this.selectedFromDay}/${this.selectedFromMonth}/${this.selectedFromYear}`,
      toDate: `${this.selectedToDay}/${this.selectedToMonth}/${this.selectedToYear}`,
      specificDate: `${this.selectedSpecificDay}/${this.selectedSpecificMonth}/${this.selectedSpecificYear}`,
      branchCondition: this.branchCondition,
      branchCode: this.branchCode,
      selectedBranch: this.selectedBranch,
      idCardNumber: this.idCardNumber,
      firstName: this.firstName,
      lastName: this.lastName,
      certificateIssueDate: this.certificateIssueDate,
      signatory: this.signatory
    });
    // Logic to generate report
    alert('ดำเนินการค้นหา');
  }

  goBack(): void {
    this.back.emit();
  }
}
