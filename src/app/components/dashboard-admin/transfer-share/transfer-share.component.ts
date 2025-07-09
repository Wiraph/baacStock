import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { RemCodeService, Remcode } from '../../../services/rem-code';
import { FormsModule } from '@angular/forms';
import { PayTypeService, PayType } from '../../../services/pay-type';
import { StockService, StockItem } from '../../../services/stock';
import { AccTypeService, AccType } from '../../../services/acc-type';
import { CustomerService } from '../../../services/customer';
import { StockRequestService } from '../../../services/stock-request';

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
  stkNote?: string;
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
  selectedStock: string[] = [];
  remcodeList: Remcode[] = [];
  tempCID: string = '';
  isEnteringNewPerson = true; // true = แสดงแค่ช่องกรอกบัตร
  selectedTransfer: TransferReceiver | null = null;
  payTypes: PayType[] = [];
  accTypes: AccType[] = [];
  selectedRemCode: string = '';
  stockCusid: string = '';
  selectedcustomer: any = null;
  selectStockTransfer: any = null;
  selectCusTransfer: any = null;

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
    remCode: '',
    stkNote: '',
  };

  constructor(
    private stockService: StockService,
    private remcodeService: RemCodeService,
    private paytypeService: PayTypeService,
    private acctypeService: AccTypeService,
    private customerService: CustomerService,
    private StockRequestService: StockRequestService,
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
          remCode: '',
          stkNote: validStock.stkNote || '',
        };

        this.isEnteringNewPerson = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        alert('เกิดข้อผิดพลาดในการดึงข้อมูลหุ้น');
      }
    });
  }




  onTransferStockSelected(stock: any) {
    // เรียก api เพื่อดึงข้อมูลของลูกค้า
    this.customerService.getCustomerDataById(stock.cusId).subscribe({
      next: (stock) => {
        this.selectedcustomer = stock;
        this.activeView = 'stock-transfer';
        console.log("ข้อมูลที่ได้รับจาก stock", this.selectedcustomer);
        this.cdRef.detectChanges();
      }
    });
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
      remCode: '',
      stkNote: '',
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

    const totalShareToTransfer = this.transferList.reduce((sum, t) => sum + (t.shareAmount || 0), 0);
    const availableShares = this.selectStockTransfer.unit ?? 0;

    console.log("ผลรวมของ Unit ที่จะส่งไปบันทีก ", totalShareToTransfer);

    if (totalShareToTransfer > availableShares) {
      alert(`ขออภัยจำนวนหุ้นไม่พอ กรุณาโอนหุ้นไม่เกิน ${availableShares} หุ้น`);
      return;
    }


    const payload = {
      fromCusId: this.selectedcustomer?.cusId,
      fromStkNote: this.selectStockTransfer.stkNote,
      amount: totalShareToTransfer,
      stkTrcode: "TFW",
      StkTrtype: "TRF",
      brCode: sessionStorage.getItem('brCode'),
      transfers: this.transferList.map(t => ({
        cid: t.cid,
        stkNote: t.stkNote,
        shareAmount: t.shareAmount,
        remCode: t.remCode,
        payType: t.payType,
        accType: t.accType,
        accNo: t.accNo,
        accName: t.accName,
        stkTrcode: "TFD",
        StkTrtype: "TRF"
      }))
    };


    console.log('📦 ส่งข้อมูลการโอน:', payload);

    // TODO: ส่ง API จริง
    this.StockRequestService.transferRequest(payload).subscribe({
      next: (res) => {
        console.log('✅ การโอนสำเร็จ:', res);
        alert('บันทึกคำขอโอนเปลี่ยนมือเรียบร้อยแล้ว');

        // 👉 เคลียร์ข้อมูลหรือนำทางกลับ
        this.transferList = [];
        this.selectStockTransfer = null;
        this.activeView = 'detail';
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('❌ เกิดข้อผิดพลาดในการโอน:', err);
        alert('เกิดข้อผิดพลาดในการส่งคำขอโอน กรุณาลองใหม่อีกครั้ง');
      }
    });

  }

  onSetTransfer(stock: any, customer: any) {
    this.selectStockTransfer = stock;
    this.selectCusTransfer = customer;
    // console.log('รายการหุ้นที่เลือก:', this.selectStockTransfer);
    // console.log('ข้อมูลลูกค้า:', this.selectCusTransfer);
    this.setView('transfer');
    this.cdRef.detectChanges();
  }

  showDetail(stock: any) {
    this.selectStockTransfer = stock;
    console.log('แสดงรายละเอียด:', this.selectStockTransfer);
    this.setView('detail');
    this.cdRef.detectChanges();
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

  goBack() {
    this.activeView = 'search'; // หรือชื่อหน้าก่อนหน้า เช่น 'search', 'list', หรือ null
  }
}