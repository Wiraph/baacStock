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
    this.loadDropdowns();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingItem'] || changes['homeAddress'] || changes['currentAddress']) {
      this.initializeData();
    }
  }

  loadDropdowns(): void {
    this.customerService.getAllProvince().subscribe({
      next: (res) => (this.provinceList = res),
      error: (err) => console.error('❌ ดึงจังหวัดล้มเหลว', err),
    });

    this.customerService.getAllCustype().subscribe({
      next: (res) => (this.custypeList = res),
      error: (err) => console.error('❌ ดึงประเภทลูกค้าล้มเหลว', err),
    });

    this.customerService.getAllDoctype().subscribe({
      next: (res) => (this.doctypeList = res),
      error: (err) => console.error('❌ ดึงบัตรล้มเหลว', err),
    });

    this.customerService.getAllTitle().subscribe({
      next: (res) => (this.titleList = res),
      error: (err) => console.error('❌ ดึงคำนำหน้าชื่อล้มเหลว', err),
    });
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

    try {
      if (this.homeAddress?.prvCode) {
        this.homeAumphors = await firstValueFrom(this.customerService.getAumphor(this.homeAddress.prvCode));
        if (this.homeAddress?.ampCode) {
          this.homeTumbons = await firstValueFrom(
            this.customerService.getTumbons(this.homeAddress.prvCode, this.homeAddress.ampCode)
          );
        }
      }

      if (this.currentAddress?.prvCode) {
        this.currentAumphors = await firstValueFrom(this.customerService.getAumphor(this.currentAddress.prvCode));
        if (this.currentAddress?.ampCode) {
          this.currentTumbons = await firstValueFrom(
            this.customerService.getTumbons(this.currentAddress.prvCode, this.currentAddress.ampCode)
          );
        }
      }
    } catch (err) {
      console.error('❌ โหลดตำบลอำเภอไม่สำเร็จ:', err);
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

  loadHomeAumphor(prvCode: string) {
    this.customerService.getAumphor(prvCode).subscribe({
      next: data => this.homeAumphors = data
    });
  }

  loadHomeTumbon(prvCode: string, ampCode: string) {
    this.customerService.getTumbons(prvCode, ampCode).subscribe({
      next: data => {
        this.homeTumbons = data;
        this.updateHomeZipcode();
      }
    });
  }

  loadCurrentAumphor(prvCode: string) {
    this.customerService.getAumphor(prvCode).subscribe({
      next: data => this.currentAumphors = data
    });
  }

  loadCurrentTumbon(prvCode: string, ampCode: string) {
    this.customerService.getTumbons(prvCode, ampCode).subscribe({
      next: data => {
        this.currentTumbons = data;
        this.updateCurrentZipcode();
      }
    });
  }

  onCancelEdit() {
    this.setViewFn?.('search');
  }

  onSaveEdit() {
    // TODO: save
  }
}
