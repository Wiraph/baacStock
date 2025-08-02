import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApproveService, ApproveIssueDto } from '../../../services/approve';
import { CommonModule } from '@angular/common';
import { DataTransfer } from '../../../services/data-transfer';
import { JwtDecoder } from '../../../services/jwt-decoder';
import Swal from 'sweetalert2';


@Component({
  standalone: true,
  selector: 'app-approve-item',
  imports: [FormsModule, CommonModule],
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
  activeView = 'table';
  detailData?: ApproveIssueDto;
  detailDataList: ApproveIssueDto[] = [];
  pageNumber = 1;
  pageSize = 10;

  constructor(
    private readonly approveService: ApproveService,
    private readonly dataTransfer: DataTransfer,
    private readonly cdr: ChangeDetectorRef,
    private readonly jwtCoder: JwtDecoder
  ) { }

  stockList: string[] = [];

  setView(activeView: string) {
    this.activeView = activeView;
  }

  loadList() {
    const token = sessionStorage.getItem('token');
    const decoder = this.jwtCoder.decodeToken(String(token));
    const brName = decoder.BrCode;
    if (this.requestList.length < this.pageSize) {
      this.loading = true;
      this.approveService.getApproveList('iSSUE', brName, this.pageNumber, this.pageSize).subscribe(data => {
        this.requestList = data;
        this.loading = false;
        this.cdr.detectChanges();
      });
    } else {
      return
    }
  }

  nextPage() {
    if (this.requestList.length == this.pageSize) {
      this.pageNumber++;

    } else {
      this.loadList();
    }
  }

  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadList();
    } else {
      return
    }
  }

  onSearch() {
    const token = sessionStorage.getItem('token');
    const brName = this.jwtCoder.decodeToken(String(token));
    this.approveService.getApproveList('APPROVE', brName.BrCode, 1, 20).subscribe({
      next: (response) => {
        console.log('Response from getPendingTransfers:', response);
        this.requestList = response;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("load data fail.....");
        this.loading = false;
      }
    });
  }

  onKeyDown(event: KeyboardEvent, item: any) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.approveConfirm(item.stkNOTE, item.stCODEs);
    }
  }


  approveConfirm(stkNote: string, stkStatus: string) {
    this.dataTransfer.setStkNote(stkNote);
    console.log(stkStatus);
    this.loadDetail(stkNote);
    this.setView('detail');
    this.cdr.detectChanges();
  }

  approveSelectedIssue() {
    const payload = {
      stkNOTEis: this.detailData?.stkNote,
      AiSQL: "APPROVE",
      stkCONFiRM: "YES",
      brCode: "",
      DATETIMEUP: "",
      USERID: "",
      IPADDRESS: "",
      HOSTNAME: ""
    };

    Swal.fire({
      icon: 'question',
      html: `
      <div style="font-family: 'Prompt', sans-serif; text-align: center;">
        <p>ท่านต้องการ <strong>อนุมัติรายการ ${this.detailData?.status}</strong> หรือไม่?</p>
        <div style="display: flex; justify-content: center; gap: 40px; margin-top: 10px;">
          <div style="text-align: right;">
            <p>หมายเลขใบหุ้น</p>
            <p>ชื่อผู้ถือหุ้น</p>
            <p>จำนวนหุ้น</p>
            <p>จำนวนเงิน</p>
          </div>
          <div style="text-align: left;">
            <p>: ${this.detailData?.stkNote}</p>
            <p>: ${this.detailData?.fullname}</p>
            <p>: ${this.detailData?.unit}</p>
            <p>: ${Number(this.detailData?.unitValue).toLocaleString()} บาท</p>
          </div>
        </div>
      </div>
    `,
      confirmButtonText: '✅ อนุมัติ',
      showCancelButton: true,
      cancelButtonText: '❌ ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {

        // แสดง loading
        Swal.fire({
          title: 'กำลังอนุมัติ...',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // ส่งข้อมูล
        this.approveService.sentConfirm(payload).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'อนุมัติสำเร็จ',
              text: 'รายการได้ถูกอนุมัติแล้ว',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              this.requestList = [];
              this.setView('table');
              this.onSearch();
              this.cdr.detectChanges();
            })

          },
          error: (err) => {
            console.error("❌ Sent Fail...", err);
            Swal.fire({
              icon: 'error',
              title: 'ล้มเหลว',
              text: 'ไม่สามารถอนุมัติรายการได้ กรุณาลองใหม่'
            }).then(() => {
              this.requestList = [];
              this.setView('table');
              this.onSearch();
              this.cdr.detectChanges();
            })
          }
        });

      }
    });
  }

  notapproveSelectedIssue() {
    const payload = {
      stkNOTEis: this.detailData?.stkNote,
      AiSQL: "APPROVE",
      stkCONFiRM: "NO",
      brCode: "",
      DATETIMEUP: "",
      USERID: "",
      IPADDRESS: "",
      HOSTNAME: ""
    };

    Swal.fire({
      icon: 'question',
      html: `
      <div style="font-family: 'Prompt', sans-serif; text-align: center;">
        <p>ท่านต้องการ <strong>ยกเลิกรายการ ${this.detailData?.status}</strong> หรือไม่?</p>
        <div style="display: flex; justify-content: center; gap: 40px; margin-top: 10px;">
          <div style="text-align: right;">
            <p>หมายเลขใบหุ้น</p>
            <p>ชื่อผู้ถือหุ้น</p>
            <p>จำนวนหุ้น</p>
            <p>จำนวนเงิน</p>
          </div>
          <div style="text-align: left;">
            <p>: ${this.detailData?.stkNote}</p>
            <p>: ${this.detailData?.fullname}</p>
            <p>: ${this.detailData?.unit}</p>
            <p>: ${Number(this.detailData?.unitValue).toLocaleString()} บาท</p>
          </div>
        </div>
      </div>
    `,
      confirmButtonText: 'ไม่อนุมัติ',
      showCancelButton: true,
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {

        // แสดง loading
        Swal.fire({
          title: 'กำลังดำเนินการ...',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // ส่งข้อมูล
        this.approveService.sentConfirm(payload).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'สำเร็จ',
              text: 'รายการได้ถูกยกเลิกเรียบร้อยแล้ว',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              this.requestList = [];
              this.setView('table');
              this.onSearch();
              this.cdr.detectChanges();
            })

          },
          error: (err) => {
            console.error("❌ Sent Fail...", err);
            Swal.fire({
              icon: 'error',
              title: 'ล้มเหลว',
              text: 'ไม่สามารถอนุมัติรายการได้ กรุณาลองใหม่'
            }).then(() => {
              this.requestList = [];
              this.setView('table');
              this.onSearch();
              this.cdr.detectChanges();
            })
          }
        });

      }
    });
  }
  reject(item: any) {
    // เรียก API เพื่อไม่อนุมัติรายการ
    console.log('ไม่อนุมัติรายการ: ', item);
  }

  loadDetail(stkNote: string) {
    // ดึงรายละเอียดหุ้นก่อนการอนุมัติ
    this.loading = true;
    const payload = {
      stkNote: stkNote
    };
    this.approveService.getDetail(payload).subscribe({
      next: (res) => {
        this.detailData = res.stock;
        this.detailDataList = res.newStock;
        this.loading = false;
        this.cdr.detectChanges();
      }, error: (err) => {
        this.loading = false;
        console.log("Loading data fail...", err);
      }
    })
  }

  ngOnInit(): void {
    this.loading = true;
    this.onSearch();
    this.cdr.detectChanges();
  }

  closeWindows() {
    this.setView("table");
  }

  formatDate(datetimeup: string): string {
    if (!datetimeup || !/^\d{8}-\d{6}$/.test(datetimeup)) return '';
    const [dataPart, timePart] = datetimeup.split('-');
    const datetimeYear = parseInt(dataPart.substring(0, 4), 10);
    const datetimeMonth = parseInt(dataPart.substring(4, 6), 10);
    const datetimeDay = parseInt(dataPart.substring(6, 8), 10);
    const datetimeHour = parseInt(timePart.substring(0, 2), 10);
    const datetimeMinute = parseInt(timePart.substring(2, 4), 10);
    const datetimeSecond = parseInt(timePart.substring(4, 6), 10);

    const monthNames = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const h = datetimeHour.toString().padStart(2, '0');
    const m = datetimeMinute.toString().padStart(2, '0');
    const s = datetimeSecond.toString().padStart(2, '0');

    const thaiMonth = monthNames[datetimeMonth] || 'เดือนผิด';
    return `${datetimeDay} ${thaiMonth} ${datetimeYear} เวลา ${h}: ${m}: ${s} น.`;
  }
} 