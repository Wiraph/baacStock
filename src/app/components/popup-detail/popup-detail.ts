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
/** ป๊อปอัปรายละเอียดใบหุ้น: แสดงข้อมูลรายการ และยืนยันอนุมัติ/ยกเลิก */
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

  /** โหลดรายละเอียดเมื่อเปิดป๊อปอัป */
  ngOnInit(): void {
    this.stkStatus = this.data.stkStatus;
    this.loading = true;
    this.action = this.data.action;
    this.onloadDetail(this.data.stkNote);
  }

  /** เรียก API เพื่อโหลดรายละเอียดใบหุ้นตาม stkNote */
  onloadDetail(stkNote: string) {
    stkNote = this.transformStkNote(stkNote);
    const payload = { stkNote };

    this.stockService.detailApprove(payload).subscribe({
      next: (res) => {
        this.AllData = Array.isArray(res) ? res : [];
        this.setDetail(this.AllData);
        this.loading = false;
        this.cd.detectChanges();
      }, error: () => {
        this.loading = false;
        Swal.fire({ icon: 'error', title: 'ไม่สามารถดึงข้อมูลรายละเอียดได้', text: 'โปรดลองใหม่' });
      }
    })
  }

  /** ตั้งค่าข้อมูลรายละเอียดสำหรับแสดงผล */
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
      this.owner = item[1];
    } else {
      this.dateTime0 = item[0].Approve_DATETIMEUP;
      this.userDesc0 = item[0].Approve_USRDesc;
      this.brCode0 = item[0].Approve_brCode;
      this.brName0 = item[0].Approve_brName;
      this.lvlDesc0 = item[0].Approve_LVLDesc;
      this.lvlCode0 = item[0].Approve_LVLCode;
      this.titleHead = this.parseStaDESCstk(item[0].staDESCstk);
      this.owner = item[0];
    }
    this.cd.detectChanges();
  }

  /** ปรับรูปแบบค่า stkNote ก่อนส่ง */
  transformStkNote(note: string): string {
    if (!note) return '';
    return note.replace(/MORE$/, 'REGN');
  }

  /** ชื่อผู้ถือหุ้นแสดงผล */
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

  /** ยืนยันอนุมัติ/ยกเลิกรายการ */
  approve(status: string) {
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
      if (!result.isConfirmed) return;

      const payload = {
        stkNOTEis: this.owner?.stkNOTE || '',
        AiSQL: this.action,
        stkCONFiRM: status
      };

      this.approveServie.confirmStock(payload).subscribe({
        next: () => {
          Swal.fire({ icon: "success", title: status === 'YES' ? "อนุมัติสำเร็จ" : "ยกเลิกรายการสำเร็จ", showConfirmButton: false, timer: 1500 })
            .then(() => { this.dialogRef.close("PASS"); });
        },
        error: () => {
          Swal.fire({ icon: "error", title: "ไม่สำเร็จ", text: "โปรดติดต่อผู้พัฒนา" });
        }
      });
    });
  }

  /** ปิดป๊อปอัป */
  close(result: boolean) {
    this.dialogRef.close(result);
  }

  /** วันที่แบบไทยจากรูปแบบ YYYYMMDD */
  formatDateThai(dateStr: string): string {
    if (!dateStr) return '-';

    const year = parseInt(dateStr.substring(0, 4));
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    const thaiMonths = [
      '',
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const monthName = thaiMonths[parseInt(month, 10)];

    return `${parseInt(day, 10)} ${monthName} ${year}`;
  }

  /** HH:mm:ss จากสตริง DATETIMEUP */
  extractTime(raw: string): string {
    if (!raw || raw.length < 15) return "";
    try {
      const timePart = raw.substring(9);
      const hour = timePart.substring(0, 2);
      const minute = timePart.substring(2, 4);
      const second = timePart.substring(4, 6);

      return `${hour}:${minute}:${second}`;
    } catch {
      return "";
    }
  }

  /** ตัดคำอธิบายสถานะแบบสั้น */
  formatStaDesc(staDESCstk: string): string {
    if (!staDESCstk) return '';
    let parts = staDESCstk.split(':');
    let last = parts[parts.length - 1];
    last = last.split('(')[0].trim();
    last = last.replace(/^การ/, '');
    return last;
  }

  /** ข้อความระบุบทบาทผู้ถือหุ้น/โอน/รับโอน */
  getHolderMsg(index: number, item: any, rowCount: number): string {
    if (rowCount === 1 || item.stkREMCode === '0040') {
      return 'ผู้ถือหุ้น / ใบหุ้น';
    } else {
      return index === 0 ? 'ผู้โอน' : 'ผู้รับโอน';
    }
  }

  /** หัวข้อของรายการอนุมัติ (ตัด "การ" และส่วนท้ายในวงเล็บ) */
  parseStaDESCstk(input: string): string {
    if (!input) return '';
    const parts = input.split(':');
    let lastPart = parts[parts.length - 1];
    lastPart = lastPart.split('(')[0];
    lastPart = lastPart.trim().replace(/^การ/, '');
    return lastPart;
  }
}
