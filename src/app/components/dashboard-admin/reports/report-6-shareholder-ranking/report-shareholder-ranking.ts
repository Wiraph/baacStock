import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Reports } from '../../../../services/reports';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-report-6-shareholder-ranking',
  imports: [CommonModule],
  templateUrl: './report-shareholder-ranking.html',
  styleUrl: './report-shareholder-ranking.css'
})
export class Report6ShareholderRanking implements OnInit {
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
  
  years: number[] = Array.from({ length: 2568 - 2554 + 1 }, (_, index) => 2568 - index);

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly reportService: Reports
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("รายงานการจัดลำดับผู้ถือหุ้น");
  }

  loadFile() {
    const payload = {
      Custype: "", // cuscode กรณีเลือกทั้งหมดให้ส่งค่า ""
      Top: 10 // จำนวน
    }

    this.reportService.LoadFileMenu6(payload).subscribe({
      next: (res:any) => {

      }, error: (err:any) => {
        Swal.fire({
          icon: 'error',
          text: `${err.message}`
        })
        console.log("Error", err);
      }
    })
    // {
    // "message": "Report generated successfully",
    // "filePath": "wwwroot\\Reps\\STK220_25680916-205456.xlsx",
    // "fileUrl": "https://localhost:7089/Reps/STK220_25680916-205456.xlsx"
    // }
  }

  goBack(): void {
    this.back.emit();
  }
}
