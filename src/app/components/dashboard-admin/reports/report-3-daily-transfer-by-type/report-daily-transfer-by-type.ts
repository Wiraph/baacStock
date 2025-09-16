import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SystemMetadata } from '../../../../services/Metadata/system-metadata';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Reports, StockReportDto } from '../../../../services/reports';

@Component({
  standalone: true,
  selector: 'app-report-3-daily-transfer-by-type',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-daily-transfer-by-type.html',
  styleUrl: './report-daily-transfer-by-type.css'
})
export class Report3DailyTransferByType implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();
  division: any[] = [];
  province: any[] = [];
  branch: any[] = [];
  selectedDivision: any = "0";
  selectedProvince: any = null;
  selectedBranch: any = null;
  loading: boolean = true;
  form: FormGroup = new FormGroup({});

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

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly systemMetadata: SystemMetadata,
    private readonly fb: FormBuilder,
    private readonly reportService: Reports
  ) {
    this.form = this.fb.group({
      division: [null],
      prov: [null],
      br: [null]
    })
  }

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    this.loadData();
  }

  loadData() {
    this.systemMetadata.branch().subscribe({
      next: (res: any) => {
        this.division = res.division;
        this.province = res.province;
        this.branch = res.branch;
        this.loading = false;
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Error", err);
        this.loading = false;
        this.cd.detectChanges();
      }
    })
  }

  onDivisionChange() {
    this.selectedProvince = "";
    if (this.selectedDivision == 0) {
      this.province = [];
      this.branch = [];
      return;
    }
    this.loading = true;
    this.province = [];
    this.selectedBranch = null;
    const payload = {
      BrDiv: this.selectedDivision
    }
    console.log("Chagne payload", payload);
    this.systemMetadata.Province(payload).subscribe({
      next: (res: any) => {
        this.province = res;
        console.log("Change Data:", res);
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Error", err);
      }
    })
    setTimeout(() => {
      this.loading = false;
    }, 0)
  }

  onProvinceChange() {
    this.loading = true;
    this.selectedBranch = null;
    const payload = {
      BrPrv: this.selectedProvince
    }
    this.systemMetadata.BrBranch(payload).subscribe({
      next: (res: any) => {
        this.branch = res;
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Error", err);
      }
    })
    setTimeout(() => {
      this.loading = false;
    }, 0)
  }

  loadFile() {
    const payload: StockReportDto = {
      Division: "", //selectedDivision
      Prov: "", //selectedProvince
      Br: "", //selectedBranch
      DateStart: "", // YYYYMMDD พ.ศ.
      DateEnd: "", // YYYYMMDD พ.ศ.
      TypeExport: "" // PDF or EXCEL
    }

    // ตัวอย่างผลลัพธ์จาก API
    //     {
      //     "message": "Report generated successfully",
      //     "filePath": "wwwroot\\Reps\\STK110_รายงานโอนหุ้น_25680916-094105.xlsx",
      //     "fileUrl": "https://localhost:7089/Reps/STK110_รายงานโอนหุ้น_25680916-094105.xlsx"
    //      }
    this.reportService.LoadFileMenu3(payload).subscribe({

    })
  }

  sendHead() {
    this.headerChange.emit("รายงานสรุปผลการโอนหุ้นประจำวันแยกตามประเภทผู้ถือหุ้น");
  }

  goBack(): void {
    this.back.emit();
  }
}
