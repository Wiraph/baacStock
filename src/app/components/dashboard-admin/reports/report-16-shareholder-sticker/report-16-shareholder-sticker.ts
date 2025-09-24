import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  selector: 'app-report-16-shareholder-sticker',
  standalone: true,
  imports: [CommonModule, FormsModule, ThaiCalendarComponent],
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
  ],
  templateUrl: './report-16-shareholder-sticker.html',
  styleUrl: './report-16-shareholder-sticker.css'
})
export class Report16ShareholderSticker implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  loading: boolean = false;
  pdfSrc: SafeResourceUrl | null = null;

  // Form fields
  selectedDate: Date | null = null;
  showCalendar: boolean = false;
  idCardNumber: string = '';
  shareholderName: string = '';
  lastName: string = '';
  loadingReport: boolean = false;

  constructor(private readonly sanitizer: DomSanitizer, private readonly reportService: Reports, private readonly cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    // Set default date to current date
    this.selectedDate = new Date();
  }

  sendHead() {
    this.headerChange.emit("สติ๊กเกอร์รายชื่อผู้ถือหุ้น");
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

  genFile() {
    console.log('As of Date:', this.formatDateToYYYYMMDD(this.selectedDate));
    console.log('ID Card Number:', this.idCardNumber);
    console.log('Shareholder Name:', this.shareholderName);
    console.log('Last Name:', this.lastName);
    const payload = {
      DateTime: this.formatDateToYYYYMMDD(this.selectedDate),
      Cusid: this.idCardNumber ?? "",
      CusFname: this.shareholderName ?? "",
      CusLname: this.lastName ?? "",
    }

    this.loadingReport = true;
    this.reportService.LoadFileMenu16(payload).subscribe({
      next: (res:any) => {
        const Url = res.fileUrl;
        const link = document.createElement('a');
        link.href = Url;
        link.download = Url.split('/').pop() || 'report.pdf';
        link.click();
        this.loadingReport = false;
        this.cd.detectChanges();
      }, error: (err:any) => {
        Swal.fire({
          icon: 'error',
          text: `${err.message}`
        })
        console.log("error", err);
      }
    })
  }

  goBack(): void {
    this.back.emit();
  }

  formatDateToYYYYMMDD(date: Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear() + 543; // Convert to Thai year
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0'); 
    return `${year}${month}${day}`;
  }
}
