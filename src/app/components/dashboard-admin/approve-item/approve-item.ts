import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../../services/stock';
import { ApproveService } from '../../../services/approve';
import { CommonModule } from '@angular/common';
import { DataTransfer } from '../../../services/data-transfer';
import { ApproveTransfer } from '../approve-transfer/approve-transfer';
import { ApproveCreate } from '../approve-create/approve-create';
import { StocktransferService } from '../../../services/stocktransfer';
import { ApproveSale } from '../approve-sale/approve-sale';

@Component({
  standalone: true,
  selector: 'app-approve-item',
  imports: [FormsModule, CommonModule, ApproveTransfer, ApproveCreate, ApproveSale],
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
  showDetailComponentSale = false;
  brCode = sessionStorage.getItem('brCode') || '';

  constructor(
    private stockService: StockService,
    private approveService: ApproveService,
    private dataTransfer: DataTransfer,
    private cdr: ChangeDetectorRef,
    private stockTransferService: StocktransferService

  ) { }

  stockList: string[] = [];

  onSearch() {
    this.stockTransferService.getPendingTransfers('APPROVE', this.brCode, 1, 20).subscribe({
      next: (response) => {
        console.log('Response from getPendingTransfers:', response);
        this.requestList = response.data; 
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert("ไม่สามารถโหลดข้อมูลรายการอนุมัติได้");
        this.loading = false;
      }
    });

  }

  approveConfirm(stkNote: string, stkStatus: string) {
    console.log('อนุมัติรายการ: ', stkNote, stkStatus);
    this.dataTransfer.setStkNote(stkNote);
    if (stkStatus == "A003") {
      this.showDetailComponent = true;
    } else if (stkStatus == "A002") {
      this.showDetailComponentCreate = true;
    } else if (stkStatus == "A000") {
      this.showDetailComponentSale = true;
    }
    this.cdr.detectChanges();
  }

  reject(item: any) {
    // เรียก API เพื่อไม่อนุมัติรายการ
    console.log('ไม่อนุมัติรายการ: ', item);
  }

  detail(item: any) {
    // แสดงรายละเอียด
  }

  ngOnInit(): void {
    this.loading = true;
    this.onSearch();
    this.cdr.detectChanges();
  }
} 