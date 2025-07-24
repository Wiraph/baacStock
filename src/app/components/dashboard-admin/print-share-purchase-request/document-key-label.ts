/**
 * ค่า mapping ระหว่าง keys และ labels สำหรับฟอร์มขอซื้อหุ้น
 * 
 * ใช้สำหรับแปลง key ที่พบในเอกสาร Word เป็นชื่อที่อ่านได้
 * รองรับทั้งภาษาไทยและภาษาอังกฤษ
 * 
 * ตัวอย่างการใช้งาน:
 * getLabelForKey('branch') → 'สาขา'
 * getLabelForKey('ชื่อ-นามสกุล') → 'ชื่อ-นามสกุล'
 */
export const KEY_LABEL_MAP: { [key: string]: string } = {
  // สาขา
  'branch': 'สาขา',
  'Branch': 'สาขา',
  'สาขา': 'สาขา',

  // วันที่
  'date': 'วันที่',
  'Date': 'วันที่',
  'วันที่': 'วันที่',

  // บัตรประชาชน
  'บัตรประชาชน': 'บัตรประชาชน',
  'ID Card No.': 'บัตรประชาชน',
  'id_card': 'บัตรประชาชน',
  'idcard': 'บัตรประชาชน',

  // ชื่อ-นามสกุล
  'ชื่อ-นามสกุล': 'ชื่อ-นามสกุล',
  'ชื่อ': 'ชื่อ',
  'Name': 'ชื่อ',
  'นามสกุล': 'นามสกุล',
  'Surname': 'นามสกุล',
  'first_name': 'ชื่อ',
  'last_name': 'นามสกุล',

  // ที่อยู่
  'ที่อยู่': 'ที่อยู่',
  'บ้านเลขที่': 'บ้านเลขที่',
  'House No.': 'บ้านเลขที่',
  'หมู่': 'หมู่ที่',
  'หมู่ที่': 'หมู่ที่',
  'Village No.': 'หมู่ที่',
  'Village': 'หมู่ที่',
  'ซอย': 'ซอย',
  'Alley': 'ซอย',
  'ถนน': 'ถนน',
  'Road': 'ถนน',
  'ตำบล': 'ตำบล',
  'แขวง': 'แขวง',
  'Sub-district': 'ตำบล',
  'อำเภอ': 'อำเภอ',
  'เขต': 'เขต',
  'District': 'อำเภอ',
  'จังหวัด': 'จังหวัด',
  'Province': 'จังหวัด',
  'zipcode': 'รหัสไปรษณีย์',
  'Zipcode': 'รหัสไปรษณีย์',
  'รหัสไปรษณีย์': 'รหัสไปรษณีย์',
  'ไปรษณีย์': 'รหัสไปรษณีย์',

  // เบอร์ติดต่อ/โทรศัพท์
  'โทรศัพท์บ้าน': 'เบอร์ติดต่อ',
  'โทรศัพท์': 'เบอร์ติดต่อ',
  'โทรศัพท์มือถือ': 'เบอร์ติดต่อ',
  'เบอร์ติดต่อ': 'เบอร์ติดต่อ',
  'phone': 'เบอร์ติดต่อ',
  'Phone': 'เบอร์ติดต่อ',
  'mobile': 'เบอร์ติดต่อ',
  'Mobile': 'เบอร์ติดต่อ',

  // อีเมล
  'อีเมล': 'อีเมล',
  'email': 'อีเมล',
  'Email': 'อีเมล',

  // รหัสพนักงาน
  'รหัสพนักงาน': 'รหัสพนักงาน',
  'Employee ID': 'รหัสพนักงาน',
  'ID': 'รหัสพนักงาน',
  'employee_id': 'รหัสพนักงาน',

  // อาชีพ
  'อาชีพ': 'อาชีพ',
  'Occupation': 'อาชีพ',
  'occupation': 'อาชีพ',

  // ข้อมูลหุ้น
  'จำนวนหุ้น': 'จำนวนหุ้น',
  'จำนวน': 'จำนวนหุ้น',
  'shares': 'จำนวนหุ้น',
  'Shares': 'จำนวนหุ้น',
  'quantity': 'จำนวนหุ้น',
  'Quantity': 'จำนวนหุ้น',
  'จำนวนหุ้นที่ขอซื้อ': 'จำนวนหุ้นที่ขอซื้อ',
  'จำนวนหุ้นที่ต้องการ': 'จำนวนหุ้นที่ขอซื้อ',

  // ราคาหุ้น
  'ราคาหุ้น': 'ราคาหุ้น',
  'ราคา': 'ราคาหุ้น',
  'price': 'ราคาหุ้น',
  'Price': 'ราคาหุ้น',
  'ราคาต่อหุ้น': 'ราคาหุ้น',
  'price_per_share': 'ราคาหุ้น',

  // จำนวนเงิน
  'จำนวนเงิน': 'จำนวนเงิน',
  'amount': 'จำนวนเงิน',
  'Amount': 'จำนวนเงิน',
  'มูลค่า': 'จำนวนเงิน',
  'total_amount': 'จำนวนเงิน',
  'total': 'จำนวนเงิน',

  // ประเภทการชำระเงิน
  'ประเภทการชำระเงิน': 'ประเภทการชำระเงิน',
  'payment_type': 'ประเภทการชำระเงิน',
  'Payment Type': 'ประเภทการชำระเงิน',
  'วิธีชำระเงิน': 'ประเภทการชำระเงิน',

  // ผู้ลงนาม
  'บุคคลที่1': 'ผู้โอน',
  'Person1': 'ผู้โอน',
  'บุคคลที่2': 'ผู้รับโอน',
  'Person2': 'ผู้รับโอน',
  'ผู้ลงนาม': 'ผู้ลงนาม',
  'signature': 'ผู้ลงนาม',
  'Signature': 'ผู้ลงนาม',

  // ข้อมูลธนาคาร
  'ธนาคาร': 'ธนาคาร',
  'bank': 'ธนาคาร',
  'Bank': 'ธนาคาร',
  'เลขที่บัญชี': 'เลขที่บัญชี',
  'account_number': 'เลขที่บัญชี',
  'Account Number': 'เลขที่บัญชี',
  'ชื่อบัญชี': 'ชื่อบัญชี',
  'account_name': 'ชื่อบัญชี',
  'Account Name': 'ชื่อบัญชี',

  // ข้อมูลบริษัท
  'บริษัท': 'บริษัท',
  'company': 'บริษัท',
  'Company': 'บริษัท',
  'ชื่อบริษัท': 'ชื่อบริษัท',
  'company_name': 'ชื่อบริษัท',
  'Company Name': 'ชื่อบริษัท',

  // เลขที่เอกสาร
  'เลขที่เอกสาร': 'เลขที่เอกสาร',
  'document_number': 'เลขที่เอกสาร',
  'Document Number': 'เลขที่เอกสาร',
  'เลขที่': 'เลขที่เอกสาร',
  'number': 'เลขที่เอกสาร',

  // สถานะ
  'สถานะ': 'สถานะ',
  'status': 'สถานะ',
  'Status': 'สถานะ',
  'สถานะการอนุมัติ': 'สถานะการอนุมัติ',
  'approval_status': 'สถานะการอนุมัติ',

  // หมายเหตุ
  'หมายเหตุ': 'หมายเหตุ',
  'remark': 'หมายเหตุ',
  'Remark': 'หมายเหตุ',
  'note': 'หมายเหตุ',
  'Note': 'หมายเหตุ',
  'comments': 'หมายเหตุ',
  'Comments': 'หมายเหตุ',
};

