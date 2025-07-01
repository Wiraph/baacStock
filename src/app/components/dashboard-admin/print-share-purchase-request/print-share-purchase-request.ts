import {
  Component,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PdfService } from '../../../services/pdf';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-print-share-purchase-request',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './print-share-purchase-request.html',
  styleUrls: ['./print-share-purchase-request.css']
})
export class PrintSharePurchaseRequestComponent implements AfterViewInit {
  // PDF display
  pdfUrl: SafeResourceUrl | null = null;
  loading = false;
  loadFailed = false;

  // Upload form
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  fileName: string = '';

  // Timeout
  timeoutHandle: any;

  constructor(
    private pdfService: PdfService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.uploadForm = this.fb.group({
      name: [''],
      idNumber: ['']
    });

  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadPdf();
      }, 1000);
    }
  }

  public loadPdf(): void {
    console.log('🔁 loadPdf called');
    this.loading = true;
    this.loadFailed = false;
    this.pdfUrl = null;

    let second = 0;
    const interval = setInterval(() => {
      second++;
      console.log(`⏳ ผ่านไป ${second} วินาที`);
      if (second >= 30) clearInterval(interval);
    }, 1000);

    this.timeoutHandle = setTimeout(() => {
      console.log('❌ Timeout reached');
      this.loading = false;
      this.loadFailed = true;
      clearInterval(interval);
    }, 30000);

    const payload = {
      docNumber: '123456',
      brName: sessionStorage.getItem('brName') || '',
      printedBy: sessionStorage.getItem('username') || ''
    };

    this.pdfService.getShareRequestPdf(payload).subscribe({
      next: (blob) => {
        console.log('✅ PDF loaded');
        clearTimeout(this.timeoutHandle);
        clearInterval(interval);

        const blobUrl = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        this.loading = false;
        this.loadFailed = false;
        this.cdr.detectChanges();
      },
      error: () => {
        console.log('🚫 Error loading PDF');
        clearTimeout(this.timeoutHandle);
        clearInterval(interval);
        this.loading = false;
        this.loadFailed = true;
      }
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
    this.fileName = this.selectedFile?.name || '';
  }



  onUpload() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('name', this.uploadForm.value.name);
    formData.append('id_number', this.uploadForm.value.idNumber);

    console.log('📤 ส่งข้อมูลไปยัง API...');
    console.log('📎 ไฟล์:', this.selectedFile.name);
    console.log('👤 ชื่อ:', this.uploadForm.value.name);
    console.log('🆔 เลขบัตร:', this.uploadForm.value.idNumber);


    this.http.post('http://localhost:8000/fill-docx/', formData, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'ใบคำขอซื้อหุ้น.docx';
        link.click();
      },
      error: () => {
        alert('❌ อัปโหลดล้มเหลว');
      }
    });
  }
}
