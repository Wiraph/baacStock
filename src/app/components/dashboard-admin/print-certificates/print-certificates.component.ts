import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SignatureService, Signature, StockData } from '../../../services/signature';
import { StockService } from '../../../services/stock';

@Component({
  selector: 'app-print-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './print-certificates.component.html',
  styleUrls: ['./print-certificates.component.css']
})
export class PrintCertificatesComponent implements OnInit {
  
  // Properties สำหรับการค้นหา (ตามโค้ดเก่า)
  searchTypeRadio: 'stkNOTE' | 'date' = 'stkNOTE';
  stkNOTE: string = '';
  
  // Properties สำหรับวันที่ (ตามโค้ดเก่า)
  dateType: 'stkDateIssue' | 'stkDateEffect' | 'stkDateApprove' = 'stkDateIssue';
  timeType: 'date-year' | 'date-range' | 'date-day' = 'date-year';
  
  // Properties สำหรับวันที่
  dateYear: string = '';
  dateRangeStartD: string = '';
  dateRangeStartM: string = '';
  dateRangeStartY: string = '';
  dateRangeStopD: string = '';
  dateRangeStopM: string = '';
  dateRangeStopY: string = '';
  dateDayD: string = '';
  dateDayM: string = '';
  dateDayY: string = '';
  
  // Properties สำหรับผู้ลงนาม (ตามโค้ดเก่า)
  sigNature1: string = '';
  sigNature2: string = '';
  signatureList: Signature[] = [];
  loadingSignatures: boolean = false;
  signatureError: string = '';

  // ข้อมูลหุ้น
  stockList: StockData[] = [];
  loadingStocks: boolean = false;
  stockError: string = '';

