import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchEditComponent } from '../search-edit/search-edit';
import { StockTableDetailComponent } from '../stock-table-detail/stock-table-detail';
import { RemCodeService } from '../../../services/rem-code';
import { StockRequestService } from '../../../services/stock-request';

@Component({
  standalone: true,
  selector: 'app-cratenewsharecertificate',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // ✅ เพิ่มตัวนี้เพื่อใช้ Reactive Forms
    SearchEditComponent,
    StockTableDetailComponent
  ],
  templateUrl: './cratenewsharecertificate.html',
  styleUrl: './cratenewsharecertificate.css'
})
export class CratenewsharecertificateComponent {
  @Input() inputShareCertificate!: string;
  internalViewName = "create-new-share-certificate";
  activeView: string = 'search';
  selectedStock: any;
  selectedRequest: any;

  reasonForm!: FormGroup; // ✅ ใช้ FormGroup
  remCodes: {
    remCode: string;
    remList: string;
    remDesc: string;
  }[] = [];

  constructor(
    private fb: FormBuilder,
    private remcodeServive: RemCodeService,
    private cd: ChangeDetectorRef,
    private StockRequestServer: StockRequestService
  ) { }

  setView(view: string) {
    this.activeView = view;
  }

  onCreatenew(stock: any) {
    console.log("ค่าที่ได้รับกลับมา: ", stock);
    this.selectedStock = stock;
    this.activeView = 'create';
  }

  handleNewStockRequest(stock: any) {
    console.log('ผู้ใช้กดออกใหม่ที่ใบหุ้น:', stock);
    this.activeView = "select";
    this.selectedRequest = stock;

    this.remcodeServive.getRemCodes().subscribe({
      next: (res) => {
        const allowCode = ["0020", "0021"];
        this.remCodes = res.filter((item: any) => allowCode.includes(item.remCode));

        // ✅ สร้างฟอร์มใหม่พร้อมค่า default
        this.reasonForm = this.fb.group({
          remCode: [this.remCodes[0]?.remCode || '', Validators.required]
        });

        this.cd.detectChanges(); // เผื่อ view ยังไม่อัปเดต
      }
    });
  }

  onSubmitReason() {
    if (this.reasonForm.valid) {
      const selectedCode = this.reasonForm.value.remCode;
      console.log("เลือก remCode:", selectedCode);

      const payload = {
        remCode: selectedCode,
        stkNote2: this.selectedRequest.stkNote,
        stkNostart: this.selectedRequest.stkStart,
        stkNoend: this.selectedRequest.stkEnd,
        stkUnit: this.selectedRequest.unit,
        stkValue: this.selectedRequest.unitValue,
        brCode: sessionStorage.getItem("brCode")
      }

      console.log("ข้อมูลที่เตรียมส่งออกไป : ", payload);
      this.StockRequestServer.stockRequest(payload).subscribe({
        next: (res) => {
          console.log('✅ ส่งคำขอสำเร็จ:', res);
          alert('บันทึกคำขอออกใบหุ้นใหม่สำเร็จ');
          this.onCancelReason();
          this.cd.detectChanges();
        }
      })
    }
  }

  onCancelReason() {
    this.reasonForm.reset();
    this.activeView = 'search'; // หรือเปลี่ยนกลับหน้าเดิม
  }
}
