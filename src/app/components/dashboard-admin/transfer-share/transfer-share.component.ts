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
import { CustomerStockService } from '../../../services/customer-stock-service';

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
  
  // ตัวแปรสำหรับหน้าโอนหุ้น

  transferForm = {
    reason: '',
    idCard: '',
    fee: '',
    title: '',
    firstName: '',
    lastName: '',
    salary: '',
    incomeSource: '',
    date: '',
    address: ''
  };
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
  stkTransList: any[] = [];
  customerData: any = '';

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
    private readonly metadataService: MetadataService,
    private readonly customerService: CustomerService,
    private readonly customerStockService: CustomerStockService
  ) { }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus('4');


  }

  fetchReceiverInfo() {
    this.cdRef.detectChanges();

    if (!this.tempCID) return;

    
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
      next: (res) => {
        this.customerData = res;
        this.cdRef.detectChanges();
      }, error: (err) => {
        console.log("Error", err);
      }
    })
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
            });
          },
          error: (err) => {
            console.error('❌ เกิดข้อผิดพลาดในการโอน:', err);
            alert('เกิดข้อผิดพลาดในการส่งคำขอโอน กรุณาลองใหม่อีกครั้ง');
          }
        });
      }
    });
  }

  // เมธอดสำหรับหน้าโอนหุ้น

  onTransferClick(item: any) {
    console.log('เลือกโอนหุ้น:', item);
    
    // เซ็ตข้อมูลหุ้นที่เลือก
    this.selectStockTransfer = {
      stkNote: item.stkNOTE,
      stkStart: item.stkNOStart,
      stkEnd: item.stkNOStop,
      unit: item.stkUNiT,
      unitValue: item.stkVALUE,
      branchName: item.brCode
    };

    // เซ็ตข้อมูลลูกค้า (ถ้ามี)
    if (this.customerData) {
      this.selectedcustomer = {
        cusId: this.customerData.cusiD,
        fullName: `${this.customerData.title}${this.customerData.fname} ${this.customerData.lname}`,
        branchName: this.customerData.branchName || item.brCode
      };
    }

    // โหลดข้อมูล remcodeList ถ้ายังไม่มี (กรองเฉพาะ 3 รายการที่ต้องการ)
    if (this.remcodeList.length === 0) {
      this.remcodeService.getRemCodes().subscribe({
        next: (codes) => {
          // กรองเฉพาะ remCode ที่ต้องการ: 0030, 0031, 0040
          this.remcodeList = codes.filter(code => 
            ['0030', '0031', '0040'].includes(code.remCode)
          );
          this.cdRef.detectChanges();
        },
        error: (err) => console.error('Error loading remcodes:', err)
      });
    }

    // เปลี่ยนไปหน้าโอนหุ้น
    this.activeView = 'transfers';
    this.cdRef.detectChanges();
  }

  onSaveTransfer() {
    console.log('บันทึกข้อมูลการโอน:', this.transferForm);
    // TODO: เพิ่ม logic การบันทึกข้อมูลการโอน
  }

  onCancelTransfer() {
    this.transferForm = {
      reason: '',
      idCard: '',
      fee: '',
      title: '',
      firstName: '',
      lastName: '',
      salary: '',
      incomeSource: '',
      date: '',
      address: ''
    };
  }

  funcDetail(stkNote: string) {
    
  }

  goBack() {
    this.transferList = [];
    this.selectStockTransfer = null;
    this.activeView = 'search';
  }
}
