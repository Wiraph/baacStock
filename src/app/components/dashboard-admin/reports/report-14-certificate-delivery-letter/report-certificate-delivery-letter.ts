import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-report-14-certificate-delivery-letter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-certificate-delivery-letter.html',
  styleUrl: './report-certificate-delivery-letter.css'
})
export class Report14CertificateDeliveryLetter implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  loading: boolean = false;
  pdfSrc: SafeResourceUrl | null = null;

  selectedCustomerType: string = 'cus-group';
  selectedGroup: string = '';
  
  // Date selectors for confirm date
  selectedConfirmDay: string = '';
  selectedConfirmMonth: string = '';
  selectedConfirmYear: string = '';
  
  // Date selectors for to date
  selectedToDay: string = '';
  selectedToMonth: string = '';
  selectedToYear: string = '';
  
  signatory: string = '';

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

  years: number[] = Array.from({ length: 2568 - 2500 + 1 }, (_, index) => 2568 - index);

  // Signatory options
  signatoryOptions = [
    { value: 'นาย A', label: 'นาย A' },
    { value: 'นาย B', label: 'นาย B' },
    { value: 'นาย C', label: 'นาย C' }
  ];

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    // Set default values to current date
    const today = new Date();
    this.selectedConfirmDay = today.getDate().toString();
    this.selectedConfirmMonth = (today.getMonth() + 1).toString();
    this.selectedConfirmYear = (today.getFullYear() + 543).toString();
    
    this.selectedToDay = today.getDate().toString();
    this.selectedToMonth = (today.getMonth() + 1).toString();
    this.selectedToYear = (today.getFullYear() + 543).toString();
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

  genPdf(type: string) {
    console.log('Generating report:', type);
    console.log('Confirm Date:', this.selectedConfirmDay, this.selectedConfirmMonth, this.selectedConfirmYear);
    console.log('To Date:', this.selectedToDay, this.selectedToMonth, this.selectedToYear);
    console.log('Signatory:', this.signatory);
  }

  constructor(private readonly sanitizer: DomSanitizer) {}

  goBack(): void {
    this.back.emit();
  }
}
