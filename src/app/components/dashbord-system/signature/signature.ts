import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SignatureService } from '../../../services/signature';
import { UserService } from '../../../services/user';
import { PermissionService } from '../../../services/permission.service';
import Swal from 'sweetalert2';

interface SignatureModel {
  empID: number;
  empName: string;
  empPosition: string;
  substituteTo?: string;
  sigBr?: boolean;
}

@Component({
  selector: 'app-signature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signature.html'
})
export class SignatureComponent implements OnInit {

  // Properties
  signatures: any[] = [];
  isLoading = false;
  isAdding = false;
  isEditing = false;
  currentUser: any;

  newSignature: SignatureModel = {
    empID: 0,
    empName: '',
    empPosition: '',
    substituteTo: '',
    sigBr: false
  };
  // ไฟล์ที่เลือก
  selectedFile: File | null = null;
  // ตัวอย่างภาพลายเซ็น
  filePreview: string | ArrayBuffer | null = null;

  constructor(
    private readonly signatureService: SignatureService,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.checkUserPermission();
    this.isAdding = true;

  }

  /**
   * ตรวจสอบสิทธิ์การเข้าถึง
   */
  private checkUserPermission(): void {
    // ตรวจสอบว่าเป็น browser หรือไม่
    if (!isPlatformBrowser(this.platformId)) {
      console.log('🔍 Running on server, skipping permission check');
      return;
    }

    this.currentUser = this.userService.getCurrentUser();

    console.log('🔍 Signature Component - Current User:', this.currentUser);

    if (!this.currentUser) {
      console.log('❌ No current user found, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    const hasPermission = this.permissionService.hasActionPermission('signature', this.currentUser.level);

    // ตรวจสอบสิทธิ์เข้าถึง signature management
    if (!hasPermission) {
      console.log('❌ No permission to access signature management');
      Swal.fire({
        icon: 'error',
        title: 'ไม่มีสิทธิ์เข้าถึง',
        text: 'คุณไม่มีสิทธิ์เข้าถึงหน้าจัดการลายเซ็น',
        confirmButtonText: 'ตกลง'
      }).then(() => {
        this.router.navigate(['/dashboard-admin']);
      });
      return;
    }

    this.loadSignatures();
  }



  /**
   * โหลดรายการลายเซ็นทั้งหมด
   */
  loadSignatures(): void {
    this.isLoading = true;

    this.signatureService.getSignatures().subscribe({
      next: (signatures: any) => {
        this.signatures = signatures.data || [];
        console.log("Log===", this.signatures);
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading signatures:', error);
        this.isLoading = false;

        // แสดง error message ที่เป็นมิตรกับผู้ใช้
        let errorMessage = 'ไม่สามารถโหลดข้อมูลลายเซ็นได้';

        if (error.status === 401) {
          errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
        } else if (error.status === 403) {
          errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลลายเซ็น';
        } else if (error.status === 500) {
          errorMessage = 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง';
        }

        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: errorMessage,
          confirmButtonText: 'ตกลง'
        });
      }
    });
  }

  /**
   * ยกเลิกการเพิ่ม/แก้ไข
   */
  cancelForm(): void {
    this.isAdding = false;
    this.isEditing = false;
  }

  // เมื่อเลือกไฟล์
  onFileSelected(event: any) {
    const file = event.target.files[0];
    // กำหนดประเภทไฟล์ที่อนุญาต
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({ icon: 'warning', text: `ไฟล์ต้องเป็น JPG หรือ PNG เท่านั้น` });
      return;
    }

    // กำหนดขนาดไฟล์สูงสุด (เช่น 2 MB)
    const maxSizeMB = 2;
    if (file.size > maxSizeMB * 1024 * 1024) {
      Swal.fire({ icon: 'warning', text: `ไฟล์ต้องไม่เกิน ${maxSizeMB} MB` });
      return;
    }

    // เก็บไฟล์
    this.selectedFile = file;

