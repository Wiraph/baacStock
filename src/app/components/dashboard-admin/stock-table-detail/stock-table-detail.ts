import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CustomerService } from '../../../services/customer';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-stock-table-detail',
  imports: [CommonModule],
  templateUrl: './stock-table-detail.html',
  styleUrls: ['./stock-table-detail.css'],
})
export class StockTableDetailComponent implements OnInit, OnChanges {
  @Input() stockData: any;
  @Output() onRequestNewStock = new EventEmitter<any>();

  customerData: any = null;
  selectedCustomer: any = null;

  constructor(
    private customerService: CustomerService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.stockData?.cusId) {
      this.loadCustomer(this.stockData.cusId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stockData'] && this.stockData?.cusId) {
      this.loadCustomer(this.stockData.cusId);
    }
  }

  private loadCustomer(cusId: string): void {
    
  }
  
  handleRequestNewStock(stock: any): void {
    this.onRequestNewStock.emit(stock);
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
}
