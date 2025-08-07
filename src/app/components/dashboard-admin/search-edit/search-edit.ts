import { Component,  ChangeDetectorRef, OnInit, Output, EventEmitter} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerStockService } from '../../../services/customer-stock-service';
import { JwtDecoder } from '../../../services/jwt-decoder';
import { DataTransfer } from '../../../services/data-transfer';
import { StocksComponent } from '../stocks/stocks';


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

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly cusstomerStockService: CustomerStockService,
    private readonly jwtCoder: JwtDecoder,
    private readonly dataTrasfer: DataTransfer,
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
      this.icon = "📄";
      this.titleSearch = "เงินปันผล";
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
    }
  }

  onViewStock(cusId: string) {
    this.cusId = cusId;
    this.activeView = 'stock';
    this.cd.detectChanges();
  }
}


