import { Injectable } from '@angular/core';

export interface SubMenuPermission {
  id: string;
  name: string;
  levels: string[];   
}

export interface MenuPermission {
  key: string;
  levels: string[];
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  // Menu permissions (เมนูหลัก)
  private menuPermissions: { [key: string]: MenuPermission } = {
    'home': { 
      key: 'home',
      levels: ['99','98','90', '89', '85', '80', '50', '20', '19', '10', '09', '05', '00'],
      description: 'แผงควบคุม'
    },
    'sales': { 
      key: 'sales',
      levels: ['99', '89', '85', '80', '19', '10', '09', '05', '00'],
      description: 'การขายและใบหุ้น'
    },
    'financial': { 
      key: 'financial',
      levels: ['99', '89', '85', '80', '20', '09', '05', '00'],
      description: 'การเงิน'
    },
    'spin-file': { 
      key: 'spin-file',
      levels: ['99', '98', '89', '85', '80'],
      description: 'SCB SPIN FILE'
    },
    'report': { 
      key: 'report',
      levels: ['99', '89', '85', '80', '09', '05', '00'],
      description: 'รายงาน'
    },
    'user': { 
      key: 'user',
      levels: ['99','98','90', '89', '85', '80', '50', '20', '19', '10', '09', '05', '00'],
      description: 'ผู้ใช้งาน'
    },
    'system': { 
      key: 'system',
      levels: ['99','98','90', '89', '85', '80', '50', '20', '19', '10', '09', '05', '00'],
      description: 'ระบบ'
    }
  };

  // Sub-menu permissions (เมนูย่อย)
  private subMenuPermissions: { [key: string]: SubMenuPermission } = {
    'home': {
      id: 'home',
      name: 'Home',
      levels: ['99', '98', '90', '89', '85', '80', '50', '20', '19', '10', '09', '05', '00']
    },
    'contact': {
      id: 'contact',
      name: 'ติดต่อ',
      levels: ['99', '98', '90', '89', '85', '80', '50', '20', '19', '10', '09', '05', '00']
    },
    'search-edit': {
      id: 'search-edit',
      name: 'ค้นหา/แก้ไข',
      levels: ['99', '98', '90', '89', '85', '80', '50', '20', '19', '10', '09', '05', '00']
    },
    'print-share-purchase-request': {
      id: 'print-share-purchase-request',
      name: 'พิมพ์คำขอซื้อหุ้น',
      levels: ['99', '89', '85', '80', '19', '10', '09', '05', '00']
    },
    'common-shares': {
      id: 'common-shares',
      name: 'ขายหุ้นสามัญ',
      levels: ['99', '89', '85', '80', '19', '10', '00']
    },
    'cratenewsharecertificate': {
      id: 'cratenewsharecertificate',
      name: 'การออกใบหุ้นใหม่ แทนใบหุ้นที่ชำรุด/สูญหาย',
      levels: ['99', '89', '85', '80', '19', '10', '00']
    },
    'transfer-share': {
      id: 'transfer-share',
      name: 'โอนเปลี่ยนมือ',
      levels: ['99', '89', '85', '80', '19', '10', '00']
    },
    'approve-item': {
      id: 'approve-item',
      name: 'อนุมัติรายการ',
      levels: ['99', '89', '85', '80', '09', '05']
    },
    'approve-issue': {
      id: 'approve-issue',
      name: 'อนุมัติออกใบหุ้น',
      levels: ['99', '89', '85', '80']
    },
    'print-certificates': {
        id: 'print-certificates',
        name: 'พิมพ์ใบหุ้น',
        levels: ['99', '89', '85', '80']
    },
    'block-certificates': {
      id: 'block-certificates',
      name: 'บล็อค/ยกเลิกบล็อค ใบหุ้น',
      levels: ['99', '89', '85', '80']
    },
    'dividend': {
      id: 'dividend',
      name: 'เงินปันผล',
      levels: ['99', '89', '85', '80', '09', '05', '00']
    },
    'pnd': {
      id: 'pnd',
      name: 'ภ.ง.ด.',
      levels: ['99', '89', '85', '80', '20']
    },
    'pnd2': {
      id: 'pnd2',
      name: 'ภ.ง.ด. 2',
      levels: ['99', '89', '85', '80', '20']
    },
    'pnd2a': {
      id: 'pnd2a',
      name: 'ภ.ง.ด. 2 ก',
      levels: ['99', '89', '85', '80', '20']
    },
    'pnd53': {
      id: 'pnd53',
      name: 'ภ.ง.ด. 53',
      levels: ['99', '89', '85', '80', '20']
    },
    'create-spin-files': {
      id: 'create-spin-files',
      name: 'สร้าง SPIN FILE ส่ง SCB',
      levels: ['99', '89', '85', '80']
    },
    'spin-files': {
      id: 'spin-files',
      name: 'รับผล SPIN FILE จาก SCB',
      levels: ['99', '89', '85', '80']
    },
    'reports': {
      id: 'reports',
      name: 'รายงาน',
      levels: ['99', '89', '85', '80', '09', '05', '00']
    },
    'users': {
      id: 'users',
      name: 'รายชื่อผู้ใช้งาน',
      levels: ['99', '89', '09', '05']
    },
    'change-password': {
      id: 'change-password',
      name: 'เปลี่ยนรหัสผ่าน',
      levels: ['99', '98', '90', '89', '85', '80', '50', '20', '19', '10', '09', '05', '00']
    },
    'system': {
      id: 'system',
      name: 'ควบคุมระบบ',
      levels: ['99', '89', '85']
    },
    'documents': {
      id: 'documents',
      name: 'เอกสาร',
      levels: ['99', '89', '85', '80']
    },
    'documents-upload': {
      id: 'documents-upload',
      name: 'Upload เอกสาร',
      levels: ['99', '89', '85', '80']
    },
    'documents-forms-procedures': {
      id: 'documents-forms-procedures',
      name: 'แบบพิมพ์ / วิธีปฏิบัติงานหุ้น',
      levels: ['99','98','90', '89', '85', '80', '50', '20', '19', '10', '09', '05', '00']
    },
    'documents-user-manual': {
      id: 'documents-user-manual',
      name: 'คู่มือการใช้งานระบบ',
      levels: ['99','98','90', '89', '85', '80', '50', '20', '19', '10', '09', '05', '00']
    },
    'developer': {
      id: 'developer',
      name: 'DEVELOPER',
      levels: ['99', '89']
    }
  };

