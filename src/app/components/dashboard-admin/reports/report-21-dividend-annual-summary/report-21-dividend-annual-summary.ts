import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Divident } from '../../../../services/divident';
import { Reports } from '../../../../services/reports';

@Component({
  selector: 'app-report-21-dividend-annual-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-21-dividend-annual-summary.html',
  styleUrl: './report-21-dividend-annual-summary.css'
})
export class Report21DividendAnnualSummary implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Form fields
  selectedYear: string = '2567';
  groupingOption: number = 1;

  loading = false;

  // Year options (2567 down to 2554)
  years: string[] = [];

  // Grouping options
  groupingOptions = [
    { value: 1, label: 'แยกตามประเภทผู้ถือหุ้น และ ประเภทการจ่าย' },
    { value: 2, label: 'แยกตามประเภทการจ่าย' },
    { value: 3, label: 'แยกตามรายผู้ถือหุ้น' }
  ];

  constructor(
    private readonly dividendService: Divident,
    private readonly cd: ChangeDetectorRef,
    private readonly reportService: Reports
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.sendHead());
    this.getYears();
  }

  sendHead() {
    this.headerChange.emit("สรุปการจ่ายเงินปันผลหุ้นสามัญประจำปี");
  }

  getYears() {
    this.loading = true;
    this.dividendService.stkyear().subscribe({
      next: (data: any[]) => {
        this.years = data.map(d => d.stkYear);
        this.loading = false;
        this.cd.detectChanges();
      }, error: (error) => {
        console.error('Error fetching years:', error);
      }
    })
  }

  onSearch(): void {
    const payload = {
      StkYear: this.selectedYear,
      RepType: this.groupingOption
    }
    this.loading = true;
    console.log("Payload", payload);
    this.reportService.LoadFileMenu21(payload).subscribe({
      next: (res:any) => {
        this.loading = false;
        const url = res.fileUrl;
        const a = document.createElement('a');
        a.href = url;
        a.download = url.substring(url.lastIndexOf('/') + 1);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.cd.detectChanges();
      }, error: (err) => {
        this.loading = false;
        console.error('Error fetching report data:', err);
        this.cd.detectChanges();
      }
    })


  }

  goBack(): void {
    this.back.emit();
  }
}