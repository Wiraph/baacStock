import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-34-movement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-34-movement.html',
  styleUrl: './report-34-movement.css'
})
export class Report34Movement implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Form fields
  selectedType: string = 'name_surname';
  selectedFromDay: string = '1';
  selectedFromMonth: string = '9';
  selectedFromYear: string = '2559';
  selectedToDay: string = '1';
  selectedToMonth: string = '9';
  selectedToYear: string = '2562';

  // Options
  typeOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'address', label: 'ที่อยู่' },
    { value: 'name_surname', label: 'ชื่อ-สกุล' },
    { value: 'dividend_condition', label: 'เงื่อนไขรับเงินปันผล' },
    { value: 'shareholder_type', label: 'ประเภทผู้ถือหุ้น' }
  ];

  days: number[] = Array.from({ length: 31 }, (_, index) => index + 1);
  months = [
    { value: '1', label: 'ม.ค.' },
    { value: '2', label: 'ก.พ.' },
    { value: '3', label: 'มี.ค.' },
    { value: '4', label: 'เม.ย.' },
    { value: '5', label: 'พ.ค.' },
    { value: '6', label: 'มิ.ย.' },
    { value: '7', label: 'ก.ค.' },
    { value: '8', label: 'ส.ค.' },
    { value: '9', label: 'ก.ย.' },
    { value: '10', label: 'ต.ค.' },
    { value: '11', label: 'พ.ย.' },
    { value: '12', label: 'ธ.ค.' }
  ];

  years: number[] = Array.from({ length: 2568 - 2554 + 1 }, (_, index) => 2568 - index);

  pdfSrc: string | null = null;

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead(): void {
    this.headerChange.emit("รายงานการเคลื่อนไหว");
  }

  loadFile(type: string): void {
    console.log('Load file with:', {
      type: type,
      selectedType: this.selectedType,
      fromDate: `${this.selectedFromDay}/${this.selectedFromMonth}/${this.selectedFromYear}`,
      toDate: `${this.selectedToDay}/${this.selectedToMonth}/${this.selectedToYear}`
    });
    // Logic to generate report
    alert(`ดำเนินการค้นหา ${type}`);
  }

  goBack(): void {
    this.back.emit();
  }
}
