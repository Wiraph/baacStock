import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../../services/stock';
import { ApproveService } from '../../../services/approve';
import { CommonModule } from '@angular/common';
import { DataTransfer } from '../../../services/data-transfer';
import { ApproveTransfer } from '../approve-transfer/approve-transfer';
import { ApproveCreate } from '../approve-create/approve-create';

@Component({
  standalone: true,
  selector: 'app-approve-item',
  imports: [FormsModule, CommonModule, ApproveTransfer, ApproveCreate],
  templateUrl: './approve-item.html',
  styleUrl: './approve-item.css'
})
export class ApproveItemComponent implements OnInit {
  brName = sessionStorage.getItem('brName');
  searchText = '';
  filterType = '';
  requestList: any[] = [];
  loading = false;
  showDetailComponent = false;
  showDetailComponentCreate = false;

  constructor(
    private stockService: StockService,
    private approveService: ApproveService,
    private dataTransfer: DataTransfer,
    private cdr: ChangeDetectorRef
  ) { }

  stockList: string[] = [];


  onSearch() {
    this.approveService.getStockApprove().subscribe({
      next: (data) => {
        this.requestList = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert("ไม่สามารถโหลดข้อมูลรายการอนุมัติได้");
      }
    });
  }


  approveConfirm(stkNote: string, stkStatus: string) {
    this.dataTransfer.setStkNote(stkNote);
    if(stkStatus == "A003") {
      this.showDetailComponent = true;
    } else if(stkStatus == "A002") {
      this.showDetailComponentCreate = true;
    }
    this.cdr.detectChanges();
  }

  reject(item: any) {
    // เรียก API เพื่อไม่อนุมัติรายการ
    console.log('ไม่อนุมัติรายการ: ', item);
  }

  detail(item: any) {

  }

  ngOnInit(): void {
    this.loading = true;
    this.onSearch();
    this.cdr.detectChanges();
  }


}
