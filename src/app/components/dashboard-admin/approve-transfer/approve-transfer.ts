import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { DataTransfer } from '../../../services/data-transfer';
import { CommonModule } from '@angular/common';
import { StockService } from '../../../services/stock';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
// import {}

@Component({
  standalone: true,
  selector: 'app-approve-transfer',
  imports: [CommonModule],
  templateUrl: './approve-transfer.html',
  styleUrl: './approve-transfer.css'
})
export class ApproveTransfer implements OnInit {
  loading = false;
  dataconfirm: any;

  constructor(
    private dataTransfer: DataTransfer,
    private stockService: StockService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    const stkNote = this.dataTransfer.getStkNote();
    this.stockService.getResultsTransfer(stkNote).subscribe({
      next: (data) => {
        this.dataconfirm = data;
        console.log("ทดสอบการส่งข้อมูลกลับมา", data);
        this.cd.detectChanges();
      }, error: (err) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลหุ้น', err);
      }
    })
  }

  convertTimeFormat(timeStr: string): string {
    // เติม 0 ด้านหน้าให้ครบ 6 หลัก ถ้าสั้นเกิน
    const padded = timeStr.padStart(6, '0');

    const hour = padded.substring(0, 2);
    const minute = padded.substring(2, 4);
    const second = padded.substring(4, 6);

    return `${hour}:${minute}:${second}`;
  }

  onConfirm() {
    Swal.fire({
      html: `
      <p style="font-family: 'Prompt', sans-serif;">ท่านต้องการ อนุมัติรายการ โอนเปลี่ยนมือ</p>
      <p style="font-family: 'Prompt', sans-serif;">หมายเลขใบหุ้น : ${this.dataconfirm.sender.stkNote}</p>
      <p style="font-family: 'Prompt', sans-serif;">ชื่อผู้ถือหุ้น : ${this.dataconfirm.sender.titleCus+this.dataconfirm.sender.cusFname+" "+this.dataconfirm.sender.cusLname}</p>
      <p style="font-family: 'Prompt', sans-serif;">จำนวนหุ้น : ${this.dataconfirm.sender.unit} หุ้น</p>
      <p style="font-family: 'Prompt', sans-serif;">จำนวนเงิน : ${this.dataconfirm.sender.value.toLocaleString('en-US')} บาท</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'อนุมัติ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        return
      }
    })
  }

  onCancel() {
    Swal.fire({
      html: `
      <p style="font-family: 'Prompt', sans-serif;">ท่านต้องการ ยกเลิกรายการ โอนเปลี่ยนมือ</p>
      <p style="font-family: 'Prompt', sans-serif;">หมายเลขใบหุ้น : ${this.dataconfirm.sender.stkNote}</p>
      <p style="font-family: 'Prompt', sans-serif;">ชื่อผู้ถือหุ้น : ${this.dataconfirm.sender.titleCus+this.dataconfirm.sender.cusFname+" "+this.dataconfirm.sender.cusLname}</p>
      <p style="font-family: 'Prompt', sans-serif;">จำนวนหุ้น : ${this.dataconfirm.sender.unit} หุ้น</p>
      <p style="font-family: 'Prompt', sans-serif;">จำนวนเงิน : ${this.dataconfirm.sender.value.toLocaleString('en-US')} บาท</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'อนุมัติ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        return
      }
    })
  }

  onClose() {
    console.log("Pass");
    window.location.reload();
    this.cd.detectChanges();
  }
}
