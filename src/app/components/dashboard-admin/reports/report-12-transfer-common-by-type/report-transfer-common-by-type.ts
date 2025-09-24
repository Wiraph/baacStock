import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Reports } from '../../../../services/reports';

@Component({
  standalone: true,
  selector: 'app-report-12-transfer-common-by-type',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-transfer-common-by-type.html',
  styleUrl: './report-transfer-common-by-type.css'
})
export class Report12TransferCommonByType implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();
  loading: boolean = false;
  pdfSrc: SafeResourceUrl | null = null;
  
  // Date selector
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

  years: number[] = Array.from({ length: 2568 - 2554 + 1 }, (_, index) => 2568 - index);

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly sanitizer: DomSanitizer,
    private readonly reports: Reports,
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("รายงานสรุปการขาย/โอนหุ้นสามัญแยกตามประเภทผู้ถือหุ้น");
  }


  // ฟังก์ชันรวมสำหรับสร้างรายงานทั้ง PDF/EXCEL
  generate(type: 'PDF' | 'EXCEL'): void {
    // Validate date selection
    if (!this.selectedDay || !this.selectedMonth || !this.selectedYear) {
      Swal.fire({ icon: 'warning', text: "กรุณาเลือกวันที่ให้ครบ" });
      return;
    }

    const selectedDate = `${this.selectedYear}${this.selectedMonth.padStart(2, '0')}${this.selectedDay.padStart(2, '0')}`;

    this.loading = true;
    const payload = { DateStart: selectedDate, TypeExport: type } as const;

    this.reports.LoadFileMenu12(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        const url: string | undefined = res?.fileUrl || res?.url;
        if (!url) {
          Swal.fire({ icon: 'warning', text: 'ไม่พบลิงก์ไฟล์สำหรับดาวน์โหลด' });
          this.cd.detectChanges();
          return;
        }
        if (type === 'PDF') {
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        } else {
          const filename = url.split('/')?.pop() || 'StockReport.xlsx';
          this.download(url, filename);
        }
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Menu12 error:', err);
        Swal.fire({ icon: 'error', title: 'ไม่สามารถสร้างรายงานได้', text: err?.message || 'เกิดข้อผิดพลาดจากระบบ' });
        this.cd.detectChanges();
      }
    });
  }

  private download(url: string, filename?: string): void {
    const a = document.createElement('a');
    a.href = url;
    if (filename) a.setAttribute('download', filename);
    a.click();
    a.remove();
  }

  goBack(): void {
    this.back.emit();
  }
}
