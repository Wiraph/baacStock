import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Reports } from '../../../../services/reports';
import { CustomerMetadata } from '../../../../services/Metadata/customer-metadata';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-report-6-shareholder-ranking',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-shareholder-ranking.html',
  styleUrl: './report-shareholder-ranking.css'
})
export class Report6ShareholderRanking implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Form data
  rankingCount: number = 10;
  selectedCustype: string = '';
  custypes: any[] = [];

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
    private readonly reportService: Reports,
    private readonly customerMetadata: CustomerMetadata
  ) {}

  ngOnInit(): void {
    this.loadCustypes();
    setTimeout(() => this.sendHead());
  }

  loadCustypes() {
    this.customerMetadata.cusTypes().subscribe({
      next: (data) => {
        this.custypes = data;
        this.cd.detectChanges();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          text: `${err.message}`
        });
      }
    });
  }

  sendHead() {
    this.headerChange.emit("รายงานการจัดลำดับผู้ถือหุ้น");
  }

  downloadReport() {
    if (!this.rankingCount || this.rankingCount < 1) {
      return;
    }

    const payload = {
      Custype: this.selectedCustype || "", // cuscode
      Top: this.rankingCount // จำนวน
    };

    console.log('Payload:', payload);

    this.reportService.LoadFileMenu6(payload).subscribe({
      next: (response) => {
        console.log('Report Response:', response);
        
        if (response?.fileUrl) {
          // Download file
          const link = document.createElement('a');
          link.href = response.fileUrl;
          link.download = `รายงานการจัดลำดับผู้ถือหุ้น_${this.rankingCount}.xlsx`;
          link.click();
        }
      },
      error: (err: any) => {
        console.error('Error generating report:', err);
        Swal.fire({
          icon: 'error',
          text: `${err.message}`
        });
      }
    });
  }

  goBack(): void {
    this.back.emit();
  }
}
