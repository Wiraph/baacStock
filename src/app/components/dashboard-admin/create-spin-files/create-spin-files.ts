import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Spin } from '../../../services/spin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import {MatTooltipModule} from '@angular/material/tooltip';

interface FileData {
  fileName: string;
  time: string;
  name: string;
}

@Component({
  selector: 'app-create-spin-files',
  imports: [CommonModule, FormsModule, MatTooltipModule],
  templateUrl: './create-spin-files.html',
  styleUrl: './create-spin-files.css'
})
/**
 * สร้าง/แสดง/ดาวน์โหลดไฟล์ SPIN
 * - โหลดรายการไฟล์จาก backend
 * - สร้างไฟล์ใหม่ และรีเฟรชรายการ
 * - ดาวน์โหลดไฟล์ที่เลือก
 */
export class CreateSpinFilesComponent implements OnInit {
  files: FileData[] = [];
  loading: boolean = false;
  constructor(
    private readonly spinService: Spin,
    private readonly cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadSpinfile();
  }

  /** โหลดรายการไฟล์ SPIN */
  loadSpinfile() {
    const payload = { Action: 'dat' };
    this.loading = true;
    this.spinService.getSpinFiles(payload).subscribe({
      next: (data: any) => {
        const fileList: string[] = data?.files || [];
        this.files = fileList.map(file => {
          const [datePart, nameWithExt] = file.split('_');
          const name = (nameWithExt || '').split('.')[0];
          const time = datePart || '';
          return { fileName: file, name, time };
        });
      }, error: () => {
        Swal.fire({ icon: 'error', title: 'โหลดรายการไฟล์ไม่สำเร็จ', text: 'โปรดลองใหม่' });
      }, complete: () => {
        this.loading = false;
        this.cd.detectChanges();
      }
    })
  }

  /** สร้างไฟล์ SPIN ใหม่ แล้วรีเฟรชรายการ */
  createSpinFile() {
    this.loading = true;
    this.cd.detectChanges();
    this.spinService.createSpinFile().subscribe({
      next: (res: any) => {
        Swal.fire({ icon: 'success', title: `${res.message}`, showConfirmButton: false, timer: 1500 });
        this.loadSpinfile();
      }, error: () => {
        Swal.fire({ icon: 'error', title: 'สร้างไฟล์ไม่สำเร็จ', text: 'โปรดลองใหม่' });
      }, complete: () => {
        this.loading = false;
        this.cd.detectChanges();
      }
    })
  }

  /** ดาวน์โหลดไฟล์ SPIN ตามชื่อ */
  download(fileName: string) {
    const payload = { FileName: fileName };
    this.spinService.downloadSpinFile(payload).subscribe({
      next: (blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      }, error: () => {
        Swal.fire({ icon: 'error', title: 'ดาวน์โหลดไฟล์ไม่สำเร็จ', text: 'โปรดลองใหม่' });
      }
    });
  }
}
