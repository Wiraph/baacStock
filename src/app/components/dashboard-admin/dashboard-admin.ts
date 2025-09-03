import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import {
  trigger, transition, style, animate
} from '@angular/animations';
import { UserService } from '../../services/user';
import { PermissionService } from '../../services/permission.service';
import { Login } from '../../services/login';
import { PasswordStatusService, PasswordStatus } from '../../services/password-status.service';

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  open: boolean;
  children: { key: string; icon: string; label: string; route: string; submenu?: { key: string; icon: string; label: string; route: string }[] }[];
}

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css'],
  imports: [CommonModule, RouterOutlet, RouterModule],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('200ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ],
})
export class AdminDashboardComponent implements OnInit {
  sidebarCollapsed = false;
  currentUser: any = {};
  filteredMenus: MenuItem[] = [];
  
  // เพิ่ม properties สำหรับตรวจสอบ password status
  isFirstTimeUser = false;
  isPasswordExpired = false;
  passwordExpiryDays = 0;
  passwordExpiryDate: string | null = null;
  isPasswordChangeRequired = false;
  isDefaultPassword = false; // เพิ่มการตรวจสอบรหัสผ่านเริ่มต้น

  menus: MenuItem[] = [
    {
      key: 'home',
      label: 'แผงควบคุม',
      icon: '📑',
      open: false,
      children: [
        { key: 'home', icon: '🏠', label: 'Home', route: '/dashboard-admin/' },
        { key: 'contact', icon: '📞', label: 'ติดต่อ', route: '/dashboard-admin/contact' },
        { key: 'search-edit', icon: '🔎', label: 'ค้นหา/แก้ไข', route: '/dashboard-admin/editcustomer' }
      ]
    },
    {
      key: 'sales',
      label: 'การขายและใบหุ้น',
      icon: '📊',
      open: false,
      children: [
        { key: 'print-share-purchase-request', icon: '🛒', label: 'พิมพ์คำขอซื้อหุ้น', route: '/dashboard-admin/print-share-purchase-request' },
        { key: 'common-shares', icon: '😶‍🌫️', label: 'ขายหุ้นสามัญ', route: '/dashboard-admin/salestock' },
        { key: 'cratenewsharecertificate', icon: '📄', label: 'การออกใบหุ้นใหม่ แทนใบหุ้นที่ชำรุด/สูญหาย', route: '/dashboard-admin/cratenewsharecertificate' },
        { key: 'transfer-share', icon: '♾️', label: 'โอนเปลี่ยนมือ', route: '/dashboard-admin/transfer-share' },
        { key: 'approve-item', icon: '✅', label: 'อนุมัติรายการ', route: '/dashboard-admin/approve-item' },
        { key: 'approve-issue', icon: '📝', label: 'อนุมัติออกใบหุ้น', route: '/dashboard-admin/approve-issue' },
        { key: 'print-certificates', icon: '🖨️', label: 'พิมพ์ใบหุ้น', route: '/dashboard-admin/print-certificates' },
        { key: 'block-certificates', icon: '🔒', label: 'บล็อค/ยกเลิกบล็อค ใบหุ้น', route: '/dashboard-admin/block-certificates' }
      ]
    },
    {
      key: 'financial',
      label: 'การเงิน',
      icon: '💰',
      open: false,
      children: [
        { key: 'dividend', icon: '💰', label: 'เงินปันผล', route: '/dashboard-admin/dividend' },
        { key: 'annualdividendcalculator', icon: '😵‍💫', label: 'คำนวณเงินปันผลประจำปี', route: '/dashboard-admin/AnnualDividendCalculatorComponent' },
      ]
    },
    {
      key: 'spin-file',
      label: 'SCB SPIN FILE',
      icon: '⚡',
      open: false,
      children: [
        { key: 'create-spin-files', icon: '⚡', label: 'สร้าง SPIN FILE ส่ง SCB', route: '/dashboard-admin/create-spin-files' },
        { key: 'spin-files', icon: '🔌', label: 'รับผล SPIN FILE จาก SCB', route: '/dashboard-admin/spin-files' }
      ]
    },
    {
      key: 'sap-interface',
      label: 'SAP Interface',
      icon: '🔗',
      open: false,
      children: [
        { key: 'sap-interface', icon: '🔗', label: 'SAP Interface', route: '/dashboard-admin/sap-interface' }
      ]
    },
    {
      key: 'pnd',
      label: 'ภ.ง.ด.',
      icon: '📋',
      open: false,
      children: [
        { key: 'pnd2', icon: '📄', label: 'ภ.ง.ด. 2', route: '/dashboard-admin/pnd2' },
        { key: 'pnd2a', icon: '📋', label: 'ภ.ง.ด. 2 ก', route: '/dashboard-admin/pnd2a' },
        { key: 'pnd53', icon: '📊', label: 'ภ.ง.ด. 53', route: '/dashboard-admin/pnd53' },
        { key: '*เก่า*', icon: '', label: '*เก่า*', route: '' },
        { key: 'pnd2-old', icon: '📄', label: 'ภ.ง.ด. 2 เก่า', route: '/dashboard-admin/pnd2old' },
        { key: 'pnd2a-old', icon: '📋', label: 'ภ.ง.ด. 2 ก เก่า', route: '/dashboard-admin/pnd2aold' },
        { key: 'pnd53-old', icon: '📊', label: 'ภ.ง.ด. 53 เก่า', route: '/dashboard-admin/pnd53old' }

      ]
    },
    {
      key: 'report',
      label: 'รายงาน',
      icon: '📄',
      open: false,
      children: [
        { key: 'reports', icon: '📄', label: 'รายงาน', route: '/dashboard-admin/reports' }
      ]
    },
    {
      key: 'user',
      label: 'ผู้ใช้งาน',
      icon: '👪',
      open: false,
      children: [
        { key: 'users', icon: '👤', label: 'รายชื่อผู้ใช้งาน', route: '/dashboard-admin/users' },
        { key: 'change-password', icon: '🔑', label: 'เปลี่ยนรหัสผ่าน', route: '/dashboard-admin/change-password' }
      ]
    },
    {
      key: 'system',
      label: 'ระบบ',
      icon: '🛠️',
      open: false,
      children: [
        { key: 'system', icon: '🛠️', label: 'ควบคุมระบบ', route: '/dashboard-system' },
        { key: 'documents-upload', icon: '📁', label: 'Upload เอกสาร', route: '/dashboard-admin/documents/upload' },
        { key: 'documents-forms-procedures', icon: '📋', label: 'แบบพิมพ์/วิธีปฏิบัติงานหุ้น', route: '/dashboard-admin/documents/forms-procedures' },
        { key: 'documents-user-manual', icon: '📖', label: 'คู่มือการใช้งานระบบ', route: '/dashboard-admin/documents/user-manual' },
        { key: 'developer', icon: '💻', label: 'DEVELOPER', route: '/dashboard-admin/developer' }
      ]
    }
  ];

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    private readonly loginService: Login,
    private readonly passwordStatusService: PasswordStatusService
  ) { }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  openMenu(key: string) {
    // อัพเดท state ใน menus
    this.menus = this.menus.map(menu => {
      const isTarget = menu.key === key;
      return {
        ...menu,
        open: isTarget ? !menu.open : false
      };
    });

    // อัพเดท filteredMenus ด้วย
    this.filteredMenus = this.permissionService.filterMenusByPermission(
      this.menus,
      this.currentUser.level
    );
  }


  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  // ดึงชื่อ level จาก lvlDesc
  getUserLevelName(levelCode: string): string {
    return this.userService.getUserLevelName(levelCode);
  }

  // ดึงตัวอักษรแรกของชื่อ
  getUserInitials(fullname: string): string {
    if (!fullname || fullname.trim() === '') {
      return 'U'; // Default initial
    }
    return this.userService.getInitials(fullname);
  }

  // Filter menus ตามสิทธิ์
  private filterMenusByPermission(): void {
    console.log('Filtering menus for user level:', this.currentUser.level);
    console.log('Total menus before filtering:', this.menus.length);

    this.filteredMenus = this.permissionService.filterMenusByPermission(
      this.menus,
      this.currentUser.level
    );

    console.log('Filtered menus count:', this.filteredMenus.length);
    console.log('Filtered menus:', this.filteredMenus);
  }

  // ตรวจสอบสิทธิ์ใน component
  canView(menuId: string): boolean {
    return this.permissionService.hasActionPermission(menuId, this.currentUser.level);
  }

  // ตรวจสอบสถานะรหัสผ่าน
  private checkPasswordStatus() {
    console.log('Checking password status with currentUser:', this.currentUser);
    
    // ใช้ PasswordStatusService แทนการเขียน logic ซ้ำ
    const passwordStatus: PasswordStatus = this.passwordStatusService.checkPasswordStatus(this.currentUser);
    
    // อัปเดต properties จาก service
    this.isFirstTimeUser = passwordStatus.isFirstTimeUser;
    this.isPasswordExpired = passwordStatus.isPasswordExpired;
    this.passwordExpiryDays = passwordStatus.passwordExpiryDays;
    this.passwordExpiryDate = passwordStatus.passwordExpiryDate;
    this.isDefaultPassword = passwordStatus.isDefaultPassword;
    this.isPasswordChangeRequired = passwordStatus.isPasswordChangeRequired;
    
    console.log('Password Status in Dashboard:', passwordStatus);
  }

  // แสดงเฉพาะเมนูที่จำเป็นเมื่อต้องเปลี่ยนรหัสผ่าน
  private showLimitedMenus() {
    this.filteredMenus = [
      {
        key: 'home',
        label: 'Home',
        icon: '🔑',
        open: false,
        children: [
          { key: 'change-password', icon: '🔑', label: 'Home', route: '/dashboard-admin/change-password' }
        ]
      },
      {
        key: 'contact',
        label: 'ติดต่อ',
        icon: '📞',
        open: false,
        children: [
          { key: 'contact', icon: '📞', label: 'ติดต่อ', route: '/dashboard-admin/contact' }
        ]
      },
      {
        key: 'user-manual',
        label: 'คู่มือการใช้งานระบบ',
        icon: '📖',
        open: false,
        children: [
          { key: 'user-manual', icon: '📖', label: 'คู่มือการใช้งานระบบ', route: '/dashboard-admin/documents/user-manual' }
        ]
      }
    ];
    
    // ถ้าต้องเปลี่ยนรหัสผ่าน ให้ redirect ไปหน้า change-password
    if (this.isPasswordChangeRequired) {
      this.router.navigate(['/dashboard-admin/change-password']);
    }
  }

  ngOnInit(): void {
    // ใช้ UserService เพื่อดึงข้อมูลจาก sessionStorage
    this.currentUser = this.userService.getCurrentUser();
    
    console.log('Current user in ngOnInit:', this.currentUser);

    if (this.currentUser?.level) {
      // ตรวจสอบ password status
      this.checkPasswordStatus();
      
      console.log('After checkPasswordStatus - isPasswordChangeRequired:', this.isPasswordChangeRequired);
      
      // ถ้าต้องเปลี่ยนรหัสผ่าน ให้แสดงเฉพาะเมนูที่กำหนด
      if (this.isPasswordChangeRequired) {
        console.log('Password change required, showing limited menus');
        this.showLimitedMenus();
      } else {
        console.log('No password change required, filtering menus normally');
        this.filterMenusByPermission();
      }
    } else {
      console.log('No user data or level found, redirecting to login');
      console.log('Current user data:', this.currentUser);
      this.router.navigate(['/login']);
    }
  }
}
