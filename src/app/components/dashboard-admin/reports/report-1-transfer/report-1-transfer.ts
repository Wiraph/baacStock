import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CustomerMetadata } from '../../../../services/Metadata/customer-metadata';
import { SystemMetadata } from '../../../../services/Metadata/system-metadata';
import Swal from 'sweetalert2';
import { StockMetadata } from '../../../../services/Metadata/stock-metadata';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StockService } from '../../../../services/stock';

@Component({
  standalone: true,
  selector: 'app-report-1-transfer',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-1-transfer.html',
  styleUrl: './report-1-transfer.css'
})
export class Report1Transfer implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();
  form: FormGroup = new FormGroup({});
  custypeg: any;
  stockType: any[] = [];
  division: any[] = [];
  province: any[] = [];
  branch: any[] = [];
  prov: any[] = [];
  br: any[] = [];
  loading: boolean = false;
  selectedDivision: any = "0";
  selectedProvince: any = null;
  selectedBranch: any = null;
  saleBy: string = "0";
  ApproveFlg: string = "0";
  CusType: string = "0"
  dateMode: string = "";
  issdateSt: string = '';
  issmonthSt: string = '';
  issyearSt: string = '';
  issdateEn: string = '';
  issmonthEn: string = '';
  issyearEn: string = '';
  effdateSt: string = '';
  effmonthSt: string = '';
  effyearSt: string = '';
  effdateEn: string = '';
  effmonthEn: string = '';
  effyearEn: string = '';
  stkType: string = 'A';
  pdfSrc: SafeResourceUrl | null = null;

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
    private readonly customerMetadataService: CustomerMetadata,
    private readonly systemMetadataService: SystemMetadata,
    private readonly stockMetadataService: StockMetadata,
    private readonly sanitizer: DomSanitizer,
    private readonly stockService: StockService,
    private readonly fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      division: [null],
      prov: [null],
      br: [null]
    })
  }

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    this.getData();
  }

  sendHead() {
    this.headerChange.emit("รายงานการขายหุ้น/โอนเปลี่ยนมือ");
  }

  getData() {
    this.loading = true;
    forkJoin({
      custypeg: this.customerMetadataService.custypeg(),
      branch: this.systemMetadataService.branch(),
      stockType: this.stockMetadataService.stkTyps(),
    }).subscribe({
      next: (result: any) => {
        this.loading = false;
        this.custypeg = result.custypeg;
        this.division = result.branch.division;
        this.province = result.branch.province;
        this.branch = result.branch.branch;
        this.stockType = result.stockType;
        this.cd.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        Swal.fire({ icon: 'error', text: err })
        this.cd.detectChanges();
      }
    })
    setTimeout(() => { }, 0)
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
    this.systemMetadataService.Province(payload).subscribe({
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
    this.systemMetadataService.BrBranch(payload).subscribe({
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

  genPdf(TypeReport: string) {
    let DateStart = '';
    let DateEnd = '';
    if (this.dateMode == "1") {
      if (!this.issdateSt || !this.issdateEn || !this.issmonthSt || !this.issmonthEn || !this.issyearSt || !this.issyearEn) {
        Swal.fire({
          icon: 'warning',
          text: "กรุณาเลือกวันที่ให้ครบ"
        });
        return;
      }

      const dateSt = this.issdateSt.toString().padStart(2, '0');
      const dateEn = this.issdateEn.toString().padStart(2, '0');
      const monthSt = this.issmonthSt.toString().padStart(2, '0');
      const monthEn = this.issmonthEn.toString().padStart(2, '0');

      DateStart = `${this.issyearSt}${monthSt}${dateSt}`;
      DateEnd = `${this.issyearEn}${monthEn}${dateEn}`;

    } else if (this.dateMode == "2") {
      if (!this.effdateSt || !this.effdateEn || !this.effmonthSt || !this.effmonthEn || !this.effyearSt || !this.effyearEn) {
        Swal.fire({
          icon: 'warning',
          text: "กรุณาเลือกวันที่ให้ครบ"
        });
        return;
      }

      const dateSt = this.effdateSt.toString().padStart(2, '0');
      const dateEn = this.effdateEn.toString().padStart(2, '0');
      const monthSt = this.effmonthSt.toString().padStart(2, '0');
      const monthEn = this.effmonthEn.toString().padStart(2, '0');

      DateStart = `${this.effyearSt}${monthSt}${dateSt}`;
      DateEnd = `${this.effyearEn}${monthEn}${dateEn}`;
    }
    this.loading = true;
    const payload = {
      "DD": this.dateMode,
      "DateSta": DateStart ?? "",
      "DateStp": DateEnd ?? "",
      "oldNew": this.saleBy,
      "ApproveFlg": this.ApproveFlg,
      "StkType": this.stkType,
      "CusType": this.CusType,
      "BrDiv": this.selectedDivision ?? "",
      "BrPrv": this.selectedProvince ?? "",
      "BrCode": this.selectedBranch ?? "",
      "PCnt": 4,
    }

    if (TypeReport == "PDF") {
      this.pdf(payload);
    } else {
      this.excel(payload);
    }

  }

  pdf(payload: any) {
    this.stockService.GenPdfStockReport(payload).subscribe({
      next: (blob: Blob) => {
        this.loading = false;
        if (!blob || blob.size === 0) {
          Swal.fire({ icon: 'warning', text: 'ไม่พบข้อมูลสำหรับสร้างรายงาน' });
          return;
        }
        const url = window.URL.createObjectURL(blob);
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('PDF Error', err);
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถสร้างรายงานได้',
          text: err.message || 'เกิดข้อผิดพลาดจากระบบ'
        });
        this.cd.detectChanges();
      }
    });
  }

  excel(payload: any) {
    this.stockService.GenExcelStockReport(payload).subscribe({
      next: (blob: Blob) => {
        this.loading = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'StockReport.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.cd.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('EXCEL : Error', err);
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถสร้างรายงานได้',
          text: err.message || 'เกิดข้อผิดพลาดจากระบบ'
        });
        this.cd.detectChanges();
      }
    })
  }

  goBack(): void {
    this.back.emit();
  }
}
