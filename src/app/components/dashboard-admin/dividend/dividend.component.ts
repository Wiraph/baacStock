import { Component, Input, OnInit, ChangeDetectorRef, inject} from '@angular/core';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { FormsModule } from '@angular/forms';
import { DataTransfer } from '../../../services/data-transfer';
import { UserService } from '../../../services/user';
import { Divident } from '../../../services/divident';
import { StockService } from '../../../services/stock';
import Swal from 'sweetalert2';

// Type aliases for menu keys to satisfy lint rule S4323
type PaymentMethodKey = 'CSH' | 'KTB' | 'CHQ' | 'STK';
type PayActionKey = 'payCSH' | 'payKTB' | 'payCHQ' | 'paySTK';
type DividendMenuKey = PaymentMethodKey | 'DETAILS' | 'BLOCKS';

// Reusable constants
const TABS_FOR_MINISTRY: DividendMenuKey[] = ['CSH', 'KTB', 'CHQ', 'STK', 'DETAILS', 'BLOCKS'];
const TABS_FOR_OPERATOR: DividendMenuKey[] = ['CSH', 'DETAILS', 'BLOCKS'];

@Component({
  selector: 'app-dividend',
  standalone: true,
  imports: [CommonModule, SearchEditComponent, FormsModule],
  templateUrl: './dividend.component.html',
  styleUrls: ['./dividend.component.css'],
  providers: [StockService]
})
export class DividendComponent implements OnInit {
  @Input() InputDividend!: string;
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
  }
  // เมนู 6 ช่อง
  menuTabs: { key: DividendMenuKey, label: string }[] = [
    { key: 'CSH', label: 'จ่ายเป็นเงินสด' },
    { key: 'KTB', label: 'KTB Corporate' },
    { key: 'CHQ', label: 'จ่ายเป็นเช็ค' },
    { key: 'STK', label: 'จ่ายเป็นหุ้น' },
    { key: 'DETAILS', label: 'รายละเอียด' },
    { key: 'BLOCKS', label: 'รายการบล็อค' }
  ];
  selectedMenu: DividendMenuKey = 'DETAILS';

  // ระดับสิทธิ์ผู้ใช้ ปัจจุบัน
  userLevel: string = '';
  // สิทธิ์ผู้ใช้และเงื่อนไขเมนู
  isLevel80Plus: boolean = false; // ผู้ใช้ระดับ 80 ขึ้นไป
  isOperator: boolean = false;      // ระดับ 00
  isMinistry: boolean = false;    // ลูกค้า cusCODE = '0100'

  // เมนูที่แสดง และปุ่มจ่ายเงินสด
  visibleTabKeys: DividendMenuKey[] = ['CSH', 'DETAILS', 'BLOCKS'];
  showCashPayButton: boolean = false;
  canSeeCashControls: boolean = false; // แสดงช่องกรอก/ติ๊กทั้งจำนวนได้หรือไม่

  loading: boolean = false;

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
    private readonly userService: UserService
  ) { }

  // ใช้ inject() เพื่อให้แน่ใจว่าได้อินสแตนซ์ของ StockService เสมอ แม้ DI ของ constructor จะไม่ทำงานจาก HMR
  private readonly stockService = inject(StockService);

  ngOnInit(): void {
   this.activeView = 'search';
   this.dataTransfer.setPageStatus('5');
   // โหลดระดับสิทธิ์ของผู้ใช้จาก session
   const currentUser = this.userService.getCurrentUser();
   this.userLevel = (currentUser?.level || '').toString();
  this.isLevel80Plus = Number(this.userLevel) >= 80;
  this.isOperator = this.userLevel === '00';
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
    this.loading = true;
    this.dividendService.getAllDividend()
      .pipe(finalize(() => { this.loading = false; this.cd.detectChanges(); }))
      .subscribe({
        next: (res) => {
          this.dividendData = res;
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
      cusCODE: data.cusCODE || '',
      taxRate: ''
    };

    // Switch to dividend view
    this.activeView = 'dividend';
    
    console.log('💰 onViewStock called');
    console.log('💰 activeView set to:', this.activeView);
    console.log('💰 customerData set to:', this.customerData);
    this.updatePermissionsAndTabs();
  }

  // Handle dividend selection from SearchEditComponent
  onDividendSelected(data: any): void {
    console.log('💰 เลือกข้อมูลสำหรับเงินปันผล:', data);
    this.onViewStock(data);
  }

  // Load customer data from API like other systems
  loadCustomerDataFromAPI(cusId: string) {
    this.loading = true;
    const payload = {
      stkOWNiD: cusId
    }
    
    console.log('💰 Loading dividend data for cusId:', cusId);
    console.log('💰 Payload:', payload);
    
    // เรียก API GetDividend2Pay เพื่อดึงข้อมูลเงินปันผล
    this.dividendService.getDividend2Pay(payload)
      .pipe(finalize(() => { this.loading = false; this.cd.detectChanges(); }))
      .subscribe({
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
            cusCODE: firstItem.cusCODE || '',
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
          // อัปเดตสิทธิ์เมนูหลังทราบข้อมูลลูกค้า
          this.updatePermissionsAndTabs();

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
          this.updatePermissionsAndTabs();
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

        // ตรวจสอบสถานะใบหุ้น - ใช้การตรวจสอบที่ปลอดภัย และสะสมผลรวมผ่าน helper เพื่อลด complexity
        const stCODE = this.getValidValue(item.stCODE, '');
        const stkPayStat = this.getValidValue(item.stkPayStat, '');
        this.addToSummaryByStatus(stCODE, stkPayStat, {
          payBEFdvn, payBEFtax, payBEFnet, payCURdvn, payCURtax, payCURnet
        });
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
    // ตั้งค่า default สำหรับกล่องชำระ
    this.cashPayAmount = this.paymentData.dividend;
    this.ktbPayAmount = this.paymentData.dividend;
    this.chequePayAmount = this.paymentData.dividend;
    this.sharePayAmount = this.paymentData.unit;
  }

  // แปลงตัวเลขเป็นข้อความภาษาไทย
  numberToThaiText(amount: number): string {
    if (typeof amount !== 'number' || isNaN(amount)) return '';
    const rounded = Math.round(amount * 100) / 100;
    const baht = Math.floor(rounded);
    const satang = Math.round((rounded - baht) * 100);
    let text = this.toThaiBig(baht) + 'บาท';
    if (satang > 0) text += this.toThaiWithinMillion(satang) + 'สตางค์'; else text += 'ถ้วน';
    return text;
  }

  // จัดรูปแบบตัวเลข
  formatNumber(num: number, decimals: number = 2): string {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // ลด Cognitive Complexity: รวม logic การสะสมผลรวมตามสถานะใบหุ้น
  private addToSummaryByStatus(
    stCODE: string,
    stkPayStat: string,
    amounts: { payBEFdvn: number; payBEFtax: number; payBEFnet: number; payCURdvn: number; payCURtax: number; payCURnet: number }
  ): void {
    const { payBEFdvn, payBEFtax, payBEFnet, payCURdvn, payCURtax, payCURnet } = amounts;
    if (typeof stCODE === 'string' && stCODE.endsWith('S008')) {
      // รายการบล็อค
      this.dividendSummary.block.bef.dvn += payBEFdvn;
      this.dividendSummary.block.bef.tax += payBEFtax;
      this.dividendSummary.block.bef.net += payBEFnet;
      this.dividendSummary.block.cur.dvn += payCURdvn;
      this.dividendSummary.block.cur.tax += payCURtax;
      this.dividendSummary.block.cur.net += payCURnet;
      return;
    }
    if (typeof stCODE === 'string' && stCODE.endsWith('002')) {
      // รายการชำรุด/สูญหาย
      this.dividendSummary._002.bef.dvn += payBEFdvn;
      this.dividendSummary._002.bef.tax += payBEFtax;
      this.dividendSummary._002.bef.net += payBEFnet;
      this.dividendSummary._002.cur.dvn += payCURdvn;
      this.dividendSummary._002.cur.tax += payCURtax;
      this.dividendSummary._002.cur.net += payCURnet;
      return;
    }
    if (typeof stkPayStat === 'string' && stkPayStat.endsWith('0TR')) {
      // รายการรอผลการโอนผ่านบัญชี
      this.dividendSummary.spin0tr.bef.dvn += payBEFdvn;
      this.dividendSummary.spin0tr.bef.tax += payBEFtax;
      this.dividendSummary.spin0tr.bef.net += payBEFnet;
      this.dividendSummary.spin0tr.cur.dvn += payCURdvn;
      this.dividendSummary.spin0tr.cur.tax += payCURtax;
      this.dividendSummary.spin0tr.cur.net += payCURnet;
      return;
    }
    // รายการปกติ - รวมใน totalSub
    this.dividendSummary.totalSub.bef.dvn += payBEFdvn;
    this.dividendSummary.totalSub.bef.tax += payBEFtax;
    this.dividendSummary.totalSub.bef.net += payBEFnet;
    this.dividendSummary.totalSub.cur.dvn += payCURdvn;
    this.dividendSummary.totalSub.cur.tax += payCURtax;
    this.dividendSummary.totalSub.cur.net += payCURnet;
  }

  // —

  // เลือกเมนูหลัก 6 ช่อง
  selectMenu(menu: DividendMenuKey): void {
    this.selectedMenu = menu;
  }

  // คืนค่ารายการเมนูตามสิทธิ์
  visibleMenus(): { key: DividendMenuKey, label: string }[] {
    return this.menuTabs.filter(m => this.visibleTabKeys.includes(m.key));
  }

  // อัปเดตสิทธิ์การมองเห็นเมนูและปุ่มจ่ายเงินสด
  private updatePermissionsAndTabs(): void {
    this.isMinistry = (this.customerData?.cusCODE || '') === '0100';

    this.visibleTabKeys = (this.isLevel80Plus && this.isMinistry)
      ? TABS_FOR_MINISTRY
      : TABS_FOR_OPERATOR;

    if (!this.visibleTabKeys.includes(this.selectedMenu)) {
      this.selectedMenu = 'CSH';
    }

    // แสดงปุ่มจ่าย: (0100 และ >=80) หรือ (ไม่ใช่ 0100 และ user = 00)
    this.showCashPayButton = (this.isMinistry && this.isLevel80Plus) || (!this.isMinistry && this.isOperator);
    // แสดงแถวควบคุม (ติ๊ก/อินพุต): เฉพาะ 0100 และ >=80
    this.canSeeCashControls = this.isMinistry && this.isLevel80Plus;

    if (!this.isLevel80Plus && this.isMinistry) {
      this.showNoPermissionAndBack();
    }
  }

  // แจ้งเตือนและย้อนกลับหน้าค้นหา สำหรับกรณีสิทธิ์ไม่เพียงพอ (ลูกค้า 0100 แต่ user < 80)
  private showNoPermissionAndBack(): void {
    Swal.fire({
      icon: 'warning',
      title: 'คำเตือน',
      text: 'ท่านไม่มีสิทธิ์ให้จ่ายเงินปันผลของกระทรวงการคลัง',
      confirmButtonText: 'ตกลง',
      allowOutsideClick: false,
      backdrop: true,
      didOpen: () => {
        const container: any = Swal.getContainer();
        if (container) {
          container.style.background = 'rgba(0,0,0,0.6)';
          container.style.backdropFilter = 'blur(3px)';
          container.style.webkitBackdropFilter = 'blur(3px)';
        }
      }
    }).then((result) => {
      // กลับไปหน้าค้นหาทันทีหลังจากกดตกลง
      this.goBack();
      this.selectedMenu = 'DETAILS';
      this.dividendData = [];
      setTimeout(() => this.cd.detectChanges(), 0);
    });
  }

  // กล่องการจ่ายเงิน: state และ handler 
  cashPayAll: boolean = true;
  cashPayAmount: number = 0;
  ktbPayAll: boolean = true;
  ktbPayAmount: number = 0;
  chequePayAll: boolean = true;
  chequePayAmount: number = 0;
  sharePayAll: boolean = true;
  sharePayAmount: number = 0;

  onToggleAll(method: PaymentMethodKey): void {
    if (method === 'CSH' && this.cashPayAll) this.cashPayAmount = this.paymentData.dividend;
    if (method === 'KTB' && this.ktbPayAll) this.ktbPayAmount = this.paymentData.dividend;
    if (method === 'CHQ' && this.chequePayAll) this.chequePayAmount = this.paymentData.dividend;
    if (method === 'STK' && this.sharePayAll) this.sharePayAmount = this.paymentData.unit;
  }

  onPay(method: PaymentMethodKey | PayActionKey): void {
    const payload = this.buildPayPayload(method);
    // ยืนยันก่อนส่ง
    const { payType, key } = this.mapPayTypeAndKey(method);
    const methodLabel = this.getMethodLabel(key);
    const amountText = payType === 'paySTK'
      ? `${this.formatNumber(payload.StkUnit, 0)} หุ้น`
      : `${this.formatNumber(payload.StkValue, 2)} บาท`;
    Swal.fire({
      icon: 'question',
      title: 'ยืนยันการจ่ายปันผล?',
      text: `${methodLabel} จำนวน ${amountText}`,
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    }).then(result => {
      if (!result.isConfirmed) { return; }
      this.loading = true;
      console.log('💰 Frontend request payload:', payload);
      if (!this.stockService || typeof (this.stockService as any).stkpay !== 'function') {
        console.error('💥 StockService is undefined or has no stkpay method');
        const req = this.escapeHtml(JSON.stringify(payload, null, 2));
        Swal.fire({ icon: 'error', title: 'ไม่พบบริการ stkpay', html: `<pre style='text-align:left;white-space:pre-wrap'>${req}</pre>`, width: 800, confirmButtonText: 'ปิด' });
        this.loading = false;
        return;
      }
      this.stockService.stkpay(payload).subscribe({
      next: (response) => {
        console.log('💰 Backend response:', response);
        const message = (response as any)?.message ?? 'ดำเนินการสำเร็จ';
        Swal.fire({ icon: 'success', title: message, confirmButtonText: 'ตกลง' });
        this.loading = false;
      },
      error: (err) => {
        console.error('💰 Backend error:', err);
        const req = this.escapeHtml(JSON.stringify(payload, null, 2));
        const res = this.escapeHtml(JSON.stringify(err?.error || err, null, 2));
        const html = `<div style='text-align:left'>
          <div style='margin-bottom:8px'><strong>Request</strong></div>
          <pre style='white-space:pre-wrap'>${req}</pre>
          <div style='margin:12px 0 8px'><strong>Error</strong></div>
          <pre style='white-space:pre-wrap'>${res}</pre>
        </div>`;
        Swal.fire({ icon: 'error', title: 'ส่งข้อมูลไม่สำเร็จ', html, width: 800, confirmButtonText: 'ปิด' });
        this.loading = false;
      }
      });
    });
  }
  // === Build payload & helpers ===
  private buildPayPayload(method: PaymentMethodKey | PayActionKey) {
    const payType = this.mapPayType(method);
    let stkUnit = 0;
    let stkValue = 0;
    if (payType === 'paySTK') {
      stkUnit = Math.max(0, Math.floor(this.sharePayAmount || 0));
      const pricePerUnit = Number(this.paymentData?.denominator || 0);
      stkValue = stkUnit * pricePerUnit;
    } else if (payType === 'payCSH') {
      stkValue = Number(this.cashPayAmount || 0);
    } else if (payType === 'payKTB') {
      stkValue = Number(this.ktbPayAmount || 0);
    } else if (payType === 'payCHQ') {
      stkValue = Number(this.chequePayAmount || 0);
    }
    return {
      CusId: this.customerData?.cusId || '',
      PayType: payType,
      StkUnit: stkUnit,
      StkValue: stkValue
    };
  }

  private mapPayType(method: PaymentMethodKey | PayActionKey): PayActionKey {
    if (typeof method === 'string' && method.startsWith('pay')) return method as any;
    switch (method as PaymentMethodKey) {
      case 'CSH': return 'payCSH';
      case 'KTB': return 'payKTB';
      case 'CHQ': return 'payCHQ';
      case 'STK': return 'paySTK';
    }
  }

  private escapeHtml(s: string): string {
    return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as any)[c]);
  }

  onAmountChange(method: PaymentMethodKey, raw: any): void {
    const text = (raw ?? '').toString();
    const normalized = text.replace(/,/g, '');
    const num = Number(normalized);
    let value = isNaN(num) ? 0 : num;
    if (method === 'STK') {
      this.sharePayAmount = this.clampUnit(value, this.paymentData.unit || 0);
      return;
    }
    const clamped = this.clampAmount(value, Number(this.paymentData.dividend || 0));
    if (method === 'CSH') this.cashPayAmount = clamped;
    else if (method === 'KTB') this.ktbPayAmount = clamped;
    else if (method === 'CHQ') this.chequePayAmount = clamped;
  }

  // === Thai number reading helpers (extracted to reduce complexity in numberToThaiText) ===
  private toThaiWithinMillion(n: number): string {
    if (n === 0) return '';
    const s = Math.floor(n).toString();
    const len = s.length;
    let result = '';
    for (let i = 0; i < len; i++) {
      const digit = parseInt(s[i]);
      if (digit === 0) continue;
      const pos = len - i - 1; // 0 หน่วย, 1 สิบ, 2 ร้อย, ...
      result += this.formatThaiWithinMillionDigit(digit, pos, len);
    }
    return result;
  }

  private formatThaiWithinMillionDigit(digit: number, pos: number, totalLength: number): string {
    const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    const unitWithinMillion = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];
    if (pos === 1) {
      if (digit === 1) return 'สิบ';
      if (digit === 2) return 'ยี่สิบ';
      return numbers[digit] + 'สิบ';
    }
    if (pos === 0) {
      if (digit === 1 && totalLength > 1) return 'เอ็ด';
      return numbers[digit];
    }
    return numbers[digit] + unitWithinMillion[pos];
  }

  // แปลงจำนวนหุ้นเป็นข้อความไทยแบบย่อ (เฉพาะจำนวนเต็ม ไม่ใส่หน่วย)
  toThaiNumber(num: number): string {
    if (typeof num !== 'number' || isNaN(num)) return '';
    const whole = Math.floor(num);
    // รองรับจำนวนมากกว่าแสน (ใช้ตัวอ่านแบบกลุ่มล้าน)
    return this.toThaiBig(whole);
  }

  private toThaiBig(num: number): string {
    if (num === 0) return 'ศูนย์';
    const parts: number[] = [];
    let n = Math.floor(num);
    while (n > 0) {
      parts.push(n % 1000000);
      n = Math.floor(n / 1000000);
    }
    let result = '';
    for (let i = parts.length - 1; i >= 0; i--) {
      const grp = parts[i];
      if (grp === 0) continue;
      if (result) result += 'ล้าน';
      result += this.toThaiWithinMillion(grp);
    }
    return result || 'ศูนย์';
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
    if (!this.dividendData || this.dividendData.length === 0) return;
    const blockedStocks = this.blockedStocks;
    
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
    this.showAlert('warning', 'คำเตือน', message);
  }

  // แสดง Error Alert
  showErrorAlert(message: string): void {
    this.showAlert('error', 'ข้อผิดพลาด', message);
  }

  // —

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

  // ====== Small helpers to reduce duplication ======
  private mapPayTypeAndKey(method: PaymentMethodKey | PayActionKey): { payType: PayActionKey, key: PaymentMethodKey } {
    const payType = this.mapPayType(method);
    let key: PaymentMethodKey;
    if (payType === 'paySTK') key = 'STK';
    else if (payType === 'payCSH') key = 'CSH';
    else if (payType === 'payKTB') key = 'KTB';
    else key = 'CHQ';
    return { payType, key };
  }

  private getMethodLabel(key: PaymentMethodKey): string {
    return this.menuTabs.find(t => t.key === key)?.label || key;
  }

  private clampAmount(value: number, max: number): number {
    const n = isNaN(value) ? 0 : value;
    return Math.min(Math.max(0, n), Math.max(0, max));
  }

  private clampUnit(value: number, maxUnits: number): number {
    const n = Math.floor(isNaN(value) ? 0 : value);
    return Math.min(Math.max(0, n), Math.max(0, Math.floor(maxUnits)));
  }

  private showAlert(icon: 'warning' | 'error' | 'success' | 'info' | 'question', title: string, text: string): void {
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonText: 'ตกลง',
      allowOutsideClick: false,
      backdrop: true,
      didOpen: () => {
        const container: any = Swal.getContainer();
        if (container) {
          container.style.background = 'rgba(0,0,0,0.5)';
          container.style.backdropFilter = 'blur(2px)';
          container.style.webkitBackdropFilter = 'blur(2px)';
        }
      }
    });
  }
}