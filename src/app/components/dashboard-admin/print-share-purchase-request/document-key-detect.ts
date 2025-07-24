import { Component, ChangeDetectorRef, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentApiService, UploadTemplateResponse, GenerateDocResponse } from './document-api.service';
import { getLabelForKey } from './document-key-label';

@Component({
  selector: 'app-document-key-detect',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    
    <!-- 📋 ส่วนอัปโหลดฟอร์มเอกสาร - แบบเดิม -->
    <div class="w-full max-w-4xl mx-auto space-y-6 mt-8">
      <div class="bg-white shadow-md rounded-lg border border-gray-200">
        <div class="bg-blue-500 text-white text-center text-xl font-bold py-3 rounded-t-lg">
          📋 อัปโหลดฟอร์มเอกสาร
        </div>
        
        <!-- Progress Steps -->
        <div class="flex items-center justify-center p-6 bg-gray-50">
          <div class="flex items-center">
            <div [ngClass]="currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'" 
                 class="rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg transition-all duration-500">1</div>
            <span [ngClass]="currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'" 
                  class="mx-2 font-medium transition-all duration-500">อัปโหลดเอกสาร</span>
          </div>
          <div [ngClass]="currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-200'" 
               class="w-8 h-1 mx-2 transition-all duration-500"></div>
          <div class="flex items-center">
            <div [ngClass]="currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'" 
                 class="rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg transition-all duration-500">2</div>
            <span [ngClass]="currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'" 
                  class="mx-2 font-medium transition-all duration-500">กรอกข้อมูล</span>
          </div>
          <div [ngClass]="currentStep === 3 ? 'bg-blue-500' : 'bg-gray-200'" 
               class="w-8 h-1 mx-2 transition-all duration-500"></div>
          <div class="flex items-center">
            <div [ngClass]="currentStep === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'" 
                 class="rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg transition-all duration-500">3</div>
            <span [ngClass]="currentStep === 3 ? 'text-blue-600' : 'text-gray-500'" 
                  class="mx-2 font-medium transition-all duration-500">ดาวน์โหลด</span>
          </div>
        </div>

        <!-- Upload Form -->
        <div class="p-6 bg-gray-50 rounded-b-lg">
          <h2 class="text-xl font-bold mb-4 text-center text-gray-800">อัปโหลดฟอร์มเอกสาร (.docx)</h2>
          
          <div class="max-w-md mx-auto">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
                 (click)="fileInput.click()"
                 (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event)">
              <div class="text-gray-500 mb-4">
                <svg class="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="10,9 9,9 8,9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p class="text-sm text-gray-600 mb-2">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
              <p class="text-xs text-gray-500">รองรับไฟล์ .docx เท่านั้น</p>
              <input #fileInput type="file" accept=".docx" class="hidden" (change)="onFileSelected($event)">
              <button type="button" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors">
                เลือกไฟล์
              </button>
            </div>
            
            <!-- File Info (จะแสดงเมื่อเลือกไฟล์แล้ว) -->
            <div *ngIf="selectedFile" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-green-700">ไฟล์ที่เลือก: {{ selectedFile.name }}</span>
              </div>
            </div>
            
            <!-- Upload Button -->
            <button type="button" 
                    (click)="onUpload()"
                    [disabled]="!selectedFile || isUploading"
                    class="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="!isUploading">📤 อัปโหลดเอกสาร</span>
              <span *ngIf="isUploading">⏳ กำลังอัปโหลด...</span>
            </button>
            
            <!-- Status Messages -->
            <div class="mt-4 text-center">
              <div *ngIf="uploadError" class="text-red-500 text-sm">❌ {{ uploadError }}</div>
              <div *ngIf="uploadSuccess" class="text-green-500 text-sm">✅ อัปโหลดสำเร็จ!</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 📝 ส่วนกรอกข้อมูลในฟอร์ม -->
    <div *ngIf="uploadSuccess && detectedKeys.length > 0" 
         style="background: white; border: 2px solid green; padding: 20px; margin: 20px 0; border-radius: 8px; position: relative; z-index: 9999; width: 100%;">
        
        <h2 style="text-align: center; color: green; font-size: 24px; margin-bottom: 20px;">
          📝 กรอกข้อมูลในฟอร์ม
        </h2>
        
        <!-- แสดง key ที่ตรวจพบ -->
        <div style="background: lightblue; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <strong>ตรวจพบ {{ detectedKeys.length }} ช่องข้อมูล:</strong>
          <div style="margin-top: 10px;">
            <span *ngFor="let key of detectedKeys; let i = index" 
                  style="display: inline-block; background: white; padding: 5px 10px; margin: 2px; border-radius: 3px;">
              {{ getLabelForKey(key) }}
            </span>
          </div>
        </div>

        <!-- ฟอร์มกรอกข้อมูล -->
        <form (ngSubmit)="onSubmitForm()" style="max-width: 1200px; margin: 0 auto;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
            <div *ngFor="let key of detectedKeys" style="margin-bottom: 15px;">
              <label [for]="key" style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">
                {{ getLabelForKey(key) }} <span style="color: red;">*</span>
              </label>
              <input 
                [id]="key"
                type="text" 
                [(ngModel)]="formData[key]"
                [name]="key"
                style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 14px;"
                [placeholder]="'กรอก ' + getLabelForKey(key)"
                required>
            </div>
          </div>

          <!-- ปุ่มสร้างเอกสาร -->
          <div style="text-align: center; margin-top: 30px;">
            <button 
              type="submit"
              [disabled]="isGenerating"
              style="background: green; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;"
              [style.background]="isGenerating ? 'gray' : 'green'">
              <span *ngIf="!isGenerating">📄 สร้างเอกสาร</span>
              <span *ngIf="isGenerating">⏳ กำลังสร้างเอกสาร...</span>
            </button>
          </div>
        </form>

      <!-- PDF Preview -->
      <div *ngIf="generateSuccess && generatedPdfSafeUrl" style="width: 100%; height: 800px; border: 1px solid #ddd; margin: 20px 0;">
        <iframe 
          [src]="generatedPdfSafeUrl" 
          style="width: 100%; height: 100%; border: none;"
          title="PDF Preview">
        </iframe>
      </div>

      <!-- ปุ่มดาวน์โหลด -->
      <div *ngIf="generateSuccess" style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin: 20px 0;">
        <button 
          (click)="downloadDocx()"
          style="background: #2196F3; color: white; padding: 15px 25px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
          ดาวน์โหลด DOCX
        </button>
        
        <button 
          (click)="downloadPdf()"
          [disabled]="!generatedPdfUrl || typeof generatedPdfUrl !== 'string'"
          style="background: #FF0000; color: white; padding: 15px 25px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; opacity: 1;"
          [style.background]="(!generatedPdfUrl || typeof generatedPdfUrl !== 'string') ? '#ccc' : '#FF0000'"
          [style.cursor]="(!generatedPdfUrl || typeof generatedPdfUrl !== 'string') ? 'not-allowed' : 'pointer'">
          ดาวน์โหลด PDF
        </button>
      </div>
    </div>
  `
})
export class DocumentKeyDetectComponent {
  // ข้อมูลไฟล์ที่เลือก
  selectedFile: File | null = null;
  
  // สถานะการอัปโหลด
  isUploading = false;
  uploadError = '';
  uploadSuccess = false;
  
  // ขั้นตอนปัจจุบัน (1=อัปโหลด, 2=กรอกข้อมูล, 3=ดาวน์โหลด)
  currentStep = 1;
  
  // ข้อมูลจาก API
  templateId: string = '';
  detectedKeys: string[] = [];
  formData: { [key: string]: string } = {};
  
  // สถานะการสร้างเอกสาร
  isGenerating = false;
  generateError = '';
  generateSuccess = false;
  submitted = false;
  
  // ข้อมูลสำหรับ Step 3 (ดาวน์โหลด)
  generatedFileSize: string = '';
  generatedDate: string = '';
  generatedDocxUrl: string = '';
  generatedPdfUrl: SafeResourceUrl | string = '';
  generatedPdfSafeUrl: SafeResourceUrl | null = null;
  
  constructor(
    private documentApiService: DocumentApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer
  ) {}
  
  // ใช้ฟังก์ชันจาก key-label เพื่อแปลง key เป็นชื่อที่อ่านได้
  getLabelForKey = getLabelForKey;
  
  /**
   * ตรวจสอบว่าฟอร์มถูกต้องหรือไม่
   * 
   * ตรวจสอบว่า:
   * - ทุก key มีข้อมูล
   * - ข้อมูลไม่เป็นค่าว่าง
   * 
   * @returns true ถ้าฟอร์มถูกต้อง, false ถ้าไม่ถูกต้อง
   * 
   * ตัวอย่างการใช้งาน:
   * if (this.isFormValid()) {
   *   // ส่งฟอร์ม
   * } else {
   *   // แสดงข้อความแจ้งเตือน
   * }
   */
  isFormValid(): boolean {
    return this.detectedKeys.every(key => this.formData[key] && this.formData[key].trim() !== '');
  }

  /**
   * จัดการเมื่อผู้ใช้เลือกไฟล์จาก input
   * 
   * ขั้นตอนการทำงาน:
   * 1. รับไฟล์จาก input element
   * 2. ตรวจสอบว่ามีไฟล์หรือไม่
   * 3. เซ็ตไฟล์ที่เลือก
   * 4. รีเซ็ตข้อความ error และ success
   * 
   * @param event - Event จาก input file
   * 
   * ตัวอย่างการใช้งาน:
   * <input type="file" (change)="onFileSelected($event)">
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadError = '';
      this.uploadSuccess = false;
    }
  }

  /**
   * จัดการเมื่อลากไฟล์มาวาง (dragover)
   * 
   * ป้องกันการทำงานเริ่มต้นของ browser
   * เพื่อให้สามารถลากไฟล์มาวางได้
   * 
   * @param event - DragEvent
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * จัดการเมื่อลากไฟล์ออกจากพื้นที่ (dragleave)
   * 
   * ป้องกันการทำงานเริ่มต้นของ browser
   * 
   * @param event - DragEvent
   */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * จัดการเมื่อวางไฟล์ (drop)
   * 
   * ขั้นตอนการทำงาน:
   * 1. ป้องกันการทำงานเริ่มต้นของ browser
   * 2. ตรวจสอบว่ามีไฟล์ที่ลากมาหรือไม่
   * 3. ตรวจสอบประเภทไฟล์ (ต้องเป็น .docx)
   * 4. เซ็ตไฟล์ที่เลือกหรือแสดงข้อความ error
   * 
   * @param event - DragEvent
   * 
   * ตัวอย่างการใช้งาน:
   * <div (drop)="onDrop($event)">วางไฟล์ที่นี่</div>
   */
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      // ตรวจสอบว่าเป็นไฟล์ .docx หรือไม่
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          file.name.endsWith('.docx')) {
        this.selectedFile = file;
        this.uploadError = '';
        this.uploadSuccess = false;
      } else {
        this.uploadError = 'กรุณาเลือกไฟล์ .docx เท่านั้น';
      }
    }
  }

  /**
   * อัปโหลดไฟล์ไปยัง backend
   * 
   * ขั้นตอนการทำงาน:
   * 1. ตรวจสอบว่ามีไฟล์ที่เลือกหรือไม่
   * 2. เซ็ตสถานะการอัปโหลด
   * 3. เรียก API uploadTemplate
   * 4. รับ template_id และ keys ที่ตรวจพบ
   * 5. เซ็ตข้อมูลและเปลี่ยนไปขั้นตอนที่ 2
   * 6. จัดการ error ถ้าเกิดปัญหา
   * 
   * ตัวอย่างการใช้งาน:
   * <button (click)="onUpload()">อัปโหลด</button>
   */
  onUpload() {
    if (!this.selectedFile) return;
    
    this.isUploading = true;
    this.uploadError = '';
    this.uploadSuccess = false;
    
    // เรียก API จริง
    this.documentApiService.uploadTemplate(this.selectedFile).subscribe({
      next: (response: UploadTemplateResponse) => {
        console.log('✅ อัปโหลดสำเร็จ! ตรวจพบ', response.keys.length, 'ช่องข้อมูล');
        
        // ใช้ ngZone.run() เพื่อให้แน่ใจว่า change detection ทำงาน
        this.ngZone.run(() => {
          // เซ็ตค่าก่อน
          this.templateId = response.template_id;
          this.detectedKeys = [...response.keys]; // สร้าง array ใหม่
          this.uploadSuccess = true;
          this.currentStep = 2;
          this.isUploading = false;
          
          // สร้าง form data object สำหรับแต่ละ key
          this.formData = {}; // รีเซ็ต form data
          this.detectedKeys.forEach(key => {
            this.formData[key] = '';
          });
          
          // Force change detection
          this.cdr.detectChanges();
          
          // ตรวจสอบอีกครั้งหลังจาก DOM อัปเดต
          setTimeout(() => {
            this.ngZone.run(() => {
              this.cdr.detectChanges();
            });
          }, 100);
        });
      },
      error: (error) => {
        console.error('❌ อัปโหลดล้มเหลว');
        this.uploadError = error.error?.error || 'เกิดข้อผิดพลาดในการอัปโหลด';
        this.isUploading = false;
      }
    });
  }
  
  /**
   * ส่งฟอร์มเพื่อสร้างเอกสาร
   * 
   * ขั้นตอนการทำงาน:
   * 1. ตรวจสอบว่ามี template_id และ keys หรือไม่
   * 2. ตรวจสอบความถูกต้องของฟอร์ม
   * 3. เซ็ตสถานะการสร้างเอกสาร
   * 4. เรียก API generateDocument
   * 5. รับ URL สำหรับดาวน์โหลดไฟล์
   * 6. เซ็ตข้อมูลและเปลี่ยนไปขั้นตอนที่ 3
   * 7. จัดการ error ถ้าเกิดปัญหา
   * 
   * ตัวอย่างการใช้งาน:
   * <form (ngSubmit)="onSubmitForm()">
   *   <button type="submit">สร้างเอกสาร</button>
   * </form>
   */
  onSubmitForm() {
    this.submitted = true;
    
    if (!this.templateId || this.detectedKeys.length === 0) return;
    
    // ตรวจสอบว่าฟอร์มถูกต้อง
    if (!this.isFormValid()) {
      return;
    }
    
    this.isGenerating = true;
    this.generateError = '';
    this.generateSuccess = false;
    
    // เรียก API สร้างเอกสาร
    this.documentApiService.generateDocument(this.templateId, this.formData).subscribe({
      next: (response: GenerateDocResponse) => {
        console.log('✅ สร้างเอกสารสำเร็จ!');
        
        // ใช้ ngZone.run() เพื่อให้แน่ใจว่า change detection ทำงาน
        this.ngZone.run(() => {
          this.generateSuccess = true;
          this.currentStep = 3;
          this.isGenerating = false;
          
          // เซ็ตข้อมูลสำหรับ Step 3
          this.generatedDate = new Date().toLocaleString('th-TH');
          this.generatedFileSize = 'กำลังคำนวณ...';
          this.generatedDocxUrl = this.documentApiService.getDocxUrl(response);
          const pdfUrl = this.documentApiService.getPdfUrl(response);
          this.generatedPdfUrl = pdfUrl || '';
          
          // เซ็ต PDF Safe URL สำหรับ iframe
          if (pdfUrl) {
            this.generatedPdfSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
          }
          
          // Force change detection
          this.cdr.detectChanges();
          
          // ตรวจสอบอีกครั้งหลังจาก DOM อัปเดต
          setTimeout(() => {
            this.ngZone.run(() => {
              this.cdr.detectChanges();
            });
          }, 200);
        });
      },
      error: (error) => {
        console.error('❌ สร้างเอกสารล้มเหลว');
        this.generateError = error.error?.error || 'เกิดข้อผิดพลาดในการสร้างเอกสาร';
        this.isGenerating = false;
      }
    });
  }
  
  /**
   * ดาวน์โหลดไฟล์ DOCX
   * 
   * เรียกใช้ downloadFile จาก DocumentApiService
   * เพื่อดาวน์โหลดไฟล์ DOCX ที่สร้างขึ้น
   * 
   * ตัวอย่างการใช้งาน:
   * <button (click)="downloadDocx()">ดาวน์โหลด DOCX</button>
   */
  downloadDocx() {
    if (this.generatedDocxUrl) {
      this.documentApiService.downloadFile(this.generatedDocxUrl, 'generated_document.docx');
    }
  }
  
  /**
   * ดาวน์โหลดไฟล์ PDF
   * 
   * เปิดไฟล์ PDF ในแท็บใหม่
   * ตรวจสอบว่ามี URL และเป็น string หรือไม่
   * 
   * ตัวอย่างการใช้งาน:
   * <button (click)="downloadPdf()">ดาวน์โหลด PDF</button>
   */
  downloadPdf() {
    if (this.generatedPdfUrl && typeof this.generatedPdfUrl === 'string') {
      // เปิดในแท็บใหม่
      window.open(this.generatedPdfUrl, '_blank');
    }
  }
  

} 