  import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { ChangeDetectionStrategy } from '@angular/core';
  import { StockService, StockItem } from '../../../services/stock';
  import { ChangeDetectorRef } from '@angular/core';

  @Component({
    standalone: true,
    selector: 'app-stocks',
    imports: [CommonModule],
    templateUrl: './stocks.html',
    styleUrl: './stocks.css',
    changeDetection: ChangeDetectionStrategy.Default
  })
  export class StocksComponent implements OnChanges {
    @Input() cusId: string = '';
    @Input() fullName: string = '';
    @Input() statusDesc: string = '';
    @Input() stNotesList: string[] = [];

    stockList: StockItem[] = [];

    constructor(private stockService: StockService, private cd: ChangeDetectorRef) { }

    ngOnChanges(changes: SimpleChanges): void {
      if (changes['cusId'] && this.cusId) {
        console.log('🔁 cusId เปลี่ยน:', this.cusId);
        this.loadStock();
      }
    }

    loadStock() {
      this.stockService.getStocksByCusId(this.cusId).subscribe({
        next: (data) => {
          console.log('📦 ได้ข้อมูลจาก API:', data);
          this.stockList = data.stockList || [];
          console.log('✅ ค่าใน stockList:', this.stockList); // ดูว่าถูกเซตไหม
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('❌ เกิดข้อผิดพลาดในการโหลดใบหุ้น', err);
        }
      });
    }


    // จัดรูปแบบเวลา
    formatThaiDateTime(datetimeup: string): string {
      if (!datetimeup) return '-';

      const [datePart, timePart] = datetimeup.split('-');
      if (!datePart || !timePart) return '-';

      const year = +datePart.substring(0, 4);
      const month = +datePart.substring(4, 6) - 1;
      const day = +datePart.substring(6, 8);
      const hour = +timePart.substring(0, 2);
      const minute = +timePart.substring(2, 4);
      const second = +timePart.substring(4, 6);

      const date = new Date(year, month, day, hour, minute, second);

      const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

      const pad = (n: number) => n < 10 ? '0' + n : n.toString();

      return `${day} ${thaiMonths[month]} ${year + 543} ${pad(hour)}:${pad(minute)}:${pad(second)} น.`;
    }

    onEditStock(){
      
    }

  }
