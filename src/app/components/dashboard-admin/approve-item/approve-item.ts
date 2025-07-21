import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../../services/stock';
import { ApproveService } from '../../../services/approve';
import { CommonModule } from '@angular/common';
import { DataTransfer } from '../../../services/data-transfer';
import { ApproveTransfer } from '../approve-transfer/approve-transfer';

@Component({
  standalone: true,
  selector: 'app-approve-item',
  imports: [FormsModule, CommonModule, ApproveTransfer],
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


  approveConfirm(stkNote: string) {
    this.dataTransfer.setStkNote(stkNote);
    this.showDetailComponent = true;
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
