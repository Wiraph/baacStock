import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-21-dividend-annual-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-21-dividend-annual-summary.html',
  styleUrl: './report-21-dividend-annual-summary.css'
})
export class Report21DividendAnnualSummary implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Form fields
  selectedYear: number = 2567;
  groupingOption: string = 'byTypeAndPayment';

  // Year options (2567 down to 2554)
  years: number[] = [];

  // Grouping options
  groupingOptions = [
    { value: 'byTypeAndPayment', label: 'แยกตามประเภทผู้ถือหุ้น และ ประเภทการจ่าย' },
    { value: 'byPaymentType', label: 'แยกตามประเภทการจ่าย' },
    { value: 'byIndividual', label: 'แยกตามรายผู้ถือหุ้น' }
  ];

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    this.generateYears();
  }

  sendHead() {
    this.headerChange.emit("สรุปการจ่ายเงินปันผลหุ้นสามัญประจำปีบัญชี");
  }

  generateYears(): void {
    const currentYear = 2567;
    const startYear = 2554;
    for (let year = currentYear; year >= startYear; year--) {
      this.years.push(year);
    }
  }

  onSearch(): void {
    console.log('Search with:', {
      year: this.selectedYear,
      grouping: this.groupingOption
    });
  }

  goBack(): void {
    this.back.emit();
  }
}