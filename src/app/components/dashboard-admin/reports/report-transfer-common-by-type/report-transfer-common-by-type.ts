import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StockService } from '../../../../services/stock';

@Component({
  standalone: true,
  selector: 'app-report-transfer-common-by-type',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-transfer-common-by-type.html',
  styleUrl: './report-transfer-common-by-type.css'
})
export class ReportTransferCommonByType implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();
  loading: boolean = false;
  pdfSrc: SafeResourceUrl | null = null;
  
  // Date selector for "เลือกดูข้อมูล ณ วันที่"
  selectedDay: string = '';
  selectedMonth: string = '';
  selectedYear: string = '';

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

  years: number[] = Array.from({ length: 2568 - 2500 + 1 }, (_, index) => 2568 - index);

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly sanitizer: DomSanitizer,
    private readonly stockService: StockService,
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("รายงานสรุปการขาย/โอนหุ้นสามัญแยกตามประเภทผู้ถือหุ้น");
  }


  genPdf(TypeReport: string) {
    // Validate date selection
    if (!this.selectedDay || !this.selectedMonth || !this.selectedYear) {
      Swal.fire({
        icon: 'warning',
        text: "กรุณาเลือกวันที่ให้ครบ"
      });
      return;
    }

    const selectedDate = `${this.selectedYear}${this.selectedMonth.padStart(2, '0')}${this.selectedDay.padStart(2, '0')}`;
    
    this.loading = true;
    const payload = {
      "Date": selectedDate
    }

    if (TypeReport == "PDF") {
      this.pdf(payload);
    } else {
      this.excel(payload);
    }
  }

  pdf(payload: any) {
    this.stockService.GenPdfStockReport(payload).subscribe({
      next: (blob: Blob) => {
        this.loading = false;
        if (!blob || blob.size === 0) {
          Swal.fire({ icon: 'warning', text: 'ไม่พบข้อมูลสำหรับสร้างรายงาน' });
          return;
        }
        const url = window.URL.createObjectURL(blob);
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('PDF Error', err);
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถสร้างรายงานได้',
          text: err.message || 'เกิดข้อผิดพลาดจากระบบ'
        });
        this.cd.detectChanges();
      }
    });
  }

  excel(payload: any) {
    this.stockService.GenExcelStockReport(payload).subscribe({
      next: (blob: Blob) => {
        this.loading = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'StockReport.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('EXCEL : Error', err);
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถสร้างรายงานได้',
          text: err.message || 'เกิดข้อผิดพลาดจากระบบ'
        });
        this.cd.detectChanges();
      }
    })
  }

  goBack(): void {
    this.back.emit();
  }
}
