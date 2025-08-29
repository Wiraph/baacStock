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
  dividendData: any[] = [];
  
  // ข้อมูลสรุปเงินปันผล
  dividendSummary: any = {
    totalGrand: { bef: { dvn: 0, tax: 0, net: 0 }, cur: { dvn: 0, tax: 0, net: 0 } },
    totalSub: { bef: { dvn: 0, tax: 0, net: 0 }, cur: { dvn: 0, tax: 0, net: 0 } },
    block: { bef: { dvn: 0, tax: 0, net: 0 }, cur: { dvn: 0, tax: 0, net: 0 } },
    _002: { bef: { dvn: 0, tax: 0, net: 0 }, cur: { dvn: 0, tax: 0, net: 0 } },
    spin0tr: { bef: { dvn: 0, tax: 0, net: 0 }, cur: { dvn: 0, tax: 0, net: 0 } }
  };
  
  // ข้อมูลการจ่ายเงิน
  paymentData: any = {
    dividend: 0,
    unit: 0,
    fraction: 0,
    denominator: 100 // ราคาหุ้นต่อหน่วย
  };

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
      taxRate: ''
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
    
    // เรียก API GetDividend2Pay เพื่อดึงข้อมูลเงินปันผล
    this.dividendService.getDividend2Pay(cusId).subscribe({
      next: (response) => {
        console.log('💰 Dividend2Pay API Response:', response);
        
        if (response && response.length > 0) {
          const dividendData = response[0];
          
                     // ตั้งค่าข้อมูลลูกค้า
           this.customerData = {
             cusId: dividendData.cusiDuse || cusId,
             fullName: dividendData.cusName || '-',
             statusDesc: dividendData.cusSTDESC || '-',
             brCode: dividendData.cusCODE || '',
             brName: dividendData.cusCODEg || '',
             taxRate: dividendData.cusTAX ? dividendData.cusTAX.toString() : '0.00',
             taxId: dividendData.cusTAXidUSE || '-'
           };
          
          // ตั้งค่าข้อมูลเงินปันผล
          this.dividendData = response;
          
          // คำนวณข้อมูลสรุปเงินปันผล
          this.calculateDividendSummary();
          
          console.log('💰 Customer data loaded from API:', this.customerData);
          console.log('💰 Dividend data loaded from API:', this.dividendData);
          console.log('💰 Dividend summary calculated:', this.dividendSummary);
          console.log('💰 Payment data calculated:', this.paymentData);
          this.cd.detectChanges();
        } else {
          // ถ้าไม่มีข้อมูล ให้ตั้งค่าข้อมูลลูกค้าเป็นค่าเริ่มต้น
           this.customerData = {
             cusId: cusId,
             fullName: '-',
             statusDesc: '-',
             brCode: '',
             brName: '',
             taxRate: '0.00'
           };
        }
      },
             error: (error) => {
         console.error('💰 Error loading dividend data:', error);
         
         Swal.fire({
           icon: 'error',
           title: 'เกิดข้อผิดพลาด',
           text: 'ไม่สามารถโหลดข้อมูลเงินปันผลได้ กรุณาลองใหม่'
         });
       }
    });
  }

  // Go back to search
  goBack(): void {
    this.activeView = 'search';
    this.customerData = null;
  }

  // คำนวณข้อมูลสรุปเงินปันผล
  calculateDividendSummary(): void {
    if (!this.dividendData || this.dividendData.length === 0) {
      return;
    }

    // รีเซ็ตข้อมูลสรุป
    this.dividendSummary = {
      totalGrand: { bef: { dvn: 0, tax: 0, net: 0 }, cur: { dvn: 0, tax: 0, net: 0 } },
      totalSub: { bef: { dvn: 0, tax: 0, net: 0 }, cur: { dvn: 0, tax: 0, net: 0 } },
      block: { bef: { dvn: 0, tax: 0, net: 0 }, cur: { dvn: 0, tax: 0, net: 0 } },
      _002: { bef: { dvn: 0, tax: 0, net: 0 }, cur: { dvn: 0, tax: 0, net: 0 } },
      spin0tr: { bef: { dvn: 0, tax: 0, net: 0 }, cur: { dvn: 0, tax: 0, net: 0 } }
    };

    this.dividendData.forEach((item: any) => {
      if (item.stkNOTE) {
        // รวมข้อมูลทั้งหมด
        this.dividendSummary.totalGrand.bef.dvn += (item.payBEFdvn || 0);
        this.dividendSummary.totalGrand.bef.tax += (item.payBEFtax || 0);
        this.dividendSummary.totalGrand.bef.net += (item.payBEFnet || 0);
        this.dividendSummary.totalGrand.cur.dvn += (item.payCURdvn || 0);
        this.dividendSummary.totalGrand.cur.tax += (item.payCURtax || 0);
        this.dividendSummary.totalGrand.cur.net += (item.payCURnet || 0);

        // ตรวจสอบสถานะใบหุ้น
        if (item.stCODE && item.stCODE.endsWith('S008')) {
          // รายการบล็อค
          this.dividendSummary.block.bef.dvn += (item.payBEFdvn || 0);
          this.dividendSummary.block.bef.tax += (item.payBEFtax || 0);
          this.dividendSummary.block.bef.net += (item.payBEFnet || 0);
          this.dividendSummary.block.cur.dvn += (item.payCURdvn || 0);
          this.dividendSummary.block.cur.tax += (item.payCURtax || 0);
          this.dividendSummary.block.cur.net += (item.payCURnet || 0);
        } else if (item.stCODE && item.stCODE.endsWith('002')) {
          // รายการชำรุด/สูญหาย
          this.dividendSummary._002.bef.dvn += (item.payBEFdvn || 0);
          this.dividendSummary._002.bef.tax += (item.payBEFtax || 0);
          this.dividendSummary._002.bef.net += (item.payBEFnet || 0);
          this.dividendSummary._002.cur.dvn += (item.payCURdvn || 0);
          this.dividendSummary._002.cur.tax += (item.payCURtax || 0);
          this.dividendSummary._002.cur.net += (item.payCURnet || 0);
        } else if (item.stkPayStat && item.stkPayStat.endsWith('0TR')) {
          // รายการรอผลการโอนผ่านบัญชี
          this.dividendSummary.spin0tr.bef.dvn += (item.payBEFdvn || 0);
          this.dividendSummary.spin0tr.bef.tax += (item.payBEFtax || 0);
          this.dividendSummary.spin0tr.bef.net += (item.payBEFnet || 0);
          this.dividendSummary.spin0tr.cur.dvn += (item.payCURdvn || 0);
          this.dividendSummary.spin0tr.cur.tax += (item.payCURtax || 0);
          this.dividendSummary.spin0tr.cur.net += (item.payCURnet || 0);

          // รวมใน totalSub
          this.dividendSummary.totalSub.bef.dvn += (item.payBEFdvn || 0);
          this.dividendSummary.totalSub.bef.tax += (item.payBEFtax || 0);
          this.dividendSummary.totalSub.bef.net += (item.payBEFnet || 0);
        } else {
          // รายการปกติ
          this.dividendSummary.totalSub.bef.dvn += (item.payBEFdvn || 0);
          this.dividendSummary.totalSub.bef.tax += (item.payBEFtax || 0);
          this.dividendSummary.totalSub.bef.net += (item.payBEFnet || 0);
          this.dividendSummary.totalSub.cur.dvn += (item.payCURdvn || 0);
          this.dividendSummary.totalSub.cur.tax += (item.payCURtax || 0);
          this.dividendSummary.totalSub.cur.net += (item.payCURnet || 0);
        }
      }
    });

    // คำนวณจำนวนเงินที่จ่ายได้
    const totalNet = this.dividendSummary.totalSub.bef.net + this.dividendSummary.totalSub.cur.net;
    this.paymentData.dividend = totalNet;
    this.paymentData.fraction = totalNet % this.paymentData.denominator;
    this.paymentData.unit = (totalNet - this.paymentData.fraction) / this.paymentData.denominator;
  }

  // แปลงตัวเลขเป็นข้อความภาษาไทย
  numberToThaiText(num: number): string {
    const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
    const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    
    if (num === 0) return 'ศูนย์';
    
    let result = '';
    const numStr = Math.floor(num).toString();
    const len = numStr.length;
    
    for (let i = 0; i < len; i++) {
      const digit = parseInt(numStr[i]);
      const position = len - i - 1;
      
      if (digit !== 0) {
        if (digit === 1 && position === 1 && i === 0) {
          result += 'สิบ';
        } else if (digit === 2 && position === 1) {
          result += 'ยี่สิบ';
        } else if (digit === 1 && position === 0 && len > 1) {
          result += 'เอ็ด';
        } else {
          result += numbers[digit] + units[position];
        }
      }
    }
    
    return result;
  }

  // จัดรูปแบบตัวเลข
  formatNumber(num: number, decimals: number = 2): string {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // Get blocked stocks
  get blockedStocks(): any[] {
    return this.dividendData.filter(d => d.stCODE && d.stCODE.endsWith('S008'));
  }

  // Check if has blocked stocks
  get hasBlockedStocks(): boolean {
    return this.blockedStocks.length > 0;
  }


}