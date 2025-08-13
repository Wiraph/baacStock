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