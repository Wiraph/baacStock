import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { RemCodeService, Remcode } from '../../../services/rem-code';
import { FormsModule } from '@angular/forms';
import { PayTypeService, PayType } from '../../../services/pay-type';
import { StockService, StockItem } from '../../../services/stock';
import { AccTypeService, AccType } from '../../../services/acc-type';

interface TransferReceiver {
  cid: string;
  shareAmount: number;
  remCode?: string;
  branch?: string;
  fullName?: string;
  payType?: string;
  accType?: string;
  accNo?: string;
  accName?: string;
}

@Component({
  selector: 'app-transfer-share',
  standalone: true,
  imports: [CommonModule, SearchEditComponent, FormsModule],
  templateUrl: './transfer-share.component.html',
})
export class TransferShareComponent implements OnInit {

  @Input() InputtransferShare!: string;

  stockData: any;
  internalViewName = 'transferShare';
  cusId = '';
  fullName = '';
  statusDesc = '';
  stockNotes: string[] = [];
  viewMode = '';
  activeView = 'search';
  selectedStock: StockItem | null = null;
  remcodeList: Remcode[] = [];
  tempCID: string = '';
  isEnteringNewPerson = true; // true = แสดงแค่ช่องกรอกบัตร
  selectedTransfer: TransferReceiver | null = null;
  payTypes: PayType[] = [];
  accTypes: AccType[] = [];
  selectedRemCode: string = '';

  // สำหรับเพิ่มรายการผู้รับโอน
  transferList: TransferReceiver[] = [];
  tempTransfer: TransferReceiver = {
    cid: '',
    shareAmount: 0,
    branch: '',
    payType: '',
    accType: '',
    accNo: '',
    accName: '',
    remCode: ''
  };

  constructor(
    private stockService: StockService,
    private remcodeService: RemCodeService,
    private paytypeService: PayTypeService,
    private acctypeService: AccTypeService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.remcodeService.getRemCodes().subscribe({
      next: (data) => {
        this.remcodeList = data.filter(rem =>
          rem.remCode === '0030' || rem.remCode === '0031'
        );
      },
      error: () => {
        alert('ไม่สามารถโหลดเหตุผลการโอนหุ้น');
      }
    });

    this.paytypeService.getAll().subscribe({
      next: (data) => {
        this.payTypes = data;
      },
      error: () => {
      }
    });

    this.acctypeService.getAllAccTypes().subscribe({
      next: (data) => {
        this.accTypes = data;
      },
      error: () => {
        alert('ไม่สามารถโหลดประเภทบัญชี');
      }
    });

  }

  fetchReceiverInfo() {
    this.cdRef.detectChanges();

    if (!this.tempCID) return;

    this.stockService.getStocksByCusId(this.tempCID).subscribe({
      next: (response) => {
        const stockList = response.stockList;

        if (!stockList || stockList.length === 0) {
          alert('ไม่พบข้อมูลหุ้นของผู้ถือหุ้นรายนี้');
          return;
        }


        const validStock = stockList.find((s: StockItem) => s.stkStatus === 'S000');

        console.log("Stock ", response);

        if (!validStock) {
          const statusList = [...new Set(stockList.map((s: StockItem) => s.statusDesc || s.stkStatus))].join(', ');
          alert(`ไม่สามารถโอนได้ เนื่องจากสถานะ: ${statusList}`);
          return;
        }

        this.selectedTransfer = {
          cid: this.tempCID,
          fullName: validStock.fullname || '',
          shareAmount: 0,
          branch: sessionStorage.getItem('brName') ?? undefined,
          payType: validStock.stkPayType || '',
          accType: validStock.stkAcctype || '',
          accNo: validStock.stkAccno || '',
          accName: validStock.stkAccname || '',
          remCode: ''
        };

        this.isEnteringNewPerson = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        alert('เกิดข้อผิดพลาดในการดึงข้อมูลหุ้น');
      }
    });
  }




  onTransferStockSelected(stock: StockItem) {
    this.selectedStock = stock;
    this.activeView = 'transfer';
  }

  confirmReceiver() {
    if (!this.selectedTransfer || this.selectedTransfer.shareAmount <= 0) {
      alert('กรุณาระบุจำนวนหุ้น');
      return;
    }

    if (!this.selectedTransfer.remCode || this.selectedTransfer.remCode === '') {
      alert('กรุณาเลือกเหตุผลในการโอนหุ้น');
      return;
    }

    console.log("ข้อมูลผู้รับที่จะเพิ่ม:", this.selectedTransfer);

    this.transferList.push({ ...this.selectedTransfer });
    this.selectedTransfer = null;
    this.tempCID = '';
    this.isEnteringNewPerson = true;
  }



  setView(view: string) {
    this.activeView = view;
  }

  onViewStock(data: any) {
    // this.cusId = data.stkOwniD;
    // this.fullName = data.fullName;
    // this.statusDesc = data.statusDesc;
    // this.stockNotes = data.stockNotes;
    // this.viewMode = data.viewMode;
    this.setView('transfer');
  }

  addTransfer() {
    if (!this.tempTransfer.cid || this.tempTransfer.shareAmount <= 0) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนก่อนเพิ่ม');
      return;
    }

    this.transferList.push({ ...this.tempTransfer });
    this.resetTempTransfer();
  }

  removeTransfer(index: number) {
    this.transferList.splice(index, 1);
  }

  resetTempTransfer() {
    this.tempTransfer = {
      cid: '',
      shareAmount: 0,
      branch: '',
      payType: '',
      accType: '',
      accNo: '',
      accName: '',
      remCode: ''
    };
  }

  resetTransferForm() {
    this.selectedTransfer = null;
    this.tempCID = '';
    this.isEnteringNewPerson = true;
  }


  submitTransfer() {
    if (!this.selectedStock || this.transferList.length === 0) {
      alert('กรุณาเลือกหุ้นและเพิ่มผู้รับโอนอย่างน้อย 1 ราย');
      return;
    }

    const payload = {
      fromStockNote: this.selectedStock.stkNote,
      fromCusId: this.selectedStock.stkOwniD,
      transfers: this.transferList
    };

    console.log('📦 ส่งข้อมูลการโอน:', payload);

    // TODO: ส่ง API จริง
    // this.stockService.submitTransfer(payload).subscribe({...});
  }

}