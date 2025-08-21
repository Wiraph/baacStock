import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-print-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './print-certificates.component.html',
  styleUrls: ['./print-certificates.component.css']
})
export class PrintCertificatesComponent {
  
  // ประเภทหมวดวันที่ (dropdown ใหม่ก่อนเลือกชนิดช่วงเวลา)
  dateCategory: 'issue' | 'sale' | 'approve' = 'issue';

  // Properties สำหรับจัดการ radio button selection
  searchBy: 'stockNumber' | 'date' = 'stockNumber';
  dateType: 'date' | 'dateRange' | 'year' = 'date';

  
  // Properties สำหรับ input values
  stockNumber: string = '';
  
  // Properties สำหรับวันที่
  issueDay: string = '';
  issueMonth: string = '';
  issueYear: string = '2568';
  
  // Properties สำหรับช่วงวันที่
  startDay: string = '';
  startMonth: string = '';
  startYear: string = '2568';
  endDay: string = '';
  endMonth: string = '';
  endYear: string = '2568';
  
  // Properties สำหรับปี
  selectedYear: string = '2568';
  
  // Properties สำหรับผู้ลงนาม
  signatory1: string = '';
  signatory2: string = '';

  // Date Options Arrays - รวมวันเดือนปีไว้ที่หลังบ้าน
  readonly dayOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '7', label: '7' },
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: '10', label: '10' },
    { value: '11', label: '11' },
    { value: '12', label: '12' },
    { value: '13', label: '13' },
    { value: '14', label: '14' },
    { value: '15', label: '15' },
    { value: '16', label: '16' },
    { value: '17', label: '17' },
    { value: '18', label: '18' },
    { value: '19', label: '19' },
    { value: '20', label: '20' },
    { value: '21', label: '21' },
    { value: '22', label: '22' },
    { value: '23', label: '23' },
    { value: '24', label: '24' },
    { value: '25', label: '25' },
    { value: '26', label: '26' },
    { value: '27', label: '27' },
    { value: '28', label: '28' },
    { value: '29', label: '29' },
    { value: '30', label: '30' },
    { value: '31', label: '31' }
  ];

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
  
  constructor() { }

  // Method สำหรับเปลี่ยนประเภทการค้นหา (เลขที่ใบหุ้น หรือ วันที่)
  onSearchByChange(type: 'stockNumber' | 'date') {
    this.searchBy = type;
    
    // Clear values เมื่อเปลี่ยนประเภทการค้นหา
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

  // Method สำหรับเปลี่ยนประเภทวันที่
  onDateTypeChange(type: 'date' | 'dateRange' | 'year') {
    this.dateType = type;
    
    // Clear values เมื่อเปลี่ยนประเภทวันที่
    this.issueDay = '';
    this.issueMonth = '';
    this.startDay = '';
    this.startMonth = '';
    this.endDay = '';
    this.endMonth = '';
    this.selectedYear = '';
  }

  // Method สำหรับเปลี่ยนหมวดวันที่ (วันที่ออก/ช่วงวันที่ขาย/วันที่สาขาอนุมัติ)
  onDateCategoryChange(type: 'issue' | 'sale' | 'approve') {
    this.dateCategory = type;
  }

  // Method สำหรับตรวจสอบว่า input ควรถูก disable หรือไม่
  isStockNumberDisabled(): boolean {
    return this.searchBy === 'date';
  }

  isDateDisabled(): boolean {
    return this.searchBy === 'stockNumber';
  }

  // Method สำหรับค้นหา
  onSearch() {
    console.log('ค้นหาด้วย:', {
      searchBy: this.searchBy,
      stockNumber: this.stockNumber,
      dateType: this.dateType,
      dateCategory: this.dateCategory,
      date: {
        day: this.issueDay,
        month: this.issueMonth,
        year: this.issueYear
      },
      dateRange: {
        start: {
          day: this.startDay,
          month: this.startMonth,
          year: this.startYear
        },
        end: {
          day: this.endDay,
          month: this.endMonth,
          year: this.endYear
        }
      },
      year: this.selectedYear,
      signatory1: this.signatory1,
      signatory2: this.signatory2
    });
    
    // TODO: เพิ่ม logic การค้นหาจริง
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