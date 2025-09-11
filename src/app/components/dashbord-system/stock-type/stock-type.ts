import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StockMetadata } from '../../../services/Metadata/stock-metadata';
import { UserService } from '../../../services/user';
import { PermissionService } from '../../../services/permission.service';
import Swal from 'sweetalert2';

export interface StockType {
  id?: number;
  stkTypeCode: string;
  stkTypeDesc: string;
  isActive?: boolean;
  createdDate?: string;
  updatedDate?: string;
}

@Component({
  selector: 'app-stock-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-type.html'
})
export class StockTypeComponent implements OnInit {
  
  // Properties
  stockTypes: StockType[] = [];
  isLoading = false;
  isAdding = false;
  isEditing = false;
  currentUser: any;
  selectedStockType: StockType | null = null;
  
  // Form data
  newStockType: Partial<StockType> = {
    stkTypeCode: '',
    stkTypeDesc: '',
    isActive: true
  };

  constructor(
    private readonly stockMetadata: StockMetadata,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    private readonly cdr: ChangeDetectorRef,
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
    
    console.log('🔍 Stock Type Component - Current User:', this.currentUser);
    
    if (!this.currentUser) {
      console.log('❌ No current user found, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    console.log('🔍 User Level:', this.currentUser.level);
    console.log('🔍 Checking stock-type permission...');
    
    const hasPermission = this.permissionService.hasActionPermission('stock-type', this.currentUser.level);
    console.log('🔍 Has stock-type permission:', hasPermission);
    
    // ตรวจสอบสิทธิ์เข้าถึง stock type management
    if (!hasPermission) {
      console.log('❌ No permission to access stock type management');
      Swal.fire({
        icon: 'error',
        title: 'ไม่มีสิทธิ์เข้าถึง',
        text: 'คุณไม่มีสิทธิ์เข้าถึงหน้าจัดการประเภทหุ้น',
        confirmButtonText: 'ตกลง'
      }).then(() => {
        this.router.navigate(['/dashboard-system']);
      });
      return;
    }

    console.log('✅ Permission granted, loading stock types...');
    this.loadStockTypes();
  }

  /**
   * โหลดรายการประเภทหุ้นทั้งหมด
   */
  loadStockTypes(): void {
    this.isLoading = true;
    
    console.log('🔍 Loading stock types from API...');
    
    this.stockMetadata.stkTyps().subscribe({
      next: (data: any[]) => {
        console.log('✅ Stock types loaded successfully:', data);
        this.stockTypes = data.map((item, index) => ({
          id: index + 1,
          stkTypeCode: item.stkType || item.stkTypeCode || item.stkType_Code,
          stkTypeDesc: item.stkDesc || item.stkTypeDesc || item.stkType_Desc,
          isActive: item.isActive !== undefined ? item.isActive : true,
          createdDate: item.createdDate,
          updatedDate: item.updatedDate
        }));
        console.log('🔍 Mapped stock types:', this.stockTypes);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading stock types:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
        
        // แสดง error message ที่เป็นมิตรกับผู้ใช้
        let errorMessage = 'ไม่สามารถโหลดข้อมูลประเภทหุ้นได้';
        
        if (error.status === 401) {
          errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
        } else if (error.status === 403) {
          errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลประเภทหุ้น';
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
   * เปิดฟอร์มเพิ่มประเภทหุ้นใหม่
   */
  openAddForm(): void {
    this.isAdding = true;
    this.isEditing = false;
    this.selectedStockType = null;
    this.resetForm();
    this.cdr.detectChanges();
  }

  /**
   * เปิดฟอร์มแก้ไขประเภทหุ้น
   */
  openEditForm(stockType: StockType): void {
    this.isEditing = true;
    this.isAdding = false;
    this.selectedStockType = stockType;
    this.newStockType = { ...stockType };
    this.cdr.detectChanges();
  }

  /**
   * ยกเลิกการเพิ่ม/แก้ไข
   */
  cancelForm(): void {
    this.isAdding = false;
    this.isEditing = false;
    this.selectedStockType = null;
    this.resetForm();
    this.cdr.detectChanges();
  }

  /**
   * ปิดฟอร์ม (alias สำหรับ cancelForm)
   */
  closeForm(): void {
    this.cancelForm();
  }

  /**
   * รีเซ็ตฟอร์ม
   */
  private resetForm(): void {
    this.newStockType = {
      stkTypeCode: '',
      stkTypeDesc: '',
      isActive: true
    };
  }

  /**
   * บันทึกประเภทหุ้น
   */
  saveStockType(): void {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!this.newStockType.stkTypeCode || !this.newStockType.stkTypeDesc) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกรหัสประเภทหุ้นและคำอธิบาย',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    // ตรวจสอบรหัสซ้ำ
    const existingStockType = this.stockTypes.find(s => 
      s.stkTypeCode === this.newStockType.stkTypeCode && 
      s.id !== this.selectedStockType?.id
    );

    if (existingStockType) {
      Swal.fire({
        icon: 'error',
        title: 'รหัสซ้ำ',
        text: 'รหัสประเภทหุ้นนี้มีอยู่แล้ว',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    this.isLoading = true;
    
    const stockTypeData: StockType = {
      id: this.newStockType.id,
      stkTypeCode: this.newStockType.stkTypeCode,
      stkTypeDesc: this.newStockType.stkTypeDesc,
      isActive: this.newStockType.isActive
    };

    console.log('🔍 Saving stock type:', stockTypeData);

    // Mock implementation - เนื่องจาก API ยังไม่มี POST/PUT method
    setTimeout(() => {
      if (this.isAdding) {
        const newId = Math.max(...this.stockTypes.map(s => s.id || 0)) + 1;
        const newStockType: StockType = {
          ...stockTypeData,
          id: newId,
          createdDate: new Date().toISOString()
        };
        this.stockTypes.push(newStockType);
      } else if (this.isEditing && this.selectedStockType?.id) {
        const index = this.stockTypes.findIndex(s => s.id === this.selectedStockType?.id);
        if (index !== -1) {
          this.stockTypes[index] = {
            ...stockTypeData,
            id: this.selectedStockType?.id,
            updatedDate: new Date().toISOString()
          };
        }
      }
      
      this.isLoading = false;
      
      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        text: this.isEditing ? 'แก้ไขประเภทหุ้นเรียบร้อยแล้ว' : 'เพิ่มประเภทหุ้นเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง'
      }).then(() => {
        this.cancelForm();
        this.loadStockTypes();
        this.cdr.detectChanges();
      });
    }, 1000);
  }

  /**
   * ลบประเภทหุ้น
   */
  deleteStockType(stockType: StockType): void {
    Swal.fire({
      title: 'ยืนยันการลบ',
      text: `คุณต้องการลบประเภทหุ้น "${stockType.stkTypeDesc}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        
        console.log('🔍 Deleting stock type:', stockType.id);
        
        // Mock implementation - เนื่องจาก API ยังไม่มี DELETE method
        setTimeout(() => {
          const index = this.stockTypes.findIndex(s => s.id === stockType.id);
          if (index !== -1) {
            this.stockTypes.splice(index, 1);
          }
          
          this.isLoading = false;
          
          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ',
            text: 'ลบประเภทหุ้นเรียบร้อยแล้ว',
            confirmButtonText: 'ตกลง'
          }).then(() => {
            this.loadStockTypes();
            this.cdr.detectChanges();
          });
        }, 1000);
      }
    });
  }

  /**
   * กลับไปหน้าหลัก
   */
  goBack(): void {
    this.router.navigate(['/dashboard-system']);
  }

  /**
   * ฟอร์แมตวันที่
   */
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
