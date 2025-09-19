import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Reports, StockReportDto } from '../../../../services/reports';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-report-5-shareholder-ratio',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-shareholder-ratio.html',
  styleUrl: './report-shareholder-ratio.css'
})
export class Report5ShareholderRatio implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Form data
  selectedDay: string = '';
  selectedMonth: string = '';
  selectedYear: string = '';
  pdfSrc: SafeResourceUrl | null = null;

  // Date select options
  days: number[] = Array.from({ length: 31 }, (_, index) => index + 1);

  months: { value: number; label: string }[] = [
    { value: 1, label: 'ม.ค.' },
    { value: 2, label: 'ก.พ.' },
    { value: 3, label: 'มี.ค.' },
    { value: 4, label: 'เม.ย.' },
    { value: 5, label: 'พ.ค.' },
    { value: 6, label: 'มิ.ย.' },
    { value: 7, label: 'ก.ค.' },
    { value: 8, label: 'ส.ค.' },
    { value: 9, label: 'ก.ย.' },
    { value: 10, label: 'ต.ค.' },
    { value: 11, label: 'พ.ย.' },
    { value: 12, label: 'ธ.ค.' }
  ];
  
  years: number[] = Array.from({ length: 2568 - 2554 + 1 }, (_, index) => 2568 - index);

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly reportService: Reports,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Set default values
    const currentDate = new Date();
    this.selectedDay = currentDate.getDate().toString();
    this.selectedMonth = (currentDate.getMonth() + 1).toString();
    this.selectedYear = (currentDate.getFullYear() + 543).toString(); // Convert to Buddhist year
    
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("รายงานสัดส่วนผู้ถือหุ้น");
  }

  // Generate PDF Report
  generatePDF() {
    if (!this.selectedDay || !this.selectedMonth || !this.selectedYear) {
      return;
    }

    // Clear previous PDF
    this.pdfSrc = null;
    this.cd.detectChanges();

    const dateString = `${this.selectedYear}${this.selectedMonth.padStart(2, '0')}${this.selectedDay.padStart(2, '0')}`;
    
    const payload: StockReportDto = {
      Division: "",
      Prov: "",
      Br: "",
      DateStart: dateString,
      DateEnd: dateString,
      TypeExport: "PDF"
    };

    this.reportService.LoadFileMenu5(payload).subscribe({
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
      return;
    }

    const dateString = `${this.selectedYear}${this.selectedMonth.padStart(2, '0')}${this.selectedDay.padStart(2, '0')}`;
    
    const payload: StockReportDto = {
      Division: "",
      Prov: "",
      Br: "",
      DateStart: dateString,
      DateEnd: dateString,
      TypeExport: "EXCEL"
    };

    this.reportService.LoadFileMenu5(payload).subscribe({
      next: (response) => {
        console.log('EXCEL Report Response:', response);
        
        if (response?.fileUrl) {
          // Download EXCEL file
          const link = document.createElement('a');
          link.href = response.fileUrl;
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
