import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Reports } from '../../../../services/reports';
import { CustomerMetadata } from '../../../../services/Metadata/customer-metadata';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-report-8-shareholder-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-shareholder-register.html',
  styleUrl: './report-shareholder-register.css'
})
export class Report8ShareholderRegister implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Date select options
  days: number[] = Array.from({ length: 31 }, (_, index) => index + 1);

  months: { value: number; label: string }[] = [
    { value: 1, label: 'ม.ค.' }, { value: 2, label: 'ก.พ.' }, { value: 3, label: 'มี.ค.' },
    { value: 4, label: 'เม.ย.' }, { value: 5, label: 'พ.ค.' }, { value: 6, label: 'มิ.ย.' },
    { value: 7, label: 'ก.ค.' }, { value: 8, label: 'ส.ค.' }, { value: 9, label: 'ก.ย.' },
    { value: 10, label: 'ต.ค.' }, { value: 11, label: 'พ.ย.' }, { value: 12, label: 'ธ.ค.' }
  ];
  years: number[] = Array.from({ length: 2568 - 2500 + 1 }, (_, index) => 2568 - index);

  // Filters state
  selectedCustomerType: string = 'cus-type';
  selectedDay: string = '';
  selectedMonth: string = '';
  selectedYear: string = '';
  customerSearch: string = '';
  customerType: string = '';

  // Data state
  shareholders: any[] = [];
  loading: boolean = false;
  customerTypes: any[] = [];

  // Preview
  pdfSrc: SafeResourceUrl | null = null;
  showTable: boolean = true;

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly reportService: Reports,
    private readonly customerMetadata: CustomerMetadata,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.selectedDay = now.getDate().toString();
    this.selectedMonth = (now.getMonth() + 1).toString();
    this.selectedYear = (now.getFullYear() + 543).toString();
    this.loadCustomerTypes();
    setTimeout(() => this.sendHead());
  }

  sendHead() { this.headerChange.emit('รายงานทะเบียนผู้ถือหุ้น'); }

  private getDateString(): string {
    return `${this.selectedYear}${this.selectedMonth.padStart(2, '0')}${this.selectedDay.padStart(2, '0')}`;
  }

  // Load customer types from API
  loadCustomerTypes() {
    this.customerMetadata.cusTypes().subscribe({
      next: (types: any[]) => { this.customerTypes = types || []; this.cd.detectChanges(); },
      error: () => { this.customerTypes = []; }
    });
  }

  onLoadCustomer() {
    this.loading = true;
    const payload = {
      DateRep: this.getDateString(),
      CusType: this.customerType,
      CusFname: this.selectedCustomerType === 'cusFName' ? this.customerSearch : '',
      CusLname: this.selectedCustomerType === 'cusLName' ? this.customerSearch : '',
      CusCardno: this.selectedCustomerType === 'cusID' ? this.customerSearch : ''
    };

    this.reportService.StockHolder(payload).subscribe({
      next: (res: any) => {
        this.shareholders = res || [];
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.shareholders = [];
        this.loading = false;
        this.cd.detectChanges();
        Swal.fire({ icon: 'error', text: `${err.message}` });
      }
    });
  }

  private download(url: string, filename?: string): void {
    const a = document.createElement('a');
    a.href = url;
    if (filename) a.setAttribute('download', filename);
    a.click();
  }

  private generateReport(shareholder: any, type: 'PDF' | 'EXCEL'): void {
    const payload = { DateRep: this.getDateString(), CusCardno: shareholder.cusid, TypeExport: type };
    this.reportService.LoadFileMenu8(payload).subscribe({
      next: (res: any) => {
        const url = res?.fileUrl;
        if (!url) return;
        if (type === 'PDF') {
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.showTable = false;
          this.cd.detectChanges();
        } else {
          this.download(url);
        }
      },
      error: (err) => {
        // avoid returning Promise from handler
        Swal.fire({ icon: 'error', text: `${err.message}` });
      }
    });
  }


  onCustomerTypeChange(event: any): void { this.selectedCustomerType = event.target.value; }

  showTableView(): void { this.showTable = true; this.pdfSrc = null; this.cd.detectChanges(); }

  goBack(): void { this.back.emit(); }
}
