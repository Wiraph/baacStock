import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Spin } from '../../../services/spin';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';

interface FileData {
  fileName: string;
  time: string;
  name: string;
}

@Component({
  selector: 'app-spin-files',
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './spin-files.html',
  styleUrl: './spin-files.css'
})
export class SpinFilesComponent implements OnInit {
  selectedFiles: File[] = [];
  files: FileData[] = [];
  uploadResult: any;
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly spinService: Spin,
    private readonly cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.files = [];
    this.cd.detectChanges();
    this.loadSpinfile();
  }
  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  loadSpinfile() {
    const payload = {
      Action: "out"
    };
    this.spinService.getSpinFiles(payload).subscribe({
      next: (data: any) => {
        const fileList: string[] = data?.files || [];

        this.files = fileList.map(file => {
          let datePart = '';
          let name = '';
          if (file.includes('_')) {
            const [rawDate, nameWithExt] = file.split('_');
            datePart = rawDate;
            name = nameWithExt?.split('.')[0] || '';
          } else {
            // ถ้าไม่มี '_' ให้ใช้ชื่อไฟล์เต็ม และวันที่จากเวลาปัจจุบัน
            datePart = this.getCurrentDateInThai();
            name = file.split('.')[0];
          }
          return {
            fileName: file,
            name: name,
            time: datePart
          };
        });
        console.log(this.files);
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Error", err);
      }
    });
  }

  async uploadSpinFile() {
    if (this.selectedFiles.length === 0) {
      Swal.fire({
        icon: 'error',
        text: "กรุณาเลือกไฟล์ SPiN ที่ต้องการ UPLOAD ผลการโอน",
        showConfirmButton: true
      })
      return;
    }

    let UPFLG0 = true;
    let MSGa = 'ชื่อไฟล์ไม่ถูกต้อง: ';

    if (this.selectedFiles) {
      UPFLG0 = /DIV110\d{8}\.out$/i.test(this.selectedFiles[0].name);
      if (!UPFLG0) {
        Swal.fire({
          icon: 'error',
          html: `<pre>${MSGa}</pre>
                <p>\n\n\t> "DIV110yyyymmdd.out" : เงินปันผลหุ้น\n\t</p>
                <p>\n\n\t> "${this.selectedFiles[0].name}"\t\t</p>
          `,
          showConfirmButton: true
        })
      } else {
        try {
          for (const file of this.selectedFiles) {
            const fileContentBase64 = await this.readFileAsBase64(file);
            const payload = {
              FileName: file.name,
              FileContentBase64: fileContentBase64
            }

            this.spinService.uploadFiles(payload).subscribe({
              next: (res: any) => {
                if (res.success === true) {
                  Swal.fire({
                    icon: 'success',
                    text: "อัปโหลดไฟล์สำเร็จ",
                    showConfirmButton: true
                  }).then((result) => {
                    if (result.isConfirmed) {
                      // Handle confirmed action
                      window.location.reload();
                    }
                  });
                } else {
                  Swal.fire({
                    icon: 'error',
                    text: "อัปโหลดไฟล์ไม่สำเร็จ",
                    showConfirmButton: true
                  }).then((result) => {
                    if (result.isConfirmed) {
                      // Handle confirmed action
                      window.location.reload();
                    }
                  })
                }
              }, error: (err) => {
                console.log("Error", err);
              }
            })
          }
        } catch (err) {
          console.error(err);
          alert('เกิดข้อผิดพลาดในการอัปโหลด');
        }
      }
    }
  }

  download(fileName: string) {
    const payload = {
      FileName: fileName
    }
    this.spinService.downloadSpinFile(payload).subscribe(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    });
  }

  getCurrentDateInThai(): string {
    const now = new Date();
    const yearTH = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${yearTH}${month}${day}${hours}${minutes}${seconds}`;
  }

  readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          resolve(btoa(binary));
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      };
      reader.onerror = (event) => reject(new Error('File reading error'));
      reader.readAsArrayBuffer(file);
    });
  }
}
