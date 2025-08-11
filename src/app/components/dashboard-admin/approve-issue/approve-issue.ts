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
    private readonly StockApproveService: StockService,
    private readonly cd: ChangeDetectorRef,
    private readonly approveService: ApproveService
  ) { }

  activeView: string = "table";
  brName = sessionStorage.getItem('brName');
  issueList: any[] = [];
  issuadata: any;


  setView(view: string) {
    this.activeView = view;
  }

  onsearch() {
    // this.StockApproveService.getIssueApprove().subscribe({
    //   next: (data) => {
    //     this.issueList = data;
    //     this.cd.detectChanges();
    //   },
    //   error: () => {
    //     alert("ไม่สามารถโหลดข้อมูลรอรายการอนุมัติออกใบหุ้นได้ กรุณาติดต่อผู้พัฒนา")
    //   }
    // })
  }

  detailIssue(item: any) {
    console.log(item);
    this.setView('detail-issue')
    // this.StockApproveService.getIssueByStkNote(item.stkNote).subscribe({
    //   next: (data) => {
    //     this.issuadata = data;
    //     console.log("ข้อมูลที่จะอนุมัติ", this.issuadata);
    //     this.cd.detectChanges();
    //   }
    // })
  }

  approveSelectedIssue(): void {
    if (!this.issuadata?.stkNote) {
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

  notApproveSelectedIssue(): void {
    if (!this.issuadata?.stkNote) {
      Swal.fire('ไม่พบหมายเลขหุ้น', '', 'error');
      return
    }

    Swal.fire({
      html: `
            <p style="font-family: 'Prompt', sans-serif;">ท่านต้องการ ยกเลิกรายการ ${this.issuadata.note}</p>
            <p style="font-family: 'Prompt', sans-serif;">ใบหุ้นหมายเลข : ${this.issuadata.stkNote}</p>
            <p style="font-family: 'Prompt', sans-serif;">ชื่อผู้ถือหุ้น : ${this.issuadata.fullname}</p>
            <p style="font-family: 'Prompt', sans-serif;">จำนวนหุ้น : ${this.issuadata.unit} หุ้น</p>
            <p style="font-family: 'Prompt', sans-serif;">จำนวนเงิน : ${this.issuadata.unitValue} บาท</p>
            `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '✅ ใช่',
      cancelButtonText: '❌ ยกเลิก',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        this.approveService.notapprove(this.issuadata.stkNote).subscribe({
          next: () => {
            Swal.fire('ไม่อนุมัติเรียบร้อย', '', 'success');
            this.activeView = 'table';
            this.issueList = [];
            this.cd.detectChanges();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('เกิดข้อผิดพลาดในรายการไม่อนุมัติ', '', 'error');
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

  formatThaiDateTimeWithDash(input: string): string {
    // ตรวจสอบรูปแบบ yyyyMMdd-HHmmss
    if (!/^\d{8}-\d{6}$/.test(input)) {
      throw new Error("รูปแบบวันที่เวลาไม่ถูกต้อง ต้องเป็น yyyyMMdd-HHmmss เช่น 20250704-152035");
    }

    const [datePart, timePart] = input.split("-");

    const yearCE = parseInt(datePart.substring(0, 4), 10);
    const month = parseInt(datePart.substring(4, 6), 10);
    const day = parseInt(datePart.substring(6, 8), 10);

    const hour = timePart.substring(0, 2);
    const minute = timePart.substring(2, 4);
    const second = timePart.substring(4, 6);

    const thaiYear = yearCE;

    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

    if (month < 1 || month > 12) {
      throw new Error("เดือนไม่ถูกต้อง");
    }

    return `${day} ${thaiMonths[month - 1]} ${thaiYear} ${hour}:${minute}:${second}`;
  }

  formatThaiDateTime(input: string): string {
    if (input.length !== 8) {
      throw new Error("รูปแบบวันที่และเวลาไม่ถูกต้อง ต้องเป็น 14 หลัก เช่น 25680715");
    }

    const year = input.substring(0, 4);   // 2568
    const month = input.substring(4, 6);  // 07
    const day = input.substring(6, 8);    // 15

    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

    const monthIndex = parseInt(month, 10) - 1;

    if (monthIndex < 0 || monthIndex > 11) {
      throw new Error("เดือนไม่ถูกต้อง");
    }

    return `${parseInt(day, 10)} ${thaiMonths[monthIndex]} ${year}`;
  }

}
