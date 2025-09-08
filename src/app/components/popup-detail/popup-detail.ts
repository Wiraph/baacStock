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
  AllData: any[] = [];
  owner: any = '';
  other: any[] = [];
  loading = true;
  action: string = '';
  cusNAME0: string = '';
  dateTime0: string = '';
  userDesc0: string = '';
  lvlDesc0: string = '';
  brCode0: string = '';
  brName0: string = '';
  lvlCode0: string = '';

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
    this.action = this.data.action;
    console.log("Action", this.action);
    this.onloadDetail(this.data.stkNote);
  }

  onloadDetail(stkNote: string) {
    stkNote = this.transformStkNote(stkNote);
    const payload = {
      stkNote: stkNote
    };

    this.stockService.detailApprove(payload).subscribe({
      next: (res) => {
        this.AllData = res;
        this.setDetail(this.AllData);
        this.loading = false;
        console.log("AllData", this.AllData);
        this.cd.detectChanges();
      }, error: (err) => {
        this.loading = false;
        console.log("ไม่สามารถดึงข้อมูลรายละเอียดได้", err);
      }
    })
  }

  // ฟังก์ชันเงือนไขการแสดงของรายละเอียด
  setDetail(item: any) {
    if (item[0].LiSTi == "100") {
      this.cusNAME0 = `${item[0].titleABBR}${item[0].cusFName} ${item[0].cusLName}`;
      this.dateTime0 = item[1].Approve_DATETIMEUP;
      this.userDesc0 = item[1].Approve_USRDesc;
      this.brCode0 = item[1].Approve_brCode;
      this.brName0 = item[1].Approve_brName;
      this.lvlDesc0 = item[1].Approve_LVLDesc;
      this.lvlCode0 = item[1].Approve_LVLCode;
      this.titleHead = item[1].staDESCstk;
      // กำหนดค่า owner จากข้อมูลที่ได้รับ
      this.owner = item[1];
    } else {
      this.dateTime0 = item[0].Approve_DATETIMEUP;
      this.userDesc0 = item[0].Approve_USRDesc;
      this.brCode0 = item[0].Approve_brCode;
      this.brName0 = item[0].Approve_brName;
      this.lvlDesc0 = item[0].Approve_LVLDesc;
      this.lvlCode0 = item[0].Approve_LVLCode;
      this.titleHead = this.parseStaDESCstk(item[0].staDESCstk);
      // กำหนดค่า owner จากข้อมูลที่ได้รับ
      this.owner = item[0];
    }
    console.log("TitleHead", this.titleHead);
    console.log("Owner", this.owner);
    this.cd.detectChanges();
  }

  // ฟังก์ชันเปลี่ยน stkNote ก่อนส่ง
  transformStkNote(note: string): string {
    if (!note) return '';
    return note.replace(/MORE$/, 'REGN');
  }

  getCusName(item: any): string {
    let name = '';
    if (item.titleCode !== 'JUR') name += item.titleABBR + ' ';
    name += item.cusFName + ' ';
    if (item.titleCode !== 'JUR') name += ' ';
    name += item.cusLName;
    if (item.LiSTi === '100') {
      name += ' [ก่อนเปลี่ยนแปลง]';
    } else {
      name += ` [${item.cusDESC}]`;
    }
    return name;
  }

  approve(status: string) {
    console.log("Status", status);
    let msgAction = '';
    if (this.action === "APPROVE") {
      msgAction = 'รายการ';
    } else if (this.action === "iSSUE") {
      msgAction = 'ออกใบหุ้นใหม่';
    }

    let msgStatus = '';
    if (status === 'YES') {
      msgStatus = 'ท่านต้องการอนุมัติ';
    } else if (status === 'NO') {
      msgStatus = 'ท่านต้องยกเลิก';
    }

    Swal.fire({
      icon: "question",
      html: `
      <p>${msgStatus} ${msgAction}</p>
      <p>หมายเลขหุ้น : ${this.owner?.stkNOTE || 'ไม่ระบุ'}</p>
      <p>ชื่อผู้ถือหุ้น : ${this.owner?.titleABBR || ''}${this.owner?.cusFName || ''} ${this.owner?.cusLName || ''}</p>
      <p>จำนวนหุ้น : ${this.owner?.stkUNiT || 0} หุ้น</p>
      <p>จำนวนเงิน : ${this.owner?.stkVALUE ? this.owner.stkVALUE.toLocaleString('en-US') : '0'} บาท</p>
    `,
      showCancelButton: true,
      cancelButtonText: 'ยกเลิก',
      cancelButtonColor: '#FF0000',
      confirmButtonText:  status === 'YES' ? "อนุมัติ" : "ยกเลิกรายการ",
      confirmButtonColor: '#32CD32'
    }).then((result) => {
      if (!result.isConfirmed && status === 'YES') return; // ถ้าไม่ confirm แต่ status YES ก็ไม่ส่ง
      if (!result.isConfirmed && status === 'NO') return;

      const payload = {
        stkNOTEis: this.owner?.stkNOTE || '',
        AiSQL: this.action,
        stkCONFiRM: status
      };

      this.approveServie.confirmStock(payload).subscribe({
        next: (res:any) => {
          console.log("Result", res);
          Swal.fire({
            icon: "success",
            title: status === 'YES' ? "อนุมัติสำเร็จ" : "ยกเลิกรายการสำเร็จ",
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            this.dialogRef.close("PASS");
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: "error",
            title: "ไม่สำเร็จ",
            text: "โปรดติดต่อผู้พัฒนา"
          });
        }
      });
    });
  }


  close(result: boolean) {
    this.dialogRef.close(result);
  }

  formatDateThai(dateStr: string): string {
    if (!dateStr) return '-';

    const year = parseInt(dateStr.substring(0, 4)); // ค.ศ. → พ.ศ.
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    const thaiMonths = [
      '', // index 0 ไม่ใช้
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const monthName = thaiMonths[parseInt(month, 10)];

    return `${parseInt(day, 10)} ${monthName} ${year}`;
  }


  extractTime(raw: string): string {
    if (!raw || raw.length < 15) return "";
    try {
      const timePart = raw.substring(9); // "132524"
      const hour = timePart.substring(0, 2);
      const minute = timePart.substring(2, 4);
      const second = timePart.substring(4, 6);

      return `${hour}:${minute}:${second}`;
    } catch (e) {
      console.error("❌ Error extracting time:", raw, e);
      return "";
    }
  }

  // แปลง staDESCstk
  formatStaDesc(staDESCstk: string): string {
    if (!staDESCstk) return '';
    let parts = staDESCstk.split(':');
    let last = parts[parts.length - 1];
    last = last.split('(')[0].trim();
    last = last.replace(/^การ/, ''); // remove leading "การ"
    return last;
  }

  // ตรวจว่าเป็น "ผู้ถือหุ้น / ใบหุ้น"
  getHolderMsg(index: number, item: any, rowCount: number): string {
    if (rowCount === 1 || item.stkREMCode === '0040') {
      return 'ผู้ถือหุ้น / ใบหุ้น';
    } else {
      return index === 0 ? 'ผู้โอน' : 'ผู้รับโอน';
    }
  }

  // สำหรับหัวข้อของรายการอนุมัติ
  parseStaDESCstk(input: string): string {
    if (!input) return '';

    // 1. แยกด้วย ":"
    const parts = input.split(':');

    // 2. เอาตัวสุดท้าย
    let lastPart = parts[parts.length - 1];

    // 3. แยกด้วย "(" และเอาตัวแรก
    lastPart = lastPart.split('(')[0];

    // 4. trim space และลบ "การ" ข้างหน้า
    lastPart = lastPart.trim().replace(/^การ/, '');

    return lastPart;
  }
}
