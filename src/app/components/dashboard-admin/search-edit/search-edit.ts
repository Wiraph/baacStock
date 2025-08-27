import { Component,  ChangeDetectorRef, OnInit, Output, EventEmitter} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CustomerStockService } from '../../../services/customer-stock-service';
import { JwtDecoder } from '../../../services/jwt-decoder';
import { DataTransfer } from '../../../services/data-transfer';
import { StocksComponent } from '../stocks/stocks';
import { UserService } from '../../../services/user';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-search-edit',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    StocksComponent
],
  templateUrl: './search-edit.html',
  styleUrls: ['./search-edit.css']
})
export class SearchEditComponent implements OnInit {
  @Output() statusView = new EventEmitter<{ view: string; cusId: string }>();
  // @Output() cusId = new EventEmitter<{cusid: string}>();

  cusId: string = '';
  titleSearch: string = '';
  branch = '';
  activeView = 'search';
  table = false;
  selectedStockNotes: string[] = [];
  selectedCusId: string = '';
  selectedName: string = '';
  selectedStockList: string[] = [];
  selectedStatus: string = '';
  mode: string = '';
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
    private readonly cusstomerStockService: CustomerStockService,
    private readonly jwtCoder: JwtDecoder,
    private readonly dataTrasfer: DataTransfer,
    private readonly userService: UserService,
    private readonly router: Router,
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
    this.statusPage = this.dataTrasfer.getPageStatus();
    this.onloadStart();
    const token = sessionStorage.getItem('token');
    const decoder = this.jwtCoder.decodeToken(String(token));
    this.branch = decoder.BrName ?? "";
    
    // โหลดข้อมูล user ปัจจุบัน
    this.currentUser = this.userService.getCurrentUser();
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
    console.log(requestPayload);
    this.cd.detectChanges();
    this.cusstomerStockService.searchCustomerStock(requestPayload)
      .subscribe({
        next: data => {
          console.log(data);
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

  onloadStart() {
    if (this.statusPage == '1') {
      this.icon = "📝";
      this.titleSearch = "ค้นหา/แก้ไข";
    } else if (this.statusPage == '2') {
      this.icon = "💸";
      this.titleSearch = "ขายหุ้นสามัญ";
    } else if (this.statusPage == '3') {
      this.icon = "🆕";
      this.titleSearch = "ออกใบหุ้นใหม่ แทนใบหุ้นชำรุด/สูญหาย";
    } else if (this.statusPage == '4') {
      this.icon = "🔃";
      this.titleSearch = "โอนเปลี่ยนมือ";
    } else if (this.statusPage == '5') {
      this.icon = "💰";
      this.titleSearch = "จ่ายเงินปันผล";
    } else if (this.statusPage == '6') {
      this.icon = "🔒";
      this.titleSearch = "บล็อคใบหุ้น";
    }
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

  onHandle(cusId: string) {
    if (this.statusPage == '1') {
      this.activeView = 'edit';
      this.statusView.emit({ view: 'edit', cusId: cusId });
    } else if (this.statusPage == '2') {
      this.statusView.emit({ view: 'sale', cusId: cusId});
    } else if (this.statusPage == '3') {
      this.statusView.emit({ view: 'newcertificate', cusId: cusId});
    } else if (this.statusPage == '4') {
      this.statusView.emit({view: 'transfer', cusId: cusId });
    } else if (this.statusPage == '5') {
      this.statusView.emit({view: 'dividend', cusId: cusId});
    } else if (this.statusPage == '6') {
      this.statusView.emit({view: 'block', cusId: cusId});
    }
  }

  onViewStock(cusId: string) {
    this.cusId = cusId;
    this.activeView = 'stock';
    this.cd.detectChanges();
  }

  // ตรวจสอบเลขบัตร 13 หลัก
  isValidIdCard(): boolean {
    const idCard = this.criteria.cusId;
    
    // ตรวจสอบความยาว 13 หลัก
    if (!idCard || idCard.length !== 13 || !/^\d{13}$/.test(idCard)) {
      return false;
    }
    
    // ตรวจสอบ checksum
    return this.validateIdCardChecksum(idCard);
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

  // warning ของปุ่มผู้ถือหุ้นรายใหม่
  onNewShareholder() {
    if (!this.isValidIdCard()) {
      Swal.fire({
        icon: 'warning',
        title: 'เลขบัตรแสดงตนไม่ถูกต้อง',
        text: 'กรุณาใส่เลขบัตรแสดงตน 13 หลัก ที่ถูกต้องในช่อง "เลขที่บัตรแสดงตน" ก่อน',
        confirmButtonText: 'เข้าใจแล้ว'
      });
      return;
    }

    // นำทางไปยังหน้า newcus
    this.router.navigate(['/dashboard-admin/newcus'], {
      queryParams: { 
        idCard: this.criteria.cusId,
        mode: 'new-shareholder'
      }
    });
  }
}


