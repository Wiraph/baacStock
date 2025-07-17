import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../../services/customer';
import { StockService, StockType } from '../../../services/stock';
import { AccType, AccTypeService } from '../../../services/acc-type';
import { StockRequestService } from '../../../services/stock-request';
import { CommonModule } from '@angular/common';
import { combineLatest, from } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import thaiBaht from 'thai-baht-text'
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
  @Input() mode!: string;

  @Output() back = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private stockService: StockService,
    private acctypeServide: AccTypeService,
    private stockRequestService: StockRequestService,
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
  stockList: any[] = [];
  acctypeList: any[] = [];
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

    this.customerForm.get('stkUnit')?.valueChanges
      .pipe(
        debounceTime(800),          // ✅ หน่วง 400ms หลังจากพิมพ์
        distinctUntilChanged()      // ✅ ค่าเปลี่ยนจริงเท่านั้นถึงจะทำ
      )
      .subscribe(() => {
        this.calculateStockAmount();
      });

    this.customerForm.get('stkPrice')?.valueChanges
      .pipe(
        debounceTime(800),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.calculateStockAmount();
      });


  }

  calculateStockAmount(): void {
    const unit = Number(this.customerForm.get('stkUnit')?.value || 0);
    const price = Number(this.customerForm.get('stkPrice')?.value || 0);

    if (!unit || unit < 50) {
      this.customerForm.get('stkAmount')?.setValue('', { emitEvent: false });
      this.customerForm.get('txtUnit')?.setValue('', { emitEvent: false });
      this.customerForm.get('txtValue')?.setValue('', { emitEvent: false });
      alert('ไม่สามารถซื้อต่ำกว่า 50 หุ้นได้');
      return;
    }

    const amount = unit * price;

    // แปลงจำนวนหุ้นเป็นข้อความภาษาไทย
    const unitText = thaiBaht(unit).replace('บาทถ้วน', 'หุ้น');
    const amountText = thaiBaht(amount);

    this.customerForm.get('stkAmount')?.setValue(amount.toFixed(2), { emitEvent: false });
    this.customerForm.get('txtUnit')?.setValue(unitText, { emitEvent: false });
    this.customerForm.get('txtValue')?.setValue(amountText, { emitEvent: false });
    this.cd.detectChanges();
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

    this.customerForm.get('stkUnit')?.valueChanges.subscribe((unit) => {
      const price = this.customerForm.get('stkPrice')?.value || 0;
      const value = Number(unit || 0) * Number(price);

      this.customerForm.patchValue({
        stkAmount: value.toFixed(2),
        stkValue: value
      }, { emitEvent: false });
    });

  }



  initForm() {
    this.customerForm = this.fb.group({
      cusId: ['', Validators.required],
      title: [{ value: '', disabled: this.mode === 'sale-stock-common' }, Validators.required],
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      brCode: [''],
      custype: [{ value: '', disabled: this.mode === 'sale-stock-common' }, Validators.required],
      doctype: [{ value: '', disabled: this.mode === 'sale-stock-common' }],
      taxId: [''],
      totalStock: [''],
      email: [''],
      cusCodeg: [''],
      stktype: [{ value: 'A', disabled: this.mode === 'sale-stock-common' }, Validators.required],
      accType: [['001']],
      stkReqNo: ['', Validators.required],
      stkUnit: [0, [Validators.required, Validators.min(1)]],
      stkValue: [null, Validators.required],
      stkPrice: [100],
      stkPayType: ['', Validators.required],
      stkAmount: [{ value: '', disabled: true }],
      txtUnit: [''],
      txtValue: [''],

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
        prvCode: [{ value: '', disabled: this.mode === 'sale-stock-common' }],
        ampCode: [{ value: '', disabled: this.mode === 'sale-stock-common' }],
        tmbCode: [{ value: '', disabled: this.mode === 'sale-stock-common' }],
        zipcode: [''],
        phone: ['']
      }),
      stockDividend: this.fb.group({
        stkNote: [''],
        stkPayType: [''],
        stkPayDesc: [''],
        stkAcctype: [{ value: '', disabled: this.mode === 'sale-stock-common' }],
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
        stkSaleBy: ['', Validators.required],
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
        ipaddress: [''],
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
      this.stockService.getStockType(),
      this.acctypeServide.getAllAccTypes(),
    ]).subscribe({
      next: async ([customer, titleList, custypeList, doctypeList, prvList, accList, stockList, acctypeList]) => {
        this.customerData = customer;
        this.titleList = titleList;
        this.custypeList = custypeList;
        this.doctypeList = doctypeList;
        this.prvList = prvList;
        this.accList = accList;
        this.stockList = stockList;
        this.acctypeList = acctypeList;
        console.log("StockList DATA:", stockList);

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

  loadStockTypes(): void {
    this.stockService.getStockType().subscribe({
      next: (types) => {
        this.stockList = types;
      },
      error: (err) => {
        console.error('โหลดประเภทหุ้นไม่สำเร็จ', err);
      }
    });
  }

  loadAccTypes(): void {
    this.acctypeServide.getAllAccTypes().subscribe({
      next: (accTypes) => {
        this.acctypeList = accTypes;
      },
      error: (err) => {
        console.error('โหดลประเภทบัญชีไม่สำเร็จ', err);
      }
    })
  }


  onTabChange(tabName: 'edit' | 'dividend') {
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
        stkAcctype: form.stockDividend.stkAcctype,
        stkAccno: form.stockDividend.stkAccno,
        stkAccname: form.stockDividend.stkAccname,
        stkOwnID: form.stockDividend.stkOwnID,
        stkRemCode: form.stockDividend.stkRemCode, logBrCode: this.brCode
      }
    };
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
