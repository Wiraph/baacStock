import { Component, ChangeDetectorRef, OnInit, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CustomerStockService } from '../../../services/customer-stock-service';
import { DataTransfer } from '../../../services/data-transfer';
import { StocksComponent } from '../stocks/stocks';
import { NewCusComponent } from '../newcus/newcus';
import { UserService } from '../../../services/user';
import { CustomerService } from '../../../services/customer';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-search-edit',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    StocksComponent,
    NewCusComponent
  ],
  templateUrl: './search-edit.html',
  styleUrls: ['./search-edit.css']
})
export class SearchEditComponent implements OnInit {
  @Output() statusView = new EventEmitter<{ view: string; cusId: string }>();
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
    this.statusPage = this.dataTrasfer.getPageStatus();
    this.onloadStart();

    // ตรวจสอบว่าอยู่ใน browser environment หรือไม่
    if (isPlatformBrowser(this.platformId)) {
      console.log("All cookies:", document.cookie);
      const rawBrName = this.getCookie('BrName');
      this.branch = rawBrName ? decodeURIComponent(rawBrName) : null;
      console.log("BrName", this.branch);
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
      this.statusView.emit({ view: 'editcus', cusId: cusId });
    } else if (this.statusPage == '2') {
      this.statusView.emit({ view: 'stksale', cusId: cusId });
    } else if (this.statusPage == '3') {
      this.statusView.emit({ view: 'newcertificate', cusId: cusId });
    } else if (this.statusPage == '4') {
      this.statusView.emit({ view: 'transfer', cusId: cusId });
    } else if (this.statusPage == '5') {
      this.statusView.emit({ view: 'dividend', cusId: cusId });
    } else if (this.statusPage == '6') {
      this.statusView.emit({ view: 'block', cusId: cusId });
    }
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

  // warning ของปุ่มผู้ถือหุ้นรายใหม่
  onNewShareholder() {
    if (this.criteria.cusId.length === 0) {
      Swal.fire({
        icon: 'warning',
        text: 'กรุณาบันทึกเลขที่บัตรแสดงตน'
      })
    } else {
      Swal.fire({
        icon: 'question',
        html: `<p>เลขที่บัตรแสดงตนของผู้ถือหุ้น เป็นเลขนิติบุคคล ใช่หรือไม่?</p>
        <div style="display: flex; justify-content: center;">
        <p style="width: 50px; text-align: start;">Yes</p><p style="width: 50px; text-align: start;">=></p><p>เลขทะเบียนนิติบุคคล</p>
        </div>
        <div style="display: flex; justify-content: center;">
        <p style="width: 50px; text-align: start; margin-left: 15px">No</p><p style="width: 50px; text-align: start;">=></p><p>เลขประจำตัวประชาชน</p>
        </div>
        `,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        showCancelButton: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.statusView.emit({ view: 'newcus', cusId: this.criteria.cusId })
        } else {
          const cusId = this.criteria.cusId;
          let msg: string = '';
          if (cusId.length < 13) {
            msg = "*** กรุณาบันทึกเลขที่บัตรประชาชน 13 หลัก ***";
            this.alert(msg);
            return
          }
          if (isNaN(Number(cusId))) {
            const msg = "*** กรุณาบันทึกเป็นตัวเลขเท่านั้น จำนวน 13 หลัก ***";
            this.alert(msg);
            return;
          }
          if (cusId.length > 13) {
            msg = "*** กรุณาบันทึกเลขที่บัตรประชาชนไม่เกิน 13 หลัก ***";
            this.alert(msg);
            return
          }
          if (cusId.length == 13) {
            this.statusView.emit({ view: 'newcus', cusId: cusId })
          } else {
            msg = "*** กรุณาบันทึกเลขที่บัตรประชาชน 13 หลัก ***";
            this.alert(msg);
            return
          }
        }
      })
    }
  }

  alert(msg: string) {
    Swal.fire({
      icon: 'warning',
      text: `${msg}`
    })
  }
}


