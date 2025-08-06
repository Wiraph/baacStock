import {
  Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef
} from '@angular/core';
import { CustomerService } from '../../../../services/customer';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-common-stock',
  templateUrl: './common-stock.html',
  styleUrl: './common-stock.css',
  imports: [CommonModule, FormsModule],
})
export class CommonStockComponent implements OnInit, OnChanges {
  @Input() editingItem: any;
  @Input() homeAddress: any;
  @Input() currentAddress: any;
  @Input() stockDividend: any;
  @Input() setViewFn!: (view: string) => void;

  custypeList: any[] = [];
  doctypeList: any[] = [];
  titleList: any[] = [];
  homeAumphors: any[] = [];
  homeTumbons: any[] = [];
  currentAumphors: any[] = [];
  currentTumbons: any[] = [];
  provinceList: any[] = [];

  selectedMethod = '';
  accNo = '';
  accName = '';
  selectedAccType = '';
  selectedPayType = '';
  loading = true;

  constructor(
    private customerService: CustomerService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingItem'] || changes['homeAddress'] || changes['currentAddress']) {
      this.initializeData();
    }
  }

  async initializeData(): Promise<void> {
    this.loading = true;

    // dividend
    if (this.stockDividend) {
      const payType = this.stockDividend.stkPayType;
      this.selectedMethod = payType === '001' ? 'account' :
                            payType === '002' ? 'cash' :
                            payType === '003' ? 'donate' : '';
      this.accNo = this.stockDividend.stkAccno || '';
      this.accName = this.stockDividend.stkAccname || '';
      this.selectedAccType = this.stockDividend.stkAcctype || '';
      this.selectedPayType = this.stockDividend.stkPayType || '';
    }

  
    this.loading = false;
    this.cdRef.detectChanges(); // ✅ สำคัญ: render ใหม่หลังโหลดเสร็จ
  }

  updateHomeZipcode() {
    const tmb = this.homeTumbons.find(t => t.tmbCode === this.homeAddress?.tmbCode);
    if (tmb) this.homeAddress.zipcode = tmb.zipCode;
  }

  updateCurrentZipcode() {
    const tmb = this.currentTumbons.find(t => t.tmbCode === this.currentAddress?.tmbCode);
    if (tmb) this.currentAddress.zipcode = tmb.zipCode;
  }



dit() {
    this.setViewFn?.('search');
  }

  onSaveEdit() {
    // TODO: save
  }
}
