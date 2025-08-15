import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StocktransferService } from '../../../services/stocktransfer';
import { JwtDecoder } from '../../../services/jwt-decoder';
import { MatDialog } from '@angular/material/dialog';
import { PopupDetail } from '../../popup-detail/popup-detail';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-approve-issue',
  imports: [CommonModule],
  templateUrl: './approve-issue.html',
  styleUrl: './approve-issue.css'
})
export class ApproveIssue implements OnInit {

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly stockTransferService: StocktransferService,
    private readonly jwtDecoder: JwtDecoder,
    private readonly dialog: MatDialog
  ) { }

  activeView: string = "table";
  brName:string = '';
  issueList: any[] = [];
  issuadata: any;
  brCode = '';
  loading = false;
  pageNumber = 1;
  pageSize = 20;


  ngOnInit(): void {
    this.loading = true;
    this.onsearch(1,20);
  }

  setView(view: string) {
    this.activeView = view;
  }

  nextPage() {
    if (this.issueList.length == this.pageSize) {
      this.pageNumber++;
      this.onsearch(this.pageNumber, this.pageSize);
    } else {
      this.onsearch(this.pageNumber, this.pageSize);
    }
  }

  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.onsearch(this.pageNumber, this.pageSize);
    } else {
      return
    }
  }

  onsearch(pageNumber: number, pageSize: number) {
    const decoder = this.jwtDecoder.decodeToken(String(sessionStorage.getItem('token')));
    this.brCode = decoder.BrCode;
    this.brName = decoder.BrName;
    this.stockTransferService.getPendingTransfers('iSSUE', this.brCode, pageNumber, pageSize).subscribe({
      next: (response) => {
        this.issueList = response.data;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        Swal.fire({
          title: "โหลดข้อมูลไม่สำเร็จ",
          text: "โปรดติดต่อผู้พัฒนา",
          icon: "error"
        });
      }
    });
  }

  showPopup(stkNote: string, stkStatus: string) {
    this.openPopup(stkNote, stkStatus, "iSSUE")
  }

  openPopup(stkNote: string, stkStatus: string, action: string) {
    const dialogRef = this.dialog.open(PopupDetail, {
      width: '300px',
      data: { 
        stkNote: stkNote,
        stkStatus: stkStatus,
        action: action
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
