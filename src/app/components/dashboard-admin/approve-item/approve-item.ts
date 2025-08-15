import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StocktransferService } from '../../../services/stocktransfer';
import { MatDialog } from '@angular/material/dialog';
import { PopupDetail } from '../../popup-detail/popup-detail';
import { MatPaginatorModule } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { JwtDecoder } from '../../../services/jwt-decoder';


@Component({
  standalone: true,
  selector: 'app-approve-item',
  imports: [FormsModule, CommonModule, MatPaginatorModule],
  templateUrl: './approve-item.html',
  styleUrl: './approve-item.css'
})
export class ApproveItemComponent implements OnInit {
  brName = '';
  searchText = '';
  filterType = '';
  requestList: any[] = [];
  loading = false;
  brCode = '';
  activeView = 'table';
  pageNumber = 1;
  pageSize = 20;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly stockTransferService: StocktransferService,
    private readonly dialog: MatDialog,
    private readonly jwtDecoder: JwtDecoder
  ) { }

  stockList: string[] = [];

  ngOnInit(): void {
    this.loading = true;
    this.onSearch(this.pageNumber, this.pageSize);
    this.cdr.detectChanges();
  }

  onSearch(pageNumber: number, pageSize: number) {
    const decoder = this.jwtDecoder.decodeToken(String(sessionStorage.getItem('token')));
    this.brCode = decoder.BrCode;
    this.brName = decoder.BrName;
    this.stockTransferService.getPendingTransfers('APPROVE', this.brCode, pageNumber, pageSize).subscribe({
      next: (response) => {
        console.log('Response from getPendingTransfers:', response);
        this.requestList = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire({
          title: "โหลดข้อมูลไม่สำเร็จ",
          text: "โปรดติดต่อผู้พัฒนา",
          icon: "error"
        });
        this.loading = false;
      }
    });

  }

  nextPage() {
    if (this.requestList.length == this.pageSize) {
      this.pageNumber++;
      this.onSearch(this.pageNumber, this.pageSize);
    } else {
      this.onSearch(this.pageNumber, this.pageSize);
    }
  }

  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.onSearch(this.pageNumber, this.pageSize);
    } else {
      return
    }
  }

  approveDetail(stkNote: string, stkStatus: string) {
    this.openPopup(stkNote, stkStatus);
    this.cdr.detectChanges();
  }

  openPopup(stkNote: string, stkStatus: string) {
    const dialogRef = this.dialog.open(PopupDetail, {
      width: '300px',
      data: {
        stkNote: stkNote,
        stkStatus: stkStatus,
        action: "APPROVE"
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
} 