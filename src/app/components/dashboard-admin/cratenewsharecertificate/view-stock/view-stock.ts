import {
  Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService, StockItem } from '../../../../services/stock';
import { ChangeDetectionStrategy } from '@angular/core';
import { RemCodeService } from '../../../../services/rem-code';

// เพิ่ม interface เพื่อรองรับ property ใหม่
interface StockItemWithFlags extends StockItem {
  hasBeenReplaced?: boolean;
  replacedByNote?: string | null;
}

@Component({
  standalone: true,
  selector: 'app-view-stock',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-stock.html',
  styleUrl: './view-stock.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewStock implements OnChanges, OnInit {
  @Input() editingItem: any;
  @Input() homeAddress: any;
  @Input() currentAddress: any;
  @Input() stockDividend: any;
  @Input() setViewFn!: (view: string) => void;

  stockList: StockItemWithFlags[] = [];
  cusId: string = '';
  fullName: string = '';
  statusDesc: string = '';
  remCodeList: any[] = [];
  selectedRemCode = '';
  selectedStock: any = null;
  selectedCusId: string = '';
  viewName: string = 'view-stock';

  constructor(
    private stockService: StockService,
    private remCodeService: RemCodeService,
    private cd: ChangeDetectorRef
  ) { }

  setView(view: string): void {
    if (this.setViewFn) {
      this.setViewFn(view);
    } else {
      console.warn('🔴 setViewFn is not provided');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingItem'] && this.editingItem?.cusiD) {
      this.fullName = this.editingItem.fullName || '';
      this.statusDesc = this.editingItem.statusDesc || '';
      this.cusId = this.editingItem.cusiD;
      this.loadStock();
    }
  }

  ngOnInit() {
    this.remCodeService.getRemCodes().subscribe({
      next: (data) => {
        this.remCodeList = data;
      },
      error: (err) => {
        console.error('โหลดรหัสหมายเหตุล้มเหลว', err);
      }
    });
  }

  onSelectRemCode(stock: any) {
    this.selectedRemCode = stock || '';
    this.selectedCusId = this.editingItem?.cusiD || '';
    this.viewName = 'view-select';
    this.selectedStock = { ...stock };
    this.cd.detectChanges();
  }

  get filteredRemCodeList(): any[] {
    return this.remCodeList.filter(r =>
      r.remCode === '0020' || r.remCode === '0021'
    );
  }

  loadStock() {
    this.stockService.getStocksByCusId(this.cusId).subscribe({
      next: (data) => {
        const list: StockItem[] = data.stockList || [];

        // สร้าง Map สำหรับจับคู่ stkNote เดิม -> stkNote ใหม่
        const replacedMap = new Map<string, string>();
        list.forEach(item => {
          if (item.stkNoteo) {
            replacedMap.set(item.stkNoteo, item.stkNote); // ใบหุ้นเดิม => ใบหุ้นใหม่
          }
        });

        // เพิ่ม flag ให้ stockList
        this.stockList = list.map(s => {
          const newNote = replacedMap.get(s.stkNote);
          return {
            ...s,
            hasBeenReplaced: !!newNote,
            replacedByNote: newNote || null,
          };
        });

        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('❌ เกิดข้อผิดพลาดในการโหลดใบหุ้น', err);
      }
    });
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

    const date = new Date(year, month, day, hour, minute, second);

    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    const pad = (n: number) => n < 10 ? '0' + n : n.toString();

    return `${day} ${thaiMonths[month]} ${year + 543} ${pad(hour)}:${pad(minute)}:${pad(second)} น.`;
  }

}
