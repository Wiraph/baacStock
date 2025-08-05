import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import {
  trigger, transition, style, animate
} from '@angular/animations';
import { UserService } from '../../services/user';
import { PermissionService } from '../../services/permission.service';

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

  menus: MenuItem[] = [
    {
      key: 'home',
      label: 'แผงควบคุม',
      icon: '📑',
      open: false,
      children: [
        { key: 'home', icon: '🏠', label: 'Home', route: '/dashboard-admin/' },
        { key: 'contact', icon: '📞', label: 'ติดต่อ', route: '/dashboard-admin/contact' },
        { key: 'search-edit', icon: '🔎', label: 'ค้นหา/แก้ไข', route: '/dashboard-admin/search-edit' }
      ]
    },
    {
      key: 'sales',
      label: 'การขายและใบหุ้น',
      icon: '📊',
      open: false,
      children: [
        { key: 'print-share-purchase-request', icon: '🛒', label: 'พิมพ์คำขอซื้อหุ้น', route: '/dashboard-admin/print-share-purchase-request' },
        { key: 'common-shares', icon: '😶‍🌫️', label: 'ขายหุ้นสามัญ', route: '/dashboard-admin/common-shares' },
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
<<<<<<< HEAD
        { icon: '💰', label: 'เงินปันผล', route: '/dashboard-admin/dividend' },
        { icon: '📊', 
          label: 'ภ.ง.ด.', 
          route: '',
          submenu: [
            { icon: '📄', label: 'ภ.ง.ด. 2', route: '/dashboard-admin/pnd2' },
            { icon: '📋', label: 'ภ.ง.ด. 2 ก', route: '/dashboard-admin/pnd2a' },
            { icon: '📊', label: 'ภ.ง.ด. 53', route: '/dashboard-admin/pnd53' }
          ]
        }
=======
        { key: 'dividend', icon: '💰', label: 'เงินปันผล', route: '/dashboard-admin/dividend' },
        { key: 'pnd', icon: '📊', label: 'ภ.ง.ด.', route: '', 
          submenu: [
          { key: 'pnd2', icon: '📄', label: 'ภ.ง.ด. 2', route: '/dashboard-admin/pnd2' },
          { key: 'pnd2a', icon: '📋', label: 'ภ.ง.ด. 2 ก', route: '/dashboard-admin/pnd2a' },
          { key: 'pnd53', icon: '📊', label: 'ภ.ง.ด. 53', route: '/dashboard-admin/pnd53' }
        ]}
>>>>>>> develop
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
        { key: 'system', icon: '🛠️', label: 'ควบคุมระบบ', route: '/dashboard-admin/system' },
        { key: 'documents-upload', icon: '📘', label: 'Upload เอกสาร', route: '/dashboard-admin/documents/upload' },
        { key: 'documents-forms-procedures', icon: '📋', label: 'แบบพิมพ์/วิธีปฏิบัติงานหุ้น', route: '/dashboard-admin/documents/forms-procedures' },
        { key: 'documents-user-manual', icon: '📖', label: 'คู่มือการใช้งานระบบ', route: '/dashboard-admin/documents/user-manual' },
        { key: 'developer', icon: '💻', label: 'DEVELOPER', route: '/dashboard-admin/developer' }
      ]
    }
  ];

  constructor(
    private router: Router,
    private userService: UserService,
    private permissionService: PermissionService
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
    return this.userService.getInitials(fullname);
  }

  // Filter menus ตามสิทธิ์
  private filterMenusByPermission(): void {
    this.filteredMenus = this.permissionService.filterMenusByPermission(
      this.menus, 
      this.currentUser.level
    );
  }

  // ตรวจสอบสิทธิ์ใน component
  canView(menuId: string): boolean {
    return this.permissionService.hasActionPermission(menuId, this.currentUser.level);
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/login']);
      } else {
        this.currentUser = this.userService.getCurrentUser();
        
        this.filterMenusByPermission();
      }
    }
  }
}
