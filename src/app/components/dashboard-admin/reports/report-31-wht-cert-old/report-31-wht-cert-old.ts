import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-31-wht-cert-old',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-31-wht-cert-old.html',
  styleUrl: './report-31-wht-cert-old.css'
})
export class Report31WhtCertOld implements OnInit {
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

  // เงื่อนไขหุ้น
  paymentMethod: string = 'all';

  // เงื่อนไขสาขา
  branchCondition: string = 'national';
  branchCode: string = '';
  selectedBranch: string = '';

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

  // Payment method options
  paymentMethodOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'cash', label: 'เงินสด' },
    { value: 'transfer', label: 'โอนเงิน' },
    { value: 'check', label: 'เช็ค' }
  ];

  // Branch condition options
  branchConditionOptions = [
    { value: 'national', label: 'รวมประเทศ' },
    { value: 'head_office', label: 'สำนักงานใหญ่' },
    { value: 'branch', label: 'สาขา' }
  ];

  pdfSrc: string | null = null;

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead(): void {
    this.headerChange.emit("หนังสือรับรองการหักภาษี ณ ที่จ่าย (แบบเก่า)");
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

  onSearch(): void {
    console.log('Search with:', {
      timeCondition: this.timeCondition,
      year: this.selectedYear,
      fromDate: `${this.selectedFromDay}/${this.selectedFromMonth}/${this.selectedFromYear}`,
      toDate: `${this.selectedToDay}/${this.selectedToMonth}/${this.selectedToYear}`,
      specificDate: `${this.selectedSpecificDay}/${this.selectedSpecificMonth}/${this.selectedSpecificYear}`,
      paymentMethod: this.paymentMethod,
      branchCondition: this.branchCondition,
      branchCode: this.branchCode,
      selectedBranch: this.selectedBranch
    });
    // Logic to generate report
    alert('ดำเนินการค้นหา');
  }

  goBack(): void {
    this.back.emit();
  }
}
