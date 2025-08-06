import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { FileService } from '../../../services/file';
import { HttpEventType } from '@angular/common/http';

interface UploadedFile {
  name: string;
  url?: string;
  size: number;
  type: string;
  uploadDate: Date,
  uploadedBy: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html'
})
export class UploadComponent implements OnInit {

  isDragOver = false;
  selectedFiles: File[] = [];
  uploadedFiles: any[] = [];
  isUploading = false;

  maxFileSize = 10 * 1024 * 1024; // 10MB
  allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];
  allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];

  constructor(
    private cd: ChangeDetectorRef,
    private fileService: FileService
  ) { }

  ngOnInit(): void {
    this.loadUploadedFiles();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files) this.handleFiles(Array.from(files));
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) this.handleFiles(Array.from(files));
  }

  handleFiles(files: File[]) {
    const validFiles = files.filter(file => this.validateFile(file));
    if (validFiles.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
    }
  }

  validateFile(file: File): boolean {
    if (file.size > this.maxFileSize) {
      Swal.fire('ไฟล์ใหญ่เกินไป', `${file.name} > 10MB`, 'error');
      return false;
    }
    if (!this.allowedTypes.includes(file.type)) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!this.allowedExtensions.includes(ext)) {
        Swal.fire('ประเภทไฟล์ไม่ถูกต้อง', `${file.name} ไม่ได้รับอนุญาต`, 'error');
        return false;
      }
    }
    return true;
  }

  async uploadFiles() {
    if (this.selectedFiles.length === 0) {
      Swal.fire('ไม่มีไฟล์', 'กรุณาเลือกไฟล์', 'warning');
      return;
    }

    this.isUploading = true;

    for (const file of this.selectedFiles) {
      const entry: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        uploadedBy: 'admin',
        status: 'uploading',
        progress: 0
      };
      this.uploadedFiles.unshift(entry);

      await new Promise<void>((resolve) => {
        this.fileService.uploadFile(file).subscribe({
          next: event => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              entry.progress = Math.round((event.loaded / event.total) * 100);
              this.cd.markForCheck();
            } else if (event.type === HttpEventType.Response) {
              entry.status = 'completed';
              entry.url = event.body?.fileUrl || `/uploads/${file.name}`; // ปรับตาม response API
              resolve();
            }
          },
          error: err => {
            entry.status = 'error';
            console.error(`❌ Upload failed for ${file.name}`, err);
            Swal.fire('ผิดพลาด', `ไม่สามารถอัปโหลดไฟล์ ${file.name} ได้`, 'error');
            resolve();
          }
        });
      });
    }

    this.selectedFiles = [];
    this.isUploading = false;

    this.loadUploadedFiles(); // โหลดรายการล่าสุด
    Swal.fire('สำเร็จ', 'อัปโหลดไฟล์เรียบร้อยแล้ว', 'success');
  }


  removeSelectedFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  deleteUploadedFile(file: string) {
    Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการลบ',
      text: `ลบไฟล์ ${file} ใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then(result => {
      if (result.isConfirmed) {
        this.fileService.delete(file).subscribe({
          next: () => {
            Swal.fire('สำเร็จ', `ลบไฟล์ ${file} เรียบร้อยแล้ว`, 'success');
            this.loadUploadedFiles();
            this.cd.markForCheck();
          },
          error: err => {
            console.error(`❌ Delete failed for ${file}`, err);
            Swal.fire('ผิดพลาด', `ไม่สามารถลบไฟล์ ${file} ได้`, 'error');
          }
        });
      }
    });
  }

  downloadFile(fileName: string) {
    if (!fileName) {
      Swal.fire('ไม่มีชื่อไฟล์', 'กรุณาเลือกไฟล์ที่ต้องการดาวน์โหลด', 'warning');
      return;
    }
    
    this.fileService.downloadFile(fileName).subscribe({
      next: (blob) => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        this.cd.markForCheck();
        
        Swal.fire('สำเร็จ', `ดาวน์โหลด ${fileName} เรียบร้อยแล้ว`, 'success');
      },
      error: (err) => {
        console.error(`❌ Download failed for ${fileName}`, err);
        Swal.fire('ผิดพลาด', 'ไม่สามารถดาวน์โหลดไฟล์ได้', 'error');
      }
    })
  }


  loadUploadedFiles() {
    this.fileService.getFiles().subscribe(data => {
      this.uploadedFiles = data;
      this.cd.markForCheck();
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(type: string): string {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('image')) return '🖼️';
    if (type.includes('text')) return '📃';
    return '📁';
  }
}
