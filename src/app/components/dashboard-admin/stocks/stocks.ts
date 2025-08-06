import { Component, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import { StockService, StockItem } from '../../../services/stock';
import { ChangeDetectorRef } from '@angular/core';
import { CustomerService } from '../../../services/customer';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stocks.html',
  // styleUrl: ['./stocks.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class StocksComponent implements OnChanges {
  @Input() cusId: string = '';
  @Input() fullName: string = '';
  @Input() statusDesc: string = '';
  @Input() stNotesList: string[] = [];
  @Input() viewMode: string = '';
  @Output() back = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();
  @Output() transferStock = new EventEmitter<any>();


  stockList: StockItem[] = [];
  cusData: any = null;
  showTransferForm = false;
  selectedStock: StockItem | null = null;


  constructor(
    private stockService: StockService,
    private customerService: CustomerService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cusId'] && this.cusId) {
      this.loadStock();

      console.log('view mode: ', this.viewMode);

      if (this.viewMode === 'transfer') {

      } else if (this.viewMode === 'viewOnly') {
        // ห้ามแก้ไข
      }
    }
  }

  loadStock() {
    this.stockService.getStocksByCusId(this.cusId).subscribe({
      next: (data) => {
        console.log('📦 ได้ข้อมูลจาก API:', data);
        this.stockList = data.stockList || [];
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('❌ เกิดข้อผิดพลาดในการโหลดใบหุ้น', err);
      }
    });
  }

  

  formatThaiDateTime(datetimeup: string): string {
    if (!datetimeup || !datetimeup.includes('-')) return '-';

    const [datePart, timePart] = datetimeup.split('-');
    if (datePart.length !== 8 || timePart.length !== 6) return '-';

    const year = +datePart.substring(0, 4);
    const month = +datePart.substring(4, 6) - 1;
    const day = +datePart.substring(6, 8);
    const hour = +timePart.substring(0, 2);
    const minute = +timePart.substring(2, 4);
    const second = +timePart.substring(4, 6);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return '-';

    const date = new Date(year, month, day, hour, minute, second);
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

  onTransferStockClick(stock: StockItem) {
    alert("ระบบทำงาน");
    this.transferStock.emit(stock);
  }


  goBack() {
    this.back.emit();
  }
}
