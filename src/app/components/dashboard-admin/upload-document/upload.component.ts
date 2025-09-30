import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { FileService } from '../../../services/file';
import { HttpEventType } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

/** ข้อมูลไฟล์ที่แสดงบน UI ระหว่างอัปโหลด/หลังอัปโหลด */
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
/** อัปโหลด/ลบ/ดาวน์โหลดเอกสาร พร้อมตรวจสอบประเภทและขนาดไฟล์ */
export class UploadComponent implements OnInit {

  isDragOver = false;
  selectedFiles: File[] = [];
  uploadedFiles: any[] = [];
  isUploading = false;
  isLoading = false;

  // จำกัดขนาดไฟล์ไม่เกิน 10MB
  maxFileSize = 10 * 1024 * 1024; // 10MB
  // อนุญาตเฉพาะเอกสารเท่านั้น (ไม่รวมรูปภาพ)
  allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly fileService: FileService
  ) { }

  /** โหลดรายการไฟล์เมื่อเข้าหน้า */
  ngOnInit(): void {
    this.loadUploadedFiles();
  }

  /** drag over */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  /** drag leave */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  /** drop files */
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files) this.handleFiles(Array.from(files));
  }

  /** เลือกไฟล์จาก input */
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) this.handleFiles(Array.from(files));
  }

  /** คัดกรองไฟล์ที่ผ่านการตรวจสอบ */
  handleFiles(files: File[]) {
    const validFiles = files.filter(file => this.validateFile(file));
    if (validFiles.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
    }
  }

  /** ตรวจสอบประเภทไฟล์และขนาดไฟล์ */
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

  /** อัปโหลดไฟล์ทั้งหมดแบบต่อเนื่อง แสดงความคืบหน้าเป็นรายไฟล์ */
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
          error: () => {
            entry.status = 'error';
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

  /** เอาไฟล์ออกจากรายการที่เลือกก่อนอัปโหลด */
  removeSelectedFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  /** ลบไฟล์ที่อัปโหลดแล้ว พร้อมยืนยัน */
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
        this.isLoading = true;
        this.cd.markForCheck();
        this.fileService.delete(file)
          .pipe(finalize(() => {
            this.isLoading = false;
            this.cd.markForCheck();
          }))
          .subscribe({
            next: () => {
              Swal.fire('สำเร็จ', `ลบไฟล์ ${file} เรียบร้อยแล้ว`, 'success');
              this.loadUploadedFiles();
            },
            error: () => {
              Swal.fire('ผิดพลาด', `ไม่สามารถลบไฟล์ ${file} ได้`, 'error');
            }
          });
      }
    });
  }

  /** ดาวน์โหลดไฟล์จากเซิร์ฟเวอร์ */
  downloadFile(fileName: string) {
    if (!fileName) {
      Swal.fire('ไม่มีชื่อไฟล์', 'กรุณาเลือกไฟล์ที่ต้องการดาวน์โหลด', 'warning');
      return;
    }

    this.isLoading = true;
    this.cd.markForCheck();
    
    this.fileService.downloadFile(fileName)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cd.markForCheck();
      }))
      .subscribe({
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
        error: () => {
          Swal.fire('ผิดพลาด', 'ไม่สามารถดาวน์โหลดไฟล์ได้', 'error');
        }
      })
  }

  /** โหลดรายการไฟล์จากระบบ */
  loadUploadedFiles() {
    this.isLoading = true;
    this.cd.markForCheck();
    this.fileService.getFiles()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cd.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          this.uploadedFiles = Array.isArray(data) ? data : [];
          this.cd.markForCheck();
        },
        error: () => {
          this.uploadedFiles = [];
          Swal.fire('ผิดพลาด', 'ไม่สามารถโหลดรายการไฟล์ได้', 'error');
        }
      });
  }

  /** แปลงขนาดไฟล์เป็นข้อความอ่านง่าย */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /** คืนค่าไอคอนตามประเภทไฟล์ */
  getFileIcon(type: string): string {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('image')) return '🖼️';
    if (type.includes('text')) return '📃';
    return '📁';
  }
}
