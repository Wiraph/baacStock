import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environments';

interface PNDFile {
  name: string;
  type: 'EFL' | 'SWC' | 'XLS';
  path: string;
  available: boolean;
  size?: string;
}

interface PNDData {
  yearMonth: string;
  displayText: string;
  files: PNDFile[];
  hasData: boolean;
}

@Component({
  selector: 'app-pnd2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pnd2.component.html',
  styleUrls: ['./pnd2.component.css']
})
export class Pnd2Component implements OnInit {
  pndData: PNDData[] = [];
  isLoading = false;
  isGenerating = false;
  currentGenerating = '';

  constructor(private http: HttpClient) {
    console.log('PND2 Component constructor called');
  }

  ngOnInit(): void {
    console.log('PND2 ngOnInit called');
    this.loadPNDData();
  }

  /**
   * โหลดข้อมูล PND2 จาก API
   */
  loadPNDData(): void {
    // TODO: เรียก API จริง
    // this.isLoading = true;
    // this.http.get(`${environment.apiUrl}/pnd/pnd2/list`).subscribe({
    //   next: (response: any) => {
    //     this.pndData = this.mapApiResponse(response);
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading PND2 data:', error);
    //     this.isLoading = false;
    //   }
    // });

    // Mock data สำหรับ demo - โหลดทันที
    this.pndData = this.getMockData();
    this.isLoading = false;
    console.log('PND2 Data loaded:', this.pndData);
  }

  /**
   * สร้างไฟล์ PND2 สำหรับเดือนที่เลือก
   */
  generateFiles(yearMonth: string): void {
    this.isGenerating = true;
    this.currentGenerating = yearMonth;

    // TODO: เรียก API จริง
    // const payload = {
    //   pndType: 'PND2',
    //   yearMonth: yearMonth,
    //   format: 'ALL'
    // };

    // this.http.post(`${environment.apiUrl}/pnd/generate`, payload).subscribe({
    //   next: (response: any) => {
    //     console.log('Files generated successfully:', response);
    //     this.loadPNDData(); // รีโหลดข้อมูลเพื่อแสดงไฟล์ใหม่
    //     this.isGenerating = false;
    //     this.currentGenerating = '';
    //   },
    //   error: (error) => {
    //     console.error('Error generating files:', error);
    //     this.isGenerating = false;
    //     this.currentGenerating = '';
    //   }
    // });

    // Mock การสร้างไฟล์
    setTimeout(() => {
      const item = this.pndData.find(d => d.yearMonth === yearMonth);
      if (item) {
        item.files = this.generateMockFiles(yearMonth);
      }
      this.isGenerating = false;
      this.currentGenerating = '';
    }, 2000);
  }

  /**
   * ดาวน์โหลดไฟล์
   */
  downloadFile(file: PNDFile): void {
    if (!file.available) {
      return;
    }

    // TODO: เรียก API จริงสำหรับดาวน์โหลด
    // this.http.get(`${environment.apiUrl}/pnd/download/${file.path}`, { responseType: 'blob' })
    //   .subscribe({
    //     next: (blob) => {
    //       const url = window.URL.createObjectURL(blob);
    //       const link = document.createElement('a');
    //       link.href = url;
    //       link.download = file.name;
    //       link.click();
    //       window.URL.revokeObjectURL(url);
    //     },
    //     error: (error) => {
    //       console.error('Error downloading file:', error);
    //     }
    //   });

    // Mock การดาวน์โหลด
    console.log('Downloading file:', file.name);
    alert(`กำลังดาวน์โหลดไฟล์: ${file.name}`);
  }

  /**
   * สร้าง Mock data สำหรับ demo
   */
  private getMockData(): PNDData[] {
    const data: PNDData[] = [];
    
    // ข้อมูล Mock ตามรูปแบบจริง
    const mockPeriods = [
      { year: 2567, month: 7, hasFiles: true },   // กรกฎาคม 2567
      { year: 2567, month: 6, hasFiles: true },   // มิถุนายน 2567  
      { year: 2566, month: 11, hasFiles: true },  // พฤศจิกายน 2566
      { year: 2566, month: 7, hasFiles: true },   // กรกฎาคม 2566
      { year: 2565, month: 7, hasFiles: true },   // กรกฎาคม 2565
      { year: 2568, month: 6, hasFiles: false },  // มิถุนายน 2568 (ยังไม่มีไฟล์)
    ];
    
    const monthNames = [
      '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    mockPeriods.forEach(period => {
      const englishYear = period.year - 543;
      const yearMonth = `${englishYear}${period.month.toString().padStart(2, '0')}`;
      const displayText = `${period.year}${period.month.toString().padStart(2, '0')} - สร้างไฟล์ทั้งหมด ${monthNames[period.month].substring(0, 3)}.`;
      
      // สร้างไฟล์ mock
      const files: PNDFile[] = [];
      if (period.hasFiles) {
        files.push(...this.generateMockFiles(yearMonth));
      }
      
      data.push({
        yearMonth: displayText,
        displayText,
        files,
        hasData: files.length > 0
      });
    });
    
    return data;
  }

  /**
   * สร้างไฟล์ mock สำหรับเดือนที่กำหนด
   */
  private generateMockFiles(yearMonth: string): PNDFile[] {
    // แปลง yearMonth เป็นรูปแบบ YYYY_MM_DD_DD สำหรับชื่อไฟล์
    const year = yearMonth.substring(0, 4);
    const month = yearMonth.substring(4, 6);
    const formattedDate = `${year}_${month}_01_01`;
    
    const baseFileName = `PND2_0994000164912_000000_${formattedDate}`;
    
    return [
      {
        name: `${baseFileName}_EFL.txt`,
        type: 'EFL',
        path: `pnd2/${baseFileName}_EFL.txt`,
        available: true,
        size: '15 KB'
      },
      {
        name: `${baseFileName}_SWC.txt`, 
        type: 'SWC',
        path: `pnd2/${baseFileName}_SWC.txt`,
        available: true,
        size: '18 KB'
      },
      {
        name: `${baseFileName}_XLS.xlsx`,
        type: 'XLS',
        path: `pnd2/${baseFileName}_XLS.xlsx`,
        available: true,
        size: '25 KB'
      }
    ];
  }

  /**
   * แปลงข้อมูลจาก API response
   */
  private mapApiResponse(response: any): PNDData[] {
    // TODO: แปลงข้อมูลจาก API จริง
    return [];
  }
}