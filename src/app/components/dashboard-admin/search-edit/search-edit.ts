import { Component, Input, ChangeDetectorRef, OnInit, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { CustomerService, CustomerSearchDto } from '../../../services/customer';
import { ResultDefaultComponent } from './result-table/result-default/result-default.component';
import { ResultCommonStockComponent } from './result-table/result-common-stock/result-common-stock';
import { ResultNewCertificateComponent } from './result-table/result-new-certificate/result-new-certificate.component';
import { ResultTranferShareComponent } from './result-table/result-tranfer-share/result-tranfer-share.component';
import { EditCustomerComponent } from '../edit-customer/edit-customer.component';
@Component({
  standalone: true,
  selector: 'app-search-edit',
  imports: [
    FormsModule,
    CommonModule,
    ResultDefaultComponent,
    ResultCommonStockComponent,
    ResultNewCertificateComponent,
    ResultTranferShareComponent,
    EditCustomerComponent
  ],
  templateUrl: './search-edit.html',
  styleUrls: ['./search-edit.css']
})
export class SearchEditComponent implements OnInit, OnChanges {
  @Input() commonShare!: string;
  @Input() InputcreateNewShareCertificate!: string;
  @Input() InputtransferShare!: string;

  titleSearch: string = '';
  branch = sessionStorage.getItem('brName');
  activeView: string = 'search';

  selectedStockNotes: string[] = [];
  selectedCusId: string = '';
  selectedName: string = '';
  selectedStockList: string[] = [];
  selectedStatus: string = '';

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

  onSubmit(event: Event) {
    event.preventDefault(); // กันการ reload หน้าเว็บ
    this.cd.detectChanges(); // บังคับ Angular อัปเดต view/ค่าก่อน
    this.onSearch(); // เรียก search หลังจากค่าทั้งหมดถูก bind แล้ว

    // Debug: ตรวจสอบค่า input และ condition
    console.log('🔍 Debug Info:');
    console.log('commonShare:', this.commonShare);
    console.log('InputcreateNewShareCertificate:', this.InputcreateNewShareCertificate);
    console.log('isCommonShares:', this.isCommonShares);
    console.log('isCreateNewShareCertificate:', this.isCreateNewShareCertificate);
    console.log('Condition result:', this.isCommonShares && !this.isCreateNewShareCertificate);
    console.log('criteria:', this.criteria);

    setTimeout(() => {
      this.onSearch();
    }, 0);
  }

  ngOnChanges() {
    console.log('📦 ข้อมูลใหม่เข้า result-default:', this.results);
  }


  ngOnInit(): void {
    if (this.commonShare === 'common-shares') {
      this.titleSearch = 'ขายหุ้นสามัญ';
    } else if (this.InputcreateNewShareCertificate === 'create-new-share-certificate') {
      this.titleSearch = 'ออกใบหุ้นใหม่แทนใบหุ้นที่ชำรุด/สูญหาย';
    } else if (this.InputtransferShare === 'transfer-share') {
      this.titleSearch = 'โอนเปลี่ยนมือ';
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
          console.log('✅ ค้นหาลูกค้าเรียบร้อย:', this.results);
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

  setView(view: string, stockNotes?: string[], cusId?: string, fullName?: string, stockList?: any[], statusDesc?: string) {
    this.activeView = view;
    this.selectedStockNotes = stockNotes ?? [];
    this.selectedCusId = cusId ?? '';
    this.selectedName = fullName ?? '';
    this.selectedStockList = stockList ?? [];
    this.selectedStatus = statusDesc ?? '';
  }

  onEdit(item: any) {
    console.log('✅ รับข้อมูลจากลูก:', item);
    this.selectedCusId = item.cusId;
    this.activeView = 'edit';
    console.log('✅ เปลี่ยนเป็นหน้า edit แล้ว');
  }


  get currentResultType(): string {
    if (this.InputtransferShare === 'transfer-share') return 'transfer';
    if (this.InputcreateNewShareCertificate === 'create-new-share-certificate') return 'new-cert';
    if (this.commonShare === 'common-shares') return 'common';
    return 'default';
  }
  get isCommonShares(): boolean {
    return this.commonShare === 'common-shares';
  }
  get isCreateNewShareCertificate(): boolean {
    return this.InputcreateNewShareCertificate === 'create-new-share-certificate';
  }
  get isTransferShare(): boolean {
    return this.InputtransferShare === 'transfer-share';
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