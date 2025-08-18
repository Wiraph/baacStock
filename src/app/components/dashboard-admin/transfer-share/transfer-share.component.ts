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
import { StocktransferService } from '../../../services/stocktransfer';

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
    private readonly stocktransferService: StocktransferService,
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
    // ตรวจสอบสถานะใบหุ้น
    if (item.stDESC !== 'ปกติ') {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่สามารถโอนหุ้นได้',
        text: 'หุ้นใบนี้ไม่สามารถทำการโอนได้ เนื่องจากสถานะไม่ใช่ปกติ'
      });
      return;
    }

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
    
    // 🔍 ตรวจสอบ 1: ไม่ให้โอนหุ้นให้กับหมายเลขหุ้นเดี่ยวกับหุ้นโอน
    if (cusId === this.selectedcustomer?.cusId) {
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถโอนหุ้นได้',
        text: 'ไม่สามารถโอนหุ้นให้กับหมายเลขหุ้นเดี่ยวกับหุ้นโอนได้'
      });
      return;
    }

    // 🔍 ตรวจสอบ 2: ไม่ให้โอนหุ้นให้กับเลขที่อยู่ในรายการอยู่แล้ว
    const existingTransfers = this.transferForm.value.transfers || [];
    const isAlreadyInList = existingTransfers.some((transfer: any) => transfer.CUSid === cusId);
    
    if (isAlreadyInList) {
      Swal.fire({
        icon: 'warning',
        title: 'เลขบัตรแสดงตนซ้ำ',
        text: 'เลขบัตรแสดงตนนี้อยู่ในรายการผู้รับโอนอยู่แล้ว'
      });
      return;
    }

    // 🔍 ตรวจสอบ 3: ไม่ให้เพิ่มผู้รับโอนถ้าหุ้นหมดแล้ว
    const availableShares = this.selectedcustomer?.stkUnit || 0;
    const totalUsedShares = existingTransfers.reduce((sum: number, transfer: any) => {
      return sum + (transfer.CUSun || 0);
    }, 0);
    
    if (totalUsedShares >= availableShares) {
      Swal.fire({
        icon: 'warning',
        title: 'จำนวนหุ้นไม่เพียงพอ',
        text: `จำนวนหุ้นที่ใช้ไปแล้ว (${totalUsedShares.toLocaleString()} หุ้น) เท่ากับหรือเกินจำนวนหุ้นที่มี (${availableShares.toLocaleString()} หุ้น) ไม่สามารถเพิ่มผู้รับโอนได้อีก`
      });
      return;
    }

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
        
        // ล้างค่าในช่องค้นหา
        this.searchForm.patchValue({
          stkOWNiD: ''
        });
        
                this.cdRef.detectChanges();
          },
          error: (err) => {
        console.log("Error", err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่พบข้อมูลลูกค้าหรือเกิดข้อผิดพลาดในการค้นหา'
        });
      }
    })
  }

  removeAt(index: number) {
    this.transfers.removeAt(index);
  }

  // 🔍 ตรวจสอบจำนวนหุ้นที่สามารถโอนได้
  checkTransferableShares(): { canTransfer: boolean; totalRequested: number; availableShares: number; message: string } {
    const transfers = this.transferForm.value.transfers || [];
    const availableShares = this.selectedcustomer?.stkUnit || 0;
    
    // คำนวณจำนวนหุ้นที่ต้องการโอนทั้งหมด
    const totalRequested = transfers.reduce((sum: number, transfer: TransferItem) => {
      return sum + (transfer.CUSun || 0);
    }, 0);
    
    // ตรวจสอบว่าจำนวนหุ้นที่ต้องการโอนไม่เกินจำนวนหุ้นที่มี
    const canTransfer = totalRequested <= availableShares;
    
    let message = '';
    if (!canTransfer) {
      message = `จำนวนหุ้นที่ต้องการโอน (${totalRequested.toLocaleString()} หุ้น) เกินกว่าจำนวนหุ้นที่มี (${availableShares.toLocaleString()} หุ้น)`;
    } else if (totalRequested === 0) {
      message = 'กรุณาระบุจำนวนหุ้นที่ต้องการโอน';
    } else {
      message = `สามารถโอนได้ ${totalRequested.toLocaleString()} หุ้น จาก ${availableShares.toLocaleString()} หุ้น (เหลือ ${(availableShares - totalRequested).toLocaleString()} หุ้น)`;
    }
    
    return { canTransfer, totalRequested, availableShares, message };
  }

  // 🔍 คำนวณจำนวนหุ้นที่เหลือสำหรับคนถัดไป
  getRemainingSharesForNextPerson(currentIndex: number): number {
    const transfers = this.transferForm.value.transfers || [];
    const availableShares = this.selectedcustomer?.stkUnit || 0;
    
    // คำนวณจำนวนหุ้นที่ใช้ไปแล้ว (ไม่รวมคนปัจจุบัน)
    const usedShares = transfers.reduce((sum: number, transfer: TransferItem, index: number) => {
      if (index < currentIndex) {
        return sum + (transfer.CUSun || 0);
      }
      return sum;
    }, 0);
    
    // คำนวณจำนวนหุ้นที่เหลือ
    const remainingShares = availableShares - usedShares;
    
    return Math.max(0, remainingShares);
  }



  // 🔍 ฟังก์ชันสำหรับควบคุมจำนวนหุ้นแบบ real-time
  onShareAmountChange(currentIndex: number) {
    const transfers = this.transferForm.value.transfers || [];
    const availableShares = this.selectedcustomer?.stkUnit || 0;
    let totalUsedShares = 0;
    
    // คำนวณจำนวนหุ้นที่ใช้ไปแล้ว (ไม่รวมคนปัจจุบัน)
    for (let i = 0; i < transfers.length; i++) {
      if (i < currentIndex) {
        totalUsedShares += transfers[i].CUSun || 0;
      }
    }
    
    // ตรวจสอบจำนวนหุ้นของคนปัจจุบัน
    const currentShares = transfers[currentIndex]?.CUSun || 0;
    const remainingForCurrent = availableShares - totalUsedShares;
    
    if (currentShares > remainingForCurrent) {
      // รีเซ็ตค่ากลับไปเป็นค่าสูงสุดที่สามารถใส่ได้
      const transferControl = this.transfers.at(currentIndex);
      if (transferControl) {
        transferControl.patchValue({
          CUSun: Math.max(0, remainingForCurrent)
        });
      }
    }

    // 🔍 ตรวจสอบและปรับค่าคนอื่นๆ ที่อยู่หลังคนปัจจุบัน
    this.adjustSubsequentRecipients(currentIndex);
  }

  // 🔍 ปรับค่าคนอื่นๆ ที่อยู่หลังคนปัจจุบัน
  adjustSubsequentRecipients(changedIndex: number) {
    const transfers = this.transferForm.value.transfers || [];
    const availableShares = this.selectedcustomer?.stkUnit || 0;
    
    // คำนวณจำนวนหุ้นที่ใช้ไปแล้วจนถึงคนที่เปลี่ยน
    let totalUsedShares = 0;
    for (let i = 0; i <= changedIndex; i++) {
      totalUsedShares += transfers[i]?.CUSun || 0;
    }
    
    // ปรับค่าคนที่อยู่หลัง
    for (let i = changedIndex + 1; i < transfers.length; i++) {
      const remainingForNext = availableShares - totalUsedShares;
      const currentShares = transfers[i]?.CUSun || 0;
      
      // ถ้าจำนวนหุ้นปัจจุบันเกินจำนวนที่เหลือ ให้รีเซ็ต
      if (currentShares > remainingForNext) {
        const transferControl = this.transfers.at(i);
        if (transferControl) {
          transferControl.patchValue({
            CUSun: Math.max(0, remainingForNext)
          });
        }
      }
      
      totalUsedShares += transfers[i]?.CUSun || 0;
    }
  }

  submitAll() {

    if (this.transferReason == '') {
      Swal.fire("Error", "กรุณาเลือกเหตุในการโอนหุ้น", "error");
      return;
    }

    // 🔍 ตรวจสอบว่ามีผู้รับโอนหรือไม่
    const transfers = this.transferForm.value.transfers || [];
    if (transfers.length === 0) {
      Swal.fire("Error", "กรุณาเพิ่มผู้รับโอนอย่างน้อย 1 คน", "error");
      return;
    }

    // 🔍 ตรวจสอบความถูกต้องของข้อมูล
    if (this.transferForm.valid) {
      // ตรวจสอบซ้ำอีกครั้งว่ามีการโอนหุ้นให้กับตัวเองหรือไม่
      const hasSelfTransfer = transfers.some((t: TransferItem) => t.CUSid === this.selectedcustomer?.cusId);
      if (hasSelfTransfer) {
      Swal.fire({
        icon: 'error',
          title: 'ไม่สามารถโอนหุ้นได้',
          text: 'ไม่สามารถโอนหุ้นให้กับหมายเลขหุ้นเดี่ยวกับหุ้นโอนได้'
      });
      return;
    }

             // ตรวจสอบว่ามีเลขบัตรแสดงตนซ้ำหรือไม่
       const cusIds = transfers.map((t: TransferItem) => t.CUSid);
       const uniqueCusIds = [...new Set(cusIds)];
       if (cusIds.length !== uniqueCusIds.length) {
         Swal.fire({
           icon: 'warning',
           title: 'ข้อมูลซ้ำ',
           text: 'พบเลขบัตรแสดงตนซ้ำในรายการผู้รับโอน กรุณาตรวจสอบและลบรายการที่ซ้ำออก'
         });
         return;
       }

       // 🔍 ตรวจสอบ 3: จำนวนหุ้นที่สามารถโอนได้
       const shareCheck = this.checkTransferableShares();
       if (!shareCheck.canTransfer) {
      Swal.fire({
        icon: 'error',
           title: 'จำนวนหุ้นเกิน',
           text: shareCheck.message,
           confirmButtonText: 'เข้าใจแล้ว'
         });
         return;
       }

       // ตรวจสอบว่ามีการระบุจำนวนหุ้นหรือไม่
       if (shareCheck.totalRequested === 0) {
         Swal.fire({
           icon: 'warning',
           title: 'กรุณาระบุจำนวนหุ้น',
           text: 'กรุณาระบุจำนวนหุ้นที่ต้องการโอนให้กับผู้รับโอน'
      });
      return;
    }



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
      
      // แสดงข้อความยืนยัน
    Swal.fire({
        icon: 'success',
        title: 'ข้อมูลถูกต้อง',
        text: `พร้อมบันทึกการโอนหุ้นให้กับ ${transfers.length} คน`,
      showCancelButton: true,
        confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
          // TODO: เรียก API บันทึกข้อมูล
          this.stocktransferService.transferRequest(payload).subscribe({
            next: (res) => {
              console.log("Success", res);
              Swal.fire({
                icon: 'success',
                title: 'บันทึกสำเร็จ',
                text: 'การโอนหุ้นได้รับการบันทึกเรียบร้อยแล้ว',
                confirmButtonText: 'ตกลง'
              });
            }, error: (err) => {
              console.log("Fail", err);
              Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
                confirmButtonText: 'ตกลง'
              });
            }
          })
          console.log('บันทึกข้อมูล:', payload);
        }
      });
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
