import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerMetadata } from '../../../services/Metadata/customer-metadata';
import { UserService } from '../../../services/user';
import { PermissionService } from '../../../services/permission.service';
import Swal from 'sweetalert2';

export interface ShareholderGroup {
  id?: number;
  cusCodeg: string;
  cusDescg: string;
  cusDescgAbbr?: string;
  isActive?: boolean;
  createdDate?: string;
  updatedDate?: string;
}

@Component({
  selector: 'app-shareholder-group',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sharelder-group.html'
})
export class ShareholderGroupComponent implements OnInit {
  shareholderGroups: ShareholderGroup[] = [];
  isLoading = false;
  isAdding = false;
  isEditing = false;
  selectedShareholderGroup: ShareholderGroup | null = null;
  newShareholderGroup: ShareholderGroup = {
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
      console.log('Shareholder Group Component - Current User:', this.currentUser);
      
      if (this.currentUser.level) {
        console.log('User Level:', this.currentUser.level);
        console.log('Checking shareholder-group permission...');
        
        this.hasPermission = this.permissionService.hasActionPermission('shareholder-group', this.currentUser.level);
        console.log('Has shareholder-group permission:', this.hasPermission);
        
        if (this.hasPermission) {
          console.log('✅ Permission granted, loading shareholder groups...');
          this.loadShareholderGroups();
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

  loadShareholderGroups(): void {
    this.isLoading = true;
    console.log('🔍 Loading shareholder groups from API...');
    
    this.customerMetadata.cusTypes().subscribe({
      next: (data: any[]) => {
        console.log('✅ Shareholder groups loaded successfully:', data);
        this.shareholderGroups = data.map((item, index) => ({
          id: index + 1,
          cusCodeg: item.cusCODEg || item.cusCodeg || item.cusCodeg_Code,
          cusDescg: item.cusDESCg || item.cusDescg || item.cusDescg_Desc,
          cusDescgAbbr: item.cusDESCgABBR || item.cusDescgAbbr || item.cusDescgAbbr_Desc,
          isActive: item.isActive !== undefined ? item.isActive : true,
          createdDate: item.createdDate,
          updatedDate: item.updatedDate
        }));
        console.log('🔍 Mapped shareholder groups:', this.shareholderGroups);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading shareholder groups:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดข้อมูลกลุ่มผู้ถือหุ้นได้',
          confirmButtonText: 'ตกลง'
        });
      }
    });
  }

  saveShareholderGroup(): void {
    if (!this.newShareholderGroup.cusCodeg || !this.newShareholderGroup.cusDescg) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกรหัสและคำอธิบายกลุ่มผู้ถือหุ้น',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    this.isLoading = true;

    if (this.isAdding) {
      // Mock add
      setTimeout(() => {
        const newGroup: ShareholderGroup = {
          id: this.shareholderGroups.length + 1,
          ...this.newShareholderGroup
        };
        this.shareholderGroups.push(newGroup);
        
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'เพิ่มข้อมูลสำเร็จ',
          text: 'เพิ่มกลุ่มผู้ถือหุ้นเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง'
        }).then(() => {
          this.cancelForm();
          this.loadShareholderGroups();
          this.cdr.detectChanges();
        });
      }, 1000);
    } else if (this.isEditing && this.selectedShareholderGroup) {
      // Mock update
      setTimeout(() => {
        const index = this.shareholderGroups.findIndex(g => g.id === this.selectedShareholderGroup?.id);
        if (index !== -1) {
          this.shareholderGroups[index] = {
            ...this.selectedShareholderGroup,
            ...this.newShareholderGroup
          };
        }
        
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'แก้ไขข้อมูลสำเร็จ',
          text: 'แก้ไขกลุ่มผู้ถือหุ้นเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง'
        }).then(() => {
          this.cancelForm();
          this.loadShareholderGroups();
          this.cdr.detectChanges();
        });
      }, 1000);
    }
  }

  deleteShareholderGroup(shareholderGroup: ShareholderGroup): void {
    Swal.fire({
      title: 'ยืนยันการลบ',
      text: `คุณต้องการลบกลุ่มผู้ถือหุ้น "${shareholderGroup.cusDescg}" หรือไม่?`,
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
          const index = this.shareholderGroups.findIndex(g => g.id === shareholderGroup.id);
          if (index !== -1) {
            this.shareholderGroups.splice(index, 1);
          }
          
          Swal.fire({
            icon: 'success',
            title: 'ลบข้อมูลสำเร็จ',
            text: 'ลบกลุ่มผู้ถือหุ้นเรียบร้อยแล้ว',
            confirmButtonText: 'ตกลง'
          }).then(() => {
            this.loadShareholderGroups();
            this.cdr.detectChanges();
          });
        }, 1000);
      }
    });
  }

  openAddForm(): void {
    this.isAdding = true;
    this.isEditing = false;
    this.selectedShareholderGroup = null;
    this.resetForm();
    this.cdr.detectChanges();
  }

  openEditForm(shareholderGroup: ShareholderGroup): void {
    this.isEditing = true;
    this.isAdding = false;
    this.selectedShareholderGroup = shareholderGroup;
    this.newShareholderGroup = { ...shareholderGroup };
    this.cdr.detectChanges();
  }

  cancelForm(): void {
    this.isAdding = false;
    this.isEditing = false;
    this.selectedShareholderGroup = null;
    this.resetForm();
    this.cdr.detectChanges();
  }

  closeForm(): void {
    this.cancelForm();
  }

  private resetForm(): void {
    this.newShareholderGroup = {
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