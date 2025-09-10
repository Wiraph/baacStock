import { Injectable } from '@angular/core';

export interface PasswordStatus {
  isFirstTimeUser: boolean;
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
   * @param userData.usr_PWDExp สถานะการหมดอายุรหัสผ่าน (0 = ไม่ต้องตรวจสอบ, >0 = ต้อง
   * @param userData.datetimeup วันที่เปลี่ยนรหัสผ่านล่าสุด
   * @returns PasswordStatus object
   */
  checkPasswordStatus(userData: any): PasswordStatus {
    if (!userData) {
      return this.getDefaultPasswordStatus();
    }

    // ตรวจสอบการใช้งานระบบครั้งแรก (DATETIMEUP เป็น null)
    const isFirstTimeUser = !userData.datetimeup || userData.datetimeup === null;
    
    let isPasswordExpired = false;
    let passwordExpiryDays = 0;
    let passwordExpiryDate: string | null = null;

    // ตรวจสอบรหัสผ่านหมดอายุ
    if (userData.usr_PWDExp === 0) {
      // ถ้า usr_PWDExp = 0 ไม่ต้องตรวจสอบรหัสผ่านหมดอายุ
      isPasswordExpired = false;
      passwordExpiryDays = 0;
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
    const isDefaultPassword = userData.currentPassword === 'baac' || userData.usrPWD === 'baac';
    
    // ตรวจสอบว่าต้องเปลี่ยนรหัสผ่านหรือไม่
    const isPasswordChangeRequired = isFirstTimeUser || isPasswordExpired || isDefaultPassword;
    
    const result: PasswordStatus = {
      isFirstTimeUser,
      isPasswordExpired,
      passwordExpiryDays,
      passwordExpiryDate,
      isDefaultPassword,
      isPasswordChangeRequired
    };

    console.log('Password Status:', {
      usr_PWDExp: userData.usr_PWDExp,
      isPasswordExpired,
      isPasswordChangeRequired
    });
    
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
        const year = parseInt(datetimeup.substring(0, 4)) - 543; // แปลงจากปี พ.ศ. เป็น ค.ศ.
        const month = parseInt(datetimeup.substring(4, 6)) - 1; // เดือนเริ่มจาก 0
        const day = parseInt(datetimeup.substring(6, 8));
        
        const lastPasswordChange = new Date(year, month, day);
        const currentDate = new Date();
        const daysDiff = Math.floor((currentDate.getTime() - lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log('Password Expiry:', {
          daysDiff,
          pwdExp,
          isExpired: daysDiff > pwdExp
        });
        
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
      isFirstTimeUser: false,
      isPasswordExpired: false,
      passwordExpiryDays: 30,
      passwordExpiryDate: null,
      isDefaultPassword: false,
      isPasswordChangeRequired: false
    };
  }
}
