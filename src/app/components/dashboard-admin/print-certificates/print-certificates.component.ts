import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignatureService, Signature, StockData } from '../../../services/signature';

@Component({
  selector: 'app-print-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './print-certificates.component.html',
  styleUrls: ['./print-certificates.component.css']
})
export class PrintCertificatesComponent implements OnInit {
  
  dateCategory: 'issue' | 'sale' | 'approve' = 'issue';
  searchBy: 'stockNumber' | 'date' = 'stockNumber';
  dateType: 'date' | 'dateRange' | 'year' = 'date';

  stockNumber: string = '';
  
  issueDay: string = '';
  issueMonth: string = '';
  issueYear: string = '';
  
  startDay: string = '';
  startMonth: string = '';
  startYear: string = '';
  endDay: string = '';
  endMonth: string = '';
  endYear: string = '';
  
  selectedYear: string = '';
  
  signatory1: string = '';
  signatory2: string = '';
  signatures: Signature[] = [];
  loadingSignatures: boolean = false;
  signatureError: string = '';
  apiResponse: any = null;

  // ข้อมูลหุ้น
  stockList: StockData[] = [];
  loadingStocks: boolean = false;
  stockError: string = '';

  dayOptions: { value: string; label: string }[] = [];
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

  readonly yearOptions = [
    { value: '2568', label: '2568' },
    { value: '2567', label: '2567' },
    { value: '2566', label: '2566' },
    { value: '2565', label: '2565' },
    { value: '2564', label: '2564' },
    { value: '2563', label: '2563' },
    { value: '2562', label: '2562' },
    { value: '2561', label: '2561' },
    { value: '2560', label: '2560' },
    { value: '2559', label: '2559' },
    { value: '2558', label: '2558' },
    { value: '2557', label: '2557' },
    { value: '2556', label: '2556' },
    { value: '2555', label: '2555' },
    { value: '2554', label: '2554' },
    { value: '2553', label: '2553' },
    { value: '2552', label: '2552' },
    { value: '2551', label: '2551' },
    { value: '2550', label: '2550' },
    { value: '2549', label: '2549' },
    { value: '2548', label: '2548' },
    { value: '2547', label: '2547' },
    { value: '2546', label: '2546' },
    { value: '2545', label: '2545' },
    { value: '2544', label: '2544' },
    { value: '2543', label: '2543' },
    { value: '2542', label: '2542' },
    { value: '2541', label: '2541' },
    { value: '2540', label: '2540' },
    { value: '2539', label: '2539' },
    { value: '2538', label: '2538' },
    { value: '2537', label: '2537' },
    { value: '2536', label: '2536' },
    { value: '2535', label: '2535' },
    { value: '2534', label: '2534' },
    { value: '2533', label: '2533' },
    { value: '2532', label: '2532' },
    { value: '2531', label: '2531' },
    { value: '2530', label: '2530' },
    { value: '2529', label: '2529' },
    { value: '2528', label: '2528' },
    { value: '2527', label: '2527' },
    { value: '2526', label: '2526' },
    { value: '2525', label: '2525' },
    { value: '2524', label: '2524' },
    { value: '2523', label: '2523' },
    { value: '2522', label: '2522' },
    { value: '2521', label: '2521' },
    { value: '2520', label: '2520' },
    { value: '2519', label: '2519' },
    { value: '2518', label: '2518' },
    { value: '2517', label: '2517' },
    { value: '2516', label: '2516' },
    { value: '2515', label: '2515' },
    { value: '2514', label: '2514' },
    { value: '2513', label: '2513' },
    { value: '2512', label: '2512' },
    { value: '2511', label: '2511' },
    { value: '2510', label: '2510' }
  ];
  
  constructor(
    private readonly signatureService: SignatureService
  ) { }

  ngOnInit() {
    this.loadSignatures();
    this.updateDayOptions();
  }

  loadSignatures() {
    this.loadingSignatures = true;
    this.signatureError = '';
    this.apiResponse = null;
    
    this.signatureService.getSignatures().subscribe({
      next: (signatures) => {
        this.apiResponse = signatures;
        this.signatures = signatures.filter(sig => !sig.substituteTo);
        this.loadingSignatures = false;
      },
      error: (error) => {
        this.loadingSignatures = false;
        this.signatureError = 'ไม่สามารถโหลดข้อมูลผู้ลงนามได้ กรุณาลองใหม่อีกครั้ง';
        this.signatures = [];
        this.apiResponse = null;
      }
    });
  }

