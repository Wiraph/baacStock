import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockService, StockItem } from '../../../services/stock';
import { CustomerService } from '../../../services/customer';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stocks.html',
  // styleUrl: ['./stocks.css'],
})
/**
 * แสดงรายการใบหุ้นทั้งหมดของลูกค้าตาม `cusId` พร้อมข้อมูลลูกค้าแบบสรุป
 */
export class StocksComponent implements OnInit {
  @Input() cusId: string = '';
  @Input() hideHeader: boolean = false;
  @Output() back = new EventEmitter<string>();

  stockList: any[] = [];
  cusData: any = null;
  showTransferForm = false;
  selectedStock: StockItem | null = null;
  customerInfo: any = null;
  isLoading = false;

  constructor(
    private readonly stockService: StockService,
    private readonly customerService: CustomerService,
    private readonly cd: ChangeDetectorRef,
  ) { }

  /** โหลดข้อมูลใบหุ้นและข้อมูลลูกค้า เมื่อรับ `cusId` */
  ngOnInit(): void {
    if (this.cusId != '') {
      this.loadCustomerStock(this.cusId);
      this.loadCustomerInfo(this.cusId);
    }
  }

  /**
   * โหลดใบหุ้นทุกสถานะของลูกค้า ให้ได้รายการครบสำหรับแสดงผล
   */
  loadCustomerStock(cusiD: string) {
    this.isLoading = true;
    const payload = {
      GetDTL: 'bySTK@byCUS',
      STKno: '',
      CUSid: cusiD,
      CUSfn: '',
      CUSln: '',
      StkA: '',
      PGNum: 1,
      PGSize: 9999999
    };

    this.cd.detectChanges();
    this.customerService.searchCustomerStk(payload)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.stockList = Array.isArray(res) ? res : [];
          this.cd.detectChanges();
        },
        error: () => {
          this.stockList = [];
          this.cd.detectChanges();
          Swal.fire({ icon: 'error', title: 'โหลดรายการใบหุ้นไม่สำเร็จ', text: 'โปรดลองใหม่' });
        }
      });
  }

  /** โหลดข้อมูลลูกค้าแบบสรุปสำหรับแสดงหัวตาราง/รายละเอียด */
  loadCustomerInfo(cusiD: string) {
    this.isLoading = true;
    const cusPayload = { cusId: cusiD };

    this.cd.detectChanges();
    this.customerService.getCustomerDetail(cusPayload)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: (res: any) => {
          this.customerInfo = res ?? null;
          this.cd.detectChanges();
        },
        error: () => {
          this.customerInfo = null;
          this.cd.detectChanges();
          Swal.fire({ icon: 'error', title: 'โหลดข้อมูลลูกค้าไม่สำเร็จ', text: 'โปรดลองใหม่' });
        }
      });
  }

  /** แปลงวันที่ DATETIMEUP: YYYYMMDD-HHMMSS เป็นข้อความไทย */
  formatThaiDateTime(datetimeup: string): string {
    if (!datetimeup?.includes('-')) return '-';

    const [datePart, timePart] = datetimeup.split('-');
    if (datePart.length !== 8 || timePart.length !== 6) return '-';

    const year = +datePart.substring(0, 4);
    const month = +datePart.substring(4, 6) - 1;
    const day = +datePart.substring(6, 8);
    const hour = +timePart.substring(0, 2);
    const minute = +timePart.substring(2, 4);
    const second = +timePart.substring(4, 6);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return '-';

    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const pad = (n: number) => n < 10 ? '0' + n : n.toString();

    return `${day} ${thaiMonths[month]} ${year} ${pad(hour)}:${pad(minute)}:${pad(second)} น.`;
  }

  /** แก้ไขใบหุ้น (placeholder) */
  onEditStock() {
    Swal.fire({ icon: 'info', title: 'อยู่ระหว่างพัฒนา', text: 'ฟังก์ชันแก้ไขใบหุ้นยังไม่พร้อมใช้งาน' });
  }

  /** เปิดฟอร์มโอนใบหุ้น */
  onTransfer(stock: StockItem) {
    this.selectedStock = stock;
    this.showTransferForm = true;
  }

  /** ยกเลิกการโอน */
  cancelTransfer() {
    this.showTransferForm = false;
    this.selectedStock = null;
  }

  /** กลับหน้าค้นหา */
  goBack() {
    this.back.emit('search');
  }
}
