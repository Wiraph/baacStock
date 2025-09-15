import { Component, ChangeDetectorRef, OnInit, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CustomerStockService } from '../../../../services/customer-stock-service';
import { DataTransfer } from '../../../../services/data-transfer';
import { StocksComponent } from '../../stocks/stocks';
import { UserService } from '../../../../services/user';
import { CustomerService } from '../../../../services/customer';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-report-certificate-history',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    StocksComponent
  ],
  templateUrl: './report-certificate-history.html',
  styleUrls: ['./report-certificate-history.css']
})
export class ReportCertificateHistory implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();
  @Output() statusView = new EventEmitter<{ view: string; cusId: string; }>();
  // @Output() cusId = new EventEmitter<{cusid: string}>();

  cusId: string = '';
  titleSearch: string = '';
  branch: string | null = '';
  activeView = 'search';
  table = false;
  selectedStockNotes: string[] = [];
  selectedCusId: string = '';
  selectedName: string = '';
  selectedStockList: string[] = [];
  selectedStatus: string = '';
  mode: string = '';
  idCard: string = '';
  criteria: any = {
    cusId: '',
    fname: '',
    lname: '',
    stockId: ''
  };
  customerStocks: any[] = [];
  searched = false;
  loading = false;
  pageNumber = 1;
  pageSize = 20;
  statusPage = '1';
  icon = '';
  currentUser: any;

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly customerStockService: CustomerStockService,
    private readonly dataTrasfer: DataTransfer,
    private readonly userService: UserService,
    private readonly customerService: CustomerService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) { }

  nextPage() {
    if (this.customerStocks.length == this.pageSize) {
      this.pageNumber++;
      this.onSearch(this.pageNumber, this.pageSize);
    } else {
      this.onSearch(this.pageNumber, this.pageSize);
    }
  }

  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.onSearch(this.pageNumber, this.pageSize);
    } else {
      return
    }
  }

  setView(view: string, stockNotes?: string[], cusId?: string, fullName?: string, stockList?: any[], statusDesc?: string) {
    this.activeView = view;
    this.selectedStockNotes = stockNotes ?? [];
    this.selectedCusId = cusId ?? '';
    this.selectedName = fullName ?? '';
    this.selectedStockList = stockList ?? [];
    this.selectedStatus = statusDesc ?? '';
  }


  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    this.statusPage = this.dataTrasfer.getPageStatus();

    // ตรวจสอบว่าอยู่ใน browser environment หรือไม่
    if (isPlatformBrowser(this.platformId)) {
      const rawBrName = this.getCookie('BrName');
      this.branch = rawBrName ? decodeURIComponent(rawBrName) : null;
    }

    // โหลดข้อมูล user ปัจจุบัน
    this.currentUser = this.userService.getCurrentUser();
  }

  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift()!;
    return null;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.onSearch(this.pageNumber, this.pageSize);
    this.table = true;
    this.cd.detectChanges();
  }

  onSearch(pgNum: number, PGSize: number) {
    this.loading = true;
    const requestPayload = {
      GetDTL: 'byCUS',
      STKno: this.criteria.stockId || '',
      CUSid: this.criteria.cusId || '',
      CUSfn: this.criteria.fname || '',
      CUSln: this.criteria.lname || '',
      StkA: '',
      PGNum: pgNum,
      PGSize: PGSize
    }
    this.cd.detectChanges();
    this.customerService.searchCustomerStk(requestPayload)
      .subscribe({
        next: data => {
          this.customerStocks = data;
          this.loading = false;
          this.cd.detectChanges();
        },
        error: err => {
          console.error('❌ เกิดข้อผิดพลาดจาก API:', err);
          this.searched = true;
          this.loading = false;
          this.cd.detectChanges();
        }
      });
  }

  onReset() {
    this.criteria = {
      cusId: '',
      stockId: '',
      fname: '',
      lname: ''
    };
    this.customerStocks = [];
    this.table = false;
    this.searched = false;
  }

  onViewStock(cusId: string) {
    this.cusId = cusId;
    this.activeView = 'stock';
    this.cd.detectChanges();
  }

  // ตรวจสอบ checksum ของเลขบัตร
  validateIdCardChecksum(idCard: string): boolean {
    const digits = idCard.split('').map(Number);
    const weights = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * weights[i];
    }

    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === digits[12];
  }

  

  alert(msg: string) {
    Swal.fire({
      icon: 'warning',
      text: `${msg}`
    })
  }

  sendHead() {
    this.headerChange.emit("ประวัติใบหุ้น");
  }

  goBack(): void {
    this.back.emit();
  }
}


