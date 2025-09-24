import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Reports } from '../../../../services/reports';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-report-15-certificate-delivery-envelope',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-15-certificate-delivery-envelope.html',
  styleUrl: './report-15-certificate-delivery-envelope.css'
})
export class Report15CertificateDeliveryEnvelope implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  loading: boolean = false;
  pdfSrc: SafeResourceUrl | null = null;

  // Search type selection
  selectedSearchType: string = 'stockNumber';
  stockNumber: string = '';
  selectedDateType: string = 'stkDateIssue';
  selectedDateMode: string = 'date-year';
  selectedYear: string = '';
  
  // Date range properties
  selectedFromDay: string = '';
  selectedFromMonth: string = '';
  selectedFromYear: string = '';
  selectedToDay: string = '';
  selectedToMonth: string = '';
  selectedToYear: string = '';
  
  // Specific date properties
  selectedSpecificDay: string = '';
  selectedSpecificMonth: string = '';
  selectedSpecificYear: string = '';

  loadingReport: boolean = false;

  // Date select options
  days: number[] = Array.from({ length: 31 }, (_, index) => index + 1);

  months: { value: number; label: string }[] = [
    { value: 1, label: 'ม.ค.' },
    { value: 2, label: 'ก.พ.' },
    { value: 3, label: 'มี.ค.' },
    { value: 4, label: 'เม.ย.' },
    { value: 5, label: 'พ.ค.' },
    { value: 6, label: 'มิ.ย.' },
    { value: 7, label: 'ก.ค.' },
    { value: 8, label: 'ส.ค.' },
    { value: 9, label: 'ก.ย.' },
    { value: 10, label: 'ต.ค.' },
    { value: 11, label: 'พ.ย.' },
    { value: 12, label: 'ธ.ค.' }
  ];

  years: number[] = Array.from({ length: 2568 - 2510 + 1 }, (_, index) => 2568 - index);


  constructor(private readonly sanitizer: DomSanitizer, private readonly reports: Reports, private readonly cd:ChangeDetectorRef) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("หน้าซองนำส่งใบหุ้น");
  }

  onSearchTypeChange() {
    // Reset values when switching search type
    if (this.selectedSearchType === 'stockNumber') {
      this.selectedDateType = '';
      this.selectedDateMode = '';
      this.selectedYear = '';
      this.selectedFromDay = '';
      this.selectedFromMonth = '';
      this.selectedFromYear = '';
      this.selectedToDay = '';
      this.selectedToMonth = '';
      this.selectedToYear = '';
      this.selectedSpecificDay = '';
      this.selectedSpecificMonth = '';
      this.selectedSpecificYear = '';
    } else if (this.selectedSearchType === 'date') {
      this.stockNumber = '';
    }
  }

  genFile() {
    if (this.selectedDateMode === 'year') {
      console.log('Year:', this.selectedYear);
    } else if (this.selectedDateMode === 'dateRange') {
      console.log('From Date:', this.selectedFromDay, this.selectedFromMonth, this.selectedFromYear);
      console.log('To Date:', this.selectedToDay, this.selectedToMonth, this.selectedToYear);
    } else if (this.selectedDateMode === 'specificDate') {
      console.log('Specific Date:', this.selectedSpecificDay, this.selectedSpecificMonth, this.selectedSpecificYear);
    }

    if (this.selectedDateMode == 'date-year') {
      this.selectedFromDay = "";
      this.selectedFromMonth = "";
      this.selectedFromYear = "";
      this.selectedToDay = "";
      this.selectedToMonth = "";
      this.selectedToYear = "";
      this.selectedSpecificDay = "";
      this.selectedSpecificMonth = "";
      this.selectedSpecificYear = ""; 
    }
    if (this.selectedDateMode == 'date-range') {
      this.selectedYear = "";
      this.selectedSpecificDay = "";
      this.selectedSpecificMonth = "";
      this.selectedSpecificYear = ""; 
    }
    if (this.selectedDateMode == 'date-day') {
      this.selectedYear = "";
      this.selectedFromDay = "";
      this.selectedFromMonth = "";
      this.selectedFromYear = "";
      this.selectedToDay = "";
      this.selectedToMonth = "";
      this.selectedToYear = "";
    }
    if (this.selectedSearchType == 'stockNumber') {
      this.selectedDateMode = "";
    }
    const payload = {
      StkNote: this.stockNumber ?? "",
      DateType: this.selectedDateType ?? "",
      TimeType: this.selectedDateMode ?? "",
      Year: this.selectedYear ?? "",
      StartDate: this.selectedFromDay && this.selectedFromMonth && this.selectedFromYear ? `${this.selectedFromYear}${this.selectedFromMonth}${this.selectedFromDay}` : "",
      EndDate: this.selectedToDay && this.selectedToMonth && this.selectedToYear ? `${this.selectedToYear}${this.selectedToMonth}${this.selectedToDay}` : "",
      Date: this.selectedSpecificDay && this.selectedSpecificMonth && this.selectedSpecificYear ? `${this.selectedSpecificYear}${this.selectedSpecificMonth}${this.selectedSpecificDay}` : ""
    }
    this.loadingReport = true;
    this.reports.LoadFileMenu15(payload).subscribe({
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
        console.log("Error", err);
        this.loadingReport = false
        this.cd.detectChanges();
      }
    })
  }

  goBack(): void {
    this.back.emit();
  }
}