/**
 * คำสำคัญที่เกี่ยวข้องกับวันที่
 * 
 * ใช้สำหรับตรวจสอบว่า key ใดเกี่ยวข้องกับวันที่
 * รองรับทั้งภาษาไทยและภาษาอังกฤษ
 * 
 * ตัวอย่าง:
 * isDateKey('birth_date') → true
 * isDateKey('วันที่เกิด') → true
 * isDateKey('name') → false
 */
export const DATE_KEYWORDS = [
  'date', 'วันที่', 'วัน', 'time', 'เวลา', 'period', 'ช่วงเวลา',
  'start', 'เริ่ม', 'end', 'สิ้นสุด', 'expire', 'หมดอายุ',
  'birth', 'เกิด', 'born', 'เกิด', 'dead', 'เสียชีวิต',
  'issue', 'ออก', 'publish', 'เผยแพร่', 'create', 'วันที่สร้าง',
  'submit', 'วันที่ส่ง', 'apply', 'วันที่สมัคร', 'register', 'วันที่ลงทะเบียน',
  'request_date', 'วันที่ขอ', 'application_date', 'วันที่สมัคร',
  'approval_date', 'วันที่อนุมัติ', 'effective_date', 'วันที่มีผล'
];

/**
 * คำสำคัญที่เกี่ยวข้องกับหุ้น
 * 
 * ใช้สำหรับตรวจสอบว่า key ใดเกี่ยวข้องกับหุ้น
 * รองรับทั้งภาษาไทยและภาษาอังกฤษ
 * 
 * ตัวอย่าง:
 * isStockKey('shares') → true
 * isStockKey('จำนวนหุ้น') → true
 * isStockKey('name') → false
 */
