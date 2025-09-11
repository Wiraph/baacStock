import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerMetadata } from '../../../services/Metadata/customer-metadata';
import { UserService } from '../../../services/user';
import { PermissionService } from '../../../services/permission.service';
import Swal from 'sweetalert2';

export interface ShareholderType {
  id?: number;
  cusCodeg: string;
  cusDescg: string;
  cusDescgAbbr?: string;
  isActive?: boolean;
  createdDate?: string;
  updatedDate?: string;
}

@Component({
  selector: 'app-shareholder-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sharelder-type.html'
})
export class ShareholderTypeComponent implements OnInit {
  shareholderTypes: ShareholderType[] = [];
  isLoading = false;
  isAdding = false;
  isEditing = false;
  selectedShareholderType: ShareholderType | null = null;
  newShareholderType: ShareholderType = {
    cusCodeg: '',
    cusDescg: '',
    cusDescgAbbr: '',
    isActive: true
  };
  currentUser: any = null;
  hasPermission = false;

  constructor(
    private readonly customerMetadata: CustomerMetadata,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.currentUser = this.userService.getCurrentUser();
      console.log('Shareholder Type Component - Current User:', this.currentUser);
      
      if (this.currentUser.level) {
        console.log('User Level:', this.currentUser.level);
        console.log('Checking shareholder-type permission...');
        
        this.hasPermission = this.permissionService.hasActionPermission('shareholder-type', this.currentUser.level);
        console.log('Has shareholder-type permission:', this.hasPermission);
        
        if (this.hasPermission) {
          console.log('✅ Permission granted, loading shareholder types...');
          this.loadShareholderTypes();
        } else {
          console.log('❌ Permission denied, redirecting...');
          this.router.navigate(['/dashboard-system']);
        }
      } else {
        console.log('❌ No user data or level found, redirecting to login');
        this.router.navigate(['/login']);
      }
    } else {
      console.log('🔍 Running on server, skipping permission check');
    }
  }

  loadShareholderTypes(): void {
    this.isLoading = true;
    console.log('🔍 Loading shareholder types from API...');
    
    this.customerMetadata.cusTypes().subscribe({
      next: (data: any[]) => {
        console.log('✅ Shareholder types loaded successfully:', data);
        this.shareholderTypes = data.map((item, index) => ({
          id: index + 1,
          cusCodeg: item.cusCODEg || item.cusCodeg || item.cusCodeg_Code,
          cusDescg: item.cusDESCg || item.cusDescg || item.cusDescg_Desc,
          cusDescgAbbr: item.cusDESCgABBR || item.cusDescgAbbr || item.cusDescgAbbr_Desc,
          isActive: item.isActive !== undefined ? item.isActive : true,
          createdDate: item.createdDate,
          updatedDate: item.updatedDate
        }));
        console.log('🔍 Mapped shareholder types:', this.shareholderTypes);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading shareholder types:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดข้อมูลประเภทผู้ถือหุ้นได้',
          confirmButtonText: 'ตกลง'
        });
      }
    });
  }

  saveShareholderType(): void {
    if (!this.newShareholderType.cusCodeg || !this.newShareholderType.cusDescg) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกรหัสและคำอธิบายประเภทผู้ถือหุ้น',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    this.isLoading = true;

    if (this.isAdding) {
      // Mock add
      setTimeout(() => {
        const newType: ShareholderType = {
          id: this.shareholderTypes.length + 1,
          ...this.newShareholderType
        };
        this.shareholderTypes.push(newType);
        
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'เพิ่มข้อมูลสำเร็จ',
          text: 'เพิ่มประเภทผู้ถือหุ้นเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง'
        }).then(() => {
          this.cancelForm();
          this.loadShareholderTypes();
          this.cdr.detectChanges();
        });
      }, 1000);
    } else if (this.isEditing && this.selectedShareholderType) {
      // Mock update
      setTimeout(() => {
        const index = this.shareholderTypes.findIndex(t => t.id === this.selectedShareholderType?.id);
        if (index !== -1) {
          this.shareholderTypes[index] = {
            ...this.selectedShareholderType,
            ...this.newShareholderType
          };
        }
        
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'แก้ไขข้อมูลสำเร็จ',
          text: 'แก้ไขประเภทผู้ถือหุ้นเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง'
        }).then(() => {
          this.cancelForm();
          this.loadShareholderTypes();
          this.cdr.detectChanges();
        });
      }, 1000);
    }
  }

  deleteShareholderType(shareholderType: ShareholderType): void {
    Swal.fire({
      title: 'ยืนยันการลบ',
      text: `คุณต้องการลบประเภทผู้ถือหุ้น "${shareholderType.cusDescg}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        // Mock delete
        setTimeout(() => {
          const index = this.shareholderTypes.findIndex(t => t.id === shareholderType.id);
          if (index !== -1) {
            this.shareholderTypes.splice(index, 1);
          }
          
          Swal.fire({
            icon: 'success',
            title: 'ลบข้อมูลสำเร็จ',
            text: 'ลบประเภทผู้ถือหุ้นเรียบร้อยแล้ว',
            confirmButtonText: 'ตกลง'
          }).then(() => {
            this.loadShareholderTypes();
            this.cdr.detectChanges();
          });
        }, 1000);
      }
    });
  }

  openAddForm(): void {
    this.isAdding = true;
    this.isEditing = false;
    this.selectedShareholderType = null;
    this.resetForm();
    this.cdr.detectChanges();
  }

  openEditForm(shareholderType: ShareholderType): void {
    this.isEditing = true;
    this.isAdding = false;
    this.selectedShareholderType = shareholderType;
    this.newShareholderType = { ...shareholderType };
    this.cdr.detectChanges();
  }

  cancelForm(): void {
    this.isAdding = false;
    this.isEditing = false;
    this.selectedShareholderType = null;
    this.resetForm();
    this.cdr.detectChanges();
  }

  closeForm(): void {
    this.cancelForm();
  }

  private resetForm(): void {
    this.newShareholderType = {
      cusCodeg: '',
      cusDescg: '',
      cusDescgAbbr: '',
      isActive: true
    };
  }

  goBack(): void {
    this.router.navigate(['/dashboard-system']);
  }
}