import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ThaiCalendarComponent } from '../../../thai-calendar-component/thai-calendar-component';
import { Thaidateadapter } from '../../../thaidateadapter/thaidateadapter';
import { Reports } from '../../../../services/reports';
import Swal from 'sweetalert2';

export const THAI_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'd MMMM yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'd MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-report-2-newstock',
  standalone: true,
  imports: [CommonModule, FormsModule, ThaiCalendarComponent],
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
  ],
  templateUrl: './report-newstock.html',
  styleUrls: ['./report-newstock.css']
})
export class Report2Newstock implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // แสดง/ซ่อน calendar
  showCalendarFrom = false;
  showCalendarTo = false;

  // วันที่ที่เลือก (ใช้ Thai calendar adapter แสดงผล)
  selectedDateFrom: Date = new Date();
  selectedDateTo: Date = new Date();

  // ฟิลเตอร์
  filters = {
    types: {
      transfer: false,
      damaged: false,
      nameChange: false,
      lost: false,
    },
    // เก็บเป็นรูปแบบ YYYYMMDD (พ.ศ.) สำหรับเรียก API
    from: '',
    to: '',
  };

  constructor(
    private readonly reportService: Reports
  ) { }

  ngOnInit(): void {
    this.headerChange.emit('รายงานการอนุมัติออกใบหุ้นใหม่');
    // ค่าเริ่มต้น: วันนี้
    this.filters.from = this.formatDateToString(this.selectedDateFrom);
    this.filters.to = this.formatDateToString(this.selectedDateTo);
  }

  onDateFromSelected(date: Date): void {
    this.selectedDateFrom = date;
    this.filters.from = this.formatDateToString(date);
    this.showCalendarFrom = false;
  }

  onDateToSelected(date: Date): void {
    this.selectedDateTo = date;
    this.filters.to = this.formatDateToString(date);
    this.showCalendarTo = false;
  }

  // แปลง Date → YYYYMMDD (พ.ศ.) สำหรับส่งหา API
  private formatDateToString(date: Date): string {
    const year = date.getFullYear() + 543; // พ.ศ.
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  // แสดงผลไทย เช่น 12 กันยายน 2568
  formatThaiDate(date: Date | null): string {
    if (!date) return '';
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const d = date.getDate();
    const m = months[date.getMonth()];
    const y = date.getFullYear() + 543;
    return `${d} ${m} ${y}`;
  }

  onSearch(): void {
    // ตรวจสอบการเลือกประเภทรายการ
    const selectedTypes = [];
    if (this.filters.types.nameChange) selectedTypes.push('LOS0040');
    if (this.filters.types.lost) selectedTypes.push('LOS0021');
    if (this.filters.types.damaged) selectedTypes.push('LOS0020');
    if (this.filters.types.transfer) selectedTypes.push('TRN');

    if (selectedTypes.length === 0) {
      Swal.fire({
        icon: 'warning',
        text: 'กรุณาเลือกประเภทรายการอย่างน้อยหนึ่งรายการ'
      });
      return;
    }

    // สร้าง payload 
    const payload = {
      DateSTA: this.filters.from, // YYYYMMDD (พ.ศ.) 
      DateSTP: this.filters.to,   // YYYYMMDD (พ.ศ.) 
      RemCode: selectedTypes.join('|') // "TRN|LOS0020|LOS0040|LOS0021" 
    };

    console.log('DateSTA (DSTA):', payload.DateSTA);
    console.log('DateSTP (DSTP):', payload.DateSTP);
    console.log('RemCode (REMc):', payload.RemCode);

    this.reportService.downloadApproveReport(payload).subscribe({
      next: (blob) => {
        // สร้าง link สำหรับดาวน์โหลดไฟล์
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.click();
        window.URL.revokeObjectURL(url);
        
        Swal.fire({
          icon: 'success',
          text: 'ดาวน์โหลดรายงานสำเร็จ'
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          text: 'ไม่พบข้อมูลตามวันที่ระบุ'
        });
        console.log("Error", err);
      }
    });
  }

  goBack(): void {
    this.back.emit();
  }

  getCurrentDateTimeBE(): string {
    const now = new Date();

    const yearBE = now.getFullYear() + 543; // พ.ศ.
    const month = String(now.getMonth() + 1).padStart(2, '0'); // เดือน 01-12
    const day = String(now.getDate()).padStart(2, '0');       // วัน 01-31
    const hours = String(now.getHours()).padStart(2, '0');     // ชั่วโมง 00-23
    const minutes = String(now.getMinutes()).padStart(2, '0'); // นาที 00-59
    const seconds = String(now.getSeconds()).padStart(2, '0'); // วินาที 00-59

    return `${yearBE}${month}${day}-${hours}${minutes}${seconds}`;
  }
}