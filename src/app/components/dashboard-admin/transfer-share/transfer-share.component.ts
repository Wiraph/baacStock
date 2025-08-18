import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService, CustomerDetailDto2 } from '../../../services/customer';
import Swal from 'sweetalert2';
import { DataTransfer } from '../../../services/data-transfer';
import { MetadataService } from '../../../services/metadata';
import { CustomerStockService } from '../../../services/customer-stock-service';
import { StockService } from '../../../services/stock';
import { Divident } from '../../../services/divident';
import { forkJoin } from 'rxjs';

interface TransferItem {
  CUSid: string;
  CUSun: number;
  accTY?: string;
  accNO?: string;
  accNA?: string;
  payTY?: string;
}

@Component({
  selector: 'app-transfer-share',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchEditComponent, ReactiveFormsModule],
  templateUrl: './transfer-share.component.html',
})
export class TransferShareComponent implements OnInit {

  @Input() InputtransferShare!: string;

  stockData: any;
  stkTransList: any[] = [];
  customerData: any = '';
  activeView = 'search';
  cusId = '';
  selectedcustomer: any = '';
  remcodeList: any[] = [];
  accList: any[] = [];
  transferRecipients: any[] = [];
  transferReason: any = '';
  sesstionSearch = true;
  loading = false;


  // ข้อมูลสำหรับหน้าสรุปผล
  transferSummary: any = null;

  searchForm: FormGroup;
  transferForm: FormGroup;
  transferList: TransferItem[] = [];
  foundReceiver: CustomerDetailDto2 | null = null;

