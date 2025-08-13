import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { RemCodeService, Remcode } from '../../../services/rem-code';
import { FormsModule } from '@angular/forms';
import { PayTypeService, PayType } from '../../../services/pay-type';
import { StockService, StockItem } from '../../../services/stock';
import { CustomerService } from '../../../services/customer';
import { StockRequestService } from '../../../services/stock-request';
import { StocktransferService } from '../../../services/stocktransfer';
import Swal from 'sweetalert2';
import { DataTransfer } from '../../../services/data-transfer';
import { MetadataService } from '../../../services/metadata';

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
  accTypes: any[] = [];
  selectedRemCode: string = '';
  stockCusid: string = '';
  selectedcustomer: any = null;
  selectStockTransfer: any = null;
  selectCusTransfer: any = null;
  globalRemCode: string = '';
  transferResult: any;
  loading = false;

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
    private readonly remcodeService: RemCodeService,
    private readonly paytypeService: PayTypeService,
    private readonly StockTrnsferService: StocktransferService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly dataTransfer: DataTransfer,
    private readonly metadataService: MetadataService
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

    this.metadataService.getAcctypes().subscribe({
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

    
  }




  onTransferStockSelected(stock: any) {
    // เรียก api เพื่อดึงข้อมูลของลูกค้า
    
  }

  confirmReceiver() {
    if (!this.selectedTransfer || this.selectedTransfer.shareAmount <= 0) {
      alert('กรุณาระบุจำนวนหุ้น');
      return;
    }

    if (!this.globalRemCode || this.globalRemCode === '') {
      alert('กรุณาเลือกเหตุผลในการโอนหุ้น');
      return;
    }

    if (this.selectedTransfer?.payType === "001") {
      const accNo = this.selectedTransfer.accNo?.trim();
      const accName = this.selectedTransfer.accName?.trim();

      if (!accNo || !accName) {
        alert('กรุณากรอกข้อมูลบัญชีให้ครบถ้วน');
        return;
      }
    }



    console.log("ข้อมูลผู้รับที่จะเพิ่ม:", this.selectedTransfer);

    this.transferList.push({
      ...this.selectedTransfer,
      remCode: this.globalRemCode // ใส่เหตุผลโอนหุ้นแบบกลาง
    });

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




  onSetTransfer(stock: any, customer: any) {
    this.selectStockTransfer = stock;
    this.selectCusTransfer = customer;
    this.setView('transfer');
    this.cdRef.detectChanges();
  }

  showDetail(stkNote: string) {
    this.setView('detail');
    this.funcDetail(stkNote)
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

  submitTransfer() {
    if (!this.selectedStock || this.transferList.length === 0) {
      alert('กรุณาเลือกหุ้นและเพิ่มผู้รับโอนอย่างน้อย 1 ราย');
      return;
    }

    if (!this.globalRemCode) {
      alert('กรุณาเลือกเหตุผลการโอนหุ้น');
      return;
    }

    const totalShareToTransfer = this.transferList.reduce((sum, t) => sum + (t.shareAmount || 0), 0);
    const availableShares = this.selectStockTransfer.unit ?? 0;
    if (totalShareToTransfer > availableShares) {
      alert(`ขออภัยจำนวนหุ้นไม่พอ กรุณาโอนหุ้นไม่เกิน ${availableShares} หุ้น`);
      return;
    }


    // สร้าง string lists ที่คั่นด้วย '|'
    const list_CUSid = this.transferList.map(t => t.cid).join('|');
    const list_CUSun = this.transferList.map(t => t.shareAmount).join('|');
    const list_accTY = this.transferList.map(t => t.accType).join('|');
    const list_accNO = this.transferList.map(t => t.accNo).join('|');
    const list_accNA = this.transferList.map(t => t.accName).join('|');
    const list_payTY = this.transferList.map(t => t.payType).join('|');

    const payload = {
      TRF_CUSid: this.selectedcustomer?.cusId,
      TRF_stkNOTE: this.selectStockTransfer.stkNote,
      TRF_stkSTA: this.selectStockTransfer.stkStart,
      TRF_stkSTP: this.selectStockTransfer.stkEnd,
      TRF_stkUNiTALL: availableShares,

      TR2_RemCode: this.globalRemCode,

      TR2_LST_CUSid: list_CUSid,
      TR2_LST_CUSun: list_CUSun,
      TR2_LST_accTY: list_accTY,
      TR2_LST_accNO: list_accNO,
      TR2_LST_accNA: list_accNA,
      TR2_LST_payTY: list_payTY,
    };

    Swal.fire({
      html: `<p style="font-family: 'Prompt', sans-serif;">ยืนยันการโอนหุ้นเปลี่ยนมือ</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'อนุมัติ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        this.StockTrnsferService.transferRequest(payload).subscribe({
          next: (res) => {
            console.log('✅ การโอนสำเร็จ:', res);
            Swal.fire({
              icon: 'success',
              html: `<p style="font-family: 'Prompt', sans-serif;">บันทึกข้อมูลสำเร็จ</p>`,
              confirmButtonText: 'ตกลง'
            }).then((result) => {
              if (result.isConfirmed) {
                this.transferList = [];
                this.selectStockTransfer = null;
                this.funcDetail(this.selectedcustomer?.cusId);
                this.goBack();
                this.cdRef.detectChanges();
              }
            })
          },
          error: (err) => {
            console.error('❌ เกิดข้อผิดพลาดในการโอน:', err);
            alert('เกิดข้อผิดพลาดในการส่งคำขอโอน กรุณาลองใหม่อีกครั้ง');
          }
        });
      }
    });
  }


  funcDetail(stkNote: string) {
    
  }

  goBack() {
    this.transferList = [];
    this.selectStockTransfer = null;
    this.activeView = 'search';
  }
}