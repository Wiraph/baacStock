## Services Overview

สรุปบริการทั้งหมดใน `src/app/services/` ครอบคลุมจุดประสงค์ Base URL เมธอดหลัก Payload มาตรฐานเข้ารหัส และหมายเหตุสำคัญ เพื่อให้อ้างอิงการเชื่อมต่อ backend ได้สะดวกและสอดคล้องมาตรฐานของโปรเจกต์

### มาตรฐานร่วม

- เข้ารหัส payload ก่อนส่งด้วย `EncryptionService.encrypPayload(payload)` สำหรับ POST ที่เป็นข้อมูลธุรกรรม/ค้นหา
- ใช้ `withCredentials: true` เพื่อส่ง cookie ตาม `authInterceptor`
- เมื่อจำเป็นต้องใช้ Bearer token ให้สร้างผ่าน `createAuthHeaders()` จาก `sessionStorage.token`
- ไฟล์ดาวน์โหลดใช้ `responseType: 'blob'` และจัดการ ObjectURL ให้เรียบร้อย

---



## Metadata

กลุ่มบริการ metadata ใช้สำหรับโหลดข้อมูลอ้างอิง (เช่น จังหวัด ประเภทบัญชี คำนำหน้า) เพื่อใช้ในฟอร์มและการคัดกรองข้อมูล

### SystemMetadata

- Base: `${environment.dotnetApiUrl}/api/SystemMetadata`
- Endpoints: GET `/syscfg`, `/remcode`, `/data`; POST `/brprv`, `/brbranch`

### StockMetadata

- Base: `${environment.dotnetApiUrl}/api/StockMetadata`
- Endpoints: GET `/stktypes`, `/acctypes`

### CustomerMetadata

- Base: `${environment.dotnetApiUrl}/api/CustomerMetadata`
- Endpoints: GET `/custypes`, `/doctypes`, `/titles`, `/cuscodeg`

### AddressMetadata

- Base: `${environment.dotnetApiUrl}/api/AddressMetadata`
- Endpoints: GET `/provinces`; POST `/aumphors`, `/tumbons`

---



### UserService

- Base: `${environment.dotnetApiUrl}/api/user`
- Endpoints:
  - GET `/getallusers`
  - POST `/getuserbyid` payload: `{ UserId }`
  - POST `/controlleraction` payload: `{ UserId, brc, Act }`
  - POST `/changepassword` payload: `{ userId, pwdO, newPwd, userDesc }`
  - POST `/adduser` payload: ข้อมูลผู้ใช้ใหม่
- Notes: มี helper จัดการ session หลัง login

### Login

- Base: `${environment.dotnetApiUrl}/api/auth`
- Endpoints:
  - POST `/login` payload: `{ Username, Password }` (เข้ารหัส)
  - GET `/me`

### CustomerService

- Base: `${environment.dotnetApiUrl}/api/Customer`
- Endpoints:
  - POST `/detailcus` payload: `{ CUSid }`
  - POST `/customer` payload: `{ cusId }`
  - POST `/search` payload: คีย์ค้นหาลูกค้า/ใบหุ้น
  - POST `/cusmanage` payload: รวมข้อมูลลูกค้า/ที่อยู่/ปันผล/ACT
  - POST `/customer2tr` payload: `{ cusId }` (ข้อมูลโอน)
  - POST `/create` payload: ผู้ถือหุ้นใหม่
- Notes: ควรลบ console ภายใน `createNewShareholder`

### AddressService

- Base: `${environment.dotnetApiUrl}/api/Address`
- Endpoints:
  - POST `/address` payload: `{ cusId }` → `{ homeAddress, currentAddress }`

### StockService

- Base: `${environment.dotnetApiUrl}/api/Stock`
- Endpoints:
  - POST `/manage`, `/stkdetail`, `/stklost`, `/transfer`, `/block`, `/approvedetail`
  - POST `/pdf` → Blob, `/excel` → Blob
  - POST `/filestocksale`, `/stkpay`

### Stocklost

- Base: `${environment.dotnetApiUrl}/api/StockLost`
- Endpoints:
  - POST `/createstocklostlist`, `/stocklost`
- Notes: ใช้ Bearer token headers; ลบ console ใน `getListStkLost`

### StockBlockService

- Base: `${environment.dotnetApiUrl}/api/StockBlock`
- Endpoints:
  - PUT `/block/{stkNote}` (auth headers)
- Notes: ตรวจสอบ backend ว่าไม่ต้องการ body

### StocktransferService

- Base: `${environment.dotnetApiUrl}/api/stocktransfer`
- Endpoints:
  - POST `/transfer` payload: รายการโอน (เข้ารหัส) ใช้ Bearer token headers

### Divident

- Base: `${environment.dotnetApiUrl}/api/Dividend`
- Endpoints:
  - POST `/dividend`, `/dividends`, `/dividendlist`, `/detailperperson`, `/2pay`
  - DELETE `/removedividend`
  - GET `/voucher` → Blob, GET `/print` → Blob
  - GET `/stkyear`

