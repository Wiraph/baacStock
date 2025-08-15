import { Component, Input, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { RemCodeService, Remcode } from '../../../services/rem-code';
import { FormsModule } from '@angular/forms';
import { PayTypeService, PayType } from '../../../services/pay-type';
import { CustomerService } from '../../../services/customer';
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
  imports: [CommonModule, FormsModule, SearchEditComponent],
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
    address: '',
    position: '',
    memberId: '',
    shareAmount: 0,
    payType: '',
    accountType: '',
    accountNumber: '',
    accountName: ''
  };

  // เพิ่มรายการผู้รับโอนหลายคน
  transferRecipients: any[] = [];
  currentRecipientIndex: number = -1;

  foundUser: any = null;
  selectedTransfer: TransferReceiver | null = null;
  payTypes: PayType[] = [];
  accTypes: any[] = [];
  actypeList: any[] = [];
  dividendData: any = null;
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
  isShareAmountConfirmed = false;
  
  // ข้อมูลสำหรับหน้าสรุปผล
  transferSummary: any = null;

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
    private readonly customerStockService: CustomerStockService,
    private readonly ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus('4');

    // โหลดข้อมูลพื้นฐาน
    this.loadBasicData();
  }

  onPayTypeChange() {
    // เมื่อเลือก "บริจาคให้ ธ.ก.ส." ให้ล้างข้อมูลบัญชี
    if (this.transferForm.payType === '003') {
      this.transferForm.accountNumber = '';
      this.transferForm.accountName = '';
    }
  }

  loadBasicData() {
    // โหลดข้อมูล remcode
    this.remcodeService.getRemCodes().subscribe({
      next: (remcodes: Remcode[]) => {
        this.remcodeList = remcodes.filter(code => 
          ['0030', '0031', '0040'].includes(code.remCode)
        );
        this.cdRef.detectChanges();
      },
      error: (err: any) => console.error('Error loading remcodes:', err)
    });

    // โหลดข้อมูล paytypes
    this.paytypeService.getAll().subscribe({
      next: (paytypes: PayType[]) => {
        this.payTypes = paytypes;
        this.cdRef.detectChanges();
      },
      error: (err: any) => console.error('Error loading paytypes:', err)
    });

    // โหลดข้อมูล account types
    this.metadataService.getAcctypes().subscribe({
      next: (types: any[]) => {
        this.actypeList = types;
        console.log('Account types loaded:', this.actypeList);
        
        // ตั้งค่าเริ่มต้นสำหรับ accountType (เลือกประเภทแรก)
        if (this.actypeList.length > 0) {
          this.transferForm.accountType = this.actypeList[0].accType;
        }
        
        this.cdRef.detectChanges();
      },
      error: (err: any) => console.error('Error loading account types:', err)
    });
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
                // this.goBack();
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
      branchName: item.brCode,
      stDESC: item.stDESC
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

    // โหลดข้อมูล payTypes ถ้ายังไม่มี
    if (this.payTypes.length === 0) {
      this.paytypeService.getAll().subscribe({
        next: (types: PayType[]) => {
          this.payTypes = types;
          console.log('PayTypes loaded:', this.payTypes);
          this.cdRef.detectChanges();
        },
        error: (err: any) => console.error('Error loading paytypes:', err)
      });
    }

    // โหลดข้อมูล account types ถ้ายังไม่มี
    if (this.actypeList.length === 0) {
      this.metadataService.getAcctypes().subscribe({
        next: (types: any[]) => {
          this.actypeList = types;
          console.log('Account types loaded:', this.actypeList);
          
          // ตั้งค่าเริ่มต้นสำหรับ accountType (เลือกประเภทแรก)
          if (this.actypeList.length > 0) {
            this.transferForm.accountType = this.actypeList[0].accType;
          }
          
          this.cdRef.detectChanges();
        },
        error: (err: any) => console.error('Error loading account types:', err)
      });
    } else {
      // ถ้ามีข้อมูลแล้ว ให้ตั้งค่าเริ่มต้น
      if (this.actypeList.length > 0 && !this.transferForm.accountType) {
        this.transferForm.accountType = this.actypeList[0].accType;
      }
    }

    // เปลี่ยนไปหน้าโอนหุ้น
    this.activeView = 'transfers';
    this.cdRef.detectChanges();
  }


    
  onAddPerson() {
    if (!this.transferForm.idCard.trim()) {
      Swal.fire({
        title: 'ข้อผิดพลาด!',
        text: 'กรุณากรอกเลขบัตรแสดงตน',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    // แสดง loading
    this.loading = true;

    // เรียก API เพื่อค้นหาข้อมูลผู้รับโอน
    const payload = { cusId: this.transferForm.idCard };
    
    this.customerService.getCustomer(payload).subscribe({
      next: (response: any) => {
        this.loading = false;
        console.log('response', response);
                 if (response && response.customer) {
           const customerData = response.customer;
           
           // เก็บข้อมูลผู้รับโอน
           this.foundUser = {
             idCard: customerData.cusiD,
             title: this.getTitleName(customerData.titleCode),
             firstName: customerData.cusFName,
             lastName: customerData.cusLName,
             fullName: `${this.getTitleName(customerData.titleCode)}${customerData.cusFName} ${customerData.cusLName}`,
             address: customerData.address || '',
             phone: customerData.phonE_MOBILE || '',
             position: customerData.cusDESCg || '',
             salary: customerData.cusTAX || '',
             branchName: customerData.brCode || '',
             staDesc: customerData.stkSTATUS || '',
             cusCode: customerData.cusCODE || '',
             email: customerData.email || ''
           };
      
      // เติมข้อมูลในฟอร์ม
           this.transferForm.title = this.getTitleName(customerData.titleCode);
           this.transferForm.firstName = customerData.cusFName;
           this.transferForm.lastName = customerData.cusLName;
          
    } else {
      this.foundUser = null;
          Swal.fire({
            title: 'ไม่พบข้อมูล',
            text: 'ไม่พบข้อมูลผู้รับโอน กรุณาตรวจสอบเลขบัตรแสดงตน',
            icon: 'warning',
            confirmButtonText: 'ตกลง'
          });
        }
        
        this.cdRef.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error searching customer:', error);
        
        this.foundUser = null;
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: 'ไม่สามารถค้นหาข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
        
        this.cdRef.detectChanges();
      }
    });
  }

  onRemoveUser() {
    this.foundUser = null;
    this.transferForm.title = '';
    this.transferForm.firstName = '';
    this.transferForm.lastName = '';
    this.transferForm.salary = '';
    this.transferForm.address = '';
    this.transferForm.position = '';
    this.transferForm.memberId = '';
    this.transferForm.shareAmount = 0;
    this.transferForm.payType = '';
    this.transferForm.accountType = '';
    this.transferForm.accountNumber = '';
    this.transferForm.accountName = '';
  }

  // เพิ่มผู้รับโอนคนใหม่
  addRecipient() {
    let missingFields: string[] = [];
    
    // ตรวจสอบข้อมูลก่อนเพิ่มผู้รับโอน
    if (!this.transferForm.reason) {
      missingFields.push('เหตุผลการโอนหุ้น');
    }

    if (!this.foundUser) {
      missingFields.push('ผู้รับโอน');
    }

    if (!this.isShareAmountConfirmed) {
      missingFields.push('การยืนยันจำนวนหุ้น');
    }

    if (!this.transferForm.payType) {
      missingFields.push('วิธีการรับเงินปันผล');
    }

    // ตรวจสอบจำนวนหุ้นรวมไม่เกินจำนวนหุ้นทั้งหมด
    const totalShares = this.selectStockTransfer?.unit || 0;
    const currentUsedShares = this.getUsedShares();
    const newTotalShares = currentUsedShares + this.transferForm.shareAmount;
    
    if (newTotalShares > totalShares) {
      Swal.fire({
        title: 'ข้อผิดพลาด!',
        text: `จำนวนหุ้นรวมเกินจำนวนหุ้นทั้งหมด (${totalShares} หุ้น)`,
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    // ตรวจสอบข้อมูลบัญชีถ้าเลือกโอนเข้าบัญชี
    if (this.transferForm.payType === '001') {
      if (!this.transferForm.accountNumber) {
        missingFields.push('เลขที่บัญชี');
      }
      if (!this.transferForm.accountName) {
        missingFields.push('ชื่อบัญชี');
      }
    }

    // ถ้ามีข้อมูลที่ขาดหายไป
    if (missingFields.length > 0) {
      Swal.fire({
        title: 'ข้อมูลไม่ครบถ้วน!',
        html: `
          <div class="text-left">
            <p class="mb-3">กรุณากรอกข้อมูลให้ครบถ้วนก่อนเพิ่มผู้รับโอน:</p>
            <ul class="list-disc list-inside text-red-600">
              ${missingFields.map(field => `<li>${field}</li>`).join('')}
            </ul>
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      });
      
      // ไฮไลท์ช่องที่ยังไม่ได้ใส่
      this.highlightMissingFields(missingFields);
      return;
    }

    // เพิ่มผู้รับโอนคนใหม่ลงในรายการ
    const newRecipient = {
      ...this.foundUser,
      shareAmount: this.transferForm.shareAmount,
      payType: this.transferForm.payType,
      accountType: this.transferForm.accountType,
      accountNumber: this.transferForm.accountNumber,
      accountName: this.transferForm.accountName,
      reason: this.transferForm.reason // เพิ่มเหตุผลการโอน
    };

    this.transferRecipients.push(newRecipient);
    
    // Log ข้อมูลผู้รับโอนที่เพิ่ม
    console.log('📋 เพิ่มผู้รับโอนคนใหม่:', newRecipient);
    console.log('📊 รายการผู้รับโอนทั้งหมด:', this.transferRecipients);
    console.log('📈 จำนวนผู้รับโอน:', this.transferRecipients.length);
    console.log('💰 จำนวนหุ้นรวม:', this.transferRecipients.reduce((sum, r) => sum + (r.shareAmount || 0), 0));
    
    // รีเซ็ทกระบวนการกลับไปใหม่
    this.resetTransferProcess();
    
    Swal.fire({
      title: 'สำเร็จ!',
      text: 'เพิ่มผู้รับโอนเรียบร้อยแล้ว',
      icon: 'success',
      confirmButtonText: 'ตกลง'
    });
  }

  // รีเซ็ทกระบวนการกลับไปใหม่
  resetTransferProcess() {
    // ล้างข้อมูลฟอร์มสำหรับผู้รับโอนคนถัดไป
    this.transferForm.idCard = '';
    this.foundUser = null;
    
    // รีเซ็ทการยืนยันจำนวนหุ้น
    this.isShareAmountConfirmed = false;
    
    // ตั้งจำนวนหุ้นเป็น 0 สำหรับผู้รับรายใหม่
    this.transferForm.shareAmount = 0;
    
    // ล้างข้อมูลการรับเงินปันผล
    this.transferForm.payType = '';
    this.transferForm.accountNumber = '';
    this.transferForm.accountName = '';
  }

  // ลบผู้รับโอน
  removeRecipient(index: number) {
    const removedRecipient = this.transferRecipients[index];
    this.transferRecipients.splice(index, 1);
    
    // Log ข้อมูลผู้รับโอนที่ลบ
    console.log('🗑️ ลบผู้รับโอน:', removedRecipient);
    console.log('📊 รายการผู้รับโอนที่เหลือ:', this.transferRecipients);
    console.log('📈 จำนวนผู้รับโอนที่เหลือ:', this.transferRecipients.length);
    console.log('💰 จำนวนหุ้นรวมที่เหลือ:', this.transferRecipients.reduce((sum, r) => sum + (r.shareAmount || 0), 0));
  }

  // แก้ไขข้อมูลผู้รับโอน
  editRecipient(index: number) {
    const recipient = this.transferRecipients[index];
    
    // Log ข้อมูลผู้รับโอนที่จะแก้ไข
    console.log('✏️ แก้ไขผู้รับโอน:', recipient);
    console.log('📋 ดัชนีผู้รับโอน:', index);
    
    // นำข้อมูลผู้รับโอนมาใส่ในฟอร์ม
    this.transferForm.idCard = recipient.idCard;
    this.foundUser = {
      cusId: recipient.cusId,
      fullName: recipient.fullName,
      idCard: recipient.idCard,
      phone: recipient.phone,
      title: recipient.title,
      taxId: recipient.taxId,
      branchCode: recipient.branchCode,
      status: recipient.status
    };
    this.transferForm.shareAmount = recipient.shareAmount;
    this.transferForm.payType = recipient.payType;
    this.transferForm.accountType = recipient.accountType;
    this.transferForm.accountNumber = recipient.accountNumber;
    this.transferForm.accountName = recipient.accountName;
    
    // เซ็ตสถานะยืนยันจำนวนหุ้น
    this.isShareAmountConfirmed = true;
    
    // ลบผู้รับโอนออกจากรายการ (เพราะจะเพิ่มใหม่หลังจากแก้ไข)
    this.transferRecipients.splice(index, 1);
    
    // Log สถานะหลังจากแก้ไข
    console.log('📝 ข้อมูลฟอร์มหลังจากแก้ไข:', this.transferForm);
    console.log('👤 ข้อมูลผู้ใช้ที่พบ:', this.foundUser);
    console.log('📊 รายการผู้รับโอนที่เหลือ:', this.transferRecipients);
    
    // แสดงข้อความแจ้งเตือน
    Swal.fire({
      title: 'แก้ไขข้อมูลผู้รับโอน',
      text: `ต้องการแก้ไขข้อมูลผู้รับโอน ${recipient.fullName} ใช่หรือไม่?`,
      icon: 'info',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    });
  }

  // แปลงรหัสเหตุผลการโอนเป็นข้อความ
  getReasonText(reasonCode: string): string {
    if (!reasonCode) return '-';
    
    const reason = this.remcodeList.find(r => r.remCode === reasonCode);
    return reason ? reason.remDesc : reasonCode;
  }

  // แปลงรหัสวิธีการรับเงินปันผลเป็นข้อความ
  getPayTypeText(payTypeCode: string | undefined): string {
    if (!payTypeCode) return '-';
    
    const payType = this.payTypes.find(p => p.payType === payTypeCode);
    return payType?.payDesc || payTypeCode || '-';
  }

  // กลับไปแก้ไข
  goBackToEdit() {
    this.activeView = 'transfers';
  }

  // กลับหน้าแรก
  goBackToSearch() {
    this.resetAllData();
    this.activeView = 'search';
  }

  onConfirmShareAmount() {
    if (!this.transferForm.shareAmount || this.transferForm.shareAmount <= 0) {
      Swal.fire({
        title: 'ข้อผิดพลาด!',
        text: 'กรุณากรอกจำนวนหุ้นที่ต้องการโอน',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    // คำนวณจำนวนหุ้นที่เหลืออยู่
    const totalShares = this.selectStockTransfer?.unit || 0;
    const usedShares = this.transferRecipients.reduce((sum, recipient) => sum + (recipient.shareAmount || 0), 0);
    const remainingShares = totalShares - usedShares;

    if (this.transferForm.shareAmount > remainingShares) {
      Swal.fire({
        title: 'ข้อผิดพลาด!',
        text: `จำนวนหุ้นคงเหลือที่สามารถโอนได้ ${remainingShares} หุ้น`,
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    // ล็อคจำนวนหุ้นทันทีโดยไม่ต้องมี alert
    this.isShareAmountConfirmed = true;
    
    // ไม่ต้องล้างข้อมูลผู้รับโอน เพราะต้องการให้อยู่หน้าเดิมเพื่อเพิ่มผู้รับโอนคนถัดไป
    // this.transferForm.idCard = '';
    // this.foundUser = null;
  }

  onEditShareAmount() {
    // ปลดล็อคเพื่อให้แก้ไขจำนวนหุ้นได้อีกครั้ง
    this.isShareAmountConfirmed = false;
  }

  onSaveTransferRecord() {
    // ตรวจสอบว่ามีรายการผู้รับโอนหรือไม่
    if (this.transferRecipients.length === 0) {
      Swal.fire({
        title: 'ไม่มีรายการผู้รับโอน!',
        text: 'กรุณาเพิ่มผู้รับโอนก่อนบันทึก',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    // แสดง alert แจ้งเตือนการทำเรื่องโอนหุ้น
    Swal.fire({
      title: 'ยืนยันการทำเรื่องโอนหุ้น',
      html: `
        <div class="text-left">
          <p class="mb-3">คุณต้องการทำเรื่องโอนหุ้นให้กับ:</p>
          <ul class="list-disc list-inside text-blue-600 mb-3">
            ${this.transferRecipients.map((recipient, index) => 
              `<li>${recipient.fullName} (${recipient.shareAmount} หุ้น)</li>`
            ).join('')}
          </ul>
          <p class="text-sm text-gray-600">รวมจำนวนผู้รับโอน: ${this.transferRecipients.length} คน</p>
          <p class="text-sm text-gray-600">รวมจำนวนหุ้น: ${this.transferRecipients.reduce((sum, r) => sum + (r.shareAmount || 0), 0)} หุ้น</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280'
    }).then((result) => {
      if (result.isConfirmed) {
        // เรียกฟังก์ชันโอนหุ้นทันทีเมื่อกดยืนยัน
        this.onConfirmFinalTransfer();
      }
    });
  }

  // ไฮไลท์ช่องที่ยังไม่ได้ใส่
  highlightMissingFields(missingFields: string[]) {
    // ล้างการไฮไลท์เดิม
    this.clearHighlight();
    
    // ไฮไลท์ช่องที่ขาดหายไป
    missingFields.forEach(field => {
      switch(field) {
        case 'เหตุผลการโอนหุ้น':
          this.highlightElement('reason');
          break;
        case 'ผู้รับโอน':
          this.highlightElement('idCard');
          break;
        case 'การยืนยันจำนวนหุ้น':
          this.highlightElement('shareAmount');
          break;
        case 'วิธีการรับเงินปันผล':
          this.highlightPayTypeSection();
          break;
        case 'เลขที่บัญชี':
          this.highlightElement('accountNumber');
          break;
        case 'ชื่อบัญชี':
          this.highlightElement('accountName');
          break;
      }
    });
  }

  // ไฮไลท์ element
  highlightElement(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('border-red-500', 'bg-red-50', 'animate-pulse');
    }
  }

  // ไฮไลท์ส่วนวิธีการรับเงินปันผล
  highlightPayTypeSection() {
    const payTypeSection = document.querySelector('[name="stkPayType"]')?.closest('.col-span-3');
    if (payTypeSection) {
      payTypeSection.classList.add('border-2', 'border-red-500', 'rounded', 'p-2', 'bg-red-50');
    }
  }

  // ล้างการไฮไลท์
  clearHighlight() {
    // ล้างการไฮไลท์จาก input fields
    document.querySelectorAll('input, select').forEach(element => {
      element.classList.remove('border-red-500', 'bg-red-50', 'animate-pulse');
    });
    
    // ล้างการไฮไลท์จากส่วนวิธีการรับเงินปันผล
    document.querySelectorAll('.col-span-3').forEach(element => {
      element.classList.remove('border-2', 'border-red-500', 'rounded', 'p-2', 'bg-red-50');
    });
  }

  // คำนวณจำนวนหุ้นที่เหลืออยู่
  getRemainingShares(): number {
    const totalShares = this.selectStockTransfer?.unit || 0;
    const usedShares = this.transferRecipients.reduce((sum, recipient) => sum + (recipient.shareAmount || 0), 0);
    return Math.max(0, totalShares - usedShares);
  }

  // คำนวณจำนวนหุ้นที่ใช้ไปแล้ว
  getUsedShares(): number {
    return this.transferRecipients.reduce((sum, recipient) => sum + (recipient.shareAmount || 0), 0);
  }

  prepareSummaryData() {
    // หาข้อมูลเหตุผลการโอน
    const selectedReason = this.remcodeList.find(rem => rem.remCode === this.transferForm.reason);
    
    // หาข้อมูลประเภทบัญชี
    const selectedAccountType = this.actypeList.find(acc => acc.accType === this.transferForm.accountType);
    
    this.transferSummary = {
      // ข้อมูลผู้โอน
      transferor: {
        cusId: this.selectedcustomer?.cusId || '',
        fullName: this.selectedcustomer?.fullName || '',
        branchName: this.selectedcustomer?.branchName || ''
      },
      
      // ข้อมูลหุ้นที่โอน
      stock: {
        stkNote: this.selectStockTransfer?.stkNote || '',
        stkStart: this.selectStockTransfer?.stkStart || '',
        stkEnd: this.selectStockTransfer?.stkEnd || '',
        totalUnit: this.selectStockTransfer?.unit || 0,
        transferUnit: this.transferForm.shareAmount || 0,
        unitValue: this.selectStockTransfer?.unitValue || 0,
        totalValue: (this.transferForm.shareAmount || 0) * (this.selectStockTransfer?.unitValue || 0)
      },
      
      receivers: [
        ...(this.foundUser ? [{
          idCard: this.transferForm.idCard || '',
          fullName: this.foundUser?.fullName || '',
          title: this.foundUser?.title || '',
          firstName: this.foundUser?.firstName || '',
          lastName: this.foundUser?.lastName || '',
          address: this.foundUser?.address || '',
          phone: this.foundUser?.phone || '',
          position: this.foundUser?.position || '',
          salary: this.foundUser?.salary || '',
          shareAmount: this.transferForm.shareAmount || 0,
          payType: this.transferForm.payType || '',
          accountType: this.transferForm.accountType || '',
          accountNumber: this.transferForm.accountNumber || '',
          accountName: this.transferForm.accountName || ''
        }] : []),
        // รายการผู้รับโอนที่เพิ่มแล้ว
        ...this.transferRecipients
      ],
      
      // ข้อมูลผู้รับโอนคนแรก (สำหรับ backward compatibility)
      receiver: {
        idCard: this.transferForm.idCard || '',
        fullName: this.foundUser?.fullName || '',
        title: this.foundUser?.title || '',
        firstName: this.foundUser?.firstName || '',
        lastName: this.foundUser?.lastName || '',
        address: this.foundUser?.address || '',
        phone: this.foundUser?.phone || '',
        position: this.foundUser?.position || '',
        salary: this.foundUser?.salary || ''
      },
      
      // ข้อมูลเหตุผลการโอน
      reason: {
        code: this.transferForm.reason,
        description: selectedReason?.remDesc || ''
      },
      
      // ข้อมูลการรับเงินปันผล
      dividend: {
        payType: this.transferForm.payType,
        payTypeDesc: this.transferForm.payType === '001' ? 'โอนเข้าบัญชีธนาคาร' : 'บริจาคให้ ธ.ก.ส.',
        accountType: this.transferForm.accountType,
        accountTypeDesc: selectedAccountType?.accDesc || '',
        accountNumber: this.transferForm.accountNumber || '',
        accountName: this.transferForm.accountName || ''
      },
      
      // วันที่และเวลา
      transferDate: new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      transferTime: new Date().toLocaleTimeString('th-TH')
    };
    
    // บังคับให้ Angular ตรวจสอบการเปลี่ยนแปลง
    this.cdRef.detectChanges();
  }

  onConfirmFinalTransfer() {
    // สร้าง payload สำหรับดูข้อมูล (ยังไม่ส่งไป API)
    const payload = this.buildTransferPayload();
    console.log('🚀 Payload ที่จะส่งไป backend:', payload);
    
    console.log('🔍 ก่อนเตรียมข้อมูล - activeView:', this.activeView);
    
    // เตรียมข้อมูลสำหรับหน้าสรุปผล
    this.prepareSummaryData();
    
    // ใช้ NgZone เพื่อบังคับให้ Angular รู้ว่ามีการเปลี่ยนแปลง
      // ไปหน้าสรุปผล
      this.activeView = 'summary';
      
      console.log('🔍 หลังเปลี่ยนหน้า - activeView:', this.activeView);
      console.log('🔍 transferSummary:', this.transferSummary);
      
      // บังคับให้ Angular ตรวจสอบการเปลี่ยนแปลง
      this.cdRef.detectChanges();
  }

  getTitleName(titleCode: string): string {
    // แปลง titleCode เป็นชื่อคำนำหน้า
    const titleMap: { [key: string]: string } = {
      '001': 'นาย',
      '002': 'นาง', 
      '003': 'นางสาว',
      '004': 'เด็กชาย',
      '005': 'เด็กหญิง',
      '006': 'ดร.',
      '007': 'ศ.ดร.',
      '008': 'รศ.ดร.',
      '009': 'ผศ.ดร.',
      '010': 'พล.อ.',
      '011': 'พล.ต.',
      '012': 'พล.ร.'
    };
    return titleMap[titleCode] || '';
  }

  buildTransferPayload() {
    // รวมรายการผู้รับโอนทั้งหมด
    const allRecipients = [
      // ผู้รับโอนคนปัจจุบัน (ถ้ามี)
      ...(this.foundUser ? [{
        idCard: this.foundUser.idCard,
        shareAmount: this.transferForm.shareAmount,
        accountType: this.transferForm.accountType,
        accountNumber: this.transferForm.accountNumber,
        accountName: this.transferForm.accountName,
        payType: this.transferForm.payType
      }] : []),
      // รายการผู้รับโอนที่เพิ่มแล้ว
      ...this.transferRecipients.map(recipient => ({
        idCard: recipient.idCard,
        shareAmount: recipient.shareAmount,
        accountType: recipient.accountType,
        accountNumber: recipient.accountNumber,
        accountName: recipient.accountName,
        payType: recipient.payType
      }))
    ];

    // สร้าง string lists ที่คั่นด้วย '|'
    const list_CUSid = allRecipients.map(r => r.idCard).join('|');
    const list_CUSun = allRecipients.map(r => r.shareAmount).join('|');
    const list_accTY = allRecipients.map(r => r.accountType).join('|');
    const list_accNO = allRecipients.map(r => r.accountNumber).join('|');
    const list_accNA = allRecipients.map(r => r.accountName).join('|');
    const list_payTY = allRecipients.map(r => r.payType).join('|');

    // สร้าง payload ตามรูปแบบที่ backend ต้องการ
    const payload = {
      TRF_CUSid: this.selectedcustomer?.cusId || '',
      TRF_stkNOTE: this.selectStockTransfer?.stkNote || '',
      TRF_stkSTA: this.selectStockTransfer?.stkStart || '',
      TRF_stkSTP: this.selectStockTransfer?.stkEnd || '',
      TRF_stkUNiTALL: this.selectStockTransfer?.unit || 0,
      
      TR2_RemCode: this.transferForm.reason,
      
      // รายการผู้รับโอนหลายคน
      TR2_LST_CUSid: list_CUSid,
      TR2_LST_CUSun: list_CUSun,
      TR2_LST_accTY: list_accTY,
      TR2_LST_accNO: list_accNO,
      TR2_LST_accNA: list_accNA,
      TR2_LST_payTY: list_payTY
    };

    // Log ข้อมูลที่จะส่งไป backend
    console.log('🚀 Payload ที่จะส่งไป backend:', payload);
    console.log('📋 รายการผู้รับโอนที่จะส่ง:', allRecipients);
    console.log('📊 สรุปข้อมูลการโอน:');
    console.log('   - ผู้โอน:', this.selectedcustomer?.cusId);
    console.log('   - หมายเลขใบหุ้น:', this.selectStockTransfer?.stkNote);
    console.log('   - เหตุผลการโอน:', this.transferForm.reason);
    console.log('   - จำนวนผู้รับโอน:', allRecipients.length);
    console.log('   - จำนวนหุ้นรวม:', allRecipients.reduce((sum, r) => sum + (r.shareAmount || 0), 0));

    return payload;
  }

  resetAllData() {
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
      address: '',
      position: '',
      memberId: '',
      shareAmount: 0,
      payType: '',
      accountType: this.actypeList.length > 0 ? this.actypeList[0].accType : '',
      accountNumber: '',
      accountName: ''
    };
    this.foundUser = null;
    this.isShareAmountConfirmed = false;
    this.transferSummary = null;
    this.selectStockTransfer = null;
    this.selectedcustomer = null;
    this.transferRecipients = [];
  }

  onCancelTransfer() {
    this.activeView = 'transfer';
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
      address: '',
      position: '',
      memberId: '',
      shareAmount: 0,
      payType: '',
      accountType: this.actypeList.length > 0 ? this.actypeList[0].accType : '',
      accountNumber: '',
      accountName: ''
    };
    this.foundUser = null;
    this.isShareAmountConfirmed = false;
    this.transferRecipients = [];
  }

    

  funcDetail(stkNote: string) {
    // TODO: Implement stock detail functionality if needed
    this.activeView = 'summary';
    this.cdRef.detectChanges();
    console.log('Stock detail for:', stkNote);
  }

  goBack() {
    this.transferList = [];
    this.selectStockTransfer = null;
    this.activeView = 'search';
  }
}
