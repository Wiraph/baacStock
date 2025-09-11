import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SignatureService, Signature } from '../../../services/signature';
import { UserService } from '../../../services/user';
import { PermissionService } from '../../../services/permission.service';
import Swal from 'sweetalert2';

<<<<<<< HEAD
interface SignatureModel {
  empID: number;
  empName: string;
  empPosition: string;
  substituteTo?: string;
  sigBr?: boolean;
}

=======
>>>>>>> feature/report-document
@Component({
  selector: 'app-signature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signature.html'
})
export class SignatureComponent implements OnInit {
  
  // Properties
  signatures: Signature[] = [];
  isLoading = false;
  isAdding = false;
  isEditing = false;
  currentUser: any;
<<<<<<< HEAD

  newSignature: SignatureModel = {
    empID: 0,
    empName: '',
    empPosition: '',
    substituteTo: '',
    sigBr: false
=======
  selectedSignature: Signature | null = null;
  
  // Form data
  newSignature: Partial<Signature> = {
    empId: 0,
    empName: '',
    empPosition: '',
    substituteTo: '',
    sigFileData: ''
>>>>>>> feature/report-document
  };
  
  // File upload
  selectedFile: File | null = null;
  filePreview: string | null = null;

  constructor(
    private readonly signatureService: SignatureService,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}

  ngOnInit(): void {
    this.checkUserPermission();
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

    console.log('🔍 User Level:', this.currentUser.level);
    console.log('🔍 Checking signature permission...');
    
    const hasPermission = this.permissionService.hasActionPermission('signature', this.currentUser.level);
    console.log('🔍 Has signature permission:', hasPermission);
    
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

    console.log('✅ Permission granted, loading signatures...');
    this.loadSignatures();
  }

  /**
   * โหลดรายการลายเซ็นทั้งหมด
   */
  loadSignatures(): void {
    this.isLoading = true;
    
    console.log('🔍 Loading signatures from API...');
    
    this.signatureService.getSignatures().subscribe({
      next: (signatures) => {
        console.log('✅ Signatures loaded successfully:', signatures);
        this.signatures = signatures || [];
        this.isLoading = false;
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
   * เปิดฟอร์มเพิ่มลายเซ็นใหม่
   */
  openAddForm(): void {
    this.isAdding = true;
    this.isEditing = false;
    this.selectedSignature = null;
    this.resetForm();
  }

  /**
   * เปิดฟอร์มแก้ไขลายเซ็น
   */
  openEditForm(signature: Signature): void {
    this.isEditing = true;
    this.isAdding = false;
    this.selectedSignature = signature;
    this.newSignature = { ...signature };
    this.filePreview = signature.sigFileData;
  }

  /**
   * ยกเลิกการเพิ่ม/แก้ไข
   */
  cancelForm(): void {
    this.isAdding = false;
    this.isEditing = false;
    this.selectedSignature = null;
    this.resetForm();
  }

  /**
   * รีเซ็ตฟอร์ม
   */
  private resetForm(): void {
    this.newSignature = {
      empId: 0,
      empName: '',
      empPosition: '',
      substituteTo: '',
      sigFileData: ''
    };
    this.selectedFile = null;
    this.filePreview = null;
  }

  /**
   * จัดการการเลือกไฟล์
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (file) {
      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'ประเภทไฟล์ไม่ถูกต้อง',
          text: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น',
          confirmButtonText: 'ตกลง'
        });
        return;
      }

      // ตรวจสอบขนาดไฟล์ (5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'ไฟล์ใหญ่เกินไป',
          text: 'กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB',
          confirmButtonText: 'ตกลง'
        });
        return;
      }

      this.selectedFile = file;
      
      // แสดงตัวอย่างรูปภาพ
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview = e.target?.result as string;
        this.newSignature.sigFileData = this.filePreview || '';
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * บันทึกลายเซ็น
   */
  saveSignature(): void {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!this.newSignature.empName || !this.newSignature.empPosition) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกชื่อ-นามสกุล และตำแหน่ง',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    if (!this.newSignature.sigFileData) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่มีไฟล์ลายเซ็น',
        text: 'กรุณาอัปโหลดไฟล์ลายเซ็น',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    this.isLoading = true;
    
    const signatureData: Signature = {
      empId: this.newSignature.empId || 0,
      empName: this.newSignature.empName,
      empPosition: this.newSignature.empPosition,
      substituteTo: this.newSignature.substituteTo || null,
      sigFileData: this.newSignature.sigFileData
    };

    console.log('🔍 Saving signature:', signatureData);

    const apiCall = this.isEditing 
      ? this.signatureService.updateSignature(this.selectedSignature!.empId, signatureData)
      : this.signatureService.addSignature(signatureData);

    apiCall.subscribe({
      next: (response) => {
        console.log('✅ Signature saved successfully:', response);
        this.isLoading = false;
        
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: this.isEditing ? 'แก้ไขลายเซ็นเรียบร้อยแล้ว' : 'เพิ่มลายเซ็นเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง'
        }).then(() => {
          this.cancelForm();
          this.loadSignatures();
        });
      },
      error: (error) => {
        console.error('❌ Error saving signature:', error);
        this.isLoading = false;
        
        let errorMessage = 'ไม่สามารถบันทึกข้อมูลลายเซ็นได้';
        
        if (error.status === 401) {
          errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
        } else if (error.status === 403) {
          errorMessage = 'ไม่มีสิทธิ์บันทึกข้อมูลลายเซ็น';
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
   * ลบลายเซ็น
   */
  deleteSignature(signature: Signature): void {
    Swal.fire({
      title: 'ยืนยันการลบ',
      text: `คุณต้องการลบลายเซ็นของ ${signature.empName} หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        
        console.log('🔍 Deleting signature:', signature.empId);
        
        this.signatureService.deleteSignature(signature.empId).subscribe({
          next: (response) => {
            console.log('✅ Signature deleted successfully:', response);
            this.isLoading = false;
            
            Swal.fire({
              icon: 'success',
              title: 'ลบสำเร็จ',
              text: 'ลบลายเซ็นเรียบร้อยแล้ว',
              confirmButtonText: 'ตกลง'
            }).then(() => {
              this.loadSignatures();
            });
          },
          error: (error) => {
            console.error('❌ Error deleting signature:', error);
            this.isLoading = false;
            
            let errorMessage = 'ไม่สามารถลบข้อมูลลายเซ็นได้';
            
            if (error.status === 401) {
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
            } else if (error.status === 403) {
              errorMessage = 'ไม่มีสิทธิ์ลบข้อมูลลายเซ็น';
            } else if (error.status === 404) {
              errorMessage = 'ไม่พบข้อมูลลายเซ็นที่ต้องการลบ';
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
    });
  }

  /**
   * กลับไปหน้าหลัก
   */
  goBack(): void {
    this.router.navigate(['/dashboard-system']);
  }
<<<<<<< HEAD

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
=======
>>>>>>> feature/report-document
}
