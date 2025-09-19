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

  // ข้อมูลสถานะระบบ
  systemStatus: any = {
    hasDividendData: false,
    hasValidTaxId: true,
    hasBlockedStocks: false,
    isAllStocksBlocked: false,
    errorMessage: '',
    warningMessage: ''
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
    const payload = {
      stkOWNiD: cusId
    }
    
    console.log('💰 Loading dividend data for cusId:', cusId);
    console.log('💰 Payload:', payload);
    
    // เรียก API GetDividend2Pay เพื่อดึงข้อมูลเงินปันผล
    this.dividendService.getDividend2Pay(payload).subscribe({
      next: (response:any) => {
        console.log('💰 API Response:', response);
        console.log('💰 Response type:', typeof response);
        console.log('💰 Response length:', response?.length);
        
        if (response && response.length > 0) {
          // ตรวจสอบว่ามีข้อมูลที่ valid หรือไม่
          const hasValidDividendData = response.some((item: any) => 
            this.getValidValue(item.payBEFdvn) || 
            this.getValidValue(item.payCURdvn) || 
            this.getValidValue(item.stkNOTE)
          );

          //กรณีที่ 1: มีข้อมูลเงินปันผล
          this.systemStatus.hasDividendData = hasValidDividendData;
          
          // ใช้ข้อมูลจากรายการแรกเพื่อดึงข้อมูลลูกค้า
          const firstItem = response[0];
          console.log('💰 First item:', firstItem);
          
          // ตั้งค่าข้อมูลลูกค้า
           this.customerData = {
             cusId: firstItem.cusiDuse || cusId,
             fullName: firstItem.cusName || '-',
             statusDesc: firstItem.cusSTDESC || '-',
             brCode: firstItem.cusCODE || '',
             brName: firstItem.cusCODEg || '',
             taxRate: this.getValidValue(firstItem.cusTAX, '0.00'),
             taxId: firstItem.cusTAXidUSE || '-'
           };

          console.log('💰 Customer Data:', this.customerData);

          //กรณีที่ 2: ตรวจสอบเลขผู้เสียภาษี
          if(firstItem.cusTAX && firstItem.cusTAX > 0) {
            this.systemStatus.hasValidTaxId = false;
            this.systemStatus.warningMessage = 'หมายเลขผู้เสียภาษีไม่ถูกต้อง';
          }
          
          // ตั้งค่าข้อมูลเงินปันผล
          this.dividendData = response;
          console.log('💰 Dividend Data:', this.dividendData);
          console.log('💰 Dividend Data length:', this.dividendData.length);

          //กรณีที่ 3: หุ้นบล็อค
          this.checkBlockedStocks();
          
          // คำนวณข้อมูลสรุปเงินปันผล
          this.calculateDividendSummary();
          this.cd.detectChanges();

        } else {
          console.log('💰 No dividend data found');
          this.systemStatus.hasDividendData = false;
          this.systemStatus.errorMessage = 'ไม่พบรายการเงินปันผลรอจ่าย';
          this.showErrorAlert('ไม่พบรายการเงินปันผลรอจ่าย');

          // ตั้งค่าข้อมูลลูกค้าเป็นค่าเริ่มต้น
          this.customerData = {
            cusId: cusId,
            fullName: '-',
            statusDesc: '-',
            brCode: '',
            brName: '',
            taxRate: '0.00',
            taxId: '-'
          };
          this.cd.detectChanges();
        }
      },
      error: (error: any) => {
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
       console.log('💰 Processing dividend item:', item);
       
       // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่
       const hasValidData = this.getValidValue(item.stkNOTE) || this.getValidValue(item.payBEFdvn) || this.getValidValue(item.payCURdvn);
       
       if (hasValidData) {
         // รวมข้อมูลทั้งหมด - ใช้ helper method เพื่อจัดการ empty objects
         const payBEFdvn = this.getValidValue(item.payBEFdvn, 0);
         const payBEFtax = this.getValidValue(item.payBEFtax, 0);
         const payBEFnet = this.getValidValue(item.payBEFnet, 0);
         const payCURdvn = this.getValidValue(item.payCURdvn, 0);
         const payCURtax = this.getValidValue(item.payCURtax, 0);
         const payCURnet = this.getValidValue(item.payCURnet, 0);
         
         this.dividendSummary.totalGrand.bef.dvn += payBEFdvn;
         this.dividendSummary.totalGrand.bef.tax += payBEFtax;
         this.dividendSummary.totalGrand.bef.net += payBEFnet;
         this.dividendSummary.totalGrand.cur.dvn += payCURdvn;
         this.dividendSummary.totalGrand.cur.tax += payCURtax;
         this.dividendSummary.totalGrand.cur.net += payCURnet;

         // ตรวจสอบสถานะใบหุ้น - ใช้การตรวจสอบที่ปลอดภัย
         const stCODE = this.getValidValue(item.stCODE, '');
         const stkPayStat = this.getValidValue(item.stkPayStat, '');
         
         console.log('💰 stCODE:', stCODE, 'Type:', typeof stCODE);
         console.log('💰 stkPayStat:', stkPayStat, 'Type:', typeof stkPayStat);
         
         if (stCODE && typeof stCODE === 'string' && stCODE.endsWith('S008')) {
           // รายการบล็อค
           console.log('💰 Processing blocked stock');
           this.dividendSummary.block.bef.dvn += payBEFdvn;
           this.dividendSummary.block.bef.tax += payBEFtax;
           this.dividendSummary.block.bef.net += payBEFnet;
           this.dividendSummary.block.cur.dvn += payCURdvn;
           this.dividendSummary.block.cur.tax += payCURtax;
           this.dividendSummary.block.cur.net += payCURnet;

         } else if (stCODE && typeof stCODE === 'string' && stCODE.endsWith('002')) {
           // รายการชำรุด/สูญหาย
           console.log('💰 Processing damaged/lost stock');
           this.dividendSummary._002.bef.dvn += payBEFdvn;
           this.dividendSummary._002.bef.tax += payBEFtax;
           this.dividendSummary._002.bef.net += payBEFnet;
           this.dividendSummary._002.cur.dvn += payCURdvn;
           this.dividendSummary._002.cur.tax += payCURtax;
           this.dividendSummary._002.cur.net += payCURnet;

         } else if (stkPayStat && typeof stkPayStat === 'string' && stkPayStat.endsWith('0TR')) {
           // รายการรอผลการโอนผ่านบัญชี
           console.log('💰 Processing transfer pending stock');
           this.dividendSummary.spin0tr.bef.dvn += payBEFdvn;
           this.dividendSummary.spin0tr.bef.tax += payBEFtax;
           this.dividendSummary.spin0tr.bef.net += payBEFnet;
           this.dividendSummary.spin0tr.cur.dvn += payCURdvn;
           this.dividendSummary.spin0tr.cur.tax += payCURtax;
           this.dividendSummary.spin0tr.cur.net += payCURnet;

         } else {
           // รายการปกติ - รวมใน totalSub
           console.log('💰 Processing normal stock');
           this.dividendSummary.totalSub.bef.dvn += payBEFdvn;
           this.dividendSummary.totalSub.bef.tax += payBEFtax;
           this.dividendSummary.totalSub.bef.net += payBEFnet;
           this.dividendSummary.totalSub.cur.dvn += payCURdvn;
           this.dividendSummary.totalSub.cur.tax += payCURtax;
           this.dividendSummary.totalSub.cur.net += payCURnet;
         }
       } else {
         console.log('💰 Skipping item without valid data:', item);
       }
     });

    // คำนวณจำนวนเงินที่จ่ายได้
    const totalNet = this.dividendSummary.totalSub.bef.net + this.dividendSummary.totalSub.cur.net;
    this.paymentData.dividend = totalNet;
    this.paymentData.fraction = totalNet % this.paymentData.denominator;
    this.paymentData.unit = (totalNet - this.paymentData.fraction) / this.paymentData.denominator;
    
    console.log('💰 Dividend Summary calculated:', this.dividendSummary);
    console.log('💰 Payment Data:', this.paymentData);
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
    if (!this.dividendData || this.dividendData.length === 0) {
      return [];
    }
    
    return this.dividendData.filter(d => {
      const stCODE = this.getValidValue(d.stCODE, '');
      if (stCODE && typeof stCODE === 'string') {
        return stCODE.endsWith('S008');
      }
      return false;
    });
  }

  // Check if has blocked stocks
  get hasBlockedStocks(): boolean {
    return this.blockedStocks.length > 0;
  }

  // ตรวจสอบหุ้นบล็อก (กรณีที่ 3)
  checkBlockedStocks(): void {
    console.log('💰 Checking blocked stocks...');
    console.log('💰 Dividend data:', this.dividendData);
    
    if (!this.dividendData || this.dividendData.length === 0) {
      console.log('💰 No dividend data to check');
      return;
    }
    
    const blockedStocks = this.dividendData.filter(d => {
      console.log('💰 Checking item:', d);
      const stCODE = this.getValidValue(d.stCODE, '');
      console.log('💰 stCODE:', stCODE, 'Type:', typeof stCODE);
      
      // ตรวจสอบว่า stCODE เป็น string และไม่เป็น null/undefined
      if (stCODE && typeof stCODE === 'string') {
        const isBlocked = stCODE.endsWith('S008');
        console.log('💰 Is blocked:', isBlocked);
        return isBlocked;
      } else {
        console.log('💰 stCODE is not a valid string, skipping');
        return false;
      }
    });
    
    console.log('💰 Blocked stocks found:', blockedStocks.length);
    console.log('💰 Blocked stocks:', blockedStocks);
    
    this.systemStatus.hasBlockedStocks = blockedStocks.length > 0;
    this.systemStatus.isAllStocksBlocked = blockedStocks.length === this.dividendData.length;
    
    if (this.systemStatus.isAllStocksBlocked) {
      this.systemStatus.warningMessage = 'ใบหุ้นถูกบล็อก ไม่สามารถจ่ายเงินปันผลได้';
      this.showWarningAlert('ใบหุ้นถูกบล็อก ไม่สามารถจ่ายเงินปันผลได้');
    } else if (this.systemStatus.hasBlockedStocks) {
      this.systemStatus.warningMessage = `มีหุ้น ${blockedStocks.length} รายการที่ถูกบล็อก`;
      this.showWarningAlert(`มีหุ้น ${blockedStocks.length} รายการที่ถูกบล็อก`);
    }
  }

  // แสดง Warning Alert
  showWarningAlert(message: string): void {
    Swal.fire({
      icon: 'warning',
      title: 'คำเตือน',
      text: message,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false
    });
  }

  // แสดง Error Alert
  showErrorAlert(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'ข้อผิดพลาด',
      text: message,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#d33',
      allowOutsideClick: false
    });
  }

  // กำหนดสถานะการจ่ายเงิน
  get paymentStatus(): { text: string; color: string; bgColor: string } {
    // ตรวจสอบเงื่อนไขที่ไม่สามารถจ่ายได้
    if (!this.systemStatus.hasDividendData || 
        !this.systemStatus.hasValidTaxId || 
        this.systemStatus.isAllStocksBlocked || 
        this.paymentData.dividend <= 0) {
      return {
        text: 'ไม่สามารถจ่ายเงินปันผลได้',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      };
    }
    
    // กรณีที่สามารถจ่ายได้
    return {
      text: 'สามารถจ่ายเงินปันผลได้',
      color: 'text-green-700',
      bgColor: 'bg-green-100'
    };
  }

  // รีเซ็ตสถานะระบบ
  resetSystemStatus(): void {
    this.systemStatus = {
      hasDividendData: false,
      hasValidTaxId: true,
      hasBlockedStocks: false,
      isAllStocksBlocked: false,
      errorMessage: '',
      warningMessage: ''
    };
  }

  // Helper method เพื่อจัดการกับ empty objects และค่าที่ไม่ถูกต้อง
  getValidValue(value: any, defaultValue: any = 0): any {
    // ตรวจสอบว่าเป็น empty object หรือไม่
    if (value && typeof value === 'object' && Object.keys(value).length === 0) {
      return defaultValue;
    }
    
    // ตรวจสอบว่าเป็น null, undefined, หรือ empty string
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    
    // ตรวจสอบว่าเป็น number ที่ valid
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    
    // ตรวจสอบว่าเป็น string ที่ valid
    if (typeof value === 'string' && value.trim() !== '') {
      return value;
    }
    
    return defaultValue;
  }

}