export const STOCK_KEYWORDS = [
  'stock', 'หุ้น', 'share', 'หุ้นสามัญ', 'common stock', 'หุ้นบุริมสิทธิ',
  'preferred stock', 'จำนวนหุ้น', 'shares', 'quantity', 'จำนวน',
  'ราคาหุ้น', 'price', 'มูลค่า', 'value', 'amount', 'จำนวนเงิน'
];

/**
 * คำสำคัญที่เกี่ยวข้องกับการชำระเงิน
 * 
 * ใช้สำหรับตรวจสอบว่า key ใดเกี่ยวข้องกับการชำระเงิน
 * รองรับทั้งภาษาไทยและภาษาอังกฤษ
 * 
 * ตัวอย่าง:
 * isPaymentKey('payment') → true
 * isPaymentKey('การชำระเงิน') → true
 * isPaymentKey('name') → false
 */
export const PAYMENT_KEYWORDS = [
  'payment', 'การชำระเงิน', 'ชำระ', 'pay', 'transfer', 'โอน',
  'bank', 'ธนาคาร', 'account', 'บัญชี', 'cash', 'เงินสด',
  'check', 'เช็ค', 'credit', 'เครดิต', 'debit', 'เดบิต'
];

/**
 * ฟังก์ชันสำหรับหา label จาก key
 * 
 * ใช้สำหรับแปลง key ที่พบในเอกสาร Word เป็นชื่อที่อ่านได้
 * ถ้าไม่พบ key ใน KEY_LABEL_MAP จะส่งคืน key เดิม
 * 
 * @param key - key ที่พบในเอกสาร Word
 * @returns label ที่อ่านได้ หรือ key เดิมถ้าไม่พบ
 * 
 * ตัวอย่างการใช้งาน:
 * getLabelForKey('branch') → 'สาขา'
 * getLabelForKey('ชื่อ-นามสกุล') → 'ชื่อ-นามสกุล'
 * getLabelForKey('unknown_key') → 'unknown_key'
 */
export function getLabelForKey(key: string): string {
  return KEY_LABEL_MAP[key] || key;
}

/**
 * ฟังก์ชันสำหรับตรวจสอบว่าเป็น key ที่เกี่ยวข้องกับวันที่หรือไม่
 * 
 * ตรวจสอบโดยดูว่า key มีคำสำคัญที่เกี่ยวข้องกับวันที่หรือไม่
 * ใช้การเปรียบเทียบแบบ case-insensitive
 * 
 * @param key - key ที่ต้องการตรวจสอบ
 * @returns true ถ้าเกี่ยวข้องกับวันที่, false ถ้าไม่เกี่ยวข้อง
 * 
 * ตัวอย่างการใช้งาน:
 * isDateKey('birth_date') → true
 * isDateKey('วันที่เกิด') → true
 * isDateKey('name') → false
 * isDateKey('BIRTH_DATE') → true (case-insensitive)
 */
export function isDateKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return DATE_KEYWORDS.some(keyword => lowerKey.includes(keyword.toLowerCase()));
}

/**
 * ฟังก์ชันสำหรับตรวจสอบว่าเป็น key ที่เกี่ยวข้องกับหุ้นหรือไม่
 * 
 * ตรวจสอบโดยดูว่า key มีคำสำคัญที่เกี่ยวข้องกับหุ้นหรือไม่
 * ใช้การเปรียบเทียบแบบ case-insensitive
 * 
 * @param key - key ที่ต้องการตรวจสอบ
 * @returns true ถ้าเกี่ยวข้องกับหุ้น, false ถ้าไม่เกี่ยวข้อง
 * 
 * ตัวอย่างการใช้งาน:
 * isStockKey('shares') → true
 * isStockKey('จำนวนหุ้น') → true
 * isStockKey('name') → false
 * isStockKey('SHARES') → true (case-insensitive)
 */
export function isStockKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return STOCK_KEYWORDS.some(keyword => lowerKey.includes(keyword.toLowerCase()));
}

/**
 * ฟังก์ชันสำหรับตรวจสอบว่าเป็น key ที่เกี่ยวข้องกับการชำระเงินหรือไม่
 * 
 * ตรวจสอบโดยดูว่า key มีคำสำคัญที่เกี่ยวข้องกับการชำระเงินหรือไม่
 * ใช้การเปรียบเทียบแบบ case-insensitive
 * 
 * @param key - key ที่ต้องการตรวจสอบ
 * @returns true ถ้าเกี่ยวข้องกับการชำระเงิน, false ถ้าไม่เกี่ยวข้อง
 * 
 * ตัวอย่างการใช้งาน:
 * isPaymentKey('payment') → true
 * isPaymentKey('การชำระเงิน') → true
 * isPaymentKey('name') → false
 * isPaymentKey('PAYMENT') → true (case-insensitive)
 */
export function isPaymentKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return PAYMENT_KEYWORDS.some(keyword => lowerKey.includes(keyword.toLowerCase()));
} 