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
import { DocumentKeyDetectComponent } from './document-key-detect';

@Component({
  standalone: true,
  selector: 'app-print-share-purchase-request',
  imports: [CommonModule, DocumentKeyDetectComponent],
  templateUrl: './print-share-purchase-request.html',
  styleUrls: ['./print-share-purchase-request.css']
})
export class PrintSharePurchaseRequestComponent implements AfterViewInit {
  // PDF display
  pdfUrl: SafeResourceUrl | null = null;
  loading = false;
  loadFailed = false;

  // Timeout
  timeoutHandle: any;

  constructor(
    private readonly pdfService: PdfService,
    private readonly sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly cdr: ChangeDetectorRef
  ) {
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
}
