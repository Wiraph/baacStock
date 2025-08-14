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
import { MatDialog } from '@angular/material/dialog';
import { PopupDetail } from '../../popup-detail/popup-detail';


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
  stknoteDetail: any[] = [];
  activeView = '';

  constructor(
    private readonly stockService: StockService,
    private readonly approveService: ApproveService,
    private readonly dataTransfer: DataTransfer,
    private readonly cdr: ChangeDetectorRef,
    private readonly stockTransferService: StocktransferService,
    private readonly dialog: MatDialog
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

  approveDetail(stkNote: string, stkStatus: string) {
    const payload = {
      stkNOTEDTL: stkNote
    };

    this.stockService.noteDetial(payload).subscribe({
      next: (res) => {
        this.stknoteDetail = res;
        console.log("StknoteDetail", this.stknoteDetail);
        this.cdr.detectChanges();
      }, error: (err) => {
        console.log("ไม่สามารถดึงรายละเอียดอนุมัติได้", err);
      }
    })

    this.openPopup(stkNote, stkStatus);
    this.cdr.detectChanges();
  }

  openPopup(stkNote: string, stkStatus: string) {
    const dialogRef = this.dialog.open(PopupDetail, {
      width: '300px',
      data: { 
        stkNote: stkNote,
        stkStatus: stkStatus
       }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('กดตกลง');
      } else {
        console.log('ยกเลิก');
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