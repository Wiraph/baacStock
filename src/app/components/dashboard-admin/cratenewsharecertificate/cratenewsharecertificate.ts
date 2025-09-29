import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchEditComponent } from '../search-edit/search-edit';
import { DataTransfer } from '../../../services/data-transfer';
import { CustomerService } from '../../../services/customer';
import { StockService } from '../../../services/stock';
import Swal from 'sweetalert2';
import { SystemMetadata } from '../../../services/Metadata/system-metadata';

@Component({
  standalone: true,
  selector: 'app-cratenewsharecertificate',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SearchEditComponent,
  ],
  templateUrl: './cratenewsharecertificate.html',
  styleUrl: './cratenewsharecertificate.css'
})
/**
 * ออกใบหุ้นใหม่ทดแทนใบหุ้นชำรุด/สูญหาย (Create New Share Certificate)
 * ฟลว์: รับผลการค้นหาจาก Search → โหลดรายการชำรุด/สูญหาย → เลือกใบหุ้น → เลือกเหตุผล → ยืนยันและบันทึก
 */
export class CratenewsharecertificateComponent implements OnInit {
  @Input() inputShareCertificate!: string;
  internalViewName = "create-new-share-certificate";
  activeView: string = '';
  selectedStock: any;
  selectedRequest: any;
  stkLostList: any[] = [];
  customerData: any = "";
  stockDetail: any = '';
  loading = false;

  reasonForm!: FormGroup;
  remCodes: {
    remCode: string;
    remList: string;
    remDesc: string;
  }[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly cd: ChangeDetectorRef,
    private readonly dataTransfer: DataTransfer,
    private readonly customerService: CustomerService,
    private readonly stockService: StockService,
    private readonly systemMedataaService: SystemMetadata
  ) { }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus('3');
    this.activeView = 'search';
    this.cd.detectChanges();
  }

  /** รับข้อมูลจาก SearchEdit → เปลี่ยนมุมมองและโหลดรายการใบหุ้นชำรุด/สูญหาย */
  onShowdetail(stock: any) {
    this.setView(stock.view);
    this.onLoadStkLostList(stock.cusId);
    this.cd.detectChanges();
  }

  onLoadStkDetail(stkNote: string) {
    // reserved for future use (โหลดรายละเอียดใบหุ้นเพิ่มเติม)
  }

  /** โหลดรายการใบหุ้นชำรุด/สูญหายของลูกค้า พร้อมข้อมูลลูกค้า */
  onLoadStkLostList(cusiD: string) {
    this.loading = true;
    const payloadSearch = {
      GetDTL: 'bySTK@bySTK-LOS',
      STKno: '',
      CUSid: cusiD,
      CUSfn: '',
      CUSln: '',
      stkA: '1',
      PGNum: 1,
      PGSize: 9999999
    };

    this.customerService.searchCustomerStk(payloadSearch).subscribe({
      next: (res) => {
        this.stkLostList = Array.isArray(res) ? res : [];
      }, error: () => {
        Swal.fire({ icon: 'error', title: 'ดึงรายการใบหุ้นไม่สำเร็จ', text: 'โปรดลองใหม่' });
      }, complete: () => {
        this.cd.detectChanges();
      }
    })

    const payloadCustomer = { cusId: cusiD };

    this.customerService.getCustomerDetail(payloadCustomer).subscribe({
      next: (res) => {
        this.customerData = res;
      }, error: () => {
        Swal.fire({ icon: 'error', title: 'ดึงข้อมูลลูกค้าไม่สำเร็จ', text: 'โปรดลองใหม่' });
      }, complete: () => {
        this.loading = false;
        this.cd.detectChanges();
      }
    })
  }

  setView(view: string) {
    this.activeView = view;
  }

  /** เลือกใบหุ้น → โหลดรายละเอียด และโหลดเหตุผล (remCode) ที่อนุญาต */
  handleNewStockRequest(stkNote: string) {
    this.loading = true;
    this.activeView = "select";
    const payload = { stkNote };
    this.stockService.getStockDetail(payload).subscribe({
      next: (res) => {
        this.stockDetail = res;
      }, error: () => {
        Swal.fire({ icon: 'error', title: 'ดึงรายละเอียดใบหุ้นไม่สำเร็จ', text: 'โปรดลองใหม่' });
      }, complete: () => {
        this.loading = false;
        this.cd.detectChanges();
      }
    })

    this.systemMedataaService.remCode().subscribe({
      next: (res) => {
        const allowCode = ["0020", "0021"]; // เฉพาะเหตุผลที่อนุญาต
        this.remCodes = (Array.isArray(res) ? res : []).filter((item: any) => allowCode.includes(item.remCode));
        // สร้างฟอร์มใหม่พร้อมค่า default
        this.reasonForm = this.fb.group({ remCode: [this.remCodes[0]?.remCode || '', Validators.required] });
        this.cd.detectChanges();
      }, error: () => {
        Swal.fire({ icon: 'error', title: 'โหลดเหตุผลไม่สำเร็จ', text: 'โปรดลองใหม่' });
      }
    });
  }

  /** บันทึกเหตุผลการออกใบหุ้นใหม่ (UPDATE) */
  onSubmitReason() {
    if (!this.reasonForm?.valid) {
      Swal.fire({ icon: 'warning', text: 'กรุณาเลือกเหตุผลก่อนบันทึก' });
      return;
    }
    const selectedCode = this.reasonForm.value.remCode;
    const payloadNewLost = {
      StkRemCode: selectedCode,
      StkNOTE: this.stockDetail.stkNote,
      Act: 'UPDATE'
    };
    Swal.fire({
      icon: 'question',
      text: 'ยืนยัน ต้องการออกใบหุ้นใหม่ทดแทนใบหุ้นชำรุด/สูญหาย',
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
      showCancelButton: true
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.loading = true;
      this.stockService.stockLost(payloadNewLost).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', text: 'บันทึกเรียบร้อยแล้ว', timer: 3000, timerProgressBar: true });
          this.activeView = 'search';
          this.customerData = '';
          this.cd.detectChanges();
        }, error: () => {
          Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ', text: 'โปรดลองใหม่' });
        }, complete: () => {
          this.loading = false;
          this.cd.detectChanges();
        }
      })
    })
  }

  onCancelReason() {
    this.reasonForm.reset();
    this.activeView = 'search';
  }

  /** แปลง DATETIME (25680724-103534) เป็นรูปแบบไทยอ่านง่าย */
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

    if (year > 2500) year = year - 543; // แปลง พ.ศ. → ค.ศ.

    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const pad = (n: number) => n < 10 ? '0' + n : n.toString();

    return `${day} ${thaiMonths[month]} ${year + 543} ${pad(hour)}:${pad(minute)}:${pad(second)} น.`;
  }
}
