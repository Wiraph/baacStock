import { Component, Input, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { FormsModule } from '@angular/forms';
import { StockService, StockItem } from '../../../services/stock';
import { CustomerService } from '../../../services/customer';

@Component({
  selector: 'app-dividend',
  standalone: true,
  imports: [CommonModule, SearchEditComponent, FormsModule],
  templateUrl: './dividend.component.html',
  styleUrls: ['./dividend.component.css']
})
export class DividendComponent implements OnInit {

  @Input() InputDividend!: string;

  // View Management
  internalViewName = 'dividend';
  activeView = 'search';  // เริ่มต้นที่หน้าค้นหาเสมอ

  // Customer data
  customerData: any = null;

  // Branch data for session (SSR safe)
  brName = '';
  brCode = '';

  constructor(
    private stockService: StockService,
    private customerService: CustomerService,
    private cdRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    // Initialize branch data from sessionStorage (SSR safe)
    if (isPlatformBrowser(this.platformId)) {
      this.brName = sessionStorage.getItem('brName') || '';
      this.brCode = sessionStorage.getItem('brCode') || '';
    }
  }

  // Handle search result from SearchEditComponent
  onViewStock(data: any): void {
    console.log('💰 ข้อมูลที่ได้จากการค้นหาเงินปันผล:', data);
    
    // Store customer data
    this.customerData = {
      cusId: data.cusId || '',
      fullName: data.fullName || '',
      statusDesc: data.statusDesc || 'ไม่ระบุ',
      brCode: data.brCode || this.brCode,
      brName: data.brName || this.brName
    };

    // Switch to result view
    this.activeView = 'result';
  }

  // Handle dividend selection from SearchEditComponent
  onDividendSelected(data: any): void {
    console.log('💰 เลือกข้อมูลสำหรับเงินปันผล:', data);
    this.onViewStock(data);
  }

  // Go back to search
  goBack(): void {
    this.activeView = 'search';
    this.customerData = null;
  }
}