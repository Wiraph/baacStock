import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../services/customer';
import { CustomerStockService } from '../../../services/customer-stock-service';
import { DataTransfer } from '../../../services/data-transfer';
import Swal from 'sweetalert2';
import { StockService } from '../../../services/stock';


@Component({
  selector: 'app-block-certificates',
  standalone: true,
  imports: [CommonModule, SearchEditComponent, FormsModule],
  templateUrl: './block-certificates.component.html',
})
export class BlockCertificatesComponent implements OnInit {

  @Input() InputblockCertificates!: string;

  // View Management
  internalViewName = 'blockCertificates';
  activeView = 'search';  // 'search' | 'certificate-list' | 'block-form' | 'result'

  // Data Properties
  stockData: any;
  cusId = '';
  fullName = '';
  statusDesc = '';
  stockNotes: string[] = [];
  viewMode = '';
  selectedStock: string[] = [];
  stkBlockList: any[] = [];
  customerData: any = '';

  // Block Related
  selectedcustomer: any = null;
  selectedCertificate: any = null;
  certificateList: any[] = [];
  iconBlock = '';

  // UI State
  loading = false;

  constructor(
    private readonly customerService: CustomerService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly dataTransfer: DataTransfer,
    private readonly customerStockService: CustomerStockService,
    private readonly stockService: StockService
  ) { }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus("6");
  }

  // View Management
  setView(view: string) {
    this.activeView = view;
  }

  goBack() {
    this.activeView = 'search';
  }

  // Search Integration
  onHandle(event: any) {
    this.loading = true;
    this.activeView = event.view;
    this.cusId = event.cusId;
    this.onLoadBlockList(event.cusId);
    this.cdRef.detectChanges();
  }

  onLoadBlockList(cusiD: string) {
    const payload = {
      GetDTL: 'bySTK@bySTK-BLK',
      STKno: '',
      CUSid: cusiD,
      CUSfn: '',
      CUSln: '',
      stkA: '1',
      PGNum: 1,
      PGSize: 9999999
    };
    this.customerService.searchCustomerStk(payload).subscribe({
      next: (res) => {
        this.stkBlockList = res;
        console.log("stkBlockList", this.stkBlockList);
        this.cdRef.detectChanges();
      }, error: (err) => {
        console.log("Errors", err);
      }
    })

    const payload2 = {
      cusId: cusiD
    }

    this.customerService.getCustomerDetail(payload2).subscribe({
      next: (res) => {
        this.customerData = res;
        this.loading = false;
        this.cdRef.detectChanges();
      }, error: (err) => {
        console.log("Error", err);
      }
    })
  }

  onBlock(stkNote: string, stCode: string) {
    console.log(stkNote, stCode);
    if (stCode == "S000") {
      Swal.fire({
        icon: 'question',
        text: `ท่านต้องการบล็อคใบหุ้นเลขที่ ${stkNote} ใช่หรือไม่`,
        showCancelButton: true,
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#04AA6D'
      }).then((result) => {
        if (result.isConfirmed) {
          this.onLoadBlock(stkNote);
        }
      })
    } else if (stCode == "S008") {
      Swal.fire({
        icon: 'question',
        text: `ท่านต้องการปลดบล็อคใบหุ้นเลขที่ ${stkNote} ใช่หรือไม่`,
        showCancelButton: true,
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#04AA6D'
      }).then((result) => {
        if (result.isConfirmed) {
          this.onLoadBlock(stkNote);
        }
      })
    } else {
      Swal.fire({
        icon: 'question',
        text: `ใบหุ้นนี้ไม่สามารถดำเนินการได้`,
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#04AA6D'
      })
    }
  }

  onLoadBlock(stkNote: string) {
    const payload = {
      stkNote: stkNote
    };
    this.stockService.blockStock(payload).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          text: `ดำเนินการ ${res.perMSG} บล็อคใบหุ้นเลขที่ ${this.cusId} เรียบร้อย`,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#04AA6D',
          timer: 3000,
          timerProgressBar: true,
        })
        this.onLoadBlockList(this.cusId);
        this.cdRef.detectChanges();
      }, error: (err) => {
        console.log("Error", err);
      }
    })

  }


  // Utility Methods
  getStatus(row: any): string {
    const code = (row?.stCODEs ?? row?.stCODE ?? '').toString();
    if (code && typeof code === 'string') {
      if (code.endsWith('S008')) return 'บล็อค';
      if (code.endsWith('S000')) return 'ปกติ';
    }
    return row?.stDESC || '-';
  }
  formatThaiDateTime(dateTimeStr: string): string {
    if (!dateTimeStr || dateTimeStr.length !== 15 || !dateTimeStr.includes('-')) return '-';

    const datePart = dateTimeStr.substring(0, 8); // 20250704
    const timePart = dateTimeStr.substring(9);   // 152035

    const year = parseInt(datePart.substring(0, 4), 10);
    const month = parseInt(datePart.substring(4, 6), 10);
    const day = parseInt(datePart.substring(6, 8), 10);

    const hour = timePart.substring(0, 2);
    const minute = timePart.substring(2, 4);
    const second = timePart.substring(4, 6);

    const thaiMonths = [
      '', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const buddhistYear = year;

    return `${day} ${thaiMonths[month]} ${buddhistYear} เวลา ${hour}:${minute}:${second} น.`;
  }

} 