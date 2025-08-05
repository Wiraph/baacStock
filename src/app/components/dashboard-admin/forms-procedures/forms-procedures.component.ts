import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FileService } from '../../../services/file';

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

  constructor(private fileService: FileService) { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  // Load Documents จาก API
  private loadDocuments() {
    this.loading = true;
    
    this.fileService.getFiles().subscribe({
      next: (files) => {
        
        if (!files || files.length === 0) {
          this.documents = [];
          this.loading = false;
          return;
        }
        
        // แปลงข้อมูลจาก API เป็นรูปแบบที่ต้องการ
        this.documents = files.map((file: any, index: number) => {
          const fileName = file.fileName || file.name || 'ไม่ระบุชื่อไฟล์';
          
          return {
            id: `doc-${index + 1}`,
            fileName: fileName,
            category: this.determineCategory(fileName),
            uploadDate: file.uploadDate || file.createdDate || new Date(),
            fileSize: file.size || file.fileSize || 0,
            downloadUrl: file.url || '',
            description: this.generateDescription(fileName)
          };
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading documents:', error);
        console.error('❌ Error details:', {
          status: error?.status,
          message: error?.message,
          url: error?.url
        }); // Debug log
        Swal.fire('ผิดพลาด', 'ไม่สามารถโหลดเอกสารได้', 'error');
        this.loading = false;
      }
    });
  }

  // กำหนดหมวดหมู่ตามชื่อไฟล์
  private determineCategory(fileName: string): string {
    const lowerFileName = fileName.toLowerCase();
    
    if (lowerFileName.includes('วิธีปฏิบัติ') || lowerFileName.includes('manual') || lowerFileName.includes('procedure')) {
      return 'วิธีปฏิบัติ';
    } else if (lowerFileName.includes('แบบพิมพ์') || lowerFileName.includes('form') || lowerFileName.includes('template')) {
      return 'แบบพิมพ์';
    } else {
      return 'เอกสาร';
    }
  }

  // สร้างคำอธิบายจากชื่อไฟล์
  private generateDescription(fileName: string): string {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, ''); // ลบนามสกุลไฟล์
    return `เอกสาร: ${nameWithoutExt}`;
  }

  // Download Document
  downloadDocument(doc: Document): void {
    if (!doc.fileName) {
      Swal.fire('ไม่มีชื่อไฟล์', 'กรุณาเลือกไฟล์ที่ต้องการดาวน์โหลด', 'warning');
      return;
    }

    this.fileService.downloadFile(doc.fileName).subscribe({
      next: (blob) => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = doc.fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        
        Swal.fire('สำเร็จ', `ดาวน์โหลด ${doc.fileName} เรียบร้อยแล้ว`, 'success');
      },
      error: (err) => {
        console.error(`❌ Download failed for ${doc.fileName}`, err);
        Swal.fire('ผิดพลาด', 'ไม่สามารถดาวน์โหลดไฟล์ได้', 'error');
      }
    });
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

}