import { Component, Input, ChangeDetectorRef, OnInit, OnChanges, Output, EventEmitter, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { CustomerService, CustomerSearchDto } from '../../../services/customer';
import { ResultDefaultComponent } from './result-table/result-default/result-default.component';
import { ResultCommonStockComponent } from './result-table/result-common-stock/result-common-stock';
import { ResultNewCertificateComponent } from './result-table/result-new-certificate/result-new-certificate.component';
import { ResultTranferShareComponent } from './result-table/result-tranfer-share/result-tranfer-share.component';
import { ResultBlockCertificateComponent } from './result-table/result-block-certificate/result-block-certificate.component';
import { EditCustomerComponent } from '../edit-customer/edit-customer.component';
import { StocksComponent } from '../stocks/stocks';
import { StockItem } from '../../../services/stock';

@Component({
  selector: 'app-search-edit',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ResultDefaultComponent,
    ResultCommonStockComponent,
    ResultNewCertificateComponent,
    ResultTranferShareComponent,
    ResultBlockCertificateComponent,
    EditCustomerComponent,
    StocksComponent,
  ],
  templateUrl: './search-edit.html',
  styleUrls: ['./search-edit.css']
})
export class SearchEditComponent implements OnInit, OnChanges {
  @Input() commonShare!: string;
  @Input() InputcreateNewShareCertificate!: string;
  @Input() InputtransferShare!: string;
  @Input() InputblockCertificates!: string;
  @Input() viewMode!: string;
  @Output() viewChange = new EventEmitter<{
    view: string;
    cusId?: string;
    fullName?: string;
    statusDesc?: string;
    stockNotes?: string[];
    viewMode?: string;
  }>();
  @Output() viewStock = new EventEmitter<any>();
  @Output() transferStock = new EventEmitter<any>();
  @Output() createnew = new EventEmitter<any>();
  @Output() common = new EventEmitter<any>();
  @Output() blockCertificate = new EventEmitter<any>();

  titleSearch: string = '';
  branch = sessionStorage.getItem('brName');
  activeView: string = 'search';

  selectedStockNotes: string[] = [];
  selectedCusId: string = '';
  selectedName: string = '';
  selectedStockList: string[] = [];
  selectedStatus: string = '';
  mode: string = '';

  criteria: CustomerSearchDto = {
    cusId: '',
    fname: '',
    lname: '',
    stockId: ''
  };

  results: any[] = [];
  searched = false;
  loading = false;
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;

  constructor(
    private customerService: CustomerService,
    private cd: ChangeDetectorRef,
  ) { }

  setView(view: string, stockNotes?: string[], cusId?: string, fullName?: string, stockList?: any[], statusDesc?: string, viewMode?: string) {
    this.activeView = view;
    this.selectedStockNotes = stockNotes ?? [];
    this.selectedCusId = cusId ?? '';
    this.selectedName = fullName ?? '';
    this.selectedStockList = stockList ?? [];
    this.selectedStatus = statusDesc ?? '';
    this.viewMode = viewMode ?? '';
  }

  onStockTransfer(item: StockItem) {
    this.transferStock.emit(item);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.cd.detectChanges();
    this.onSearch();

    setTimeout(() => {
      this.onSearch();
    }, 0);
  }

  ngOnChanges() {
    // console.log('📦 ข้อมูลใหม่เข้า result-default:', this.results);
  }

  ngOnInit(): void {
    if (this.commonShare === 'common-shares') {
      this.titleSearch = 'ขายหุ้นสามัญ';
    } else if (this.InputcreateNewShareCertificate === 'create-new-share-certificate') {
      this.titleSearch = 'ออกใบหุ้นใหม่แทนใบหุ้นที่ชำรุด/สูญหาย';
    } else if (this.InputtransferShare === 'transferShare') {
      this.titleSearch = 'โอนเปลี่ยนมือ';
    } else if (this.InputblockCertificates === 'blockCertificates') {
      this.titleSearch = 'บล็อค/ยกเลิกบล็อคใบหุ้น';
    } else {
      this.titleSearch = 'ค้นหา';
    }

    this.customerService.getAllProvince().subscribe({
      next: (data) => this.provinceList = data,
      error: (err) => console.error('❌ ดึงรายชื่อจังหวัดไม่สำเร็จ:', err)
    });

    this.customerService.getAllCustype().subscribe({
      next: (data) => this.custypeList = data,
      error: (err) => console.error('❌ ดึงประเภทลูกค้าไม่สำเร็จ:', err)
    });

    this.customerService.getAllDoctype().subscribe({
      next: (data) => this.doctypeList = data,
      error: (err) => console.error('❌ ไม่สามาดึงมูลไม่สำเร็จ:', err)
    });

    this.customerService.getAllTitle().subscribe({
      next: (data) => this.titleList = data,
      error: (err) => console.error('❌ ไม่สามารถดึงคำนำหน้าลูกค้าได้', err)
    });

    this.customerService.getAllAcctypes().subscribe({
      next: (data) => this.accTypeList = data,
      error: (err) => console.error('❌ ดึงประเภทบัญชีไม่สำเร็จ:', err)
    });
  }

  onSearch(page: number = 1) {
    this.currentPage = page;
    this.loading = true;

    this.customerService.searchCustomer(this.criteria, page, this.pageSize)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          this.results = res.data;
          this.totalItems = res.totalItems;
          this.searched = true;
        },
        error: err => {
          console.error('❌ เกิดข้อผิดพลาดจาก API:', err);
          this.searched = true;
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
    this.results = [];
    this.searched = false;
  }
  
  onCommon(item: any) {
    console.log("ค่าที่มาตัวกลาง");
    this.selectedCusId = item.cusId;
    this.common.emit(item);
    this.cd.detectChanges();
  }

  onEdit(item: any) {
    this.selectedCusId = item.cusId;
    this.activeView = 'edit';
  }

  onTransfer(item: any) {
    this.selectedCusId = item.cusId
    this.activeView = 'transfer';
    this.transferStock.emit(item);
  }

  onCreateNew(item: any) {
    this.createnew.emit(item);
  }

  onModeNotify(mode: string) {
    // เปลี่ยนเงื่อนไขการแสดงผล
    this.mode = mode;
    console.log("ค่า mode ที่ถูกส่งกลับมา",this.mode);
  }

  onViewStock(item: any) {
    this.selectedCusId = item.stkNote;
    this.activeView = 'stock';
  }

  onBlockCertificate(item: any) {
    this.blockCertificate.emit(item);
  }

  get currentResultType(): string {
    if (this.InputtransferShare === 'transferShare') return 'transfer';
    if (this.InputcreateNewShareCertificate === 'create-new-share-certificate') return 'new-cert';
    if (this.commonShare === 'common-shares') return 'common';
    if (this.InputblockCertificates === 'blockCertificates') return 'block-cert';
    return 'default';
  }

  get isCommonShares(): boolean {
    return this.commonShare === 'common-shares';
  }

  get isCreateNewShareCertificate(): boolean {
    return this.InputcreateNewShareCertificate === 'create-new-share-certificate';
  }

  get isTransferShare(): boolean {
    return this.InputtransferShare === 'transferShare';
  }

  get isBlockCertificates(): boolean {
    return this.InputblockCertificates === 'blockCertificates';
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  titleList: any[] = [];
  custypeList: any[] = [];
  doctypeList: any[] = [];
  accTypeList: any[] = [];
  provinceList: any[] = [];

  onEditSuccess() {
    this.setView('search');
    this.onSearch(this.currentPage);
  }
}


