import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Reports } from '../../../../services/reports';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-report-7-balance-by-type',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-balance-by-type.html',
  styleUrl: './report-balance-by-type.css'
})
export class Report7BalanceByType implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Form data
  selectedStkType: string = 'A';
  selectedDay: string = '';
  selectedMonth: string = '';
  selectedYear: string = '';
  pdfSrc: SafeResourceUrl | null = null;

  // Date select options
  days: number[] = Array.from({ length: 31 }, (_, index) => index + 1);

  months: { value: number; label: string }[] = [
    { value: 1, label: 'มกราคม' },
    { value: 2, label: 'กุมภาพันธ์' },
    { value: 3, label: 'มีนาคม' },
    { value: 4, label: 'เมษายน' },
    { value: 5, label: 'พฤษภาคม' },
    { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' },
    { value: 8, label: 'สิงหาคม' },
    { value: 9, label: 'กันยายน' },
    { value: 10, label: 'ตุลาคม' },
    { value: 11, label: 'พฤศจิกายน' },
    { value: 12, label: 'ธันวาคม' }
  ];
  
  years: number[] = Array.from({ length: 2568 - 2500 + 1 }, (_, index) => 2568 - index);

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly reportService: Reports,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("รายงานสรุปยอดคงเหลือแยกตามประเภทผู้ถือหุ้น");
  }

  // Generate PDF Report
  generatePDF() {
    if (!this.selectedDay || !this.selectedMonth || !this.selectedYear) {
      Swal.fire({
        icon: 'warning',
        text: 'กรุณาเลือกวันที่ให้ครบถ้วน'
      });
      return;
    }

    const dateString = `${this.selectedYear}${this.selectedMonth.toString().padStart(2, '0')}${this.selectedDay.toString().padStart(2, '0')}`;
    
    const payload = {
      StkType: this.selectedStkType, // A || B
      DateStart: dateString, // yyyymmdd พ.ศ.
      TypeExport: "PDF" // PDF || EXCEL
    };

    // Clear previous PDF
    this.pdfSrc = null;
    this.cd.detectChanges();

    this.reportService.LoadFileMenu7(payload).subscribe({
      next: (response) => {
        console.log('PDF Report Response:', response);
        
        if (response?.fileUrl) {
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(response.fileUrl);
          console.log('PDF URL set:', response.fileUrl);
          this.cd.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('Error generating PDF:', err);
        Swal.fire({
          icon: 'error',
          text: `${err.message}`
        });
      }
    });
  }

  // Generate EXCEL Report
  generateEXCEL() {
    if (!this.selectedDay || !this.selectedMonth || !this.selectedYear) {
      Swal.fire({
        icon: 'warning',
        text: 'กรุณาเลือกวันที่ให้ครบถ้วน'
      });
      return;
    }

    const dateString = `${this.selectedYear}${this.selectedMonth.toString().padStart(2, '0')}${this.selectedDay.toString().padStart(2, '0')}`;
    
    const payload = {
      StkType: this.selectedStkType, // A || B
      DateStart: dateString, // yyyymmdd พ.ศ.
      TypeExport: "EXCEL" // PDF || EXCEL
    };

    this.reportService.LoadFileMenu7(payload).subscribe({
      next: (response) => {
        console.log('EXCEL Report Response:', response);
        
        if (response?.fileUrl) {
          // Download EXCEL file
          const link = document.createElement('a');
          link.href = response.fileUrl;
          link.download = `รายงานสรุปยอดคงเหลือแยกตามประเภทผู้ถือหุ้น_${this.selectedStkType}_${dateString}.xlsx`;
          link.click();
        }
      },
      error: (err: any) => {
        console.error('Error generating EXCEL:', err);
        Swal.fire({
          icon: 'error',
          text: `${err.message}`
        });
      }
    });
  }

  goBack(): void {
    this.back.emit();
  }
}
