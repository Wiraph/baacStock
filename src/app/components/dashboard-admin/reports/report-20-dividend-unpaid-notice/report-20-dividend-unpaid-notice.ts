import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ThaiCalendarComponent } from '../../../thai-calendar-component/thai-calendar-component';
import { Thaidateadapter } from '../../../thaidateadapter/thaidateadapter';

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
  selector: 'app-report-20-dividend-unpaid-notice',
  standalone: true,
  imports: [CommonModule, FormsModule, ThaiCalendarComponent],
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
  ],
  templateUrl: './report-20-dividend-unpaid-notice.html',
  styleUrl: './report-20-dividend-unpaid-notice.css'
})
export class Report20DividendUnpaidNotice implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Form fields
  documentNumber: string = '';
  selectedDate: Date | null = null;
  showCalendar: boolean = false;
  hideDocumentDate: boolean = false;
  signatory: string = '';
  remarks: string = 'โปรดแจ้งให้พนักงานธนาคารผูกบัญชีเงินฝากออมทรัพย์ เพื่อรองรับเงินปันผลในปีถัดไป';
  
  // Additional fields
  idCardNumber: string = '';
  firstName: string = '';
  lastName: string = '';
  customerType: string = '';
  dividendPaymentCash: boolean = false;
  dividendPaymentTransfer: boolean = false;

  // Signatory options
  signatoryOptions = [
    { value: 'A', label: 'นาย A' },
    { value: 'B', label: 'นาย B' },
    { value: 'C', label: 'นาย C' }
  ];

  // Customer type options
  customerTypeOptions = [
    { value: '0100', label: '0100: รัฐบาล (กระทรวงการคลัง)' },
    { value: '0400', label: '0400: ธนาคารและสถาบันการเงินอื่นในประเทศ' },
    { value: '0600', label: '0600: บุคคลธรรมดา' },
    { value: '0601', label: '0601: บุคคลธรรมดาซึ่งไม่ประสงค์รับดอกเบี้ย' },
    { value: '0602', label: '0602: พนักงาน ธ.ก.ส.' },
    { value: '0603', label: '0603: เกษตรกร' },
    { value: '0700', label: '0700: สถาบันไม่หากำไรแต่ไม่รับการยกเว้นการเสียภาษี(ฌกส. ฌกฝ.)' },
    { value: '0701', label: '0701: กลุ่มไม่เป็นทางการ' },
    { value: '0703', label: '0703: ยกเลิก สหกรณ์นอกภาคการเกษตร (สหกรณ์นิคม)' },
    { value: '0704', label: '0704: สหกรณร้านค้า' },
    { value: '0705', label: '0705: สหกรณ์บริการ' },
    { value: '0706', label: '0706: สหกรณ์เครดิตยูเนียน' },
    { value: '0707', label: '0707: สหกรณ์การเกษตร สหกรณ์ประมง สหกรณ์นิคม' },
    { value: '0708', label: '0708: สกต.' },
    { value: '0709', label: '0709: กลุ่มเกษตรกร' },
    { value: '0710', label: '0710: สหกรณ์ออมทรัพย์, ชุมนุมสหกรณ์' },
    { value: '0714', label: '0714: สถาบันการเงินชุมชน' }
  ];

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    // Set default date to current date
    this.selectedDate = new Date();
  }

  sendHead() {
    this.headerChange.emit("หนังสือแจ้งเงินปันผลค้างจ่าย");
  }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.showCalendar = false;
  }

  // แสดงผลไทย เช่น 15 ก.ย. 2568
  formatThaiDate(date: Date | null): string {
    if (!date) return '';
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const d = date.getDate();
    const m = months[date.getMonth()];
    const y = date.getFullYear() + 543;
    return `${d} ${m} ${y}`;
  }

  goBack(): void {
    this.back.emit();
  }
}