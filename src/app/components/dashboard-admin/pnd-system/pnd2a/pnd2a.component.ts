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
  taxYear: string;
  displayText: string;
  files: PNDFile[];
  hasData: boolean;
}

@Component({
  selector: 'app-pnd2a',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pnd2a.component.html',
  styleUrls: ['./pnd2a.component.css']
})
export class Pnd2aComponent implements OnInit {
  pndData: PNDData[] = [];
  isLoading = false;
  isGenerating = false;
  currentGenerating = '';

  constructor(private http: HttpClient) {
    console.log('PND2A Component constructor called');
  }

  ngOnInit(): void {
    console.log('PND2A ngOnInit called');
    this.loadPNDData();
  }

  /**
   * โหลดข้อมูล PND2A จาก API
   */
  loadPNDData(): void {
    // TODO: เรียก API จริง
    // this.isLoading = true;
    // this.http.get(`${environment.apiUrl}/pnd/pnd2a/list`).subscribe({
    //   next: (response: any) => {
    //     this.pndData = this.mapApiResponse(response);
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading PND2A data:', error);
    //     this.isLoading = false;
    //   }
    // });

    // Mock data สำหรับ demo - โหลดทันที
    this.pndData = this.getMockData();
    this.isLoading = false;
    console.log('PND2A Data loaded:', this.pndData);
  }

  /**
   * สร้างไฟล์ PND2A สำหรับปีที่เลือก
   */
  generateFiles(taxYear: string): void {
    this.isGenerating = true;
    this.currentGenerating = taxYear;

    // TODO: เรียก API จริง
    // const payload = {
    //   pndType: 'PND2A',
    //   taxYear: taxYear,
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
      const item = this.pndData.find(d => d.taxYear === taxYear);
      if (item) {
        item.files = this.generateMockFiles(taxYear);
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
    
    // ข้อมูล Mock ตามรูปแบบจริง (ปีภาษี)
    const mockYears = [
      { thaiYear: 2567, hasFiles: true },   // ปีภาษี 2567
      { thaiYear: 2566, hasFiles: true },   // ปีภาษี 2566
      { thaiYear: 2565, hasFiles: true },   // ปีภาษี 2565
      { thaiYear: 2568, hasFiles: false },  // ปีภาษี 2568 (ยังไม่มีไฟล์)
    ];
    
    mockYears.forEach(yearData => {
      const englishYear = yearData.thaiYear - 543;
      const taxYear = englishYear.toString();
      const displayText = `${yearData.thaiYear} - สร้างไฟล์ทั้งหมด ก.ค.`;
      
      // สร้างไฟล์ mock
      const files: PNDFile[] = [];
      if (yearData.hasFiles) {
        files.push(...this.generateMockFiles(taxYear));
      }
      
      data.push({
        taxYear: displayText,
        displayText,
        files,
        hasData: files.length > 0
      });
    });
    
    return data;
  }

  /**
   * สร้างไฟล์ mock สำหรับปีที่กำหนด
   */
  private generateMockFiles(taxYear: string): PNDFile[] {
    const baseFileName = `PND2A_0994000164912_000000_${taxYear}_00_01_01`;
    
    return [
      {
        name: `${baseFileName}_EFL.txt`,
        type: 'EFL',
        path: `pnd2a/${baseFileName}_EFL.txt`,
        available: true,
        size: '45 KB'
      },
      {
        name: `${baseFileName}_SWC.txt`,
        type: 'SWC',
        path: `pnd2a/${baseFileName}_SWC.txt`,
        available: true,
        size: '52 KB'
      },
      {
        name: `${baseFileName}_XLS.xlsx`,
        type: 'XLS',
        path: `pnd2a/${baseFileName}_XLS.xlsx`,
        available: true,
        size: '78 KB'
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