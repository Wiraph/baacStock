import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../../services/customer';
import { CommonModule } from '@angular/common';
import { combineLatest, from } from 'rxjs';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';


@Component({
  standalone: true,
  selector: 'app-edit-customer',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-customer.component.html',
  styleUrl: './edit-customer.component.css',
  animations: [
    trigger('smoothSlide', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(20px) scale(0.95)'
        }),
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({
            opacity: 1,
            transform: 'translateY(0) scale(1)'
          })
        )
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({
            opacity: 0,
            transform: 'translateY(-20px) scale(0.95)'
          })
        )
      ])
    ])
  ]
})
export class EditCustomerComponent implements OnInit {
  @Input() cusId!: string;
  @Output() back = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private cd: ChangeDetectorRef
  ) { }

  private _activeTab: 'edit' | 'dividend' = 'edit';
  private formCache: { [key: string]: any } = {};
  private isFormInitialized = false;

  set activeTab(value: 'edit' | 'dividend') {
    const previousTab = this._activeTab;

    // Cache ข้อมูล form ก่อนเปลี่ยน tab
    if (this.customerForm && this.isFormInitialized) {
      this.formCache = { ...this.formCache, [previousTab]: this.customerForm.value };
    }

    this._activeTab = value;

    this.cd.detectChanges();

    // Restore ข้อมูลเมื่อกลับมา
    if (this.formCache && this.formCache[value] && !this.loading) {
      setTimeout(() => {
        this.restoreFormData(value);
        this.cd.detectChanges();
      }, 50);
    }

    if (value === 'dividend') {
      setTimeout(() => {
        this.cd.detectChanges();
      }, 100); // เพิ่มเวลารอ
    }
  }

  get activeTab(): 'edit' | 'dividend' {
    return this._activeTab;
  }

  private restoreFormData(tabName: string) {
    if (this.formCache[tabName] && this.customerForm) {
      this.customerForm.patchValue(this.formCache[tabName]);
      this.cd.detectChanges();
    }
  }

  customerForm!: FormGroup;
  customerData: any = null;
  loading = false;
  titleOptions = '';
  custypeList: any[] = [];
  doctypeList: any[] = [];
  titleList: any[] = [];
  prvList: any[] = [];
  ampList: any[] = [];
  tbList: any[] = [];
  accList: any[] = [];
  brCode = sessionStorage.getItem('brCode') ?? '';




  ngOnInit() {
    this.titleOptions = sessionStorage.getItem('brName') ?? '';
    this.initForm();
    this.setupFormListeners();
    this.loadCustomerData();
    // this.customerForm.valueChanges.subscribe(value => {
    //   console.log('📝 Form value changed:', value);
    // });
  }

  setupFormListeners() {
    this.customerForm.get('addressCa.prvCode')?.valueChanges.subscribe((prvCode) => {
      // reset ข้อมูลที่เกี่ยวข้อง
      this.customerForm.get('addressCa.ampCode')?.setValue('');
      this.customerForm.get('addressCa.tmbCode')?.setValue('');
      this.customerForm.get('addressCa.zipcode')?.setValue('');

      if (prvCode) {
        this.loadAmphorAsync(prvCode);
      }
    });

    this.customerForm.get('addressCa.ampCode')?.valueChanges.subscribe((ampCode) => {
      const prvCode = this.customerForm.get('addressCa.prvCode')?.value;

      // reset ตำบล + zipcode
      this.customerForm.get('addressCa.tmbCode')?.setValue('');
      this.customerForm.get('addressCa.zipcode')?.setValue('');

      if (ampCode && prvCode) {
        this.loadTbAsync(prvCode, ampCode);
      }
    });

    this.customerForm.get('addressCa.tmbCode')?.valueChanges.subscribe((tmbCode) => {
      if (!tmbCode) return;

      const selectedTb = this.tbList.find(tb => tb.tmbCode === tmbCode);
      if (selectedTb?.zipCode) {
        this.customerForm.get('addressCa.zipcode')?.setValue(selectedTb.zipCode);
      }
    });
  }



  initForm() {
    this.customerForm = this.fb.group({
      cusId: ['', Validators.required],
      title: ['', Validators.required],
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      brCode: [''],
      custype: [''],
      doctype: [''],
      taxId: [''],
      totalStock: [''],
      email: [''],
      cusCodeg: [''],

      addressCa: this.fb.group({
        houseno: [''],
        road: [''],
        trogSoi: [''],
        prvCode: [''],
        ampCode: [''],
        tmbCode: [''],
        zipcode: [''],
        phone: [''],
        addr1: [''],
        addr2: ['']
      }),
      addressHa: this.fb.group({
        houseno: [''],
        road: [''],
        trogSoi: [''],
        prvCode: [''],
        ampCode: [''],
        tmbCode: [''],
        zipcode: [''],
        phone: ['']
      }),
      stockDividend: this.fb.group({
        stkNote: [''],
        stkPayType: [''],
        stkPayDesc: [''],
        stkAcctype: [''],
        stkAccno: [''],
        stkAccname: [''],
        hostname: [''],
        stkNOTEo: [''],
        stkNOStart: [''],
        stkNOStop: [''],
        stkUnit: [''],
        stkValue: [''],
        stkDvnBF: [''],
        stkDvnCUR: [''],
        stkTaxBF: [''],
        stkTaxCUR: [''],
        stkDateInput: [''],
        stkDateEffect: [''],
        stkDateIssue: [''],
        stkDatePrint: [''],
        stkOwnID: [''],
        stkType: [''],
        stkPayStat: [''],
        stkReqNo: [''],
        stkSaleBy: [''],
        stkSaleByTRACCno: [''],
        stkSaleByTRACCname: [''],
        stkSaleByCHQno: [''],
        stkSaleByCHQdat: [''],
        stkSaleByCHQbnk: [''],
        stkSaleCHQbrn: [''],
        stkStatus: [''],
        stkRemCode: [''],
        brCode: [''],
        datetimeup: [''],
        userid: [''],
        ipaddress: ['']
      })
    });
  }

  loadCustomerData() {
    this.loading = true;

    combineLatest([
      this.customerService.getCustomerById(this.cusId),
      this.customerService.getAllTitle(),
      this.customerService.getAllCustype(),
      this.customerService.getAllDoctype(),
      this.customerService.getAllProvince(),
      this.customerService.getAllAcctypes(),
    ]).subscribe({
      next: async ([customer, titleList, custypeList, doctypeList, prvList, accList]) => {
        this.customerData = customer;
        this.titleList = titleList;
        this.custypeList = custypeList;
        this.doctypeList = doctypeList;
        this.prvList = prvList;
        this.accList = accList;
        console.log("customer DATA:", customer);
        // console.log("accList DATA:", accList);

        // Set ข้อมูลหลักก่อน
        this.customerForm.patchValue({
          cusId: customer.cusId,
          title: customer.title,
          fname: customer.fname,
          lname: customer.lname,
          custype: customer.cusType,
          doctype: customer.docType,
          taxId: customer.taxId,
          totalStock: customer.totalStockUnit,
          email: customer.email,
          brCode: customer.brCode,
          cusCodeg: customer.cusCodeg
        });

        this.customerForm.get('stockDividend')?.patchValue({
          stkNote: customer.stockDividend?.stkNote || '',
          stkPayType: customer.stockDividend?.stkPayType || '',
          stkPayDesc: customer.stockDividend?.stkPayDesc || '',
          stkAcctype: customer.stockDividend?.stkAcctype || '',
          stkAccno: customer.stockDividend?.stkAccno || '',
          stkAccname: customer.stockDividend?.stkAccname || '',
          hostname: customer.stockDividend?.hostname || '',
          stkNOTEo: customer.stockDividend?.stkNOTEo || '',
          stkNOStart: customer.stockDividend?.stkNOStart || '',
          stkNOStop: customer.stockDividend?.stkNOStop || '',
          stkUnit: customer.stockDividend?.stkUnit || null,
          stkValue: customer.stockDividend?.stkValue || null,
          stkDvnBF: customer.stockDividend?.stkDvnBF || null,
          stkDvnCUR: customer.stockDividend?.stkDvnCUR || null,
          stkTaxBF: customer.stockDividend?.stkTaxBF || null,
          stkTaxCUR: customer.stockDividend?.stkTaxCUR || null,
          stkDateInput: customer.stockDividend?.stkDateInput || '',
          stkDateEffect: customer.stockDividend?.stkDateEffect || '',
          stkDateIssue: customer.stockDividend?.stkDateIssue || '',
          stkDatePrint: customer.stockDividend?.stkDatePrint || '',
          stkOwnID: customer.stockDividend?.stkOwnID || '',
          stkType: customer.stockDividend?.stkType || '',
          stkPayStat: customer.stockDividend?.stkPayStat || '',
          stkReqNo: customer.stockDividend?.stkReqNo || '',
          stkSaleBy: customer.stockDividend?.stkSaleBy || '',
          stkSaleByTRACCno: customer.stockDividend?.stkSaleByTRACCno || '',
          stkSaleByTRACCname: customer.stockDividend?.stkSaleByTRACCname || '',
          stkSaleByCHQno: customer.stockDividend?.stkSaleByCHQno || '',
          stkSaleByCHQdat: customer.stockDividend?.stkSaleByCHQdat || '',
          stkSaleByCHQbnk: customer.stockDividend?.stkSaleByCHQbnk || '',
          stkSaleCHQbrn: customer.stockDividend?.stkSaleCHQbrn || '',
          stkStatus: customer.stockDividend?.stkStatus || '',
          stkRemCode: customer.stockDividend?.stkRemCode || '',
          brCode: customer.stockDividend?.brCode || '',
          datetimeup: customer.stockDividend?.datetimeup || '',
          userid: customer.stockDividend?.userid || '',
          ipaddress: customer.stockDividend?.ipaddress || ''
        });



        this.isFormInitialized = true;
        console.log(this.customerForm.value);



        const addressCa = customer.address?.find((a: any) => a.addCode.toUpperCase() === 'CA');
        const addressHa = customer.address?.find((a: any) => a.addCode.toUpperCase() === 'HA');

        if (addressCa && addressCa.prvCode) {
          // โหลดอำเภอก่อน รอให้เสร็จ
          await this.loadAmphorAsync(addressCa.prvCode);

          // ถ้ามี ampCode ให้โหลดตำบล
          if (addressCa.ampCode) {
            await this.loadTbAsync(addressCa.prvCode, addressCa.ampCode);
          }

          // หลังจากโหลดข้อมูลครบแล้ว ค่อย set ค่า
          this.customerForm.get('addressCa')?.patchValue({
            houseno: addressCa.houseno,
            road: addressCa.road,
            trogSoi: addressCa.trogSoi,
            prvCode: addressCa.prvCode,
            ampCode: addressCa.ampCode,
            tmbCode: addressCa.tmbCode,
            zipcode: addressCa.zipcode,
            phone: addressCa.phone,
            addr1: addressCa.addr1,
            addr2: addressCa.addr2
          });

        }

        if (addressHa) {
          this.customerForm.get('addressHa')?.patchValue(addressHa);
        }

        this.formCache = {
          'edit': this.customerForm.value,
          'dividend': this.customerForm.value
        };


        this.isFormInitialized = true;
        this.formCache = this.customerForm.value;

        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        alert('❌ ไม่สามารถโหลดข้อมูลลูกค้าได้');
        this.loading = false;
      }
    });
  }

  // แปลงเป็น async function
  loadAmphorAsync(prvCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!prvCode) {
        resolve();
        return;
      }
      this.customerService.getAumphor(prvCode).subscribe({
        next: (amphorList) => {
          this.ampList = amphorList;
          resolve();
        },
        error: (error) => {
          console.error('โหลดอำเภอไม่สำเร็จ', error);
          resolve(); // ไม่ reject เพื่อไม่ให้หยุดการทำงาน
        }
      });
    });
  }

  loadTbAsync(prvCode: string, ampCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!prvCode || !ampCode) {
        resolve();
        return;
      }
      this.customerService.getTumbons(prvCode, ampCode).subscribe({
        next: (tbsList) => {
          this.tbList = tbsList;
          resolve();
        },
        error: (error) => {
          console.error('ไม่สามารถโหลดข้อมูลตำบลได้', error);
          resolve(); // ไม่ reject เพื่อไม่ให้หยุดการทำงาน
        }
      });
    });
  }


  onTabChange(tabName: 'edit' | 'dividend') {
    // console.log(`🔄 Switching to ${tabName} tab`);
    // console.log('📋 Current form value:', this.customerForm.value);
    // console.log('💾 Form cache:', this.formCache);

    this.activeTab = tabName;
  }



  onSubmit() {
    this.loading = true;

    const form = this.customerForm.value;

    const customerPayload = {
      customer: {
        cusiD: form.cusId,
        cusFname: form.fname,
        cusLname: form.lname,
        cusCode: form.custype,
        cusCodeg: form.cusCodeg,
        docType: form.doctype,
        title: form.title,
      },
      homeAddress: form.addressHa,
      currentAddress: form.addressCa,
      stockDividend: {
        stkNote: form.stockDividend.stkNote,
        stkPayType: form.stockDividend.stkPayType,
        stkPayDesc: form.stockDividend.stkPayDesc,
        stkAcctype: form.stockDividend.stkAcctype,
        stkAccno: form.stockDividend.stkAccno,
        stkAccname: form.stockDividend.stkAccname,
        hostname: form.stockDividend.hostname,
        stkNOTEo: form.stockDividend.stkNOTEo,
        stkNOStart: form.stockDividend.stkNOStart,
        stkNOStop: form.stockDividend.stkNOStop,
        stkUnit: form.stockDividend.stkUnit,
        stkValue: form.stockDividend.stkValue,
        stkDvnBF: form.stockDividend.stkDvnBF,
        stkDvnCUR: form.stockDividend.stkDvnCUR,
        stkTaxBF: form.stockDividend.stkTaxBF,
        stkTaxCUR: form.stockDividend.stkTaxCUR,  
        stkDateInput: form.stockDividend.stkDateInput,
        stkDateEffect: form.stockDividend.stkDateEffect,
        stkDateIssue: form.stockDividend.stkDateIssue,
        stkDatePrint: form.stockDividend.stkDatePrint,
        stkOwnID: form.stockDividend.stkOwnID,
        stkType: form.stockDividend.stkType,
        stkPayStat: form.stockDividend.stkPayStat,
        stkReqNo: form.stockDividend.stkReqNo,
        stkSaleBy: form.stockDividend.stkSaleBy,
        stkSaleByTRACCno: form.stockDividend.stkSaleByTRACCno,
        stkSaleByTRACCname: form.stockDividend.stkSaleByTRACCname,
        stkSaleByCHQno: form.stockDividend.stkSaleByCHQno,
        stkSaleByCHQdat: form.stockDividend.stkSaleByCHQdat,
        stkSaleByCHQbnk: form.stockDividend.stkSaleByCHQbnk,
        stkSaleCHQbrn: form.stockDividend.stkSaleCHQbrn,
        stkStatus: form.stockDividend.stkStatus,
        stkRemCode: form.stockDividend.stkRemCode,
        brCode: form.stockDividend.brCode,
        datetimeup: form.stockDividend.datetimeup,
        userid: form.stockDividend.userid,
        ipaddress: form.stockDividend.ipaddress,
        logBrCode: this.brCode
      }

    };

    console.log("👉 Payload ที่ส่งไป:", customerPayload);

    this.customerService.updateCustomer(customerPayload).subscribe({
      next: () => {
        alert('✅ แก้ไขข้อมูลเรียบร้อย');
        this.success.emit();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ เกิดข้อผิดพลาด:', err);
        alert('❌ เกิดข้อผิดพลาดในการบันทึก');
        this.loading = false;
        this.goBack();
      }
    });
  }

  goBack() {
    this.back.emit();
  }
}
