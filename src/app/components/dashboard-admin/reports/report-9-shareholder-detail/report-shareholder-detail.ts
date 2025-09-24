import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { Reports } from '../../../../services/reports';
import { CustomerMetadata } from '../../../../services/Metadata/customer-metadata';

@Component({
  standalone: true,
  selector: 'app-report-9-shareholder-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-shareholder-detail.html',
  styleUrl: './report-shareholder-detail.css'
})
export class Report9ShareholderDetail implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

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

  // เพิ่ม property สำหรับจัดการการแสดง input fields
  selectedCustomerType: string = 'cus-type';
  customerTypes: any[] = [];

  // form state
  selectedDay: string = '';
  selectedMonth: string = '';
  selectedYear: string = '';
  customerType: string = '';
  customerSearch: string = '';
  pdfSrc: SafeResourceUrl | null = null;
  isGenerating: boolean = false;

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly reportService: Reports,
    private readonly customerMetadata: CustomerMetadata,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    this.loadCustomerTypes();
  }

  sendHead() {
    this.headerChange.emit("รายงานรายละเอียดผู้ถือหุ้น");
  }

  onCustomerTypeChange(event: any): void {
    this.selectedCustomerType = event.target.value;
  }

  private loadCustomerTypes() {
    this.customerMetadata.cusTypes().subscribe({
      next: (types: any[]) => {
        this.customerTypes = types || [];
        this.cd.detectChanges();
      },
      error: () => {
        this.customerTypes = [];
      }
    });
  }

  generateReport(type: string) {
    if (!this.selectedDay || !this.selectedMonth || !this.selectedYear) {
      Swal.fire({ icon: 'warning', text: 'กรุณาเลือกวันที่ให้ครบถ้วน' });
      return;
    }
    const dateString = `${this.selectedYear}${this.selectedMonth.toString().padStart(2, '0')}${this.selectedDay.toString().padStart(2, '0')}`;
    const payload = {
      DateRep: dateString,
      CusType: this.selectedCustomerType === 'cus-type' ? this.customerType : '',
      CusFname: this.selectedCustomerType === 'cusFName' ? this.customerSearch : '',
      CusLname: this.selectedCustomerType === 'cusLName' ? this.customerSearch : '',
      CusCardno: this.selectedCustomerType === 'cusID' ? this.customerSearch : '',
      TypeExport: type
    };
    // reset/prepare UI
    if (type === 'PDF') {
      this.pdfSrc = null;
    }
    this.isGenerating = true;
    this.cd.detectChanges();
    this.reportService.LoadFileMenu9(payload).subscribe({
      next: (res: any) => {
        if (!res?.fileUrl) { this.isGenerating = false; return; }
        if (type === 'PDF') {
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(res.fileUrl);
        } else {
          const link = document.createElement('a');
          link.href = res.fileUrl;
          link.click();
        }
        this.isGenerating = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.isGenerating = false;
        Swal.fire({ icon: 'error', text: `${err.message}` });
      }
    });
  }

  goBack(): void {
    this.back.emit();
  }
}
