/**
 * Utility functions for browser environment detection and sessionStorage handling
 */

export class BrowserUtils {
  /**
   * ตรวจสอบว่าอยู่ใน browser environment หรือไม่
   */
  static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * ตรวจสอบว่า sessionStorage พร้อมใช้งานหรือไม่
   */
  static isSessionStorageAvailable(): boolean {
    return this.isBrowser() && !!window.sessionStorage;
  }

  /**
   * ดึงข้อมูลจาก sessionStorage อย่างปลอดภัย
   * @param key - key ของข้อมูล
   * @param defaultValue - ค่าเริ่มต้นถ้าไม่มีข้อมูล
   */
  static getSessionStorageItem(key: string, defaultValue: string = ''): string {
    if (this.isSessionStorageAvailable()) {
      return sessionStorage.getItem(key) || defaultValue;
    }
    return defaultValue;
  }

  /**
   * บันทึกข้อมูลลง sessionStorage อย่างปลอดภัย
   * @param key - key ของข้อมูล
   * @param value - ค่าที่ต้องการบันทึก
   */
  static setSessionStorageItem(key: string, value: string): void {
    if (this.isSessionStorageAvailable()) {
      sessionStorage.setItem(key, value);
    }
  }

  /**
   * ลบข้อมูลจาก sessionStorage อย่างปลอดภัย
   * @param key - key ของข้อมูล
   */
  static removeSessionStorageItem(key: string): void {
    if (this.isSessionStorageAvailable()) {
      sessionStorage.removeItem(key);
    }
  }

  /**
   * ล้างข้อมูลทั้งหมดใน sessionStorage อย่างปลอดภัย
   */
  static clearSessionStorage(): void {
    if (this.isSessionStorageAvailable()) {
      sessionStorage.clear();
    }
  }

  /**
   * ดึง token จาก sessionStorage อย่างปลอดภัย
   */
  static getToken(): string {
    return this.getSessionStorageItem('token', '');
  }

  /**
   * ตรวจสอบว่ามี token หรือไม่
   */
  static hasToken(): boolean {
    return !!this.getToken();
  }
}
