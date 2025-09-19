import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Reports, StockReportDto } from '../../../../services/reports';

@Component({
  standalone: true,
  selector: 'app-report-4-dividend-rate',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-dividend-rate.html',
  styleUrl: './report-dividend-rate.css'
})
export class Report4DividendRate implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Form data
  selectedYearFrom: string = '';
  selectedYearTo: string = '';
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
    const currentYear = new Date().getFullYear() + 543;
    this.selectedYearFrom = currentYear.toString();
    this.selectedYearTo = currentYear.toString();
    
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("รายงานข้อมูลอัตราเงินปันผล");
  }

  // Generate PDF Report
  generatePDF() {
    if (!this.selectedYearFrom || !this.selectedYearTo) {
      return;
    }

    // Clear previous PDF
    this.pdfSrc = null;
    this.cd.detectChanges();

    const payload: StockReportDto = {
      Division: "", // ปล่อยว่าง
      Prov: "",     // ปล่อยว่าง
      Br: "",       // ปล่อยว่าง
      DateStart: this.selectedYearFrom,
      DateEnd: this.selectedYearTo,
      TypeExport: "PDF"
    };

    this.reportService.LoadFileMenu4(payload).subscribe({
      next: (response) => {
        console.log('PDF Report Response:', response);
        
        if (response?.fileUrl) {
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(response.fileUrl);
          console.log('PDF URL set:', response.fileUrl);
          this.cd.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error generating PDF:', error);
      }
    });
  }

  // Generate EXCEL Report
  generateEXCEL() {
    if (!this.selectedYearFrom || !this.selectedYearTo) {
      return;
    }

    const payload: StockReportDto = {
      Division: "", // ปล่อยว่าง
      Prov: "",     // ปล่อยว่าง
      Br: "",       // ปล่อยว่าง
      DateStart: this.selectedYearFrom,
      DateEnd: this.selectedYearTo,
      TypeExport: "EXCEL"
    };

    this.reportService.LoadFileMenu4(payload).subscribe({
      next: (response) => {
        console.log('EXCEL Report Response:', response);
        
        if (response.fileUrl) {
          // Download EXCEL file
          const link = document.createElement('a');
          link.href = response.fileUrl;
          link.click();
        }
      },
      error: (error) => {
        console.error('Error generating EXCEL:', error);
      }
    });
  }

  goBack(): void {
    this.back.emit();
  }
}