  searchStocks() {
    this.loadingStocks = true;
    this.stockError = '';
    this.stockList = [];

    const payload = this.buildSearchPayload();
    console.log('Search payload:', payload);
    
    this.signatureService.getStockData(payload).subscribe({
      next: (response: StockData[]) => {
        console.log('API Response:', response);
        this.stockList = response || [];
        this.loadingStocks = false;
      },
      error: (error: any) => {
        console.error('Search error:', error);
        this.loadingStocks = false;
        this.stockError = 'ไม่สามารถค้นหาข้อมูลหุ้นได้ กรุณาลองใหม่อีกครั้ง';
        this.stockList = [];
      }
    });
  }

  private buildSearchPayload(): any {
    const payload: any = {
      action: 'SEARCH'
    };

    if (this.searchBy === 'stockNumber') {
      payload.stkNote = this.stockNumber;
    } else {
      // ค้นหาด้วยวันที่
      if (this.dateType === 'date' && this.issueDay && this.issueMonth && this.issueYear) {
        const date = this.formatDateForAPI(this.issueDay, this.issueMonth, this.issueYear);
        this.setDateField(payload, date);
      } else if (this.dateType === 'dateRange' && this.startDay && this.startMonth && this.startYear && this.endDay && this.endMonth && this.endYear) {
        const startDate = this.formatDateForAPI(this.startDay, this.startMonth, this.startYear);
        const endDate = this.formatDateForAPI(this.endDay, this.endMonth, this.endYear);
        this.setDateRangeField(payload, startDate, endDate);
      } else if (this.dateType === 'year' && this.selectedYear) {
        this.setYearField(payload, this.selectedYear);
      }
    }

    return payload;
  }

  private setDateField(payload: any, date: string) {
    switch (this.dateCategory) {
      case 'issue':
        payload.stkDateIssue = date;
        break;
      case 'sale':
        payload.stkDateEffect = date;
        break;
      case 'approve':
        payload.stkDateApprove = date;
        break;
    }
  }

  private setDateRangeField(payload: any, startDate: string, endDate: string) {
    switch (this.dateCategory) {
      case 'issue':
        payload.stkDateIssueFrom = startDate;
        payload.stkDateIssueTo = endDate;
        break;
      case 'sale':
        payload.stkDateEffectFrom = startDate;
        payload.stkDateEffectTo = endDate;
        break;
      case 'approve':
        payload.stkDateApproveFrom = startDate;
        payload.stkDateApproveTo = endDate;
        break;
    }
  }

  private setYearField(payload: any, year: string) {
    const christianYear = parseInt(year) - 543;
    switch (this.dateCategory) {
      case 'issue':
        payload.stkDateIssueYear = christianYear;
        break;
      case 'sale':
        payload.stkDateEffectYear = christianYear;
        break;
      case 'approve':
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

  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  getDaysInMonth(month: number, year: number): number {
    const daysInMonth = [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysInMonth[month - 1];
  }

  updateDayOptions(month?: string, year?: string) {
    const selectedMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear() + 543;
    
    const christianYear = selectedYear - 543;
    const daysInMonth = this.getDaysInMonth(selectedMonth, christianYear);
    
    this.dayOptions = [];
    for (let i = 1; i <= daysInMonth; i++) {
      this.dayOptions.push({ value: i.toString(), label: i.toString() });
    }
  }

  onMonthChange(month: string, year: string) {
    this.updateDayOptions(month, year);
    
    const christianYear = parseInt(year) - 543;
    const daysInMonth = this.getDaysInMonth(parseInt(month), christianYear);
    const currentDay = parseInt(this.issueDay);
    
    if (currentDay > daysInMonth) {
      this.issueDay = '';
    }
  }

  onYearChange(year: string, month: string) {
    this.updateDayOptions(month, year);
    
    const christianYear = parseInt(year) - 543;
    const daysInMonth = this.getDaysInMonth(parseInt(month), christianYear);
    const currentDay = parseInt(this.issueDay);
    
    if (currentDay > daysInMonth) {
      this.issueDay = '';
    }
  }

  onSearchByChange(type: 'stockNumber' | 'date') {
    this.searchBy = type;
    
    if (type === 'stockNumber') {
      this.issueDay = '';
      this.issueMonth = '';
      this.startDay = '';
      this.startMonth = '';
      this.endDay = '';
      this.endMonth = '';
      this.selectedYear = '';
    } else {
      this.stockNumber = '';
    }
  }

  onDateTypeChange(type: 'date' | 'dateRange' | 'year') {
    this.dateType = type;
    
    this.issueDay = '';
    this.issueMonth = '';
    this.startDay = '';
    this.startMonth = '';
    this.endDay = '';
    this.endMonth = '';
    this.selectedYear = '';
  }

  onDateCategoryChange(type: 'issue' | 'sale' | 'approve') {
    this.dateCategory = type;
  }

  isStockNumberDisabled(): boolean {
    return this.searchBy === 'date';
  }

  isDateDisabled(): boolean {
    return this.searchBy === 'stockNumber';
  }

  onSearch() {
    this.searchStocks();
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