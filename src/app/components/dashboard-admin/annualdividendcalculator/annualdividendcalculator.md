### AnnualdividendcalculatorComponent

- **Path**: `src/app/components/dashboard-admin/annualdividendcalculator/annualdividendcalculator.ts`
- **Template**: `src/app/components/dashboard-admin/annualdividendcalculator/annualdividendcalculator.html`
- **Styles**: `src/app/components/dashboard-admin/annualdividendcalculator/annualdividendcalculator.css`
- **Service**: `src/app/services/divident.ts`

### การทำงาน

หน้าจอสำหรับคำนวณ/อนุมัติเงินปันผลประจำปี และดูรายละเอียดการจ่าย

- โหมดคำนวณ (DOCAL) / คำนวณใหม่ (RECAL) / อนุมัติ (APPRV)
- ดูตารางรายละเอียดแบบแบ่งหน้า + เปิดรายละเอียดรายบุคคล (Dialog)
- ดาวน์โหลด/พิมพ์ Voucher (ไฟล์จาก Backend) และ Export Excel

### การใช้งาน

```html
<app-annualdividendcalculator></app-annualdividendcalculator>
```

### State หลัก

- `activeView: '' | 'data' | 'tables'`
- `loading: boolean`
- `dividend: any` ข้อมูลสรุปรอบปี (เช่น `stkYEARc`, `stkTIME`, `stkRATE`, `dateMEET`, `datePAiD`, `dateAPPROVE`)
- `dividendDesc: string` ข้อความ “( ก่อน/หลังการอนุมัติ )”
- `dataForm: { year: string|null; time: number|null; dividend: number|null }`
- วันที่: `selectedDateMeet: Date|null`, `selectedDatePaid: Date|null`
- ตาราง: `dividendList: any[]`, `pageNumber/pageSize/length/pageSizeOptions`
- รายบุคคล (Dialog): `dividendOwner: any[]`

### ฟลว์หลักของหน้า

1) `ngOnInit()` → เรียก `calDividend()` โหลดข้อมูลปัจจุบันของรอบปี
2) `submit(doACT)`
   - ตรวจข้อมูลเมื่อ `doACT === 'DOCAL'`
   - แสดงยืนยัน → ถ้า OK
     - `RECAL` → `deleteDividendLST()` แล้ว `ngOnInit()`
     - อย่างอื่น → `calDividend(doACT, payload)`
3) `showDetail(pgNum, pgSize, year)` → เปิดมุมมอง `tables` และโหลดรายการแบบแบ่งหน้า
4) `showDividendPer(item)` → โหลดรายละเอียดรายบุคคลแล้วเปิด Dialog
5) Export/Print → เรียกไฟล์จาก Backend (Blob)

### Validation (ตอนคำนวณ DOCAL)

- `year` ต้องเป็นปี พ.ศ. 4 หลัก (ตัวเลข)
- `time` เป็นตัวเลข
- `dividend` เป็นตัวเลข
- ถ้าไม่ผ่าน แสดง SweetAlert รายการข้อผิดพลาด

### การเชื่อมต่อ API (ผ่าน Divident service)

ไฟล์บริการ: `src/app/services/divident.ts` (base: `${environment.dotnetApiUrl}/api/Dividend`)

- POST `/dividends` — โหลด/คำนวณข้อมูลรวม

  - DOCAL payload
    ```ts
    {
      setAct: 2,                 // DOCAL
      stkYear: dataForm.year,
      stkTime: Number(dataForm.time),
      stkRate: Number(dataForm.dividend),
      dateMeet: formatDatetoString(selectedDateMeet), // YYYYMMDD (พ.ศ.)
      datePaid: formatDatetoString(selectedDatePaid)
    }
    ```
  - APPRV payload
    ```ts
    { setAct: 3, stkYear: dataForm.year, stkTime: null, stkRate: null, dateMeet: null, datePaid: null }
    ```
- DELETE `/removedividend` — ลบผลคำนวณก่อนหน้า (RECAL)
- POST `/dividendlist` — โหลดรายการแบบแบ่งหน้า

  ```ts
  { year: string, pgNum: number, pgSize: number }
  ```
- POST `/detailperperson` — รายละเอียดรายบุคคลสำหรับ Dialog

  ```ts
  { stkOWNiD: string }
  ```
- GET `/voucher` — ดาวน์โหลด Voucher (Blob)
- GET `/print` — ไฟล์สำหรับสั่งพิมพ์ (Blob)

### ฟังก์ชันสำคัญในคอมโพเนนต์

- `submit(doACT)` — ตัดสินใจ DOCAL/RECAL/APPRV และเรียก API ที่เหมาะสม
- `calDividend(doact?, payload?)` — โหลด/คำนวณและตั้งค่า state เพื่อแสดงผล
- `showDetail(pgNum, pgSize, year)` — ตารางแบบแบ่งหน้า (ตั้ง `dividendList`, `length`)
- `showDividendPer(item)` — โหลดรายการรายบุคคลและเปิด Dialog
- `exportExcel()` — ดึงข้อมูลทั้งหมดและสร้างไฟล์ Excel
- `exportPDF()`/`printPDF()` — โหลดไฟล์จาก Backend แล้วเปิด/พิมพ์

### ส่วนแสดงผล (Template)

- โหมด `data`: สรุปปี/ครั้ง/อัตรา + ปุ่ม DOCAL/RECAL/APPRV หรือ Print/Voucher
- โหมด `tables`: ตารางรายละเอียด + paginator + Dialog รายบุคคล
- Overlay Loading: ปิดเมื่อสำเร็จ/ล้มเหลวทุกกรณี

### ไฟล์ที่เกี่ยวข้อง

- คอมโพเนนต์: `.ts / .html / .css`, `popup.html` (Dialog รายบุคคล)
- บริการ: `services/divident.ts`
- คอนฟิก: `environments/environment.ts` (`dotnetApiUrl`)
