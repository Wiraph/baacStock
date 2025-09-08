import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PopupDetail } from '../../popup-detail/popup-detail';
import { MatPaginatorModule } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { ApproveService } from '../../../services/approve';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-approve-item',
  imports: [FormsModule, CommonModule, MatPaginatorModule, MatButtonModule, MatTooltipModule],
  templateUrl: './approve-item.html',
  styleUrl: './approve-item.css'
})
export class ApproveItemComponent implements OnInit {
  brName: any;
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
    private readonly dialog: MatDialog,
    private readonly approveService: ApproveService
  ) { }

  stockList: string[] = [];

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      const rowBrName = this.getCookie('BrName');
      this.brName = rowBrName ? decodeURIComponent(rowBrName) : null;
    }
    this.loading = true;
    this.onSearch(this.pageNumber, this.pageSize);
    this.cdr.detectChanges();
  }

  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift()!;
    return null;
  }

  setTitleDetail(item: any): string {
    // สร้างสำเนาของ item เพื่อไม่ให้แก้ไข original object
    const itemCopy = { ...item };
    
    if (itemCopy.remCode == "0040") {
      const stDESCs = itemCopy.stDESCs.replace("ใบหุ้นที่ชำรุด/สูญหาย", "กรณีเปลี่ยนแปลงชื่อสกุล");
      return `${stDESCs}`;
    } else if (itemCopy.remList != "") {
      return `${itemCopy.stDESCs} ${itemCopy.remList}`;
    }
    return `${itemCopy.stDESCs}${itemCopy.remList || ''}`;
  }

  onSearch(pageNumber: number, pageSize: number) {
    const payload = {
      ACT: 'APPROVE',
      PGNum: pageNumber,
      PGSize: pageSize
    };

    this.approveService.getStockApprove(payload).subscribe({
      next: (res) => {
        this.requestList = res;
        this.loading = false;
        this.cdr.detectChanges();
      }, error: () => {
        Swal.fire({
          title: "Error",
          text: "โปรดติดต่อผู้พัฒนา",
          icon: 'error'
        })
        this.loading = false;
        this.cdr.detectChanges();
      }
    })
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
      if (result == "PASS") {
        this.onSearch(1, 20);
        this.cdr.detectChanges();
      }
      if (result) {
        console.log('กดตกลง');
      } else {
        console.log('ยกเลิก');
      }
    });
  }
} 