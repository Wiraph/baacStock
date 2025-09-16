import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Reports, StockReportDto } from '../../../../services/reports';

@Component({
  standalone: true,
  selector: 'app-report-4-dividend-rate',
  imports: [CommonModule],
  templateUrl: './report-dividend-rate.html',
  styleUrl: './report-dividend-rate.css'
})
export class Report4DividendRate implements OnInit {
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
    this.headerChange.emit("รายงานข้อมูลอัตราเงินปันผล");
  }

  loadFile() {
    const payload: StockReportDto = {
      Division: "", // ปล่อยว่าง
      Prov: "", // ปล่อยว่าง
      Br: "", // ปล่อยว่าง
      DateStart: "", // YYYYY
      DateEnd: "", // YYYYY
      TypeExport: "" // PDF || EXCEL
    }
    this.reportService.LoadFileMenu4(payload).subscribe({

    })

    // ตัวอย่างผลลัพธ์
    // {
    // "message": "Report generated successfully",
    // "filePath": "wwwroot\\Reps\\รายงานข้อมูลอัตราเงินปันผล_25680916-122505.xlsx",
    // "fileUrl": "https://localhost:7089/Reps/รายงานข้อมูลอัตราเงินปันผล_25680916-122505.xlsx"
    // }
  }

  goBack(): void {
    this.back.emit();
  }
}
