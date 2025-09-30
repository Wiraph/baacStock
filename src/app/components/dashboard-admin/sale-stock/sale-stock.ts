import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { DataTransfer } from '../../../services/data-transfer';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ManageFormComponent } from '../../manage-from/manage-from';
import { CustomerService } from '../../../services/customer';
import { StockService } from '../../../services/stock';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-sale-stock',
  imports: [CommonModule, ReactiveFormsModule, SearchEditComponent, FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, ManageFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sale-stock.html',
  styleUrl: './sale-stock.css'
})
/**
 * ขายหุ้น (SaleStock): รับข้อมูลจาก SearchEdit → ประมวลผล/ตรวจสิทธิ์ → ส่งข้อมูลลูกค้าและการขายไป backend
 */
export class SaleStockComponent implements OnInit {
  activeView = 'search';
  loading = false;
  cusId = '';
  docType: string | null = null;
  titleCode: string | null = null;
  customerForm!: FormGroup;

  constructor(
    private readonly dataTransfer: DataTransfer,
    private readonly cd: ChangeDetectorRef,
    private readonly customerService: CustomerService,
    private readonly stockService: StockService
  ) { }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus('2');
  }

  handleData(event: { view: string; cusId: string }) {
    this.cusId = event.cusId;
    if (isNaN(Number(this.cusId)) || this.cusId.length != 13) {
      this.docType = '1000';
      this.titleCode = 'JUR';
    } else {
      this.docType = '0001';
      this.titleCode = '003';
    }
    this.activeView = event.view;
    this.cd.detectChanges();
  }

  /** ตรวจสิทธิ์ก่อนทำรายการ (ลูกค้า 0100 ต้อง userLVL ≥ 80) */
  check(cusId: string): Promise<boolean> {
    const payload = { cusId };
    return new Promise((resolve, reject) => {
      this.customerService.getCustomer(payload).subscribe({
        next: (res: any) => {
          let allow = true;
          if (res.cusCODE === "0100") {
            const rawUserLVL = this.getCookie("UserLVL");
            const userLVL = rawUserLVL ? parseFloat(decodeURIComponent(rawUserLVL)) : 0;
            allow = userLVL >= 80;
          }
          resolve(allow);
        },
        error: (err) => reject(new Error(err?.message || JSON.stringify(err)))
      });
    });
  }

  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift()!;
    return null;
  }

  onBack() {
    this.activeView = 'search';
    this.cd.detectChanges();
  }

  /** รวม payload ลูกค้า/รายละเอียดการขาย แล้วเรียกบันทึก */
  async submit(event: any) {
    try {
      const allow = await this.check(this.cusId);
      if (!allow) {
        Swal.fire({ icon: 'warning', text: 'สิทธิ์ไม่เพียงพอ' });
        return;
      } else {
        this.loading = true;
        const formData = event[0];
        const action = event[1];

        const customer = formData.customer;
        const homeAddress = formData.homeAddress;
        const currentAddress = formData.currentAddress;
        const dividend = formData.dividend;
        const detailSale = formData.detailSale;

        const cusPayload = {
          CUSidO: this.cusId,
          CUSid: customer.cusiDnew,
          CUStax: customer.cusTAXid,
          CUSTt: customer.titleCode,
          CUSfn: customer.cusFName,
          CUSln: customer.cusLName,
          CUSTy: customer.cusCODE,
          CUSTg: customer.cusCODEg,
          docTY: customer.docTYPE,
          STC: "C000",
          BRC: "",
          CUSphone: customer.phonE_MOBILE,
          CUSemail: customer.email,
          AddCA0: currentAddress.housEno,
          AddCA1: currentAddress.troG_SOI,
          AddCA2: currentAddress.road,
          AddCA3: currentAddress.zipcodeCurrent,
          AddCA4: currentAddress.phone,
          AddCA00: currentAddress.prvCODE,
          AddCA01: currentAddress.ampCODE,
          AddCA02: currentAddress.tmbCODE,
          AddCADD1: currentAddress.addR1,
          AddCADD2: currentAddress.addR1,

          AddHA0: homeAddress.housEno,
          AddHA1: homeAddress.troG_SOI,
          AddHA2: homeAddress.road,
          AddHA3: homeAddress.zipcodeHome,
          AddHA4: homeAddress.phone,
          AddHA00: homeAddress.prvCODE,
          AddHA01: homeAddress.ampCODE,
          AddHA02: homeAddress.tmbCODE,
          stkPayType: dividend.dividendStkPayType,
          stkACCno: dividend.stkACCno,
          stkACCname: dividend.stkACCname,
          stkACCtype: dividend.stkACCtype,
          ACT: action
        }
        if (dividend.stkACCno == '') {
          dividend.stkACCtype = "000";
        }
        const stkPayload = {
          stkOWNiD: customer.cusiDnew,
          stkTYPE: detailSale.stkTYPE,
          stkPayType: dividend.stkPayType,
          stkACCno: dividend.stkACCno,
          stkACCname: dividend.stkACCname,
          stkACCtype: dividend.stkACCtype,
          stkUNiT: Number(detailSale.stkUNiT),
          stkValue: Number(detailSale.stkUNiT),
          stkTRCode: detailSale.stkPayTypeDetail,
          stkTRType: 'STK',
          stkReqNo: detailSale.stkReqNo,
          stkSaleByTRACCno: detailSale.stkSaleByTRACCno,
          stkSaleByTRACCname: detailSale.stkSaleByTRACCname,
          stkSaleByCHQno: detailSale.stkSaleByCHQno,
          stkSaleByCHQdat: this.thaiDateStringToNumber(detailSale.stkSaleByCHQdat),
          stkSaleByCHQbnk: detailSale.stkSaleByCHQbnk,
          stkSaleByCHQbrn: detailSale.stkSaleByCHQbrn
        }

        this.customerService.manageCustomer(cusPayload).subscribe({
          next: (res: any) => {
            if (res.msg[0].RST == "COMPLETE" && action == 'REG') {
              this.stockService.stockManage(stkPayload).subscribe({
                next: (res: any) => {
                  this.loading = false;
                  // ตรวจสอบว่ามี FAIL อยู่ไหม
                  const hasFail = res.some((r: any) => r.rst.toUpperCase() === "FAIL");
                  if (hasFail) {
                    const failMessages = res
                      .filter((r: any) => r.rst.toUpperCase() === "FAIL")
                      .map((r: any) => `${r.msg}`);
                    Swal.fire({ icon: 'warning', text: `${failMessages.join("\n")}` })
                  } else {
                    const successMessages = res.map((r: any) => `${r.msg}`);
                    Swal.fire({ icon: 'success', text: `${successMessages.join("\n")}` })
                      .then((result) => { if (result.isConfirmed) { this.onBack(); } })
                  }
                  this.cd.detectChanges();
                }, error: () => {
                  this.loading = false;
                  Swal.fire({ icon: 'error', title: 'บันทึกรายการขายไม่สำเร็จ', text: 'โปรดลองใหม่' });
                  this.cd.detectChanges();
                }
              })
            }  else {
              this.loading = false;
              Swal.fire({ icon: 'success', text: `${res.msg[0].MSG}` });
              this.cd.detectChanges();
            }
          }, error: () => {
            this.loading = false;
            Swal.fire({ icon: 'error', title: 'บันทึกข้อมูลลูกค้าไม่สำเร็จ', text: 'โปรดลองใหม่' });
            this.cd.detectChanges();
          }
        })
      }
    } catch (err) {
      this.loading = false;
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: (err as any)?.message || 'โปรดลองใหม่' });
      this.cd.detectChanges();
    }
  }

  thaiDateStringToNumber(dateStr: string): string {
    if (!dateStr) return '';

    const parts = dateStr.trim().split(' ');
    if (parts.length !== 3) return '';

    const [dayStr, monthStr, yearStr] = parts;

    const thaiMonths: Record<string, string> = {
      'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04',
      'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
      'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
    };

    const month = thaiMonths[monthStr];
    if (!month) return '';

    const day = dayStr.padStart(2, '0');
    const year = yearStr;
    return `${year}${month}${day}`;
  }
}
