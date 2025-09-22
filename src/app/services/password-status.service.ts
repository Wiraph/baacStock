import { Injectable } from '@angular/core';

export interface PasswordStatus {
  isPasswordExpired: boolean;
  passwordExpiryDays: number;
  passwordExpiryDate: string | null;
  isDefaultPassword: boolean;
  isPasswordChangeRequired: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PasswordStatusService {

  constructor() { }

  /**
   * ตรวจสอบสถานะรหัสผ่านจากข้อมูลผู้ใช้
   * @param userData ข้อมูลผู้ใช้จาก sessionStorage หรือ API
   * @param userData.usr_PWDExp สถานะการหมดอายุรหัสผ่าน (0 = ไม่ต้องตรวจสอบ, >0 = ต้องตรวจสอบ)
   * @param userData.datetimeup วันที่เปลี่ยนรหัสผ่านล่าสุด
   * @returns PasswordStatus object
   */
  checkPasswordStatus(userData: any): PasswordStatus {
    if (!userData) {
      return this.getDefaultPasswordStatus();
    }

    let isPasswordExpired = false;
    let passwordExpiryDays = 0;
    let passwordExpiryDate: string | null = null;
    const noPasswordChangeDate = !userData.datetimeup || userData.datetimeup === null || userData.datetimeup === '';

    // ตรวจสอบรหัสผ่านหมดอายุ
    if (userData.usr_PWDExp === 0) {
      // ถ้า usr_PWDExp = 0 ไม่ต้องตรวจสอบรหัสผ่านหมดอายุ
    } else if (userData.usr_PWDExp > 0 && userData.pwdExp && userData.datetimeup) {
      // ถ้า usr_PWDExp > 0 ตรวจสอบรหัสผ่านหมดอายุ
      passwordExpiryDays = userData.pwdExp;
      passwordExpiryDate = userData.datetimeup;
      
      // คำนวณวันที่หมดอายุ
      isPasswordExpired = this.calculatePasswordExpiry(userData.datetimeup, userData.pwdExp);
    } else if (!userData.pwdExp) {
      // ถ้าไม่มี pwdExp ให้ใช้ค่า default 60 วัน
      passwordExpiryDays = 60;
    }
    
    // ตรวจสอบรหัสผ่านเริ่มต้น (baac)
    // ถ้าไม่มีวันที่เปลี่ยนรหัสผ่าน (datetimeup ว่าง) ให้ถือว่าใช้รหัสผ่านเริ่มต้น/ยังไม่เคยเปลี่ยน
    const isDefaultPassword = userData.usrPWD === 'baac' || noPasswordChangeDate;
    
    // ตรวจสอบว่าต้องเปลี่ยนรหัสผ่านหรือไม่
    const isPasswordChangeRequired = isPasswordExpired || isDefaultPassword;
    
    const result: PasswordStatus = {
      isPasswordExpired,
      passwordExpiryDays,
      passwordExpiryDate,
      isDefaultPassword,
      isPasswordChangeRequired
    };

    
    
    return result;
  }

  /**
   * คำนวณว่ารหัสผ่านหมดอายุหรือไม่
   * @param datetimeup วันที่เปลี่ยนรหัสผ่านล่าสุด
   * @param pwdExp จำนวนวันที่รหัสผ่านหมดอายุ
   * @returns true ถ้ารหัสผ่านหมดอายุ
   */
  private calculatePasswordExpiry(datetimeup: string, pwdExp: number): boolean {
    if (!datetimeup || !pwdExp) return false;

    try {
      if (datetimeup.length >= 8) {
        const yearBE = parseInt(datetimeup.substring(0, 4));
        const month = parseInt(datetimeup.substring(4, 6)) - 1; // เดือนเริ่มจาก 0
        const day = parseInt(datetimeup.substring(6, 8));
        
        // วันที่เปลี่ยนรหัสผ่าน (พ.ศ.)
        const lastPasswordChangeBE = new Date(yearBE, month, day);
        // วันที่ปัจจุบันใน พ.ศ. (แปลงปี ค.ศ. เป็น พ.ศ. โดย +543)
        const currentCE = new Date();
        const currentBE = new Date(currentCE.getFullYear() + 543, currentCE.getMonth(), currentCE.getDate());
        const daysDiff = Math.floor((currentBE.getTime() - lastPasswordChangeBE.getTime()) / (1000 * 60 * 60 * 24));
        
        
        
        return daysDiff > pwdExp;
      }
    } catch (error) {
      console.error('Error calculating password expiry:', error);
    }
    
    return false;
  }

  /**
   * สร้าง PasswordStatus default
   */
  private getDefaultPasswordStatus(): PasswordStatus {
    return {
      isPasswordExpired: false,
      passwordExpiryDays: 30,
      passwordExpiryDate: null,
      isDefaultPassword: false,
      isPasswordChangeRequired: false
    };
  }
}
