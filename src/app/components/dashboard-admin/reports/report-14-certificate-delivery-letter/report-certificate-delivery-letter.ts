import { Component, EventEmitter, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerMetadata } from '../../../../services/Metadata/customer-metadata';
import { SignatureService } from '../../../../services/signature';
import { Reports } from '../../../../services/reports';

@Component({
  selector: 'app-report-14-certificate-delivery-letter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-certificate-delivery-letter.html',
  styleUrl: './report-certificate-delivery-letter.css'
})
export class Report14CertificateDeliveryLetter implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  loading: boolean = false;

  selectedCustomerType: string = 'cus-group';
  selectedGroup: string = '';
  selectedType: string = '';
  
  // Date selectors for confirm date
  selectedConfirmDay: string = '';
  selectedConfirmMonth: string = '';
  selectedConfirmYear: string = '';
  
  // Date selectors for to date
  selectedToDay: string = '';
  selectedToMonth: string = '';
  selectedToYear: string = '';
  
  signatory: string = '';

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

  years: number[] = Array.from({ length: 2568 - 2516 + 1 }, (_, index) => 2568 - index);

  // Metadata from API
  customerGroups: any[] = [];
  customerTypes: any[] = [];
  filteredCustomerTypes: any[] = [];
  allTypeOption: boolean = true;

  // Signatory options (from API)
  signatoryOptions: { value: string; label: string }[] = [];

  // Optional search fields
  firstName: string = '';
  lastName: string = '';
  customerId: string = '';

  // Results
  results: any[] = [];
  lastResponse: any = null;

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    // Set default values to current date
    const today = new Date();
    this.selectedConfirmDay = today.getDate().toString();
    this.selectedConfirmMonth = (today.getMonth() + 1).toString();
    this.selectedConfirmYear = (today.getFullYear() + 543).toString();
    
    this.selectedToDay = today.getDate().toString();
    this.selectedToMonth = (today.getMonth() + 1).toString();
    this.selectedToYear = (today.getFullYear() + 543).toString();

    // Load dropdown options from API
    this.loadCustomerGroups();
    this.loadCustomerTypes();
    this.loadSignatoryOptions();
  }

  sendHead() {
    this.headerChange.emit("หนังสือส่งมอบใบหุ้น");
  }

  onCustomerTypeChange(event: any) {
    this.selectedCustomerType = event.target.value;
    this.selectedGroup = ''; // Reset group when customer type changes
    this.selectedType = '';
  }

  onGroupChange(event: any) {
    this.selectedGroup = event.target.value;
    // filter types by selected group (cusCodeg)
    this.filteredCustomerTypes = (this.customerTypes || []).filter((t: any) => {
      const codeg = t.cusCodeg ?? t.cusCODEg ?? '';
      return !this.selectedGroup || codeg === this.selectedGroup;
    });
    if (!this.selectedGroup) {
      this.filteredCustomerTypes = [...this.customerTypes];
    }
    this.allTypeOption = !this.selectedGroup || (this.filteredCustomerTypes?.length || 0) > 1;
    this.selectedType = '';
  }

  private loadCustomerGroups(): void {
    this.customerMetadata.custypeg().subscribe({
      next: (groups: any[]) => {
        this.customerGroups = groups || [];
        this.cd.detectChanges();
      },
      error: () => { this.customerGroups = []; }
    });
  }

  private loadCustomerTypes(): void {
    this.customerMetadata.cusTypes().subscribe({
      next: (types: any[]) => {
        this.customerTypes = types || [];
        this.filteredCustomerTypes = [...this.customerTypes];
        this.allTypeOption = true;
        this.cd.detectChanges();
      },
      error: () => { this.customerTypes = []; this.filteredCustomerTypes = []; }
    });
  }

  private loadSignatoryOptions(): void {
    this.signatureService.getSignatures().subscribe({
      next: (response: any) => {
        let list: any[] = [];
        if (Array.isArray(response)) list = response; else if (Array.isArray(response?.data)) list = response.data;
        this.signatoryOptions = list.map((s: any) => ({ value: (s.empID ?? s.id ?? '').toString(), label: s.empName ?? s.name ?? '' })).filter(o => !!o.label);
        if (!this.signatory && this.signatoryOptions.length > 0) this.signatory = this.signatoryOptions[0].value;
        this.cd.detectChanges();
      },
      error: () => { this.signatoryOptions = []; }
    });
  }

  // Compose payload and call List14 to fetch results
  submit(): void {
    // Build CusDdl according to selected input
    let cusDdl = '';
    if (this.selectedCustomerType === 'cus-group') cusDdl = 'cus-type';
    else if (this.selectedCustomerType === 'cusName') cusDdl = 'cus-name';
    else if (this.selectedCustomerType === 'cusID') cusDdl = 'cus-id';

    // Dates from selectors (YYYYMMDD, BE)
    const dateStart = `${this.selectedConfirmYear}${String(this.selectedConfirmMonth).padStart(2,'0')}${String(this.selectedConfirmDay).padStart(2,'0')}`;
    const dateEnd = `${this.selectedToYear}${String(this.selectedToMonth).padStart(2,'0')}${String(this.selectedToDay).padStart(2,'0')}`;

    const payload: any = {
      CusDdl: cusDdl,
      CusType: this.selectedCustomerType === 'cus-group' ? (this.selectedType || '') : '',
      CusName: this.selectedCustomerType === 'cusName' ? (this.firstName || '') : '',
      CusNameL: this.selectedCustomerType === 'cusName' ? (this.lastName || '') : '',
      CusId: this.selectedCustomerType === 'cusID' ? (this.customerId || '') : '',
      DateStart: dateStart,
      DateEnd: dateEnd
    };

    this.loading = true;
    this.results = [];
    this.lastResponse = null;
    this.cd.detectChanges();

    this.reportService.List14(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.lastResponse = res;
        // Support array or { data: [] }
        let list: any[] = [];
        if (Array.isArray(res)) list = res; else if (Array.isArray(res?.data)) list = res.data;
        this.results = list || [];
        this.cd.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.results = [];
        this.lastResponse = err;
        console.error('List14 error:', err);
        this.cd.detectChanges();
      }
    });
  }

  // Generate Word for a specific row
  generateFor(row: any): void {
    const dateStart = `${this.selectedConfirmYear}${String(this.selectedConfirmMonth).padStart(2,'0')}${String(this.selectedConfirmDay).padStart(2,'0')}`;
    const dateEnd = `${this.selectedToYear}${String(this.selectedToMonth).padStart(2,'0')}${String(this.selectedToDay).padStart(2,'0')}`;
    const empId = Number(this.signatory) || 0;

    // sanitize values to avoid backend parsing issues
    const rawCusId = row?.CusId || row?.cusid || row?.CUSid || row?.CusCardno || row?.stkOwnId || '';
    const sanitizedCusId = String(rawCusId).trim().replace(/\s+/g, '');

    const payload = {
      CusId: sanitizedCusId,
      DateStart: dateStart,
      DateEnd: dateEnd,
      EmpId: empId
    };

    // debug payload before sending
    console.log('LoadFileMenu14 payload:', payload);

    this.loading = true;
    this.cd.detectChanges();

    this.reportService.LoadFileMenu14(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        const fileUrl: string | undefined = res?.fileUrl;
        if (fileUrl) {
          const a = document.createElement('a');
          a.href = fileUrl;
          a.click();
        }
        this.cd.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('LoadFileMenu14 error:', err);
        this.cd.detectChanges();
      }
    });
  }
  formatDisplayName(row: any): string {
    if (!row) return '';
    const first = row.CusName ?? row.cusName ?? row.name ?? '';
    const last = row.CusNameL ?? row.cusLname ?? row.lastName ?? '';
    const combined = [first, last].filter(Boolean).join(' ');
    return combined || row.cusFullName || (row.corporateName ?? row.CORP_NAME ?? '');
  }


  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly customerMetadata: CustomerMetadata,
    private readonly signatureService: SignatureService,
    private readonly reportService: Reports
  ) {}

  goBack(): void {
    this.back.emit();
  }
}
