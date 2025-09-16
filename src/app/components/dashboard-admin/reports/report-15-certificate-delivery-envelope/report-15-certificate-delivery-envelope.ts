import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  selectedDateType: string = '';
  selectedDateMode: string = '';
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


  constructor(private readonly sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("ซองส่งมอบใบหุ้น");
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

  genPdf(type: string) {
    console.log('Generating report:', type);
    console.log('Search Type:', this.selectedSearchType);
    console.log('Stock Number:', this.stockNumber);
    console.log('Date Type:', this.selectedDateType);
    console.log('Date Mode:', this.selectedDateMode);
    
    if (this.selectedDateMode === 'year') {
      console.log('Year:', this.selectedYear);
    } else if (this.selectedDateMode === 'dateRange') {
      console.log('From Date:', this.selectedFromDay, this.selectedFromMonth, this.selectedFromYear);
      console.log('To Date:', this.selectedToDay, this.selectedToMonth, this.selectedToYear);
    } else if (this.selectedDateMode === 'specificDate') {
      console.log('Specific Date:', this.selectedSpecificDay, this.selectedSpecificMonth, this.selectedSpecificYear);
    }
  }

  goBack(): void {
    this.back.emit();
  }
}
