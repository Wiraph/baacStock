import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StockService } from '../../services/stock';
import Swal from 'sweetalert2';
import { ApproveService } from '../../services/approve';

@Component({
  standalone: true,
  selector: 'app-popup-detail',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './popup-detail.html',
  styleUrl: './popup-detail.css'
})
export class PopupDetail implements OnInit {
  titleHead = '';
  titleContent = '';
  titleDetail = '';
  stkStatus: string = '';
  showContent = false;
  allData: any[] = [];
  owner: any = '';
  other: any[] = [];
  loading = true;

  constructor(
    public dialogRef: MatDialogRef<PopupDetail>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly stockService: StockService,
    private readonly cd: ChangeDetectorRef,
    private readonly approveServie: ApproveService
  ) { }

  ngOnInit(): void {
    console.log("StkNotePopup", this.data.stkNote, this.data.stkStatus);
    this.stkStatus = this.data.stkStatus;
    this.loading = true;

    if (this.stkStatus != null) {
      switch (this.stkStatus) {
        case "A000":
          this.titleHead = "รายการขาย";
          this.titleContent = "ผู้ถือหุ้น / ใบหุ้น";
          break;
        case "A002":
          this.titleHead = "รายการออกใบหุ้นแทน ใบหุ้นที่ชำรุด/สูญหาย";
          this.titleContent = "ผู้ถือหุ้น / ใบหุ้น";
          break;
        case "A003":
          this.titleHead = "รายการโอนเปลี่ยนมือ";
          this.titleContent = "ผู้โอน";
          this.titleDetail = "ผู้รับโอน"
          this.showContent = true;
          break;
      }
    }

    this.onloadDetail(this.data.stkNote);
  }

  onloadDetail(stkNote: string) {
    const payload = {
      stkNOTEDTL: stkNote
    };

    this.stockService.noteDetial(payload).subscribe({
      next: (res) => {
        console.log(res);
        this.allData = res;
        this.setValue();
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("ไม่สามารถดึงข้อมูลรายละเอียดได้", err);
      }
    })
  }

  setValue() {
    if (this.allData != null) {
      this.owner = this.allData[0];
      this.cd.detectChanges();
      if (this.allData.length > 1) {
        this.other = this.allData.slice(1);
        this.cd.detectChanges();
      }
    }
    this.loading = false;

    console.log("===========================");
    console.log("allData", this.allData);
    console.log("===========================");
    console.log("owner", this.owner);
    console.log("===========================");
    console.log("other", this.other);
  }

  approve() {
    Swal.fire({
      icon: "question",
      html: `
        <p>ท่านต้องการอนุมัติ ${this.titleHead}</p>
        <p>หมายเลขหุ้น : ${this.owner.stkNOTE}</p>
        <p>ชื่อผู้ถือหุ้น : ${this.owner.titleABBR}${this.owner.cusFName} ${this.owner.cusLName}</p>
        <p>จำนวนหุ้น : ${this.owner.stkUNiT} หุ้น</p>
        <p>จำนวนเงิน : ${this.owner.stkVALUE.toLocaleString('en-US')} บาท</p>
      `,
      showCancelButton: true,
      cancelButtonText: 'ยกเลิก',
      cancelButtonColor: '#FF0000',
      confirmButtonText: 'อนุมัติ',
      confirmButtonColor: '#32CD32'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          stkNOTEis: this.owner.stkNOTE,
          AiSQL: "APPROVE",
          stkCONFiRM: "YES"
        };

        this.approveServie.confirmStock(payload).subscribe({
          next: () => {
            Swal.fire({
              icon: "success",
              title: "อนุมัติสำเร็จ",
              showConfirmButton: false,
              timer: 1500
            });
            window.location.reload();
          }, error: (err) => {
            Swal.fire({
              icon: "error",
              title: "อนุมัติไม่สำเร็จ",
              text: "โปรดติดต่อผู้พัฒนา"
            });
            console.log("Error...",err);
          }
        })
      }
    })
  }

  notapprove() {
    Swal.fire({
      icon: "question",
      html: `
        <p>ท่านต้องการยกเลิก ${this.titleHead}</p>
        <p>หมายเลขหุ้น : ${this.owner.stkNOTE}</p>
        <p>ชื่อผู้ถือหุ้น : ${this.owner.titleABBR}${this.owner.cusFName} ${this.owner.cusLName}</p>
        <p>จำนวนหุ้น : ${this.owner.stkUNiT} หุ้น</p>
        <p>จำนวนเงิน : ${this.owner.stkVALUE.toLocaleString('en-US')} บาท</p>
      `,
      showCancelButton: true,
      cancelButtonText: 'ยกเลิก',
      cancelButtonColor: '#FF0000',
      confirmButtonText: 'ไม่อนุมัติ',
      confirmButtonColor: '#32CD32'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          stkNOTEis: this.owner.stkNOTE,
          AiSQL: "APPROVE",
          stkCONFiRM: "NO"
        };

        this.approveServie.confirmStock(payload).subscribe({
          next: () => {
            Swal.fire({
              icon: "success",
              title: "ยกเลิกสำเร็จ",
              showConfirmButton: false,
              timer: 1500
            });
            window.location.reload();
          }, error: (err) => {
            Swal.fire({
              icon: "error",
              title: "ยกเลิกไม่สำเร็จ",
              text: "โปรดติดต่อผู้พัฒนา"
            });
            console.log("Error...",err);
          }
        })
      }
    })
  }

  close(result: boolean) {
    this.dialogRef.close(result);
  }

  formatThaiDateTime(datetimeup: string): string {
    if (!datetimeup) return '-';

    const [datePart, timePart] = datetimeup.split('-');
    if (!datePart || !timePart) return '-';

    let year = +datePart.substring(0, 4);
    const month = +datePart.substring(4, 6) - 1;
    const day = +datePart.substring(6, 8);
    const hour = +timePart.substring(0, 2);
    const minute = +timePart.substring(2, 4);
    const second = +timePart.substring(4, 6);

    // ✅ ตรวจว่าปีเป็น พ.ศ. อยู่แล้วหรือไม่
    if (year > 2500) {
      year = year - 543; // แปลงกลับเป็น ค.ศ.
    }

    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฏาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

    const pad = (n: number) => n < 10 ? '0' + n : n.toString();

    return `${day} ${thaiMonths[month]} ${year + 543} เวลา ${pad(hour)}:${pad(minute)}:${pad(second)} น.`;
  }

  formatDate(date: string): string {
    let year = +date.substring(0, 4);
    const month = +date.substring(4, 6) - 1;
    const day = +date.substring(6, 8);

    // ✅ ตรวจว่าปีเป็น พ.ศ. อยู่แล้วหรือไม่
    if (year > 2500) {
      year = year - 543; // แปลงกลับเป็น ค.ศ.
    }

    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฏาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

    return `${day} ${thaiMonths[month]} ${year + 543}`;
  }
}
