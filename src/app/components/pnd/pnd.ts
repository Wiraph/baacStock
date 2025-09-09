import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pnd } from '../../services/pnd';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pnd',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './pnd.html',
  styleUrls: ['./pnd.css']
})
export class PndComponent implements OnInit {
  @Input() pndType: string = '';
  @Input() title: string = '';
  @Input() mode: string = '';
  @Output() back = new EventEmitter<string>();
  pndData: any[] = [];
  isLoading = false;
  isGenerating = false;
  currentGenerating = '';

  constructor(
    private readonly pndService: Pnd,
    private readonly cd: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) { }

  sendBack() {
    this.back.emit('Hello Parent!');
  }

  ngOnInit(): void {
    this.loadPNDData(this.pndType);
  }

  /**
   * โหลดข้อมูล PND จาก API
   */
  async loadPNDData(pndType: string) {
    if (this.mode == '') return;
    const payload = {
      ACT: "datLiST",
      PNDtype: pndType,
      dateSTA: '',
      getPNDformat: '',
      dateSPL: '',
      MODE: this.mode
    };

    this.ngZone.run(() => {
      this.isLoading = true;
      this.pndData = [];
    });

    try {
      const res: any = await firstValueFrom(this.pndService.getPndDividendList(payload));
      await this.handlePndData(res); // await handlePndData เพื่อให้ Angular detect
    } catch (err) {
      console.error(err);
    } finally {
      this.ngZone.run(() => {
        this.isLoading = false;
      });
    }
  }


  /**
   * ฟังก์ชัน async แยกออกมาเพื่อใช้ await
   */
  private async handlePndData(res: any) {
    this.pndData = res;
    console.log("pndData", this.pndData);
    const allFiles: string[] = [];
    this.pndData.forEach(item => {
      const pattern = item.txtFiLE.replace('.txt', ''); // เอา pattern จากชื่อ PND2 เดิม
      ['EFL', 'SWC', 'SWCe', 'XLS'].forEach(type => {
        let ext = (type === 'XLS') ? '.xlsx' : '.txt';
        allFiles.push(`${pattern}_${type}${ext}`);
      });
    });

    console.log("All File", allFiles);

    try {
      const checkRes: any[] = await firstValueFrom(this.pndService.checkFiles(allFiles));

      this.pndData.forEach(item => {
        const pattern = item.txtFiLE.replace('.txt', '');
        const files = [
          { name: `${pattern}_EFL.txt`, type: 'EFL', path: `${pattern}_EFL.txt`, available: checkRes.find(f => f.path === `${pattern}_EFL.txt`)?.available || false },
          { name: `${pattern}_SWC.txt`, type: 'SWC', path: `${pattern}_SWC.txt`, available: checkRes.find(f => f.path === `${pattern}_SWC.txt`)?.available || false },
          { name: `${pattern}_SWCe.txt`, type: 'SWCe', path: `${pattern}_SWCe.txt`, available: checkRes.find(f => f.path === `${pattern}_SWCe.txt`)?.available || false },
          { name: `${pattern}_XLS.xlsx`, type: 'XLS', path: `${pattern}_XLS.xlsx`, available: checkRes.find(f => f.path === `${pattern}_XLS.xlsx`)?.available || false }
        ];

        // กรองเฉพาะไฟล์ที่ available === true
        item.files = files.filter(f => f.available);
      });

    } catch (err) {
      console.error('Error checking files:', err);
    }

    this.isLoading = false;
    this.cd.detectChanges();
  }

  /**
   * ฟังก์ชันเรียก เดือนแบบย่อ
   */
  getShortMonthName(monthNumber: number): string {
    const month = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    if (monthNumber < 1) {
      return month[11];
    }
    if (monthNumber > 12) {
      return '';
    }
    return month[monthNumber - 1];
  }

  toNumber(val: string): number {
    return Number(val);
  }

  /**-
   * ดาวน์โหลดไฟล์
   */
  downloadFile(file: any): void {
    let dir = 'PND';
    const payload = {
      FileName: file.name,
      FilePath: dir
    };

    this.pndService.download(payload).subscribe({
      next: (blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = file.name;
        link.click();
      },
      error: (error) => {
        console.error('Download failed:', error);
      }
    });
  }

  /**
   * สร้างไฟล์ PND
   */
  generateFiles(item: any): void {
    this.isLoading = true;
    this.cd.detectChanges();
    const fileName = item.txtFiLE;
    const payload = {
      Action: "getDATA",
      PndType: this.pndType,
      YearMonth: `${item.ym}`,
      FileName: fileName,
      TaxForm: this.title
    }

    this.pndService.generateReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.cd.detectChanges();
        if (res.filesFound == 0) {
          Swal.fire({
            text: `${res.message}`,
            icon: 'warning',
            showConfirmButton: true,
            confirmButtonColor: '#3085d6',
          });
        } else {
          Swal.fire({
            text: `${res.message}`,
            icon: 'success',
            confirmButtonColor: '#3085d6',
          }).then((result) => {
            if (result.isConfirmed) {
              this.ngZone.run(() => {
                this.loadPNDData(this.pndType);
              })
            }
          })
        }
      }, error: (err) => {
        console.log("Error", err);
      }
    })
  }

  /** 
   * สร้างและดาวน์โหลดไฟล์ Excel
   */
  DowloadEcel(yyyymm: string, fileName: string, typefile: string) {
    if (typefile == "XLSX") {
      fileName = fileName.replace("txt", "xlsx");
    } 
    const payload = { Yyyymm: yyyymm, PndType: this.pndType, FileName: fileName, TypeFile: typefile };
    console.log("Payload", payload);

    this.pndService.downloadExcel(payload).subscribe({
      next: (blob) => {
        // ✅ Success → save file
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `PND_${this.pndType}_${yyyymm}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err:any) => {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err.response?.data?.message || 'ไม่พบข้อมูลตามที่ระบุ'
        });
      }

    });
  }
}
