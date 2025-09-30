import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ManualService } from '../../../services/manual';

interface Manual {
  displayName: string;
  fileName: string;
  uploadDate: Date;
  fileSize: number;
  downloadUrl: string;
}

const fileMapping: Record<string, string> = {
  'user.doc': 'คู่มือผู้ใช้งานระบบ (สำนักงานใหญ่)',
  'userBranch.doc': 'คู่มือผู้ใช้งานระบบ (สาขา)',
  'FlowDivident2554.doc': 'ขั้นตอนการจ่ายเงินปันผล',
  'searchedit.doc': 'คู่มือค้นหา/แก้ไข',
  'printstock.doc': 'คู่มือพิมพ์คำขอซื้อหุ้น',
  'salestock.doc': 'คู่มือขายหุ้นสามัญ',
  'newstockloss.doc': 'คู่มือออกหุ้นใบใหม่แทนใบที่ชำรุด/สูญหาย',
  'transfer.doc': 'คู่มือโอนเปลี่ยนมือ',
  'dividendCash_Stock_PAiD.doc': 'คู่มือจำเงินปันผล 2555 (DOC)',
  'dividendCash_Stock_PAiD.pdf': 'คู่มือจำเงินปันผล 2555 (PDF)',
  'reportsalestock.doc': 'คู่มือรายงานการขายหุ้น/โอนหุ้น',
  'reportconcludebyday.doc': 'คู่มือรายงานสรุปผลการโอนหุ้นประจำวันแยกตามประเภทผู้ถือหุ้น',
  'reportdividentRate.doc': 'คู่มือรายงานข้อมูลอัตราเงินปันผล',
  'reportregisterstock.doc': 'คู่มือทะเบียนผู้ถือหุ้น',
  'reportdetailstock.doc': 'คู่มือรายละเอียดผู้ถือหุ้น',
  'reportseparate.doc': 'คู่มือยอดสรุปการจ่ายเงินปันผลแยกตามสาขา สนจ ประเทศ',
  'reportpd2.doc': 'คู่มือใบแนบภ.ง.ด.2',
  'reportpayin.doc': 'คู่มือใบสำคัญจ่าย',
  'reporttax.doc': 'คู่มือหนังสือรับรองการหักภาษี ณ ที่จ่าย',
  '1-approvestock.doc': 'คู่มือ อนุมัติรายการ',
  '1-approvestock2.doc': 'คู่มือ อนุมัติออกใบหุ้น',
  '1-printstock.doc': 'คู่มือพิมพ์ใบหุ้น',
  '1-blockstock.doc': 'คู่มือบล็อค/ยกเลิกบล็อคใบหุ้น',
  '1-textfile.doc': 'คู่มือสร้าง textfile',
  '1-shapestock.doc': 'คู่มือรายงานสัดส่วนผู้ถือหุ้น',
  '1-ratestock.doc' : 'คู่มือรายงานการจัดลำดับผู้ถือหุ้น',
  '1-creditstock.doc' : 'คู่มือรายงานสรุปยอดคงเหลือแยกตามประเภทผู้ถือหุ้น',
  '1-confirmstock.doc': 'คู่มือหนังสือยืนยันยอดหุ้น',
  '1-reportconclude.doc' : 'คู่มือรายงานสรุปการขาย/โอนหุ้นสามัญแยกตามประเภทผู้ถือหุ้น',
  '1-summary.doc' : 'คู่มือสรุปรายละเอียดการจ่ายเงินปันผลหุ้นสามัญ',
  '1-informdividend.doc': 'คู่มือหนังสือแจ้งการจ่ายเงินปันผลหุ้นสามัญ',
  '1-control.doc': 'คู่มือควบคุมระบบ',
  '1-upload-download.doc' : 'คู่มือUpload/Download เอกสาร',
  'การแสดงผล PDF ใน Browser.doc' : 'การกำหนดตัวเลือกการแสดงผล PDF ใน Browser (DOC)',
  'การแสดงผล PDF ใน Browser.pdf' : 'การกำหนดตัวเลือกการแสดงผล PDF ใน Browser (PDF)'
};

@Component({
  selector: 'app-user-manual',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-manual.component.html'
})
export class UserManualComponent implements OnInit {
  manuals: Manual[] = [];
  loading = false;

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly manualService: ManualService
  ) { }

  ngOnInit(): void {
    this.loadManuals();
  }

  // Load Manuals (Mock Data)
  private loadManuals() {
    this.loading = true;
    this.manualService.getFileList().subscribe({
      next: files => {
        this.manuals = Object.keys(fileMapping)   // 1️⃣ ใช้ลำดับตาม key ใน mapping
          .map(fileName => {
            const file = files.find(f => f.fileName === fileName);
            if (!file) return null;  // ถ้า API ไม่มีไฟล์นี้ จะไม่เอา
            return {
              fileName: file.fileName,
              displayName: fileMapping[file.fileName],
              uploadDate: new Date(file.created),
              fileSize: file.fileSize,
              downloadUrl: file.fileName
            };
          })
          .filter(f => f !== null) as Manual[];
        this.loading = false;
        this.cd.markForCheck();
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // Download Manual
  downloadManual(manual: Manual) {
    this.manualService.downloadFile(manual.fileName).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = manual.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('Download initiated for:', manual.fileName);
      }, error: err => {
        console.error('Download failed for:', manual.fileName, err);
        Swal.fire({
          icon: `error`,
          title: `ดาวน์โหลดไม่สำเร็จ`,
          text: `ไม่สามารถดาวน์โหลดไฟล์ "${manual.fileName}" ได้ โปรดลองใหม่อีกครั้ง`,
          confirmButtonText: 'ตกลง',
        })
      }
    })
    // Simulate download
    setTimeout(() => {
      // ในระบบจริงจะใช้ window.open หรือ download link
      console.log('Download completed:', manual.downloadUrl);
    }, 2000);
  }

  // Get File Icon
  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (fileName.includes('(DOC)') || extension === 'doc' || extension === 'docx') {
      return '📝';
    } else if (fileName.includes('(PDF)') || extension === 'pdf') {
      return '📄';
    } else {
      return '📖';
    }
  }

  // Format File Size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Track By Function for ngFor
  trackByFileName(index: number, manual: Manual): string {
    return manual.fileName || index.toString();
  }
}