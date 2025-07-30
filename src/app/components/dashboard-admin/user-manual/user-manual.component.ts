import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

interface Manual {
  id: string;
  fileName: string;
  category: string;
  uploadDate: Date;
  fileSize: number;
  downloadUrl: string;
  description?: string;
}

@Component({
  selector: 'app-user-manual',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-manual.component.html'
})
export class UserManualComponent implements OnInit {

  manuals: Manual[] = [];
  loading = false;

  constructor() { }

  ngOnInit(): void {
    this.loadManuals();
  }

  // Load Manuals (Mock Data)
  private loadManuals() {
    this.loading = true;
    
    // Load data immediately without delay
    this.manuals = [
      {
        id: 'manual-01',
        fileName: 'คู่มือใช้งานระบบ (สำหรับงานใหม่)',
        category: 'คู่มือ - เอกสาร',
        uploadDate: new Date(2025, 3, 8), // 2025-04-08
        fileSize: 2048000, // 2MB
        downloadUrl: '/manuals/คู่มือใช้งานระบบ-งานใหม่.pdf',
        description: 'คู่มือการใช้งานระบบสำหรับพนักงานใหม่'
      },
      {
        id: 'manual-02',
        fileName: 'คู่มือใช้งานระบบ (สาขา)',
        category: 'คู่มือ - เอกสาร',
        uploadDate: new Date(2025, 3, 8),
        fileSize: 1536000, // 1.5MB
        downloadUrl: '/manuals/คู่มือใช้งานระบบ-สาขา.pdf',
        description: 'คู่มือการใช้งานระบบสำหรับสาขา'
      },
      {
        id: 'manual-03',
        fileName: 'ขั้นตอนการขายเงินปันผล',
        category: 'คู่มือ - เอกสาร',
        uploadDate: new Date(2025, 3, 8),
        fileSize: 1024000, // 1MB
        downloadUrl: '/manuals/ขั้นตอนการขายเงินปันผล.pdf',
        description: 'คู่มือขั้นตอนการขายเงินปันผล'
      },
      {
        id: 'manual-04',
        fileName: 'คู่มือหน้าแกไฟล์',
        category: 'คู่มือ - เอกสาร',
        uploadDate: new Date(2025, 3, 8),
        fileSize: 768000, // 768KB
        downloadUrl: '/manuals/คู่มือหน้าแกไฟล์.pdf',
        description: 'คู่มือการแก้ไฟล์ในระบบ'
      },
      {
        id: 'manual-05',
        fileName: 'คู่มือพิมพ์คำขอซื้อหุ้น',
        category: 'คู่มือ - เอกสาร',
        uploadDate: new Date(2025, 3, 8),
        fileSize: 896000, // 896KB
        downloadUrl: '/manuals/คู่มือพิมพ์คำขอซื้อหุ้น.pdf',
        description: 'คู่มือการพิมพ์คำขอซื้อหุ้น'
      },
      {
        id: 'manual-06',
        fileName: 'คู่มือขายหุ้นราคาใหม่',
        category: 'คู่มือ - เอกสาร',
        uploadDate: new Date(2025, 3, 8),
        fileSize: 1280000, // 1.25MB
        downloadUrl: '/manuals/คู่มือขายหุ้นราคาใหม่.pdf',
        description: 'คู่มือการขายหุ้นราคาใหม่'
      },
      {
        id: 'manual-07',
        fileName: 'คู่มือออกหุ้นใบใหม่แทนใบที่ชำรุด/สูญหาย',
        category: 'คู่มือ - เอกสาร',
        uploadDate: new Date(2025, 3, 8),
        fileSize: 1152000, // 1.1MB
        downloadUrl: '/manuals/คู่มือออกหุ้นใบใหม่.pdf',
        description: 'คู่มือการออกหุ้นใบใหม่แทนใบที่ชำรุด/สูญหาย'
      },
      {
        id: 'manual-08',
        fileName: 'คู่มือโอนเปลี่ยนชื่อ',
        category: 'คู่มือ - เอกสาร',
        uploadDate: new Date(2025, 3, 8),
        fileSize: 1024000, // 1MB
        downloadUrl: '/manuals/คู่มือโอนเปลี่ยนชื่อ.pdf',
        description: 'คู่มือการโอนเปลี่ยนชื่อผู้ถือหุ้น'
      },
      {
        id: 'manual-09',
        fileName: 'คู่มือจำเงินปันผล 2555 (DOC)',
        category: 'คู่มือ - เอกสาร',
        uploadDate: new Date(2025, 3, 8),
        fileSize: 640000, // 640KB
        downloadUrl: '/manuals/คู่มือจำเงินปันผล2555.doc',
        description: 'คู่มือการจำเงินปันผล ปี 2555 (รูปแบบ DOC)'
      },
      {
        id: 'manual-10',
        fileName: 'คู่มือจำเงินปันผล 2555 (PDF)',
        category: 'คู่มือ - เอกสาร',
        uploadDate: new Date(2025, 3, 8),
        fileSize: 896000, // 896KB
        downloadUrl: '/manuals/คู่มือจำเงินปันผล2555.pdf',
        description: 'คู่มือการจำเงินปันผล ปี 2555 (รูปแบบ PDF)'
      },
      {
        id: 'manual-11',
        fileName: 'คู่มือรายงานการขายหุ้น/โอนหุ้น',
        category: 'คู่มือ - เอกสาร',
        uploadDate: new Date(2025, 3, 8),
        fileSize: 1024000, // 1MB
        downloadUrl: '/manuals/คู่มือรายงานการขายหุ้น.pdf',
        description: 'คู่มือการทำรายงานการขายหุ้น/โอนหุ้น'
      },
      {
        id: 'manual-12',
        fileName: 'คู่มือรายงานสรุปสมาชิกใหม่หุ้นใหม่และระดับการประกันภัยโดยอำเภอ',
        category: 'คู่มือ - เอกสาร',
        uploadDate: new Date(2025, 3, 8),
        fileSize: 1536000, // 1.5MB
        downloadUrl: '/manuals/คู่มือรายงานสรุปสมาชิก.pdf',
        description: 'คู่มือการทำรายงานสรุปสมาชิกใหม่หุ้นใหม่และระดับการประกันภัยโดยอำเภอ'
      },
      {
        id: 'manual-13',
        fileName: 'คู่มือรายงานข้อมูลสมาชิกเงินปันผล',
        category: 'คู่มือ - เอกสาร',
        uploadDate: new Date(2025, 3, 8),
        fileSize: 768000, // 768KB
        downloadUrl: '/manuals/คู่มือรายงานข้อมูลสมาชิก.pdf',
        description: 'คู่มือการทำรายงานข้อมูลสมาชิกเงินปันผล'
      }
    ];
    
    this.loading = false;
  }

  // Download Manual
  downloadManual(manual: Manual) {
    console.log('📥 Downloading manual:', manual.fileName);
    
    // Mock download - ในระบบจริงจะเรียก API
    Swal.fire({
      icon: 'info',
      title: 'กำลังดาวน์โหลด',
      text: `กำลังดาวน์โหลดไฟล์ "${manual.fileName}"`,
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true
    });

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

  // Get Category Badge Style
  getCategoryBadge(category: string): { text: string; class: string } {
    return { text: '📖 คู่มือ - เอกสาร', class: 'bg-green-100 text-green-800' };
  }

  // Get Total Count
  get totalCount(): number {
    return this.manuals.length;
  }
}