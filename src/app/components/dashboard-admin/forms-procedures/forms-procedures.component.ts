import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  documents: any[] = [];
  loading = false;

  constructor(
    private fileService: FileService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  // Load Documents จาก API - แบบเรียบง่ายเหมือน upload component
  private loadDocuments() {
    this.loading = true;
    this.cd.markForCheck(); // Force UI update
    
    this.fileService.getFiles().subscribe({
      next: (files) => {
        this.documents = files || [];
        this.loading = false;
        this.cd.markForCheck(); // Force UI update after data loaded
      },
      error: (error) => {
        this.documents = [];
        this.loading = false;
        this.cd.markForCheck(); // Force UI update on error
        Swal.fire('ผิดพลาด', 'ไม่สามารถโหลดเอกสารได้', 'error');
      }
    });
  }

  // Download Document
  downloadDocument(doc: any): void {
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

  // Track By Function for ngFor
  trackByFileName(index: number, doc: any): string {
    return doc.fileName || doc.name || index.toString();
  }

}