    // สร้าง preview
    const reader = new FileReader();
    reader.onload = () => {
      this.filePreview = reader.result;
      this.cd.detectChanges();
      console.log('File preview:', this.filePreview);
    };
    reader.readAsDataURL(file);
  }

  /**
   * กลับไปหน้าหลัก
   */
  goBack(): void {
    this.router.navigate(['/dashboard-system']);
  }

  // ฟังก์ชัน แก้ไขลายเซ็น
  openEditForm(sig: SignatureModel) {
    this.isEditing = true;
    this.isAdding = false;
    this.newSignature.empID = sig.empID;
    this.newSignature.empName = sig.empName;
    this.newSignature.empPosition = sig.empPosition;
    this.newSignature.substituteTo = sig.substituteTo;
    this.newSignature.sigBr = !!sig.sigBr;

    this.cd.detectChanges();

    setTimeout(() => {
      const el = document.getElementById("signatureSection");
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  // ฟังก์ชัน เพิ่มลายเซ็น
  addForm() {
    this.isAdding = true;
    this.isEditing = false;
    this.cd.detectChanges();
    setTimeout(() => {
      const el = document.getElementById("signatureSection");
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  // ฟังก์ชันบันทึกลายเซ็น
  async saveSignature(act: string) {
    if (!this.newSignature.empName || !this.newSignature.empPosition) {
      alert('กรุณากรอก ชื่อและตำแหน่ง');
      return;
    }

    if (!this.selectedFile) {
      alert('กรุณาเลือกไฟล์ลายเซ็น');
      return;
    }

    this.isLoading = true;

    try {
      // แปลงไฟล์เป็น Base64
      const fileBase64 = await this.toBase64(this.selectedFile);

      // สร้าง payload สำหรับส่งไป API
      const payload = {
        empID: this.newSignature.empID || 0,
        empName: this.newSignature.empName,
        empPosition: this.newSignature.empPosition,
        substituteTo: this.newSignature.substituteTo || null,
        sigFileData: fileBase64, // ✅ ตอนนี้เป็น string จริง
        sigFileMIME: this.selectedFile.type,
        sigFileExtension: this.selectedFile.name.split('.').pop(),
        SigBr: !!this.newSignature.sigBr
      };

      console.log("Payload", payload);
      if (act == "create") {
        this.createService(payload);
      } else {
        this.updateService(payload);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        text: `ไม่สามารถอ่านไฟล์ลายเซ็น: ${error}`
      });
      this.isLoading = false;
    }
  }

  deleteSignature(empID: number) {
    const payload = {
      empID: Number(empID)
    }
    Swal.fire({
      icon: 'question',
      text: 'ต้องการลบลายเซ็นนี้ใช้ไหม',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.signatureService.deleteSignature(payload).subscribe({
          next: (res: any) => {
            Swal.fire({
              icon: 'success',
              text: `${res.message}`
            });
            this.resetForm();
            this.loadSignatures();
            this.isLoading = false;
          },
          error: (err: any) => {
            Swal.fire({
              icon: 'error',
              text: `ลบไม่สำเร็จ`
            });
            console.log(err);
            this.isLoading = false;
          }
        });
      }
    })
  }

  // ฟังก์ชัน เรียก Service บันทึกใหม่
  createService(payload: any): void {
    // เรียก API
    this.signatureService.createSignature(payload).subscribe({
      next: (res: any) => {
        console.log("Res", res);
        Swal.fire({
          icon: 'success',
          text: 'เพิ่มข้อมูลเรียบร้อย'
        });
        this.resetForm();
        this.loadSignatures();
        this.isLoading = false;
      },
      error: (err: any) => {
        Swal.fire({
          icon: 'error',
          text: `บันทึกข้อมูลไม่สำเร็จ`
        });
        console.log(err);
        this.isLoading = false;
      }
    });
  }

  // ฟังก์ชัน เรียก Service อัปเดต
  updateService(payload: any): void {
    this.signatureService.updateSignature(payload).subscribe({
      next: (res: any) => {
        console.log("Res", res);
        Swal.fire({
          icon: 'success',
          text: 'อัปเดตข้อมูลสำเร็จ'
        });
        this.resetForm();
        this.loadSignatures();
        this.isLoading = false;
      },
      error: (err: any) => {
        Swal.fire({
          icon: 'error',
          text: `แก้ไขข้อมูลไม่สำเร็จ`
        });
        console.log(err);
        this.isLoading = false;
      }
    });
  }

  // helper แปลงไฟล์เป็น Base64
  toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // ตัด prefix "data:image/jpeg;base64," ออก
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file as Base64'));
    });
  }

  resetForm() {
    this.newSignature = {
      empID: 0,
      empName: '',
      empPosition: '',
      substituteTo: '',
      sigBr: false
    };
    this.selectedFile = null;
    this.filePreview = null;
    this.isEditing = false;
    this.cd.detectChanges();
  }
}
