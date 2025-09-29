import { ChangeDetectorRef, Component, OnInit, NgZone } from '@angular/core';
import { Sap } from '../../../services/sap';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

/** รายการไฟล์สำหรับ SAP Interface */
interface TextFile {
  fileName: string;
  fileSize: number;
}


@Component({
  selector: 'app-sap-interface',
  imports: [CommonModule],
  templateUrl: './sap-interface.html',
  styleUrl: './sap-interface.css'
})
/**
 * SAP Interface: โหลดรายการไฟล์ .txt, สร้างไฟล์ใหม่จาก backend และดาวน์โหลดไฟล์/รายงานความเคลื่อนไหวหุ้น
 */
export class SapInterface implements OnInit {
  isLoading: boolean = false;
  textfile: TextFile[] = [];
  constructor(
    private readonly sapService: Sap,
    private readonly cd: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.loadTextFile();
  }

  /** โหลดรายการไฟล์ .txt จาก backend */
  loadTextFile(): void {
    this.isLoading = true;
    this.sapService.getlist().subscribe({
      next: (res: any[]) => {
        // map เพื่อเอา .txt ออก และรวม fileName/fileSize เป็น object
        this.textfile = (res || []).map(f => ({
          fileName: (f?.fileName || '').toString().replace(/\.txt$/i, ''),
          fileSize: Number(f?.fileSize) || 0
        }));
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cd.detectChanges();
        Swal.fire({ icon: 'error', title: 'โหลดรายการไฟล์ไม่สำเร็จ', text: 'โปรดลองใหม่' });
      }
    });
  }

  /** สร้างไฟล์ .txt ใหม่จาก backend และรีเฟรชรายการ */
  createTextFile(): void {
    this.isLoading = true;
    this.sapService.generate().subscribe({
      next: () => {
        this.isLoading = false;
        this.cd.detectChanges();
        Swal.fire({ icon: 'success', text: 'สร้างไฟล์สำเร็จ' }).then((result) => {
          if (result.isConfirmed) {
            this.ngZone.run(() => { this.loadTextFile(); })
          }
        })
      }, error: () => {
        this.isLoading = false;
        this.cd.detectChanges();
        Swal.fire({ icon: 'error', title: 'สร้างไฟล์ไม่สำเร็จ', text: 'โปรดลองใหม่' });
      }
    })
  }

  /** ดาวน์โหลดไฟล์ .txt ตามชื่อ */
  dowloadTextFile(fileName: string): void {
    this.isLoading = true;
    const fileNameTxt = `${fileName}.txt`;
    const payload = { fileName: fileNameTxt };
    this.sapService.download(payload).subscribe({
      next: (blob: Blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName; // ตั้งชื่อไฟล์
        link.click();
        window.URL.revokeObjectURL(link.href);
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cd.detectChanges();
        Swal.fire({ icon: 'error', title: 'ดาวน์โหลดไฟล์ไม่สำเร็จ', text: 'โปรดลองใหม่' });
      }
    })
  }

  /** ดาวน์โหลดไฟล์ Stock Movement (Excel) จากวันที่ที่ระบุในชื่อไฟล์ */
  downloadStockMovement(fileName: string) {
    this.isLoading = true;
    this.cd.detectChanges();
    const file = fileName
    const regex = /(\d{8})$/;
    const match = regex.exec(file);
    let datePart = match ? match[1] : "";
    let num = Number(datePart);
    let converted = num - 5430000;
    let result = converted.toString();
    const payload = { dateArg: result }

    this.sapService.downloadExcel(payload).subscribe({
      next: (res) => {
        const link = document.createElement('a');
        link.href = res.url;
        link.download = res.file;
        link.click();
        this.isLoading = false;
        this.cd.detectChanges();
      }, error: (err) => {
        this.isLoading = false;
        // แสดงรายละเอียดจาก server ถ้าส่ง Blob มาด้วย
        if (err?.error instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            const resultText = typeof reader.result === 'string' && reader.result.trim().length > 0
              ? reader.result
              : 'โปรดลองใหม่';
            Swal.fire({ icon: 'error', title: 'ดาวน์โหลดรายงานไม่สำเร็จ', text: resultText });
          };
          reader.readAsText(err.error);
        } else {
          Swal.fire({ icon: 'error', title: 'ดาวน์โหลดรายงานไม่สำเร็จ', text: 'โปรดลองใหม่' });
        }
        this.cd.detectChanges();
      }
    })
  }
}
