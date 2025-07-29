import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Spin } from '../../../services/spin';
import { CommonModule, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-spin-files',
  imports: [JsonPipe, CommonModule],
  templateUrl: './spin-files.html',
  styleUrl: './spin-files.css'
})
export class SpinFilesComponent implements OnInit {
  selectedFiles: File[] = [];
  files: string[] = [];
  uploadResult: any;
  isLoading = false;
  errorMessage = '';

  constructor(
    private spinService: Spin,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.spinService.getSpinFilesOut().subscribe(data => {
      this.files = data;
      this.cd.markForCheck();
    }, error => {
      console.error('Error fetching spin files:', error);
    });
  }
  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  uploadSpinFile(): void {
    if (this.selectedFiles.length === 0) {
      this.errorMessage = 'กรุณาเลือกไฟล์ก่อนอัปโหลด';
      return;
    }

    this.isLoading = true;
    this.spinService.uploadFiles(this.selectedFiles).subscribe({
      next: (response) => {
        this.uploadResult = response;
        this.isLoading = false;
        this.cd.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'เกิดข้อผิดพลาดในการอัปโหลด';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  download(fileName: string) {
    this.spinService.downloadSpinFileOut(fileName).subscribe(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    });
  }
}
