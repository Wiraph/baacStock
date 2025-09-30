import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ThaiCalendarComponent } from '../../../thai-calendar-component/thai-calendar-component';
import { Thaidateadapter } from '../../../thaidateadapter/thaidateadapter';
import { CustomerMetadata } from '../../../../services/Metadata/customer-metadata';
import { SignatureService } from '../../../../services/signature';
import { Reports } from '../../../../services/reports';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

export const THAI_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'd MMMM yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'd MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  standalone: true,
  selector: 'app-report-10-balance-confirm-letter',
  imports: [CommonModule, FormsModule, ThaiCalendarComponent],
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
  ],
  templateUrl: './report-balance-confirm-letter.html',
  styleUrl: './report-balance-confirm-letter.css'
})
/**
 * หนังสือยืนยันยอดหุ้น (Report 10)
 * - โหลดตัวเลือกกลุ่ม/ประเภทผู้ถือหุ้นและผู้ลงนาม
 * - ค้นหารายการตามเงื่อนไข และสั่งสร้างเอกสารรายบุคคล
 */
export class Report10BalanceConfirmLetter implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();


  // เพิ่ม property สำหรับจัดการการแสดง input fields
  selectedCustomerType: string = 'cus-group';
  selectedGroup: string = '';
  selectedType: string = '';

  // วันที่ยืนยัน
  showConfirmDate = false;
  selectedConfirmDate: Date = new Date();
  confirmDateString: string = '';

  // ผู้ลงนาม (เก็บ empID หรือชื่อ ตาม API กำหนด)
  signatory: string = '';
  auditorOnly: boolean = false;

  // Signatory options
  signatoryOptions: { value: string; label: string }[] = [];

  // Customer metadata (API)
  customerGroups: any[] = [];
  customerTypes: any[] = [];
  filteredCustomerTypes: any[] = [];
  allTypeOption: boolean = true;

  // Optional search fields
  firstName: string = '';
  lastName: string = '';
  customerId: string = '';

  // Output / state
  isGenerating: boolean = false;
  pdfSrc: SafeResourceUrl | null = null;
  loading: boolean = false;
  results: any[] = [];

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly customerMetadata: CustomerMetadata,
    private readonly signatureService: SignatureService,
    private readonly reportService: Reports,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    // ค่าเริ่มต้น: วันนี้
    this.confirmDateString = this.formatDateToString(this.selectedConfirmDate);

    // โหลดตัวเลือกจาก API
    this.loadCustomerGroups();
    this.loadCustomerTypes();
    this.loadSignatoryOptions();
  }

  sendHead() {
    this.headerChange.emit("หนังสือยืนยันยอดหุ้น");
  }

  // เพิ่ม method สำหรับจัดการการเปลี่ยนประเภทลูกค้า
  onCustomerTypeChange(event: any): void {
    this.selectedCustomerType = event.target.value;
  }

  // เพิ่ม method สำหรับจัดการการเปลี่ยนกลุ่ม
  onGroupChange(event: any): void {
    this.selectedGroup = event.target.value;
    // กรองประเภทตามกลุ่มที่เลือก
    this.filteredCustomerTypes = (this.customerTypes || []).filter((t: any) => {
      // รองรับชื่อฟิลด์ทั้งแบบ cusCodeg/cusCODEg
      const codeg = t.cusCodeg ?? t.cusCODEg ?? '';
      return !this.selectedGroup || codeg === this.selectedGroup;
    });
    if (!this.selectedGroup) {
      this.filteredCustomerTypes = [...this.customerTypes];
    }
    // แสดง "ทั้งหมด" เฉพาะกรณีที่ไม่เลือกกลุ่ม หรือมีมากกว่า 1 ประเภทให้เลือก
    this.allTypeOption = !this.selectedGroup || (this.filteredCustomerTypes?.length || 0) > 1;
    // reset เลือกประเภท
    this.selectedType = '';
    this.cd.detectChanges();
  }

  // วันที่ยืนยัน
  onConfirmDateSelected(date: Date): void {
    this.selectedConfirmDate = date;
    this.confirmDateString = this.formatDateToString(date);
    this.showConfirmDate = false;
  }

  // แปลง Date → YYYYMMDD (พ.ศ.) สำหรับส่งหา API
  private formatDateToString(date: Date): string {
    const year = date.getFullYear() + 543; // พ.ศ.
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  // แสดงผลไทย เช่น 12 กันยายน 2568
  formatThaiDate(date: Date | null): string {
    if (!date) return '';
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const d = date.getDate();
    const m = months[date.getMonth()];
    const y = date.getFullYear() + 543;
    return `${d} ${m} ${y}`;
  }

  goBack(): void {
    this.back.emit();
  }

  private loadCustomerGroups(): void {
    this.customerMetadata.custypeg().subscribe({
      next: (groups: any[]) => {
        this.customerGroups = groups || [];
        this.cd.detectChanges();
      },
      error: () => {
        this.customerGroups = [];
      }
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
      error: () => {
        this.customerTypes = [];
        this.filteredCustomerTypes = [];
      }
    });
  }

  private loadSignatoryOptions(): void {
    this.signatureService.getSignatures().subscribe({
      next: (response: any) => {
        let list: any[] = [];
        if (Array.isArray(response)) {
          list = response;
        } else if (Array.isArray(response?.data)) {
          list = response.data;
        }

        // map เป็น { value: empID, label: empName } รองรับชื่อฟิลด์ต่างกัน
        this.signatoryOptions = list.map((s: any) => ({
          value: (s.empID ?? s.id ?? '').toString(),
          label: s.empName ?? s.name ?? ''
        })).filter(opt => !!opt.label);

        // ตั้งค่า default ถ้ายังไม่ได้เลือก
        if (!this.signatory && this.signatoryOptions.length > 0) {
          this.signatory = this.signatoryOptions[0].value;
        }

        this.cd.detectChanges();
      },
      error: (err) => {
        this.signatoryOptions = [];
      }
    });
  }

  // Compose payload and submit to STK310
  submit(): void {
    if (!this.selectedConfirmDate) {
      Swal.fire({ icon: 'warning', text: 'กรุณาระบุวันที่ยืนยัน' });
      return;
    }

    // Map ตามสเปกตัวอย่าง API (CusDdl, CusType, CusTypeg, CusName, CusLname, CusID, DateDay, ForceReceive)
    let cusDdl = '';
    if (this.selectedCustomerType === 'cus-group') {
      cusDdl = 'cus-type';
    } else if (this.selectedCustomerType === 'cusName') {
      cusDdl = 'cus-name';
    } else if (this.selectedCustomerType === 'cusID') {
      cusDdl = 'cus-id';
    }

    const payload: any = {
      CusDdl: cusDdl,
      CusType: this.selectedCustomerType === 'cus-group' ? (this.selectedType || '') : '',
      CusTypeg: this.selectedCustomerType === 'cus-group' ? (this.selectedGroup || '') : '',
      CusName: this.selectedCustomerType === 'cusName' ? (this.firstName || '') : '',
      CusLname: this.selectedCustomerType === 'cusName' ? (this.lastName || '') : '',
      CusID: this.selectedCustomerType === 'cusID' ? (this.customerId || '') : '',
      DateDay: this.confirmDateString,                 // พ.ศ. YYYYMMDD
      ForceReceive: !!this.auditorOnly                 // boolean
    };

    // ค้นหารายการ → API จะส่งกลับเป็นรายการ (Results Table)
    this.loading = true;
    this.results = [];
    this.cd.detectChanges();

    this.reportService.Stk310(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        // รองรับ res เป็น array หรือ { data: [] }
        let list: any[] = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;
        this.results = list || [];
        this.cd.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        Swal.fire({ icon: 'error', text: err?.message || 'ไม่สามารถดึงข้อมูลได้' });
      }
    });
  }

  // สร้างเอกสารรายบุคคล PDF/WORD 
  generateFor(item: any, type: 'PDF' | 'WORD') {
    const signatoryName = this.signatoryOptions.find(o => o.value === this.signatory)?.label || '';

    const payload: any = {
      // ตามสเปกที่ backend ตัวอย่างมา
      CusId: item.stkOwnId || item.cusid || item.CusCardno || item.CUSid || '',
      Dateconfirm: this.confirmDateString,
      RECiPiENT: this.auditorOnly ? 'ผู้สอบบัญชี' : '',
      SiGNED: signatoryName,
      // ข้อมูลผู้ใช้ backend จะเติมเอง
      Ipaddress: '',
      Hostname: (typeof window !== 'undefined' && window.location) ? window.location.hostname : '',
      EmId: Number(this.signatory) || 0,
      TypeExport: type,
      ForceReceive: !!this.auditorOnly
    };
    this.isGenerating = true;
    this.cd.detectChanges();

    this.reportService.LoadFileMenu10(payload).subscribe({
      next: (res: any) => {
        this.isGenerating = false;
        const fileUrl: string | undefined = res?.fileUrl;
        if (!fileUrl) { Swal.fire({ icon: 'info', text: res?.message || 'ไม่พบไฟล์'}); return; }
        const link = document.createElement('a');
        link.href = fileUrl;
        link.target = '_blank';
        link.click();
      },
      error: (err: any) => {
        this.isGenerating = false;
        Swal.fire({ icon: 'error', text: err?.message || 'สร้างเอกสารล้มเหลว' });
      }
    });
  }
}
