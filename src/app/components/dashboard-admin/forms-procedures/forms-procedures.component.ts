import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

interface Document {
  id: string;
  fileName: string;
  category: string;
  uploadDate: Date;
  fileSize: number;
  downloadUrl: string;
  description?: string;
}

@Component({
  selector: 'app-forms-procedures',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forms-procedures.component.html'
})
export class FormsProceduresComponent implements OnInit {

  documents: Document[] = [];
  loading = false;

  constructor() { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  // Load Documents (Mock Data)
  private loadDocuments() {
    this.loading = true;
    
    // Load data immediately without delay
    this.documents = [
      {
        id: '213.01',
        fileName: '213.01 การขายหุ้นธนาคาร.pdf',
        category: 'แบบพิมพ์',
        uploadDate: new Date(2024, 11, 20),
        fileSize: 1024000, // 1MB
        downloadUrl: '/documents/forms/213.01-การขายหุ้นธนาคาร.pdf',
        description: 'แบบฟอร์มการขายหุ้นธนาคาร'
      },
      {
        id: '213.01-manual',
        fileName: '213.01วิธีปฏิบัติการขายหุ้นธนาคาร.doc',
        category: 'วิธีปฏิบัติ',
        uploadDate: new Date(2024, 11, 19),
        fileSize: 512000, // 512KB
        downloadUrl: '/documents/procedures/213.01-วิธีปฏิบัติการขายหุ้นธนาคาร.doc',
        description: 'คู่มือวิธีปฏิบัติการขายหุ้นธนาคาร'
      },
      {
        id: '213.02',
        fileName: '213.02 การเปลี่ยนแปลงข้อมูลผู้ถือหุ้น.pdf',
        category: 'แบบพิมพ์',
        uploadDate: new Date(2024, 11, 18),
        fileSize: 768000, // 768KB
        downloadUrl: '/documents/forms/213.02-การเปลี่ยนแปลงข้อมูลผู้ถือหุ้น.pdf',
        description: 'แบบฟอร์มการเปลี่ยนแปลงข้อมูลผู้ถือหุ้น'
      },
      {
        id: '213.02-manual',
        fileName: '213.02วิธีปฏิบัติการเปลี่ยนแปลงข้อมูลผู้ถือหุ้น.doc',
        category: 'วิธีปฏิบัติ',
        uploadDate: new Date(2024, 11, 17),
        fileSize: 640000, // 640KB
        downloadUrl: '/documents/procedures/213.02-วิธีปฏิบัติการเปลี่ยนแปลงข้อมูลผู้ถือหุ้น.doc',
        description: 'คู่มือวิธีปฏิบัติการเปลี่ยนแปลงข้อมูลผู้ถือหุ้น'
      },
      {
        id: '213.03',
        fileName: '213.03 การโอนเปลี่ยนชื่อ.pdf',
        category: 'แบบพิมพ์',
        uploadDate: new Date(2024, 11, 16),
        fileSize: 896000, // 896KB
        downloadUrl: '/documents/forms/213.03-การโอนเปลี่ยนชื่อ.pdf',
        description: 'แบบฟอร์มการโอนเปลี่ยนชื่อ'
      },
      {
        id: '213.03-manual',
        fileName: '213.03วิธีปฏิบัติการโอนเปลี่ยนชื่อ (กรณีโอนให้บุคคลอื่น, ผู้ถือหุ้นเสียชีวิต).doc',
        category: 'วิธีปฏิบัติ',
        uploadDate: new Date(2024, 11, 15),
        fileSize: 1152000, // 1.1MB
        downloadUrl: '/documents/procedures/213.03-วิธีปฏิบัติการโอนเปลี่ยนชื่อ.doc',
        description: 'คู่มือวิธีปฏิบัติการโอนเปลี่ยนชื่อ (กรณีโอนให้บุคคลอื่น, ผู้ถือหุ้นเสียชีวิต)'
      },
      {
        id: '213.04',
        fileName: '213.04 การขอลดโบนัสบิ้นใหม่เพื่อแทนหนอบิ้นเดิม (กรณีชำรุด, สูญหาย).pdf',
        category: 'แบบพิมพ์',
        uploadDate: new Date(2024, 11, 14),
        fileSize: 1280000, // 1.25MB
        downloadUrl: '/documents/forms/213.04-การขอลดโบนัสบิ้นใหม่.pdf',
        description: 'แบบฟอร์มการขอลดโบนัสบิ้นใหม่เพื่อแทนหนอบิ้นเดิม'
      },
      {
        id: '213.04-manual',
        fileName: '213.04วิธีปฏิบัติการขอโบนัสบิ้นใหม่เพื่อแทนหนอบิ้นเดิม (กรณีชำรุด, สูญหาย).doc',
        category: 'วิธีปฏิบัติ',
        uploadDate: new Date(2024, 11, 13),
        fileSize: 1024000, // 1MB
        downloadUrl: '/documents/procedures/213.04-วิธีปฏิบัติการขอโบนัสบิ้นใหม่.doc',
        description: 'คู่มือวิธีปฏิบัติการขอโบนัสบิ้นใหม่เพื่อแทนหนอบิ้นเดิม'
      },
      {
        id: '213.05',
        fileName: '213.05วิธีปฏิบัติการขืนขยอการถือหุ้นธนาคารของสมาชิก.doc',
        category: 'วิธีปฏิบัติ',
        uploadDate: new Date(2024, 11, 12),
        fileSize: 768000, // 768KB
        downloadUrl: '/documents/procedures/213.05-วิธีปฏิบัติการขืนขยอการถือหุ้นธนาคาร.doc',
        description: 'คู่มือวิธีปฏิบัติการขืนขยอการถือหุ้นธนาคารของสมาชิก'
      },
      {
        id: '213.06',
        fileName: '213.06 การขืนขยอการถือหุ้นธนาคารของสาขา.pdf',
        category: 'แบบพิมพ์',
        uploadDate: new Date(2024, 11, 11),
        fileSize: 896000, // 896KB
        downloadUrl: '/documents/forms/213.06-การขืนขยอการถือหุ้นธนาคารของสาขา.pdf',
        description: 'แบบฟอร์มการขืนขยอการถือหุ้นธนาคารของสาขา'
      },
      {
        id: '213.06-manual',
        fileName: '213.06วิธีปฏิบัติการขืนขยอการถือหุ้นธนาคารของสาขา.doc',
        category: 'วิธีปฏิบัติ',
        uploadDate: new Date(2024, 11, 10),
        fileSize: 640000, // 640KB
        downloadUrl: '/documents/procedures/213.06-วิธีปฏิบัติการขืนขยอการถือหุ้นธนาคาร.doc',
        description: 'คู่มือวิธีปฏิบัติการขืนขยอการถือหุ้นธนาคารของสาขา'
      }
    ];
    
    this.loading = false;
  }

  // Download Document
  downloadDocument(document: Document): void {
    console.log('Downloading document:', document.fileName);
    // TODO: Implement actual download logic
    alert(`กำลังดาวน์โหลด: ${document.fileName}`);
  }

  // Get File Icon
  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'txt': return '📄';
      default: return '📄';
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
  getCategoryBadge(category: string): { class: string, text: string } {
    switch (category) {
      case 'แบบพิมพ์':
        return {
          class: 'bg-blue-100 text-blue-800',
          text: '📋 แบบพิมพ์'
        };
      case 'วิธีปฏิบัติ':
        return {
          class: 'bg-green-100 text-green-800',
          text: '📖 วิธีปฏิบัติ'
        };
      default:
        return {
          class: 'bg-gray-100 text-gray-800',
          text: '📄 เอกสาร'
        };
    }
  }
}