  // ตรวจสอบสิทธิ์เมนูหลัก
  hasMenuPermission(menuKey: string, userLevel: string): boolean {
    const menuConfig = this.menuPermissions[menuKey];
    return menuConfig?.levels.includes(userLevel) || false;
  }

  // ตรวจสอบสิทธิ์ 
  hasActionPermission(menuId: string, userLevel: string): boolean {
    const menuConfig = this.subMenuPermissions[menuId];
    if (!menuConfig) return false;
    
    return menuConfig.levels.includes(userLevel);
  }

  // Filter menus ตามสิทธิ์
  filterMenusByPermission(menus: any[], userLevel: string): any[] {
    if (!userLevel || userLevel === '') {
      return menus;
    }
    
    const filteredMenus = menus.filter(menu => {
      // ตรวจสอบ menu หลัก
      const hasMenuPermission = this.hasMenuPermission(menu.key, userLevel);
      
      if (!hasMenuPermission) {
        return false;
      }

      // ตรวจสอบ sub-menus
      menu.children = menu.children.filter((child: any) => {
        const hasViewPermission = this.hasActionPermission(child.key, userLevel);
        return hasViewPermission;
      });

      return menu.children.length > 0;
    });
    
    return filteredMenus;
  }

  // ตรวจสอบสิทธิ์การแก้ไขข้อมูล (เฉพาะ level 99, 85, 05)
  canEditData(userLevel: string): boolean {
    const allowedLevels = ['99', '85', '05'];
    return allowedLevels.includes(userLevel);
  }

  // ตรวจสอบสิทธิ์การแก้ไขข้อมูล (เฉพาะ level 99, 85, 05)
  hasEditPermission(userLevel: string): boolean {
    const allowedLevels = ['99', '85', '05'];
    return allowedLevels.includes(userLevel);
  }
} 