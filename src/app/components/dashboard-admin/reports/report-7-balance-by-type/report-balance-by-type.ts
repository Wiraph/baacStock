import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Reports } from '../../../../services/reports';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-report-7-balance-by-type',
  imports: [CommonModule],
  templateUrl: './report-balance-by-type.html',
  styleUrl: './report-balance-by-type.css'
})
export class Report7BalanceByType implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Date select options
  days: number[] = Array.from({ length: 31 }, (_, index) => index + 1);

  months: { value: number; label: string }[] = [
    { value: 1, label: 'มกราคม' },
    { value: 2, label: 'กุมภาพันธ์' },
    { value: 3, label: 'มีนาคม' },
    { value: 4, label: 'เมษายน' },
    { value: 5, label: 'พฤษภาคม' },
    { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' },
    { value: 8, label: 'สิงหาคม' },
    { value: 9, label: 'กันยายน' },
    { value: 10, label: 'ตุลาคม' },
    { value: 11, label: 'พฤศจิกายน' },
    { value: 12, label: 'ธันวาคม' }
  ];
  
  years: number[] = Array.from({ length: 2568 - 2500 + 1 }, (_, index) => 2568 - index);

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly reportService: Reports
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("รายงานสรุปยอดคงเหลือแยกตามประเภทผู้ถือหุ้น");
  }

  loadFile() {
    const payload = {
      StkType: "", // A || B
      DateStart: "", // yyyymmdd พ.ศ.
      TypeExport: "" // PDF || EXCEL
    }

    this.reportService.LoadFileMenu7(payload).subscribe({
      next: (res) => {

      },error: (err:any) => {
        Swal.fire({
          icon: 'error',
          text: `${err.message}`
        })
      }
    })
  }

  goBack(): void {
    this.back.emit();
  }
}
