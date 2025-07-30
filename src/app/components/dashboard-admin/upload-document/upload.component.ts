import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  uploadedBy: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  url?: string;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html'
})
export class UploadComponent implements OnInit {
  
  // File Upload Properties
  isDragOver = false;
  selectedFiles: File[] = [];
  uploadedFiles: UploadedFile[] = [];
  isUploading = false;
  
  // Configuration
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

  constructor() { }

  ngOnInit(): void {
    this.loadUploadedFiles();
  }

  // Drag & Drop Events
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  // File Selection
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  // File Handling
  handleFiles(files: File[]) {
    const validFiles: File[] = [];
    
    for (const file of files) {
      if (this.validateFile(file)) {
        validFiles.push(file);
      }
    }
    
    if (validFiles.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
      console.log('📁 Selected files:', this.selectedFiles);
    }
  }

  // File Validation
  validateFile(file: File): boolean {
    // Check file size
    if (file.size > this.maxFileSize) {
      Swal.fire({
        icon: 'error',
        title: 'ไฟล์ใหญ่เกินไป',
        text: `ไฟล์ "${file.name}" มีขนาด ${this.formatFileSize(file.size)} ซึ่งเกินขีดจำกัด ${this.formatFileSize(this.maxFileSize)}`,
        confirmButtonText: 'ตกลง'
      });
      return false;
    }

    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!this.allowedExtensions.includes(extension)) {
        Swal.fire({
          icon: 'error',
          title: 'ประเภทไฟล์ไม่ถูกต้อง',
          text: `ไฟล์ "${file.name}" ไม่ใช่ประเภทที่อนุญาต\nประเภทที่อนุญาต: ${this.allowedExtensions.join(', ')}`,
          confirmButtonText: 'ตกลง'
        });
        return false;
      }
    }

    return true;
  }

  // Upload Files
  async uploadFiles() {
    if (this.selectedFiles.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่มีไฟล์ที่เลือก',
        text: 'กรุณาเลือกไฟล์ที่ต้องการอัปโหลด',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    this.isUploading = true;

    for (const file of this.selectedFiles) {
      await this.uploadSingleFile(file);
    }

    this.selectedFiles = [];
    this.isUploading = false;
    
    Swal.fire({
      icon: 'success',
      title: 'อัปโหลดสำเร็จ',
      text: 'อัปโหลดไฟล์เรียบร้อยแล้ว',
      confirmButtonText: 'ตกลง'
    });
  }

  // Upload Single File (Mock Implementation)
  private uploadSingleFile(file: File): Promise<void> {
    return new Promise((resolve) => {
      const uploadedFile: UploadedFile = {
        id: this.generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        uploadedBy: 'ผู้ดูแลระบบ', // จะได้จาก session
        status: 'uploading',
        progress: 0
      };

      this.uploadedFiles.unshift(uploadedFile);

      // Simulate upload progress
      const interval = setInterval(() => {
        uploadedFile.progress += Math.random() * 30;
        
        if (uploadedFile.progress >= 100) {
          uploadedFile.progress = 100;
          uploadedFile.status = 'completed';
          uploadedFile.url = `/uploads/documents/${uploadedFile.id}_${file.name}`;
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  }

  // Remove Selected File
  removeSelectedFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  // Delete Uploaded File
  deleteUploadedFile(fileId: string) {
    Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการลบ',
      text: 'คุณต้องการลบไฟล์นี้ใช่หรือไม่?',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (result.isConfirmed) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== fileId);
        Swal.fire({
          icon: 'success',
          title: 'ลบสำเร็จ',
          text: 'ลบไฟล์เรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง'
        });
      }
    });
  }

  // Download File
  downloadFile(file: UploadedFile) {
    if (file.url) {
      // Mock download - ในระบบจริงจะเรียก API
      console.log('📥 Downloading file:', file.url);
      Swal.fire({
        icon: 'info',
        title: 'กำลังดาวน์โหลด',
        text: `กำลังดาวน์โหลดไฟล์ "${file.name}"`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  // Load Uploaded Files (Mock Data)
  private loadUploadedFiles() {
    // Mock data - ในระบบจริงจะเรียก API
    this.uploadedFiles = [
      {
        id: '1',
        name: 'คู่มือการใช้งาน.pdf',
        size: 2048576,
        type: 'application/pdf',
        uploadDate: new Date(2024, 11, 20),
        uploadedBy: 'ผู้ดูแลระบบ',
        status: 'completed',
        progress: 100,
        url: '/uploads/documents/1_คู่มือการใช้งาน.pdf'
      },
      {
        id: '2',
        name: 'แบบฟอร์มคำขอ.docx',
        size: 1024000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadDate: new Date(2024, 11, 19),
        uploadedBy: 'ผู้ดูแลระบบ',
        status: 'completed',
        progress: 100,
        url: '/uploads/documents/2_แบบฟอร์มคำขอ.docx'
      }
    ];
  }

  // Utility Methods
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

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}