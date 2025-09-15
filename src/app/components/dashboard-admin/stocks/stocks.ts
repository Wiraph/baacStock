import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockService, StockItem } from '../../../services/stock';
import { CustomerService } from '../../../services/customer';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stocks.html',
  // styleUrl: ['./stocks.css'],
})
export class StocksComponent implements OnInit {
  @Input() cusId: string = '';
  @Input() hideHeader: boolean = false;
  @Output() back = new EventEmitter<string>();


  stockList: any[] = [];
  cusData: any = null;
  showTransferForm = false;
  selectedStock: StockItem | null = null;


  constructor(
    private readonly stockService: StockService,
    private readonly customerService: CustomerService,
    private readonly cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    if (this.cusId != '') {
      console.log("CudId ที่ถูกส่งมา ", this.cusId);
      this.loadCustomerStock(this.cusId);
    }
  }

  loadCustomerStock(cusiD: string) {
    const payload = {
      GetDtl: "bySTK@byCUS",
      StkNo: "",
      CusId: cusiD,
      CusFirstName: "",
      CusLastName: "",
      StkA: "1",
      PageNumber: 1,
      PageSize: 9999999
    };

    this.customerService.searchCustomerStk(payload).subscribe({
      next: (res) => {
        console.log('📊 ข้อมูลใบหุ้นที่ได้รับจาก API:', res);
        console.log('📋 จำนวนรายการ:', res?.length || 0);
        if (res && res.length > 0) {
          console.log('📄 ตัวอย่างข้อมูลรายการแรก:', res[0]);
        }
        this.stockList = res || [];
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("❌ Load data fail...", err);
        this.stockList = [];
        this.cd.detectChanges();
      }
    })
  }

  

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


  onEditStock() {
    console.log('📝 ฟังก์ชันแก้ไขใบหุ้น (ยังไม่ทำ)');
  }

  onTransfer(stock: StockItem) {
    this.selectedStock = stock;
    this.showTransferForm = true;
  }

  cancelTransfer() {
    this.showTransferForm = false;
    this.selectedStock = null;
  }


  goBack() {
    this.back.emit('search');
  }
}
