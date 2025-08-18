import { Component, Input, OnInit, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { FormsModule } from '@angular/forms';
import { DataTransfer } from '../../../services/data-transfer';
import { Divident } from '../../../services/divident';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dividend',
  standalone: true,
  imports: [CommonModule, SearchEditComponent, FormsModule],
  templateUrl: './dividend.component.html',
  styleUrls: ['./dividend.component.css']
})
export class DividendComponent implements OnInit {
  @Input() InputDividend!: string;
  internalViewName = 'dividend';
  activeView = '';  // เริ่มต้นที่หน้าค้นหาเสมอ
  customerData: any = null;
  brName = '';
  brCode = '';
  dividendData: any = '';

  constructor(
    private readonly dataTransfer: DataTransfer,
    private readonly cd: ChangeDetectorRef,
    private readonly dividendService: Divident
  ) { }

  ngOnInit(): void {
   this.activeView = 'search';
   this.dataTransfer.setPageStatus('5');
  }

  onHandle(event: any) {
    this.activeView = event.view;
    this.onLoadDivident();
  }

  onLoadDivident() {
    this.dividendService.getAllDividend().subscribe({
      next: (res) => {
        this.dividendData = res;
        this.cd.detectChanges();
      }, error: () =>{
        Swal.fire({
          icon: 'error',
          title: "เกิดข้อผิดพลาด",
          text: 'โปรดติดต่อผู้พัฒนา'
        })
      }
    })
  }

  // Handle search result from SearchEditComponent
  onViewStock(data: any): void {
    console.log('💰 ข้อมูลที่ได้จากการค้นหาเงินปันผล:', data);
    
    // Store customer data
    this.customerData = {
      cusId: data.cusId || '',
      fullName: data.fullName || '',
      statusDesc: data.statusDesc || 'ไม่ระบุ',
      brCode: data.brCode || this.brCode,
      brName: data.brName || this.brName
    };

    // Switch to result view
    this.activeView = 'result';
  }

  // Handle dividend selection from SearchEditComponent
  onDividendSelected(data: any): void {
    console.log('💰 เลือกข้อมูลสำหรับเงินปันผล:', data);
    this.onViewStock(data);
  }

  // Go back to search
  goBack(): void {
    this.activeView = 'search';
    this.customerData = null;
  }
}