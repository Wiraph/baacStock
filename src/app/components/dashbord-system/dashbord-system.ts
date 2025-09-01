import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
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
  selector: 'app-dashbord-system',
  templateUrl: './dashbord-system.html',
  styleUrls: ['./dashbord-system.css'],
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
        { key: 'home', icon: '🏠', label: 'Home', route: '/dashboard-system/' },
        { key: 'contact', icon: '📞', label: 'ติดต่อ', route: '/dashboard-system/contact' },
      
      ]},
    {
      key: 'system-conditions',
      label: 'กำหนดเงื่อนไขระบบงาน',
      icon: '📊',
      open: false,
      children: [
        { key: 'print-share-purchase-request', icon: '🛒', label: 'กำหนดเงื่อนไขระบบงาน ', route: '/dashboard-admin/print-share-purchase-request' }
      
      ]},
      {
        key: 'reference-file',
        label: 'แฟ้มอ้างอิง',
        icon: '📊',
        open: false,
        children: [
          { key: 'print-share-purchase-request', icon: '🛒', label: 'พิมพ์คำขอซื้อหุ้น', route: '/dashboard-admin/print-share-purchase-request' }
        
        ]},
    {
      key: 'back-to-main',
      label: 'กลับเมนูหลัก',
      icon: '💰',
      open: false,
      children: [
        { key: 'dividend', icon: '💰', label: 'เงินปันผล', route: '/dashboard-admin/dividend' },
        { key: 'dividend', icon: '😵‍💫', label: 'คำนวณเงินปันผลประจำปี', route: '/dashboard-admin/AnnualDividendCalculatorComponent' },
      
      ]}
  ];

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService
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
