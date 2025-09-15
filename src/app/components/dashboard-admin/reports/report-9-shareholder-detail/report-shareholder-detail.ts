import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-report-9-shareholder-detail',
  imports: [CommonModule],
  templateUrl: './report-shareholder-detail.html',
  styleUrl: './report-shareholder-detail.css'
})
export class Report9ShareholderDetail implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

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

  // เพิ่ม property สำหรับจัดการการแสดง input fields
  selectedCustomerType: string = 'cus-type';

  constructor(
    private readonly cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("รายงานรายละเอียดผู้ถือหุ้น");
  }

  // เพิ่ม method สำหรับจัดการการเปลี่ยนประเภทลูกค้า
  onCustomerTypeChange(event: any): void {
    this.selectedCustomerType = event.target.value;
  }

  goBack(): void {
    this.back.emit();
  }
}
