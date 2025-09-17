import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-36-average-shares-by-fiscal-year',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-36-average-shares-by-fiscal-year.html',
  styleUrl: './report-36-average-shares-by-fiscal-year.css'
})
export class Report36AverageSharesByFiscalYear implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Form fields
  selectedYear: string = '';

  // Options
  years: number[] = Array.from({ length: 2568 - 2554 + 1 }, (_, index) => 2568 - index);

  pdfSrc: string | null = null;

  ngOnInit(): void {
    // Set current year as default
    const currentYear = new Date().getFullYear() + 543; // Convert to Buddhist year
    this.selectedYear = currentYear.toString();
    
    setTimeout(() => this.sendHead());
  }

  sendHead(): void {
    this.headerChange.emit("รายละเอียดจำนวนหุ้นสามัญและหุ้นบุริมสิทธิถัวเฉลี่ย ประจำปีบัญชี");
  }

  recordChanges(): void {
    console.log('Record changes in preferred shares for year:', this.selectedYear);
    // Logic to record changes
    alert('บันทึกการเปลี่ยนแปลงหุ้นบุริมสิทธิ');
  }

  showReport(): void {
    console.log('Show report for year:', this.selectedYear);
    // Logic to show report
    alert('แสดงรายงาน');
  }

  goBack(): void {
    this.back.emit();
  }
}