  // Date Options Arrays
  readonly dayOptions = Array.from({length: 31}, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString()
  }));

  readonly monthOptions = [
    { value: '1', label: 'มกราคม' },
    { value: '2', label: 'กุมภาพันธ์' },
    { value: '3', label: 'มีนาคม' },
    { value: '4', label: 'เมษายน' },
    { value: '5', label: 'พฤษภาคม' },
    { value: '6', label: 'มิถุนายน' },
    { value: '7', label: 'กรกฎาคม' },
    { value: '8', label: 'สิงหาคม' },
    { value: '9', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' }
  ];

  readonly yearOptions = Array.from({length: 50}, (_, i) => {
    const year = 2568 - i;
    return {
      value: year.toString(),
      label: year.toString()
    };
  });
  
  constructor(
    private readonly signatureService: SignatureService,
    private readonly http: HttpClient,
    private readonly stockService: StockService
  ) { }

  ngOnInit() {
    this.loadSignatureList();
    this.setDefaultYear();
  }

  // โหลดรายชื่อผู้ลงนามจาก database
  loadSignatureList() {
    this.loadingSignatures = true;
    this.signatureError = '';
    
    this.signatureService.getSignatures().subscribe({
      next: (signatures) => {
        console.log(`โหลดข้อมูลผู้ลงนามสำเร็จ: ${signatures.length} คน`);
        this.signatureList = signatures;
        this.loadingSignatures = false;
      },
      error: (error) => {
        console.error('Error loading signatures:', error);
        this.loadingSignatures = false;
        this.signatureError = 'ไม่สามารถโหลดข้อมูลผู้ลงนามได้ กรุณาลองใหม่อีกครั้ง';
        this.signatureList = [];
      }
    });
  }

  // ตั้งค่าปีปัจจุบัน
  setDefaultYear() {
    const currentYear = new Date().getFullYear() + 543; // แปลงเป็นปี พ.ศ.
    this.dateYear = currentYear.toString();
    this.dateRangeStartY = currentYear.toString();
    this.dateRangeStopY = currentYear.toString();
    this.dateDayY = currentYear.toString();
  }

  // Method สำหรับเปลี่ยนประเภทการค้นหา
  onSearchTypeChange(type: 'stkNOTE' | 'date') {
    this.searchTypeRadio = type;
    
    // Clear values เมื่อเปลี่ยนประเภทการค้นหา
    if (type === 'stkNOTE') {
      this.clearDateValues();
    } else {
      this.stkNOTE = '';
    }
  }

  // Method สำหรับเปลี่ยนประเภทวันที่
  onTimeTypeChange(type: 'date-year' | 'date-range' | 'date-day') {
    this.timeType = type;
    this.clearDateValues();
  }

  // Method สำหรับเปลี่ยนหมวดวันที่
  onDateTypeChange(type: 'stkDateIssue' | 'stkDateEffect' | 'stkDateApprove') {
    this.dateType = type;
  }

  // Clear ค่าวันที่
  clearDateValues() {
    this.dateYear = '';
    this.dateRangeStartD = '';
    this.dateRangeStartM = '';
    this.dateRangeStartY = '';
    this.dateRangeStopD = '';
    this.dateRangeStopM = '';
    this.dateRangeStopY = '';
    this.dateDayD = '';
    this.dateDayM = '';
    this.dateDayY = '';
  }

  // Method สำหรับตรวจสอบว่า input ควรถูก disable หรือไม่
  isStkNOTEDisabled(): boolean {
    return this.searchTypeRadio === 'date';
  }

  isDateDisabled(): boolean {
    return this.searchTypeRadio === 'stkNOTE';
  }

  isTimeTypeDisabled(): boolean {
    return this.searchTypeRadio === 'stkNOTE';
  }

  // Method สำหรับค้นหา
  onSearch() {
    // ตรวจสอบ token ก่อน
    const token = sessionStorage.getItem('token');
    if (!token) {
      this.stockError = 'ไม่มีการยืนยันตัวตน กรุณา login ใหม่';
      return;
    }

    // ตรวจสอบข้อมูลที่กรอก
    if (this.searchTypeRadio === 'stkNOTE') {
      if (!this.stkNOTE || this.stkNOTE.trim() === '') {
        this.stockError = 'กรุณากรอกเลขที่ใบหุ้น';
        return;
      }
    } else {
      // ตรวจสอบข้อมูลวันที่
      if (this.timeType === 'date-day') {
        if (!this.dateDayD || !this.dateDayM || !this.dateDayY) {
          this.stockError = 'กรุณาเลือกวันที่ให้ครบถ้วน';
          return;
        }
      } else if (this.timeType === 'date-range') {
        if (!this.dateRangeStartD || !this.dateRangeStartM || !this.dateRangeStartY ||
            !this.dateRangeStopD || !this.dateRangeStopM || !this.dateRangeStopY) {
          this.stockError = 'กรุณาเลือกช่วงวันที่ให้ครบถ้วน';
          return;
        }
      } else if (this.timeType === 'date-year') {
        if (!this.dateYear) {
          this.stockError = 'กรุณาเลือกปี';
          return;
        }
      }
    }

    this.loadingStocks = true;
    this.stockError = '';
    this.stockList = [];

    const searchPayload = this.buildSearchPayload();
    console.log('Search payload:', searchPayload);
    const payload = {
      stkNote: searchPayload.stkNOTE,
    }
    
    this.stockService.getStockDetail(payload).subscribe({
      next: (response: StockData[]) => {
        console.log('API Response:', response);
        this.stockList = response || [];
        this.loadingStocks = false;
      },
      error: (error: any) => {
        console.error('Search error:', error);
        this.loadingStocks = false;
        
        // แสดงรายละเอียด error มากขึ้น
        if (error.status === 400) {
          // แสดง error message ที่ได้จาก API
          const errorMsg = error.message || 'กรุณาตรวจสอบข้อมูลที่กรอก';
          this.stockError = `ข้อมูลไม่ถูกต้อง (400): ${errorMsg}`;
          
          // แสดงคำแนะนำเพิ่มเติม
          if (this.searchTypeRadio === 'stkNOTE') {
            this.stockError += '\n\nคำแนะนำ:';
            this.stockError += '\n• กรุณาตรวจสอบเลขที่ใบหุ้นว่าถูกต้องหรือไม่';
            this.stockError += '\n• ลองใช้เลขที่ใบหุ้นอื่น เช่น A000035455';
            this.stockError += '\n• ตรวจสอบว่า API endpoint ถูกต้องหรือไม่';
            this.stockError += '\n• ลองเปลี่ยน action เป็น GET, FIND, หรือ QUERY';
            this.stockError += '\n• ลองส่ง payload แบบง่าย เช่น { stkNOTE: "A000056131" }';
          }
        } else if (error.status === 401) {
          this.stockError = 'Token หมดอายุ กรุณา login ใหม่';
        } else if (error.status === 404) {
          this.stockError = 'ไม่พบ API endpoint - กรุณาตรวจสอบ URL';
        } else {
          this.stockError = `ไม่สามารถค้นหาข้อมูลหุ้นได้: ${error.message || 'กรุณาลองใหม่อีกครั้ง'}`;
        }
        
        this.stockList = [];
      }
    });
  }

  // สร้าง payload สำหรับค้นหา
  private buildSearchPayload(): any {
    const payload: any = {
      action: ' '
    };

    if (this.searchTypeRadio === 'stkNOTE') {
      // ใช้แค่ field เดียวเพื่อลดความสับสน
      payload.stkNOTE = this.stkNOTE;
    } else {
      // ค้นหาด้วยวันที่
      if (this.timeType === 'date-day' && this.dateDayD && this.dateDayM && this.dateDayY) {
        const date = this.formatDateForAPI(this.dateDayD, this.dateDayM, this.dateDayY);
        this.setDateField(payload, date);
      } else if (this.timeType === 'date-range' && this.dateRangeStartD && this.dateRangeStartM && this.dateRangeStartY && this.dateRangeStopD && this.dateRangeStopM && this.dateRangeStopY) {
        const startDate = this.formatDateForAPI(this.dateRangeStartD, this.dateRangeStartM, this.dateRangeStartY);
        const endDate = this.formatDateForAPI(this.dateRangeStopD, this.dateRangeStopM, this.dateRangeStopY);
        this.setDateRangeField(payload, startDate, endDate);
      } else if (this.timeType === 'date-year' && this.dateYear) {
        this.setYearField(payload, this.dateYear);
      }
    }

    // เพิ่ม debug log เพื่อดู payload ที่ส่งไป
    console.log('Final Search Payload:', JSON.stringify(payload, null, 2));

    return payload;
  }

  private setDateField(payload: any, date: string) {
    switch (this.dateType) {
      case 'stkDateIssue':
        payload.stkDateIssue = date;
        break;
      case 'stkDateEffect':
        payload.stkDateEffect = date;
        break;
      case 'stkDateApprove':
        payload.stkDateApprove = date;
        break;
    }
  }

  private setDateRangeField(payload: any, startDate: string, endDate: string) {
    switch (this.dateType) {
      case 'stkDateIssue':
        payload.stkDateIssueFrom = startDate;
        payload.stkDateIssueTo = endDate;
        break;
      case 'stkDateEffect':
        payload.stkDateEffectFrom = startDate;
        payload.stkDateEffectTo = endDate;
        break;
      case 'stkDateApprove':
        payload.stkDateApproveFrom = startDate;
        payload.stkDateApproveTo = endDate;
        break;
    }
  }

  private setYearField(payload: any, year: string) {
    const christianYear = parseInt(year) - 543;
    switch (this.dateType) {
      case 'stkDateIssue':
        payload.stkDateIssueYear = christianYear;
        break;
      case 'stkDateEffect':
        payload.stkDateEffectYear = christianYear;
        break;
      case 'stkDateApprove':
        payload.stkDateApproveYear = christianYear;
        break;
    }
  }

  private formatDateForAPI(day: string, month: string, year: string): string {
    const christianYear = parseInt(year) - 543;
    const monthStr = month.padStart(2, '0');
    const dayStr = day.padStart(2, '0');
    return `${christianYear}-${monthStr}-${dayStr}`;
  }

  getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
} 