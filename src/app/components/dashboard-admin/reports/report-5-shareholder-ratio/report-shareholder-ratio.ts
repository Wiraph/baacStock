import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Reports, StockReportDto } from '../../../../services/reports';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-report-5-shareholder-ratio',
  imports: [CommonModule],
  templateUrl: './report-shareholder-ratio.html',
  styleUrl: './report-shareholder-ratio.css'
})
export class Report5ShareholderRatio implements OnInit {
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
    this.headerChange.emit("รายงานสัดส่วนผู้ถือหุ้น");
  }

  loadFile() {
    const payload: StockReportDto = {
      Division: "",
      Prov: "",
      Br: "",
      DateStart: "", // YYYYMMDD
      DateEnd: "",
      TypeExport: "" // PDF || ECEL
    }

    this.reportService.LoadFileMenu5(payload).subscribe({
      next: (res:any) => {

      }, error: (err:any) => {
        Swal.fire({
          icon: 'error',
          text: `${err.message}`
        })
      }
    })
    // {
    // "message": "Report generated successfully",
    // "filePath": "wwwroot\\Reps\\รายงานสัดส่วนผู้ถือหุ้น_25680916-160227.xlsx",
    // "fileUrl": "https://localhost:7089/Reps/รายงานสัดส่วนผู้ถือหุ้น_25680916-160227.xlsx"
    // }
  }

  goBack(): void {
    this.back.emit();
  }
}
