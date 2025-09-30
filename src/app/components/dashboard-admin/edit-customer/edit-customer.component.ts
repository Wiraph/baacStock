import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchEditComponent } from '../search-edit/search-edit';
import { DataTransfer } from '../../../services/data-transfer';
import { MatTabsModule } from '@angular/material/tabs';
import { ManageFormComponent } from '../../manage-from/manage-from';
import { CustomerService } from '../../../services/customer';
import Swal from 'sweetalert2';


@Component({
  standalone: true,
  selector: 'app-edit-customer',
  imports: [CommonModule, ReactiveFormsModule, SearchEditComponent, MatTabsModule, FormsModule, ManageFormComponent],
  templateUrl: './edit-customer.component.html',
  styleUrl: './edit-customer.component.css',
})
/**
 * แก้ไขข้อมูลลูกค้า: รับผลการค้นหาจาก SearchEdit → เปิดแบบฟอร์มแก้ไข → ส่งข้อมูลไป backend
 */
export class EditCustomerComponent implements OnInit {
  activeView = 'search';
  loading = false;
  cusId = '';
  act = '';

  constructor(
    private readonly dataTransfer: DataTransfer,
    private readonly cd: ChangeDetectorRef,
    private readonly customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus('1');
  }

  /** รับข้อมูลจากหน้าค้นหา แล้วสลับมุมมอง/เก็บรหัสลูกค้า */
  handleData(event: { view: string; cusId: string }) {
    this.activeView = event.view;
    this.cusId = event.cusId;
    this.cd.detectChanges();
  }

  /** รับ action จากฟอร์มจัดการ (เช่น SAVE/UPDATE) */
  onActionReceived(action: string){
    this.act = action;
  }

  /** รวมข้อมูลจากฟอร์มแล้วเรียกบริการแก้ไข (manageCustomer) */
  onSubmit([form, act]: [any, string]) {
    this.loading = true;
    const customer = form.customer;
    const homeAddress = form.homeAddress;
    const currentAddress = form.currentAddress;
    const dividend = form.dividend;

    const paylaod = {
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
      ACT: act
    }

    this.customerService.manageCustomer(paylaod).subscribe({
      next: (res:any) => {
        this.loading = false;
        if (res.msg?.[0]?.RST === 'COMPLETE') {
          Swal.fire({ icon: 'success', text: `${res.msg[0].MSG}` });
        } else {
          Swal.fire({ icon: 'warning', text: `${res.msg?.[0]?.MSG || 'ไม่สามารถบันทึกได้'}` });
        }
        this.cd.detectChanges();
        const event = { view: 'editcus', cusId: paylaod.CUSid };
        this.handleData(event);
      }, error: () => {
        this.loading = false;
        Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ', text: 'โปรดลองใหม่' });
        this.cd.detectChanges();
      }
    })
  }

  onBack() {
    this.activeView = 'search';
    this.cd.detectChanges();
  }
}
