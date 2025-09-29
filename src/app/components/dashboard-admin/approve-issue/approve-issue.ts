import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StocktransferService } from '../../../services/stocktransfer';
import { JwtDecoder } from '../../../services/jwt-decoder';
import { MatDialog } from '@angular/material/dialog';
import { PopupDetail } from '../../popup-detail/popup-detail';
import Swal from 'sweetalert2';
import { ApproveService } from '../../../services/approve';

@Component({
  standalone: true,
  selector: 'app-approve-issue',
  imports: [CommonModule],
  templateUrl: './approve-issue.html',
  styleUrl: './approve-issue.css'
})
/**
 * หน้ารออนุมัติออกใบหุ้น (Approve Issue)
 * - โหลดรายการออกใบหุ้นที่รออนุมัติแบบแบ่งหน้า
 * - เปิดป๊อปอัพเพื่ออนุมัติ/ยกเลิกรายการ
 * - แสดงสถานะโหลดและจับ error อย่างเหมาะสม
 */
export class ApproveIssue implements OnInit {

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly stockTransferService: StocktransferService,
    private readonly jwtDecoder: JwtDecoder,
    private readonly dialog: MatDialog,
    private readonly approveService: ApproveService
  ) { }

  activeView: string = "table";
  brName: any;
  issueList: any[] = [];
  issuadata: any;
  brCode = '';
  loading = false;
  pageNumber = 1;
  pageSize = 20;

  ngOnInit(): void {
    // อ่านชื่อสาขาจาก cookie (หากอยู่ใน browser)
    if ( typeof document !== "undefined") {
      const rawBrName = this.getCookie("BrName");
      this.brName = rawBrName ? decodeURIComponent(rawBrName) : null;
    }
    this.loading = true;
    this.onsearch(1, 20);
  }

  /** อ่านค่า cookie ตามชื่อ */
  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift()!;
    return null;
  }

  setView(view: string) {
    this.activeView = view;
  }

  /** ไปหน้าถัดไป หากมีข้อมูลครบจำนวน pageSize */
  nextPage() {
    if (this.issueList.length == this.pageSize) {
      this.pageNumber++;
      this.onsearch(this.pageNumber, this.pageSize);
    } else {
      this.onsearch(this.pageNumber, this.pageSize);
    }
  }

  /** ย้อนหน้าก่อนหน้า หาก pageNumber > 1 */
  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.onsearch(this.pageNumber, this.pageSize);
    } else {
      return
    }
  }

  /** ค้นหารายการรออนุมัติออกใบหุ้นแบบแบ่งหน้า */
  onsearch(pageNumber: number, pageSize: number) {
    const payload = {
      ACT: 'iSSUE',
      PGNum: pageNumber,
      PGSize: pageSize
    };

    this.approveService.getStockApprove(payload).subscribe({
      next: (res) => {
        this.issueList = Array.isArray(res) ? res : [];
      }, error: () => {
        Swal.fire({ title: "Error", text: "โปรดติดต่อผู้พัฒนา", icon: 'error' });
      }, complete: () => {
        this.loading = false;
        this.cd.detectChanges();
      }
    })
  }

  /** เปิดหน้าต่างรายละเอียด/ยืนยัน การอนุมัติออกใบหุ้น */
  showPopup(stkNote: string, stkStatus: string) {
    this.openPopup(stkNote, stkStatus, "iSSUE")
  }

  /** เปิด Dialog รายละเอียดพร้อม action */
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
      if (result == "PASS") {
        this.onsearch(1, 20);
        this.cd.detectChanges();
      }
    });
  }
}
