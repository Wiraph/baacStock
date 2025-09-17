import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SystemMetadata } from '../../../../services/Metadata/system-metadata';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Reports, StockReportDto } from '../../../../services/reports';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  pdfSrc: SafeResourceUrl | null = null;

  // Date select options
  days: number[] = Array.from({ length: 31 }, (_, index) => index + 1);
  
  // Date form controls
  startDay: number | null = null;
  startMonth: number | null = null;
  startYear: number | null = null;
  endDay: number | null = null;
  endMonth: number | null = null;
  endYear: number | null = null;

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
    private readonly reportService: Reports,
    private readonly sanitizer: DomSanitizer
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

  // ฟังก์ชันแปลงวันที่เป็นรูปแบบ YYYYMMDD (พ.ศ.)
  private formatDateToYYYYMMDD(day: number | null, month: number | null, year: number | null): string {
    if (!day || !month || !year) {
      return "";
    }
    
    // แปลงปี พ.ศ. เป็น ค.ศ.
    const christianYear = year;
    
    // สร้างวันที่ในรูปแบบ YYYYMMDD
    const formattedDate = `${christianYear}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
    return formattedDate;
  }

  // ฟังก์ชันตรวจสอบความถูกต้องของวันที่
  private validateDate(day: number | null, month: number | null, year: number | null): boolean {
    if (!day || !month || !year) {
      return false;
    }
    
    // ตรวจสอบช่วงวันที่
    if (day < 1 || day > 31 || month < 1 || month > 12) {
      return false;
    }
    
    // ตรวจสอบปี
    if (year < 2500 || year > 2600) {
      return false;
    }
    
    return true;
  }

  loadFile(typeExport: string) {
    // ตรวจสอบความถูกต้องของวันที่
    if (!this.validateDate(this.startDay, this.startMonth, this.startYear)) {
      alert('กรุณาเลือกวันที่เริ่มต้นให้ถูกต้อง');
      return;
    }
    
    if (!this.validateDate(this.endDay, this.endMonth, this.endYear)) {
      alert('กรุณาเลือกวันที่สิ้นสุดให้ถูกต้อง');
      return;
    }

    // แปลงวันที่เป็นรูปแบบ YYYYMMDD
    const dateStart = this.formatDateToYYYYMMDD(this.startDay, this.startMonth, this.startYear);
    const dateEnd = this.formatDateToYYYYMMDD(this.endDay, this.endMonth, this.endYear);

    // ตรวจสอบว่าวันที่เริ่มต้นไม่เกินวันที่สิ้นสุด
    if (dateStart > dateEnd) {
      alert('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด');
      return;
    }

    const payload: StockReportDto = {
      Division: this.selectedDivision || "",
      Prov: this.selectedProvince || "",
      Br: this.selectedBranch || "",
      DateStart: dateStart,
      DateEnd: dateEnd,
      TypeExport: typeExport
    }

    console.log('Sending payload:', payload);

    this.loading = true;
    
    // ใช้ endpoint ที่ทำงานได้แล้ว (downloadApproveReport)
    // แต่ปรับ payload ให้เหมาะสมกับ SP ที่ต้องการ
    const reportPayload = {
      DateSTA: dateStart,  // วันที่เริ่มต้น YYYYMMDD (ค.ศ.)
      DateSTP: dateEnd,    // วันที่สิ้นสุด YYYYMMDD (ค.ศ.)
      RemCode: 'TRN|DVN',  // ประเภทการ
      Division: this.selectedDivision || "",
      Prov: this.selectedProvince || "",
      Br: this.selectedBranch || "",
      TypeExport: typeExport
    };

    console.log('Sending report payload:', reportPayload);

     this.reportService.LoadFileMenu3(payload).subscribe({
       next: (response: any) => {
         console.log('Report response:', response);
         this.loading = false;
         
         // แสดงเอกสารใน Document Preview Area
         if (response.fileUrl) {
           this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(response.fileUrl);
           this.cd.detectChanges();
         } else {
           alert('ไม่พบไฟล์รายงาน');
         }
       },
       error: (error: any) => {
         console.error('Error generating report:', error);
         this.loading = false;
         alert('เกิดข้อผิดพลาดในการสร้างรายงาน');
       }
     });
  }

  sendHead() {
    this.headerChange.emit("รายงานสรุปผลการโอนหุ้นประจำวันแยกตามประเภทผู้ถือหุ้น");
  }

  goBack(): void {
    this.back.emit();
  }
}
