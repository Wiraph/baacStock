import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StockService } from '../../../services/stock';
import { ApproveService } from '../../../services/approve';
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
    private StockApproveService : StockService,
    private cd : ChangeDetectorRef,
    private approveService : ApproveService
  ){}

  activeView: string = "table";
  brName = sessionStorage.getItem('brName');
  issueList: any[] = [];
  issuadata: any;


  setView(view: string) {
    this.activeView = view;
  }
  
  onsearch() {
    this.StockApproveService.getIssueApprove().subscribe({
      next: (data) =>  {
        this.issueList = data;
        this.cd.detectChanges();
      },
      error: () => {
        alert("ไม่สามารถโหลดข้อมูลรอรายการอนุมัติออกใบหุ้นได้ กรุณาติดต่อผู้พัฒนา")
      }
    })
  }

  detailIssue(item: any) {
    console.log(item);
    this.setView('detail-issue')
    this.StockApproveService.getIssueByStkNote(item.stkNote).subscribe({
      next: (data) => {
        this.issuadata = data;
        console.log("ข้อมูลที่จะอนุมัติ", this.issuadata);
        this.cd.detectChanges();
      }
    })
  }

  approveSelectedIssue(): void {
    if(!this.issuadata?.stkNote) {
      Swal.fire('ไม่พบหมายเลขหุ้น', '', 'error');
      return
    }

    Swal.fire({
      // title: 'ท่านต้องการ อนุมัติรายการ ใบหุ้นชำรุด/สูญหาย',
      // text: `ใบหุ้นหมายเลข : ${this.issuadata.stkNote}`,
      html: `
            <p style="font-family: 'Prompt', sans-serif;">ท่านต้องการ อนุมัติรายการ ${this.issuadata.note}</p>
            <p style="font-family: 'Prompt', sans-serif;">ใบหุ้นหมายเลข : ${this.issuadata.stkNote}</p>
            <p style="font-family: 'Prompt', sans-serif;">ชื่อผู้ถือหุ้น : ${this.issuadata.fullname}</p>
            <p style="font-family: 'Prompt', sans-serif;">จำนวนหุ้น : ${this.issuadata.unit} หุ้น</p>
            <p style="font-family: 'Prompt', sans-serif;">จำนวนเงิน : ${this.issuadata.unitValue} บาท</p>
            `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✅ อนุมัติ',
      cancelButtonText: '❌ ยกเลิก',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        this.approveService.approveIssue(this.issuadata.stkNote).subscribe({
          next: () => {
            Swal.fire('อนุมัติเรียบร้อย', '', 'success');
            this.activeView = 'table';
            this.issueList = [];
            this.cd.detectChanges();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('เกิดข้อผิดพลาดในการอนุมัติ', '', 'error');
            this.cd.detectChanges();
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.onsearch();
  }

  closeWindows(): void {
    this.setView('table');
    this.cd.detectChanges();
  }
}
