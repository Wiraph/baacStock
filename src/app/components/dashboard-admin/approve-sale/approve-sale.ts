import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DataTransfer } from '../../../services/data-transfer';
import { StockService } from '../../../services/stock';
import { JwtDecoder } from '../../../services/jwt-decoder';
import { ApproveService } from '../../../services/approve';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-approve-sale',
  imports: [CommonModule],
  templateUrl: './approve-sale.html',
  styleUrl: './approve-sale.css'
})
export class ApproveSale implements OnInit {
  loading = false;
  stkNote: string = '';
  status: string = '';
  resultSale: any;


  constructor(
    private dataTransfer: DataTransfer,
    private stockService: StockService,
    private jwtDecoder: JwtDecoder,
    private approveService: ApproveService,
    private cd: ChangeDetectorRef
  ) { }



  ngOnInit(): void {
    this.loading = true;
    this.stkNote = this.dataTransfer.getStkNote();
    this.status = this.dataTransfer.getStatus();

    if (this.stkNote) {
      this.stockService.getResultSale(this.stkNote).subscribe({
        next: (data) => {
          this.resultSale = data;
          console.log(this.resultSale);
          this.loading = false;
          this.cd.detectChanges();
        }, error: (err) => {
          console.error('Error fetching result sale:', err);
        }
      })
    }
  }

  confirm() {
    const token = sessionStorage.getItem('token');
    const decoder = this.jwtDecoder.decodeToken(String(token));
    console.log(decoder);
    console.log(window.location.hostname);
    const payload = {
      stkNOTEis: this.resultSale.stkNote,
      aiSQL: 'APPROVE',
      stkCONFiRM: 'YES',
    };
    Swal.fire({
      icon: 'question',
      html: `
    <div style="font-family: 'Prompt', sefit; text-align: center;">
      <p>ท่านต้องการอนุมัติรายการขาย</p>
      <div style="display: flex; justify-content: center; gap: 40px; margin-top: 10px;">
        <div style="text-align: right;">
          <p>หมายเลขใบหุ้น</p>
          <p>ชื่อผู้ถือหุ้น</p>
          <p>จำนวนหุ้น</p>
          <p>จำนวนเงิน</p>
        </div>
        <div style="text-align: left;">
          <p>: ${this.resultSale.stkNote}</p>
          <p>: ${this.resultSale.cusName}</p>
          <p>: ${this.resultSale.stkUnit}</p>
          <p>: ${Number(this.resultSale.stkValue).toLocaleString()} บาท</p>
        </div>
      </div>
    </div>
  `,
      confirmButtonText: 'อนุมัติ',
      showCancelButton: true,
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'กำลังอนุมัติ...',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.approveService.confirmStock(payload).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              html: `<p>อนุมัติสำเร็จ</p>`,
              timer: 1000,
              showConfirmButton: false
            }).then(() => {
              window.location.reload();
            });
          },
          error: (err) => {
            console.error("Unable to save", err);
            Swal.fire({
              icon: 'error',
              html: `<p>เกิดข้อผิดพลาดในการอนุมัติ</p>`,
            });
          }
        });
      }
    });
  }

  onClose() {
    window.location.reload();
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

    const thaiMonth = monthNames[datetimeMonth] || 'เดือนผิด';
    return `${datetimeDay} ${thaiMonth} ${datetimeYear} เวลา ${datetimeHour}:${datetimeMinute}:${datetimeSecond}`;
  }
}
