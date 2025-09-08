import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchEditComponent } from '../search-edit/search-edit';
import { StockRequestService } from '../../../services/stock-request';
import { DataTransfer } from '../../../services/data-transfer';
import { Stocklost } from '../../../services/stocklost';
import { CustomerService } from '../../../services/customer';
import { CustomerStockService } from '../../../services/customer-stock-service';
import { StockService } from '../../../services/stock';
import Swal from 'sweetalert2';
import { MetadataService } from '../../../services/metadata';
import { SystemMetadata } from '../../../services/Metadata/system-metadata';

@Component({
  standalone: true,
  selector: 'app-cratenewsharecertificate',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // ✅ เพิ่มตัวนี้เพื่อใช้ Reactive Forms
    SearchEditComponent,
  ],
  templateUrl: './cratenewsharecertificate.html',
  styleUrl: './cratenewsharecertificate.css'
})
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

  reasonForm!: FormGroup; // ✅ ใช้ FormGroup
  remCodes: {
    remCode: string;
    remList: string;
    remDesc: string;
  }[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly cd: ChangeDetectorRef,
    private readonly StockRequestServer: StockRequestService,
    private readonly dataTransfer: DataTransfer,
    private readonly stockLostService: Stocklost,
    private readonly customerService: CustomerService,
    private readonly customerStockService: CustomerStockService,
    private readonly stockService: StockService,
    private readonly metaDataService: MetadataService,
    private readonly systemMedataaService: SystemMetadata
  ) { }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus('3');
    this.activeView = 'search';
    this.cd.detectChanges();
  }

  onShowdetail(stock: any) {
    console.log("ค่าที่ได้รับกลับมา: ", stock);
    this.setView(stock.view);
    this.onLoadStkLostList(stock.cusId);
    this.cd.detectChanges();
  }

  onLoadStkDetail(stkNote: string) {

  }

  onLoadStkLostList(cusiD: string) {
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
        this.stkLostList = res;
        console.log("res", res);
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Errors", err);
      }
    })

    const payloadCustomer = {
      cusId: cusiD
    }

    this.customerService.getCustomerDetail(payloadCustomer).subscribe({
      next: (res) => {
        this.customerData = res;
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Error", err);
      }
    })
  }

  setView(view: string) {
    this.activeView = view;
  }


  handleNewStockRequest(stkNote: string) {
    this.loading = true;
    this.activeView = "select";
    const payload = {
      stkNote: stkNote
    };
    this.stockService.getStockDetail(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.stockDetail = res;
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Error", err);
      }
    })
    this.systemMedataaService.remCode().subscribe({
      next: (res) => {
        const allowCode = ["0020", "0021"];
        this.remCodes = res.filter((item: any) => allowCode.includes(item.remCode));

        // ✅ สร้างฟอร์มใหม่พร้อมค่า default
        this.reasonForm = this.fb.group({
          remCode: [this.remCodes[0]?.remCode || '', Validators.required]
        });

        this.cd.detectChanges(); // เผื่อ view ยังไม่อัปเดต
      }
    });
  }

  onSubmitReason() {
    if (this.reasonForm.valid) {
      const selectedCode = this.reasonForm.value.remCode;
      const payloadNewLost = {
        StkRemCode: selectedCode,
        StkNOTE: this.stockDetail.stkNote,
        Act: 'UPDATE'
      }
      Swal.fire({
        icon: 'question',
        text: 'ยืนยัน ต้องการออกใบหุ้นใหม่ทดแทนใบหุ้นชำรุด/สูญหาย',
        confirmButtonText: "ตกลง",
        cancelButtonText: "ยกเลิก",
        showCancelButton: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.stockService.stockLost(payloadNewLost).subscribe({
            next: (res: any) => {
              console.log("Res", res);
              Swal.fire({
                icon: 'success',
                text: 'บันทึกเรียบร้อยแล้ว',
                timer: 3000,
                timerProgressBar: true,
              })
              this.activeView = 'search';
              this.customerData = '';
              this.cd.detectChanges();
            }, error: (err) => {
              console.log("เกิดข้อผิดพลาด", err);
            }
          })
        }
      })
    }
  }

  onCancelReason() {
    this.reasonForm.reset();
    this.activeView = 'search'; // หรือเปลี่ยนกลับหน้าเดิม
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
