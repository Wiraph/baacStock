import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CustomerService } from '../../../services/customer';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-stock-table-detail',
  imports: [CommonModule],
  templateUrl: './stock-table-detail.html',
  styleUrls: ['./stock-table-detail.css'],
})
/**
 * แสดงรายละเอียดใบหุ้นของลูกค้า และโหลดข้อมูลลูกค้าเพิ่มเติมจาก cusId
 */
export class StockTableDetailComponent implements OnInit, OnChanges {
  @Input() stockData: any;
  @Output() requestNewStock = new EventEmitter<any>();

  customerData: any = null;
  selectedCustomer: any = null;
  isLoading = false;

  constructor(
    private readonly customerService: CustomerService,
    private readonly cd: ChangeDetectorRef
  ) { }

  /**
   * เริ่มต้นโหลดข้อมูลลูกค้าเมื่อมี cusId ใน `stockData`
   */
  ngOnInit(): void {
    if (this.stockData?.cusId) {
      this.loadCustomer(this.stockData.cusId);
    }
  }

  /**
   * โหลดข้อมูลใหม่เมื่ออินพุต `stockData` มีการเปลี่ยนแปลง
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stockData'] && this.stockData?.cusId) {
      this.loadCustomer(this.stockData.cusId);
    }
  }

  /**
   * เรียก API เพื่อโหลดข้อมูลลูกค้าจาก cusId และอัปเดตสถานะ
   */
  private loadCustomer(cusId: string): void {
    this.isLoading = true;
    const payload = { cusId };
    this.cd.detectChanges();

    this.customerService.getCustomer(payload)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          const list = Array.isArray(res) ? res : [];
          this.customerData = list;
          this.selectedCustomer = list.length > 0 ? list[0] : null;
          this.cd.detectChanges();
        },
        error: () => {
          Swal.fire({ icon: 'error', title: 'โหลดข้อมูลลูกค้าไม่สำเร็จ', text: 'โปรดลองใหม่' });
        }
      });
  }
  
  /**
   * แจ้งเหตุให้คอมโพเนนต์ภายนอกเพื่อออกใบหุ้นใหม่
   */
  handleRequestNewStock(stock: any): void {
    this.requestNewStock.emit(stock);
  }

  /**
   * แปลงวันที่แบบ YYYYMMDD-HHMMSS เป็นรูปแบบไทยสำหรับแสดงผล
   */
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

  /** trackBy เริ่มต้น กรณีวนลูปในเทมเพลต */
  trackByIndex(index: number): number { return index; }
}
