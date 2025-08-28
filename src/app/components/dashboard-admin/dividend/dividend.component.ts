import { Component, Input, OnInit, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { FormsModule } from '@angular/forms';
import { DataTransfer } from '../../../services/data-transfer';
import { Divident } from '../../../services/divident';
import { CustomerService } from '../../../services/customer';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dividend',
  standalone: true,
  imports: [CommonModule, SearchEditComponent, FormsModule],
  templateUrl: './dividend.component.html',
  styleUrls: ['./dividend.component.css']
})
export class DividendComponent implements OnInit {
  @Input() InputDividend!: string;
  internalViewName = 'dividend';
  activeView = '';  // เริ่มต้นที่หน้าค้นหาเสมอ
  customerData: any = null;
  brName = '';
  brCode = '';
  dividendData: any = '';

  constructor(
    private readonly dataTransfer: DataTransfer,
    private readonly cd: ChangeDetectorRef,
    private readonly dividendService: Divident,
    private readonly customerService: CustomerService
  ) { }

  ngOnInit(): void {
   this.activeView = 'search';
   this.dataTransfer.setPageStatus('5');
  }

  onHandle(event: any) {
    console.log('💰 onHandle called with event:', event);
    
    if (event.view === 'dividend') {
      // เมื่อกดปุ่ม "จ่ายเงินปันผล" จาก search-edit
      this.activeView = 'dividend';
      
      // ดึงข้อมูลลูกค้าจาก API เหมือนระบบอื่นๆ
      if (event.cusId) {
        this.loadCustomerDataFromAPI(event.cusId);
      }
    } else {
      this.activeView = event.view;
      this.onLoadDivident();
    }
  }

  onLoadDivident() {
    this.dividendService.getAllDividend().subscribe({
      next: (res) => {
        this.dividendData = res;
        this.cd.detectChanges();
      }, error: () =>{
        Swal.fire({
          icon: 'error',
          title: "เกิดข้อผิดพลาด",
          text: 'โปรดติดต่อผู้พัฒนา'
        })
      }
    })
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
      brName: data.brName || this.brName,
      taxRate: '10.00'
    };

    // Switch to dividend view
    this.activeView = 'dividend';
    
    console.log('💰 onViewStock called');
    console.log('💰 activeView set to:', this.activeView);
    console.log('💰 customerData set to:', this.customerData);
  }

  // Handle dividend selection from SearchEditComponent
  onDividendSelected(data: any): void {
    console.log('💰 เลือกข้อมูลสำหรับเงินปันผล:', data);
    this.onViewStock(data);
  }

  // Load customer data from API like other systems
  loadCustomerDataFromAPI(cusId: string) {
    console.log('💰 Loading customer data from API for cusId:', cusId);
    
    const requestPayload = {
      cusId: cusId
    };
    
    this.customerService.getCustomer(requestPayload).subscribe({
      next: (response) => {
        console.log('💰 API Response:', response);
        
        if (response && response.length > 0) {
          const customer = response[0];
          this.customerData = {
            cusId: customer.cusID || cusId,
            fullName: (customer.titleABBR || '') + (customer.cusfname || '') + ' ' + (customer.cuslname || ''),
            statusDesc: customer.stDESC || '',
            brCode: customer.brCode || '',
            brName: customer.brName || '',
            taxRate: ' '
          };
          
          console.log('💰 Customer data loaded from API:', this.customerData);
          this.cd.detectChanges();
        }
      },
      error: (error) => {
        console.error('💰 Error loading customer data:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถดึงข้อมูลลูกค้าได้'
        });
      }
    });
  }

  // Go back to search
  goBack(): void {
    this.activeView = 'search';
    this.customerData = null;
  }
}