  constructor(
    private readonly cdRef: ChangeDetectorRef,
    private readonly dataTransfer: DataTransfer,
    private readonly metadataService: MetadataService,
    private readonly customerService: CustomerService,
    private readonly customerStockService: CustomerStockService,
    private readonly fb: FormBuilder,
    private readonly stockService: StockService,
    private readonly dividendService: Divident,
  ) {
    this.transferForm = this.fb.group({
      transfers: this.fb.array([])
    });

    this.searchForm = this.fb.group({
      stkOWNiD: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus('4');
  }

  onTransferStockSelected(event: any) {
    // เรียก api เพื่อดึงข้อมูลของลูกค้า
    this.cusId = event.cusId;
    this.activeView = event.view;
    this.onLoadTransferList(this.cusId);
  }

  onLoadTransferList(cusiD: string) {
    const payload = {
      GetDTL: 'bySTK@bySTK-TRF',
      STKno: '',
      CUSid: cusiD,
      CUSfn: '',
      CUSln: '',
      stkA: '1',
      PGNum: 1,
      PGSize: 9999999
    };
    this.customerStockService.searchCustomerStock(payload).subscribe({
      next: (res) => {
        this.stkTransList = res;
        console.log("stkTransList", this.stkTransList);
        this.cdRef.detectChanges();
      }, error: (err) => {
        console.log("Errors", err);
      }
    })

    const payload2 = {
      CUSid: cusiD
    }

    this.customerService.getCustomerTable(payload2).subscribe({
      next: (res: any) => {
        this.customerData = res;
        this.cdRef.detectChanges();
      }, error: (err) => {
        console.log("Error", err);
      }
    })
  }

  getStockDetail(stkNote: string) {
    const payload = {
      stkNote: stkNote
    };

    this.stockService.getStockDetail(payload).subscribe({
      next: (res: any) => {
        this.selectedcustomer = res;
        console.log("Selectedcustomer", this.selectedcustomer);
        this.cdRef.detectChanges();
      }, error: () => {
        Swal.fire({
          icon: 'error',
          title: "Error",
          text: "โปรดติดต่อผู้พัฒนา"
        })
      }
    })
  }

  onTransferClick(item: any) {
    console.log(item);
    this.activeView = 'transfers';
    this.getStockDetail(item.stkNOTE);
    this.loadMetaData();
  }

  get transfers(): FormArray {
    return this.transferForm.get('transfers') as FormArray;
  }

  createTransferGroup(receiver: any, dividend: any): FormGroup {
    const fullname = `${receiver.titleDESC}${receiver.cusFName} ${receiver.cusLName}`;
    return this.fb.group({
      CUSid: [receiver.cusiD, Validators.required],
      Name: [fullname],
      CUSun: [null, [Validators.required, Validators.min(1)]],
      accTY: [dividend?.stkACCtype || ''],
      accNO: [dividend?.stkACCno || ''],
      accNA: [dividend?.stkACCname || ''],
      payTY: [dividend?.stkPayType || '']
    });
  }

  searchReceiver() {
    const cusId = this.searchForm.value.stkOWNiD;
    const payload = {
      cusId: cusId
    };
    forkJoin({
      customer: this.customerService.getCustomerTr(payload),
      dividend: this.dividendService.getDividend(payload)
    }).subscribe({
      next: (res) => {
        const group = this.createTransferGroup(res.customer, res.dividend);
        this.transfers.push(group);   // ⬅️ เพิ่มเข้า list
        // this.sesstionSearch = false;

        console.log("All transfers", this.transferForm.value.transfers);
        this.searchForm.reset();
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.log("Error", err);
      }
    })
  }

  removeAt(index: number) {
    this.transfers.removeAt(index);
  }

  submitAll() {

    if (this.transferReason == '') {
      Swal.fire("Error", "กรุณาเลือกเหตุในการโอนหุ้น", "error");
      return
    };

    if (this.transferForm.valid) {
      const transfers = this.transferForm.value.transfers;
      const payload = {
        TRF_CUSid: this.selectedcustomer.cusId,
        TRF_stkNOTE: this.selectedcustomer.stkNote,
        TRF_stkSTA: this.selectedcustomer.stCode,
        TRF_stkSTP: "",
        TRF_stkUNiTALL: this.selectedcustomer.stkUnit,

        TR2_RemCode: this.transferReason,
        TR2_LST_CUSid: transfers.map((t: TransferItem) => t.CUSid).join('|'),
        TR2_LST_CUSun: transfers.map((t: TransferItem) => t.CUSun).join('|'),
        TR2_LST_accTY: transfers.map((t: TransferItem) => t.accTY).join('|'),
        TR2_LST_accNO: transfers.map((t: TransferItem) => t.accNO).join('|'),
        TR2_LST_accNA: transfers.map((t: TransferItem) => t.accNA).join('|'),
        TR2_LST_payTY: transfers.map((t: TransferItem) => t.payTY).join('|')
      };
      console.log("Final Payload", payload);
    } else {
      Swal.fire("Error", "กรุณากรอกข้อมูลให้ครบ", "error");
    }
  }

  cancelAll() {
    this.transfers.clear();
    this.transfers.reset();
    this.activeView = 'transfer';
    this.searchForm.reset();
    this.cdRef.detectChanges();
  }

  loadMetaData() {
    this.metadataService.getRemCode().subscribe({
      next: (res) => {
        this.remcodeList = res.filter((item: any) => item.remCode.startsWith("003"));
        this.cdRef.detectChanges();
        console.log("Remcode", this.remcodeList);
      }, error: (err) => {
        console.log("Fail Load remcode", err);
      }
    })

    this.metadataService.getAcctypes().subscribe({
      next: (res) => {
        this.accList = res;
        this.cdRef.detectChanges();
        console.log("Acctype", this.accList);
      }, error: (err) => {
        console.log("Fail load Acctype", err);
      }
    })
  }

  goBack() {
    this.transferList = [];
    this.activeView = 'search';
  }

  formatThaiDateTime(datetimeup: string): string {
    if (!datetimeup) return '-';

    const [datePart, timePart] = datetimeup.split('-');
    if (!datePart || !timePart) return '-';

    let year = +datePart.substring(0, 4);
    const month = +datePart.substring(4, 6) - 1;
    const day = +datePart.substring(6, 8);
    const hour = +timePart.substring(0, 2);
    const minute = +timePart.substring(2, 4);
    const second = +timePart.substring(4, 6);

    // ✅ ตรวจว่าปีเป็น พ.ศ. อยู่แล้วหรือไม่
    if (year > 2500) {
      year = year - 543; // แปลงกลับเป็น ค.ศ.
    }

    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    const pad = (n: number) => n < 10 ? '0' + n : n.toString();

    return `${day} ${thaiMonths[month]} ${year + 543} ${pad(hour)}:${pad(minute)}:${pad(second)} น.`;
  }
}
