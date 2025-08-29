import { ChangeDetectorRef, Component, OnInit, NgZone } from '@angular/core';
import { Sap } from '../../../services/sap';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

interface TextFile {
  fileName: string[];
  fileSize: number[];
}


@Component({
  selector: 'app-sap-interface',
  imports: [CommonModule],
  templateUrl: './sap-interface.html',
  styleUrl: './sap-interface.css'
})
export class SapInterface implements OnInit {
  isLoading: boolean = false;
  textfile: TextFile[] = [];
  constructor(
    private readonly sapService: Sap,
    private readonly cd: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.loadTextFile();
  }

  loadTextFile(): void {
    this.isLoading = true;
    this.sapService.getlist().subscribe({
      next: (res: any[]) => {
        // map เพื่อเอา .txt ออก และรวม fileName/fileSize เป็น object
        this.textfile = res.map(f => ({
          fileName: f.fileName.replace(/\.txt$/i, ''),
          fileSize: f.fileSize
        }));

        console.log("Textfile", this.textfile);
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.log("Load Error", err);
        this.isLoading = false;
      }
    });
  }

  createTextFile(): void {
    this.isLoading = true;
    this.sapService.generate().subscribe({
      next: () => {
        this.isLoading = false;
        this.cd.detectChanges();
        Swal.fire({
          icon: 'success',
          text: 'สร้างไฟล์สำเร็จ'
        }).then((result) => {
          if (result.isConfirmed) {
            this.ngZone.run(() => {
              this.loadTextFile();
            })
          }
        })
      }, error: (err) => {
        console.log("Generate Error", err);
      }
    })
  }

  dowloadTextFile(fileName: string): void {
    this.isLoading = true;
    const fileNameTxt = `${fileName}.txt`;
    console.log("Filename:", fileNameTxt);
    const payload = {
      fileName: fileNameTxt
    };
    this.sapService.download(payload).subscribe({
      next: (blob: Blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName; // ตั้งชื่อไฟล์
        link.click();
        // ล้าง URL object หลังใช้
        window.URL.revokeObjectURL(link.href);
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.log("Download Error", err);
        this.cd.detectChanges();
      }
    })
  }

  downloadStockMovement(fileName: string) {
    this.isLoading = true;
    this.cd.detectChanges();
    const file = fileName
    // 1. ดึงเลข 25680828 ออกมา
    const regex = /(\d{8})$/;
    const match = regex.exec(file);
    let datePart = match ? match[1] : "";
    // 2. แปลงเป็น number และทำจาก พ.ศ. -> ค.ศ.
    let num = Number(datePart);
    let converted = num - 5430000;
    // 3. แปลงกลับเป็น string
    let result = converted.toString();
    const payload = {
      dateArg: result
    }

    this.sapService.downloadExcel(payload).subscribe({
      next: (res) => {
        const link = document.createElement('a');
        link.href = res.url;
        link.download = res.file;
        link.click();
        this.isLoading = false;
        this.cd.detectChanges();
      }, error: (err) => {
        this.isLoading = false;
        console.error("Download Error", err);
        // debug ถ้า server ส่งข้อความ error เป็น Blob
        if (err.error instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => console.log("Server says:", reader.result);
          reader.readAsText(err.error);
        }
        this.cd.detectChanges();
      }
    })
  }
}
