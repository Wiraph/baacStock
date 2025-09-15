import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ThaiCalendarComponent } from '../../../thai-calendar-component/thai-calendar-component';
import { Thaidateadapter } from '../../../thaidateadapter/thaidateadapter';

export const THAI_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-report-14-certificate-delivery-letter',
  standalone: true,
  imports: [CommonModule, FormsModule, ThaiCalendarComponent],
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' }
  ],
  templateUrl: './report-certificate-delivery-letter.html',
  styleUrl: './report-certificate-delivery-letter.css'
})
export class Report14CertificateDeliveryLetter implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  selectedCustomerType: string = 'cus-group';
  selectedGroup: string = '';
  showConfirmDate: boolean = false;
  selectedConfirmDate: Date | null = null;
  showToDate: boolean = false;
  selectedToDate: Date | null = null;
  signatory: string = '';

  // Signatory options
  signatoryOptions = [
    { value: 'นาย A', label: 'นาย A' },
    { value: 'นาย B', label: 'นาย B' },
    { value: 'นาย C', label: 'นาย C' }
  ];

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    this.selectedConfirmDate = new Date();
    this.selectedToDate = new Date();
  }

  sendHead() {
    this.headerChange.emit("หนังสือส่งมอบใบหุ้น");
  }

  onCustomerTypeChange(event: any) {
    this.selectedCustomerType = event.target.value;
    this.selectedGroup = ''; // Reset group when customer type changes
  }

  onGroupChange(event: any) {
    this.selectedGroup = event.target.value;
  }

  onConfirmDateSelected(date: Date) {
    this.selectedConfirmDate = date;
    this.showConfirmDate = false;
  }

  onToDateSelected(date: Date) {
    this.selectedToDate = date;
    this.showToDate = false;
  }

  formatThaiDate(date: Date | null): string {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = (date.getFullYear() + 543).toString(); // Convert to Buddhist year
    return `${day}/${month}/${year}`;
  }

  goBack(): void {
    this.back.emit();
  }
}