### Reports

- Base: `${environment.dotnetApiUrl}/api/Report`
- Endpoints:
  - POST `/approve-report` → Blob
  - POST `/stock-report-menu{3..8,9,10,11,12,14,15,16,21}`, `/stockholder`, `/stk310`, `/list14`

### Sap

- Base: `${environment.dotnetApiUrl}/api/SapExport`
- Endpoints:
  - GET `/generate`, GET `/list`
  - POST `/download` payload: `{ fileName }` → Blob
  - POST `/StockMovement` payload: `{ dateArg }` → `{ file, url }`

### Spin

- Base: `${environment.dotnetApiUrl}/api/Spin`
- Endpoints:
  - POST `/createspindat` (ว่างเปล่า `{}`)
  - POST `/listspin` (เข้ารหัส)
  - POST `/download` (เข้ารหัส) → Blob
  - POST `/uploadout` (เข้ารหัส)
- Notes: ลบ console ใน `downloadSpinFile`

### Pnd

- Base: `${environment.dotnetApiUrl}/api/pndreport`
- Endpoints:
  - POST `/list`, `/pndx`, `/generate`
  - POST `/check` (array ชื่อไฟล์)
  - POST `/download` → Blob, POST `/downloadExcel` → Blob

### FileService

- Base: `${environment.dotnetApiUrl}/api/File`
- Endpoints:
  - POST `/upload` FormData (reportProgress)
  - GET `/list`
  - GET `/download/{fileName}` → Blob
  - DELETE `/delete/{fileName}`

### PdfService

- Endpoint: POST `${environment.dotnetApiUrl}/api/pdf/generate` → Blob (Bearer token)

### ApproveService

- Base: `${environment.dotnetApiUrl}/api/approve`
- Endpoints:
  - POST `/stktransai` (รายการรออนุมัติ)
  - POST `/confirm` (ยืนยันอนุมัติ/ยกเลิก)

### Reports/PDF usage tips

- สำหรับ Blob ให้ตรวจสอบชนิดและข้อความผิดพลาดจาก server โดยอ่าน `FileReader` เมื่อ error เป็น Blob

### PermissionService

- เป้าหมาย: กำหนดสิทธิ์การเข้าถึงเมนู/เมนูย่อย และฟังก์ชันกรองเมนูตามระดับผู้ใช้
- เมธอดเด่น: `hasMenuPermission`, `hasSystemMenuPermission`, `hasActionPermission`, `filterMenusByPermission`, `filterSystemMenusByPermission`, `hasEditPermission`
- หมายเหตุ: ไม่มี HTTP เรียก API

### PasswordStatusService

- เป้าหมาย: คำนวณสถานะรหัสผ่านจากข้อมูลผู้ใช้ (หมดอายุ/รหัสเริ่มต้น/ต้องเปลี่ยน)
- เมธอดเด่น: `checkPasswordStatus(userData)`, ผลลัพธ์ `{ isPasswordExpired, passwordExpiryDays, passwordExpiryDate, isDefaultPassword, isPasswordChangeRequired }`
- หมายเหตุ: ไม่มี HTTP เรียก API

### DataTransfer

- เป้าหมาย: เก็บสถานะชั่วคราวระหว่างคอมโพเนนต์ (`stkNote`, `status`, `pageStatus`)
- เมธอด: `set/getStkNote`, `set/getStatus`, `set/getPageStatus`
- หมายเหตุ: ไม่มี HTTP เรียก API

### EncryptionService

- เป้าหมาย: เข้ารหัส payload ด้วย AES-CBC ก่อนส่งไป backend
- เมธอด: `encrypPayload(payload)` → `{ data: string, iv: string }`
- หมายเหตุ: ใช้ `environment.encryptionKey`

### Auth Interceptor

- ฟังก์ชัน: ตั้ง `withCredentials: true` ให้ทุกคำขอ HTTP
- ไฟล์: `auth-interceptor.ts`

### JwtDecoder

- เป้าหมาย: ถอดรหัส JWT ฝั่ง client สำหรับอ่าน payload
- เมธอด: `decodeToken(token)` → object
- หมายเหตุ: ไม่มี HTTP เรียก API

### SignatureService

- Base: `${environment.dotnetApiUrl}/api/Signature`
- Endpoints:
  - GET `/` รายการลายเซ็น
  - POST `/create` payload: ข้อมูลลายเซ็น (เข้ารหัส)
  - POST `/update` payload: ข้อมูลลายเซ็น (เข้ารหัส)
  - POST `/delete` payload: คีย์ระบุรายการ (เข้ารหัส)

### CustomerStockService

- Base: `https://localhost:7089/api/CustomerStock` (เฉพาะเครื่องนักพัฒนา)
- Endpoints:

  - POST `/search` payload: เงื่อนไขค้นหา (เข้ารหัส) ใช้ Bearer token header
