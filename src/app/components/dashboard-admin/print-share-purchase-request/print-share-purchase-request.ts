import { Component, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PdfService } from '../../../services/pdf';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from "@angular/forms";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ThaiCalendarComponent } from '../../thai-calendar-component/thai-calendar-component';
import { Thaidateadapter } from '../../thaidateadapter/thaidateadapter';
import { StockService } from '../../../services/stock';
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
  selector: 'app-print-share-purchase-request',
  imports: [CommonModule, FormsModule, ThaiCalendarComponent],
  templateUrl: './print-share-purchase-request.html',
  styleUrls: ['./print-share-purchase-request.css'],
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
  ]
})
/**
 * พิมพ์คำขอซื้อหุ้น (Share Purchase Request)
 * - ตรวจความครบถ้วนของแบบฟอร์ม → เรียก API สร้างไฟล์ → ดาวน์โหลด
 * - โหลด/แสดงตัวอย่าง PDF พร้อม timeout กันค้าง
 */
export class PrintSharePurchaseRequestComponent implements AfterViewInit {
  // PDF display
  pdfUrl: SafeResourceUrl | null = null;
  loading = false;
  loadFailed = false;
  agreed = false;
  idCard = '';
  job = '';
  shareAmount = '';
  accountNumber = '';
  accountNumber2 = '';
  accountName = '';
  accountName2 = '';
  paymentMethod = '1';
  checkNumber = '';
  bankName = '';
  branchName = '';
  dividendMethod = '1';
  branchName2 = '';
  // PDF display

  // แสดง/ซ่อน calendar
  showCalendarFrom = false;
  showCalendarTo = false;

  // วันที่ที่เลือก (ใช้ Thai calendar adapter แสดงผล)
  selectedDateFrom: Date = new Date();
  selectedDateTo: Date = new Date();

  // ฟิลเตอร์
  filters = {
    types: {
      transfer: false,
      damaged: false,
      nameChange: false,
      lost: false,
    },
    // เก็บเป็นรูปแบบ YYYYMMDD (พ.ศ.) สำหรับเรียก API
    from: '',
    to: '',
  };
  // Timeout
  timeoutHandle: any;

  constructor(
    private readonly pdfService: PdfService,
    private readonly sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly cdr: ChangeDetectorRef,
    private readonly stockService: StockService
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadPdf();
      }, 1000);
    }
  }

  printPdf() {
    const msg = this.validateForm();
    if (msg.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        html: msg.join('<br>'),
        confirmButtonText: 'ตกลง',
      })
      return;
    }
    const payload = {
      cusId: this.idCard,
      job: this.job ?? "",
      stkUnit: Number(this.shareAmount) || 0,
      stkValue: Number(this.shareAmount) * 100 || 0,
      emp: this.agreed ?? false,
      PayType: this.paymentMethod,
      Accno: this.accountNumber,
      Accname: this.accountName,
      CheckNo: this.checkNumber,
      CheckDate: this.formatDateToString(this.selectedDateFrom),
      CheckBank: this.bankName,
      CheckBranch: this.branchName,
      DividendType: this.dividendMethod,
      DvnAccno: this.accountNumber2,
      DvnAccname: this.accountName2,
      DvnBranch: this.branchName2,
    }

    this.stockService.GetFileSaleStock(payload).subscribe({
      next: (res: any) => {
        const URL = res.fileUrl;
        const link = document.createElement('a');
        link.href = URL;
        link.download = URL.substring(URL.lastIndexOf('/') + 1);
        link.click();
        this.cdr.detectChanges();
      }, error: (err) => {
        Swal.fire({ icon: 'error', title: 'สร้างไฟล์ไม่สำเร็จ', text: 'โปรดลองใหม่' });
      }
    })
  }

  validateForm(): string[] {
    const msg: string[] = [];

    this.validateIdCard(msg);
    this.validateShareAmount(msg);
    this.validatePaymentMethod(msg);
    this.validateDividendMethod(msg);

    return msg;
  }

  // --------------------
  private validateIdCard(msg: string[]) {
    if (!this.idCard) {
      msg.push('- กรุณากรอกหมายเลขบัตรประชาชน');
    }
  }

  private validateShareAmount(msg: string[]) {
    if (!this.shareAmount) {
      msg.push('- กรุณากรอกจำนวนหุ้นที่ต้องการซื้อ');
      return;
    }

    const share = Number(this.shareAmount);
    if (!this.agreed && share < 50) {
      msg.push('- จำนวนหุ้นขั้นต่ำ 50 หุ้น');
    }
    if (this.agreed && share < 100) {
      msg.push('- จำนวนหุ้นขั้นต่ำ 100 หุ้น');
    }
  }

  private validatePaymentMethod(msg: string[]) {
    switch (this.paymentMethod) {
      case '2':
        if (!this.accountNumber) msg.push('- กรุณากรอกหมายเลขบัญชี');
        if (!this.accountName) msg.push('- กรุณากรอกชื่อบัญชี');
        break;
      case '3':
        if (!this.checkNumber) msg.push('- กรุณากรอกหมายเลขเช็ค');
        if (!this.bankName) msg.push('- กรุณากรอกชื่อธนาคาร');
        if (!this.branchName) msg.push('- กรุณากรอกสาขาธนาคาร');
        if (!this.selectedDateFrom) msg.push('- กรุณาเลือกวันที่บนเช็ค');
        break;
    }
  }

  private validateDividendMethod(msg: string[]) {
    if (this.dividendMethod === '2') {
      if (!this.accountNumber2) msg.push('- กรุณากรอกหมายเลขบัญชีรับเงินปันผล');
      if (!this.accountName2) msg.push('- กรุณากรอกชื่อบัญชีรับเงินปันผล');
    }
  }



  public loadPdf(): void {
    this.loading = true;
    this.loadFailed = false;
    this.pdfUrl = null;

    // ตัวจับเวลาเพื่อ feedback ภายใน 30 วิ
    let second = 0;
    const interval = setInterval(() => {
      second++;
      if (second >= 30) clearInterval(interval);
    }, 1000);

    this.timeoutHandle = setTimeout(() => {
      this.loading = false;
      this.loadFailed = true;
      clearInterval(interval);
    }, 30000);

    const payload = {
      docNumber: '123456',
      brName: sessionStorage.getItem('brName') || '',
      printedBy: sessionStorage.getItem('username') || ''
    };

    this.pdfService.getShareRequestPdf(payload).subscribe({
      next: (blob) => {
        clearTimeout(this.timeoutHandle);
        clearInterval(interval);

        const blobUrl = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        this.loading = false;
        this.loadFailed = false;
        this.cdr.detectChanges();
      },
      error: () => {
        clearTimeout(this.timeoutHandle);
        clearInterval(interval);
        this.loading = false;
        this.loadFailed = true;
        Swal.fire({ icon: 'error', title: 'โหลดตัวอย่างเอกสารไม่สำเร็จ', text: 'โปรดลองใหม่' });
      }
    });
  }

  onDateFromSelected(date: Date): void {
    this.selectedDateFrom = date;
    this.filters.from = this.formatDateToString(date);
    this.showCalendarFrom = false;
  }

  onDateToSelected(date: Date): void {
    this.selectedDateTo = date;
    this.filters.to = this.formatDateToString(date);
    this.showCalendarTo = false;
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
}
