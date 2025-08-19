import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchEditComponent } from '../dashboard-admin/search-edit/search-edit';
import { DataTransfer } from '../../services/data-transfer';
import { CustomerService } from '../../services/customer';
import { MatTabsModule } from '@angular/material/tabs';
import { MetadataService } from '../../services/metadata';
import { AddressService, AddressDto } from '../../services/address';
import { of, forkJoin } from 'rxjs';
import { finalize, switchMap, catchError } from 'rxjs/operators';
import { Divident } from '../../services/divident';
import Swal from 'sweetalert2';
import flatpickr from 'flatpickr';
import { Thai } from 'flatpickr/dist/l10n/th.js';
import { Thaidateadapter } from '../thaidateadapter/thaidateadapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import ThaiBahtText from 'thai-baht-text';
import { StockService } from '../../services/stock';

export const THAI_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'd MMMM yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'd MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  standalone: true,
  selector: 'app-sale-stock',
  imports: [CommonModule, ReactiveFormsModule, SearchEditComponent, MatTabsModule, FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './formdetail.html',
  styleUrl: './formdetail.css',
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' }
  ]
})
export class SaleStockComponent implements OnInit, AfterViewInit {
  readonly startDate = new Date();
  selectedDate?: Date;
  activeView = 'search';
  loading = false;
  cusId = '';
  customer: any = {};
  unit: number = 0;
  homeAddress!: AddressDto;
  currentAddress!: AddressDto;
  zipCodeHome: string = '';
  zipCodeCurrent: string = '';
  dividendData: any = { payDESC: '', stkPayType: '', stkACCno: '', stkACCname: '' };
  pricePerUnit: any;
  unitText: string = "";
  valueText: string = "";
  prvData: any[] = [];
  ampData: any[] = [];
  tumbonData: any[] = [];
  titleList: any[] = [];
  custypeList: any[] = [];
  doctypeList: any[] = [];
  ampDataHome: any[] = [];
  ampDataCurrent: any[] = [];
  tumbonDataHome: any[] = [];
  tumbonDataCurrent: any[] = [];
  actypeList: any[] = [];
  stkTypeList: any[] = [];
  res: any[] = [];
  mode: string = '';
  idCard: string = '';
  customerForm!: FormGroup;

  constructor(
    private readonly dataTransfer: DataTransfer,
    private readonly customerService: CustomerService,
    private readonly metadataService: MetadataService,
    private readonly cd: ChangeDetectorRef,
    private readonly addressService: AddressService,
    private readonly dividend: Divident,
    private readonly fb: FormBuilder,
    private readonly stockService: StockService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.dataTransfer.setPageStatus('2');
    
    // ตั้งค่าเริ่มต้นสำหรับ pricePerUnit และ address
    this.pricePerUnit = { stkBv: 0 };
    this.homeAddress = this.addressService.getDefaultAddress();
    this.currentAddress = this.addressService.getDefaultAddress();
    
    this.customerForm = this.fb.group({
      customer: this.fb.group({
        cusCODE: [''],
        cusDESC: [''],
        cusCODEg: [''],
        cusDESCgABBR: [''],
        docTYPE: [''],
        cusiD: [''],
        brCode: [''],
        cusTAXid: [''],
        cusFName: [''],
        cusLName: [''],
        unit: [''],
        titleCode: [''],
        phonE_MOBILE: [''],
        email: ['']
      }),
      homeAddress: this.fb.group({
        housEno: [''],
        troG_SOI: [''],
        road: [''],
        prvCODE: [''],
        ampCODE: [''],
        tmbCODE: [''],
        phone: [''],
        zipcodeHome: ['']
      }),
      currentAddress: this.fb.group({
        housEno: [''],
        troG_SOI: [''],
        road: [''],
        prvCODE: [''],
        ampCODE: [''],
        tmbCODE: [''],
        phone: [''],
        zipcodeCurrent: [''],
        addR1: [''],
        addR2: ['']
      }),
      dividend: this.fb.group({
        stkPayType: [''],
        dividendStkPayType: [''],
        stkACCno: [''],
        stkACCname: [''],
        stkACCtype: ['']
      }),
      detailSale: this.fb.group({
        stkTYPE: ['A'],
        stkPayTypeDetail: [''],
        sktACCno: [''],
        stkACCname: [''],
        stkACCtype: ['001'],
        stkUNiT: [''],
        stkValue: [''],
        stkTRCode: [''],
        stkTRType: [''],
        stkReqNo: [''],
        stkSaleByTRACCno: [''],
        stkSaleByTRACCname: [''],
        stkSaleByCHQno: [''],
        stkSaleByCHQdat: [''],
        stkSaleByCHQbnk: [''],
        stkSaleByCHQbrn: [''],
      })
    });
    
    // ตรวจสอบ query parameters หลังจากสร้าง form แล้ว
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'new-shareholder' && params['idCard']) {
        this.mode = 'new-shareholder';
        this.idCard = params['idCard'];
        this.activeView = 'sale';
        
        this.customerForm.patchValue({
          customer: { cusId: this.idCard }
        });
        
        this.initializeNewShareholderForm();
        this.cd.detectChanges();
      }
    });
    
    this.loadInitialMetadata();
    
    this.metadataService.getSyscfg().subscribe({
      next: (res: any) => {
        this.pricePerUnit = res || { stkBv: 0 };
        this.cd.detectChanges();
      },
      error: (err) => {
        this.pricePerUnit = { stkBv: 0 };
        this.cd.detectChanges();
      }
    });
  }

  loadInitialMetadata() {
    const metadataCalls = [
      { service: this.metadataService.getProvince(), setter: (res: any) => this.prvData = res },
      { service: this.metadataService.getTitle(), setter: (res: any) => this.titleList = res },
      { service: this.metadataService.getCustype(), setter: (res: any) => this.custypeList = res },
      { service: this.metadataService.getDoctype(), setter: (res: any) => this.doctypeList = res },
      { service: this.metadataService.getAcctypes(), setter: (res: any) => this.actypeList = res },
      { service: this.metadataService.getStaTypes(), setter: (res: any) => this.stkTypeList = res }
    ];

    metadataCalls.forEach(({ service, setter }) => {
      service.subscribe({
        next: (res) => {
          setter(res);
          this.cd.detectChanges();
        },
        error: (err) => console.error('Load metadata failed:', err)
      });
    });
  }

  initializeNewShareholderForm() {
    if (this.customerForm && this.idCard) {
      this.customerForm.patchValue({
        customer: {
          cusId: this.idCard,
          docTYPE: '0001',
          titleCode: '001',
          cusCODE: '001',
          brCode: 'New' 
        }
      });
    }
  }

  ngAfterViewInit(): void {
    function toThaiYear(date: Date): Date {
      const d = new Date(date);
      d.setFullYear(d.getFullYear() + 543);
      return d;
    }

    flatpickr("#thaiDateInput", {
      locale: Thai,
      dateFormat: "d F Y",
      altInput: true,
      altFormat: "d F Y",
      onChange: function (selectedDates, dateStr, instance) {
        if (selectedDates.length > 0) {
          const thaiDate = toThaiYear(selectedDates[0]);
          instance.input.value = thaiDate.getDate() + " " + Thai.months.longhand[thaiDate.getMonth()] + " " + thaiDate.getFullYear();
        }
      },
      formatDate: function (date, format, locale) {
        const thaiYearDate = toThaiYear(date);
        return `${thaiYearDate.getDate()} ${locale.months.longhand[thaiYearDate.getMonth()]} ${thaiYearDate.getFullYear()}`;
      }
    });
  }

  handleData(event: { view: string; cusId: string }) {
    this.homeAddress = this.addressService.getDefaultAddress();
    this.currentAddress = this.addressService.getDefaultAddress();
    this.zipCodeHome = '';
    this.zipCodeCurrent = '';
    this.activeView = event.view;
    this.loading = true;
    this.cusId = event.cusId;

    if (!this.cusId) return;

    const requestPayload = { cusId: this.cusId };

    forkJoin({
      customer: this.customerService.getCustomer(requestPayload).pipe(
        catchError(err => {
          console.error("Customer service error:", err);
          return of(null);
        })
      ),
      address: this.addressService.getAddress(requestPayload).pipe(
        catchError(err => {
          console.error("Address service error:", err);
          return of({ homeAddress: null, currentAddress: null });
        })
      ),
      dividend: this.dividend.getDividend(requestPayload),
      provinces: this.metadataService.getProvince(),
      titles: this.metadataService.getTitle(),
      custypes: this.metadataService.getCustype(),
      doctypes: this.metadataService.getDoctype(),
      acctypes: this.metadataService.getAcctypes(),
      stktypes: this.metadataService.getStaTypes(),
    })
      .pipe(
        switchMap((res) => {
          this.customer = (res.customer as any)?.customer || {};
          this.unit = (res.customer as any)?.unit || 0;

          if (res.address && (res.address.homeAddress || res.address.currentAddress)) {
            this.homeAddress = res.address.homeAddress;
            this.currentAddress = res.address.currentAddress;
          }

          this.dividendData = res.dividend || {
            payDESC: '', stkPayType: '', stkACCno: '', stkACCname: '', stkACCtype: ''
          };
          
          this.prvData = res.provinces;
          this.titleList = res.titles;
          this.custypeList = res.custypes;
          this.doctypeList = res.doctypes;
          this.actypeList = res.acctypes;
          this.stkTypeList = res.stktypes;

          this.populateCustomerForm();
          this.populateAddressForm();
          this.cd.detectChanges();

          return this.loadInitialAddressDataObservable();
        }),
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error("โหลดข้อมูลผิดพลาด", err);
          this.loading = false;
        }
      });
  }

  populateCustomerForm() {
    if (this.customer) {
      const customerFormData = {
        cusCODE: this.customer.cusCODE || '',
        cusDESC: this.customer.cusDESCg || '',
        cusCODEg: this.customer.cusCODEg || '',
        cusDESCgABBR: this.customer.cusDESCgABBR || '',
        docTYPE: this.customer.docTYPE || '',
        cusiD: this.customer.cusiD || '',
        brCode: this.customer.brCode || '',
        cusTAXid: this.customer.cusTAXid || '',
        cusFName: this.customer.cusFName || '',
        cusLName: this.customer.cusLName || '',
        unit: this.unit || '0',
        titleCode: this.customer.titleCode || '',
        email: this.customer.email || '',
        phonE_MOBILE: this.customer.phonE_MOBILE || ''
      };

      this.customerForm.patchValue({
        customer: customerFormData,
        dividend: {
          stkPayType: this.dividendData?.stkPayType || '',
          dividendStkPayType: this.dividendData?.stkPayType || '',
          stkACCno: this.dividendData?.stkACCno || '',
          stkACCname: this.dividendData?.stkACCname || '',
          stkACCtype: this.dividendData?.stkACCtype || ''
        }
      });
      this.cd.detectChanges();
    } else {
      this.customerForm.patchValue({
        customer: {
          cusCODE: "TEST",
          cusDESC: "Test Description",
          cusCODEg: "1",
          cusDESCgABBR: "Test ABBR",
          docTYPE: "0001",
          cusiD: "TEST123",
          brCode: "0001",
          cusTAXid: "1234567890123",
          cusFName: "Test Name",
          cusLName: "Test Surname",
          unit: "5",
          titleCode: "001"
        }
      });
    }
  }

  populateAddressForm() {
    if (!this.homeAddress && !this.currentAddress) {
      console.warn("No address data available to populate");
      return;
    }

    const homeAddressData = {
      housEno: this.homeAddress?.housEno || '',
      troG_SOI: this.homeAddress?.troG_SOI || '',
      road: this.homeAddress?.road || '',
      prvCODE: this.homeAddress?.prvCODE || '',
      ampCODE: this.homeAddress?.ampCODE || '',
      tmbCODE: this.homeAddress?.tmbCODE || '',
      phone: this.homeAddress?.phone || '',
      zipcodeHome: this.homeAddress?.zipcode || ''
    };

    const currentAddressData = {
      housEno: this.currentAddress?.housEno || '',
      troG_SOI: this.currentAddress?.troG_SOI || '',
      road: this.currentAddress?.road || '',
      prvCODE: this.currentAddress?.prvCODE || '',
      ampCODE: this.currentAddress?.ampCODE || '',
      tmbCODE: this.currentAddress?.tmbCODE || '',
      phone: this.currentAddress?.phone || '',
      zipcodeCurrent: this.currentAddress?.zipcode || '',
      addR1: this.currentAddress?.addR1 || '',
      addR2: this.currentAddress?.addR2 || ''
    };

    this.customerForm.patchValue({
      homeAddress: homeAddressData,
      currentAddress: currentAddressData
    });

    this.zipCodeHome = this.homeAddress?.zipcode || '';
    this.zipCodeCurrent = this.currentAddress?.zipcode || '';

    if (this.homeAddress?.prvCODE && this.homeAddress?.ampCODE && this.homeAddress?.tmbCODE) {
      this.updateHomeZipcode();
    }
    if (this.currentAddress?.prvCODE && this.currentAddress?.ampCODE && this.currentAddress?.tmbCODE) {
      this.updateCurrentZipcode();
    }

    this.cd.detectChanges();
  }

  updateHomeZipcode() {
    if (this.homeAddress?.zipcode) {
      this.zipCodeHome = this.homeAddress.zipcode;
    } else if (this.homeAddress && this.tumbonDataHome?.length > 0) {
      const zip = this.onZipcodeChangeHome(this.homeAddress.prvCODE, this.homeAddress.ampCODE, this.homeAddress.tmbCODE);
      this.zipCodeHome = zip;
    }
  }

  updateCurrentZipcode() {
    if (this.currentAddress?.zipcode) {
      this.zipCodeCurrent = this.currentAddress.zipcode;
    } else if (this.currentAddress && this.tumbonDataCurrent?.length > 0) {
      const zip = this.onZipcodeChangeCurrent(this.currentAddress.prvCODE, this.currentAddress.ampCODE, this.currentAddress.tmbCODE);
      this.zipCodeCurrent = zip;
    }
  }

  onProvinceChangeHome(prvCode: string, isFormMode = false) {
    this.metadataService.getAumphor(prvCode).subscribe({
      next: (res) => {
        this.ampDataHome = res;
        this.tumbonDataHome = [];
        if (!isFormMode) {
          this.homeAddress.ampCODE = '';
          this.homeAddress.tmbCODE = '';
        }
        this.cd.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  onProvinceChangeHomeForm(prvCode: string) {
    this.onProvinceChangeHome(prvCode, true);
  }

  onZipcodeChangeHome(prvCode: string, ampCode: string, tmbCode: string): string {
    const match = this.tumbonDataHome.find(z =>
      z.prvCode == prvCode && z.ampCode == ampCode && z.tmbCode == tmbCode
    );
    const zip = match?.zipCode || '';
    this.zipCodeHome = zip;
    this.customerForm.patchValue({
      homeAddress: { zipcodeHome: zip }
    });
    this.cd.detectChanges();
    return zip;
  }

  onAumphorChangeHome(prvCode: string, ampCode: string) {
    this.metadataService.getTumbons(prvCode, ampCode).subscribe({
      next: (res) => {
        this.tumbonDataHome = res;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.tumbonDataHome = [];
        this.cd.detectChanges();
      }
    });
  }

  onAumphorChangeHomeForm(prvCode: string, ampCode: string) {
    this.onAumphorChangeHome(prvCode, ampCode);
  }

  onProvinceChangeCurrent(prvCode: string, isFormMode = false) {
    this.metadataService.getAumphor(prvCode).subscribe({
      next: (res) => {
        this.ampDataCurrent = res;
        this.tumbonDataCurrent = [];
        if (!isFormMode) {
          this.currentAddress.ampCODE = '';
          this.currentAddress.tmbCODE = '';
        }
        this.cd.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  onProvinceChangeCurrentForm(prvCode: string) {
    this.onProvinceChangeCurrent(prvCode, true);
  }

  onAumphorChangeCurrent(prvCode: string, ampCode: string) {
    this.metadataService.getTumbons(prvCode, ampCode).subscribe({
      next: (res) => {
        this.tumbonDataCurrent = res;
        this.cd.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  onAumphorChangeCurrentForm(prvCode: string, ampCode: string) {
    this.onAumphorChangeCurrent(prvCode, ampCode);
  }

  onZipcodeChangeCurrent(prvCode: string, ampCode: string, tmbCode: string) {
    const match = this.tumbonDataCurrent.find(z =>
      z.prvCode == prvCode && z.ampCode == ampCode && z.tmbCode == tmbCode
    );
    const zip = match?.zipCode || '';
    this.zipCodeCurrent = zip;
    this.customerForm.patchValue({
      currentAddress: { zipcodeCurrent: zip }
    });
    this.cd.detectChanges();
    return zip;
  }

  onZipcodeChangeHomeForm(prvCode: string, ampCode: string, tmbCode: string): string {
    return this.onZipcodeChangeHome(prvCode, ampCode, tmbCode);
  }

  onZipcodeChangeCurrentForm(prvCode: string, ampCode: string, tmbCode: string): string {
    return this.onZipcodeChangeCurrent(prvCode, ampCode, tmbCode);
  }

  loadInitialAddressDataObservable() {
    const tasks = [];

    if (this.homeAddress?.prvCODE) {
      tasks.push(
        this.metadataService.getAumphor(this.homeAddress.prvCODE).pipe(
          switchMap((ampRes) => {
            this.ampDataHome = ampRes;
            this.cd.detectChanges();

            if (this.homeAddress?.ampCODE) {
              return this.metadataService.getTumbons(this.homeAddress.prvCODE, this.homeAddress.ampCODE).pipe(
                switchMap((tumbonRes) => {
                  this.tumbonDataHome = tumbonRes;
                  const zip = this.onZipcodeChangeHome(this.homeAddress.prvCODE, this.homeAddress.ampCODE, this.homeAddress.tmbCODE);
                  if (zip) {
                    this.customerForm.get('homeAddress.zipcodeHome')?.patchValue(zip);
                  }
                  this.cd.detectChanges();
                  return of(true);
                })
              );
            }
            return of(true);
          })
        )
      );
    }

    if (this.currentAddress?.prvCODE) {
      tasks.push(
        this.metadataService.getAumphor(this.currentAddress.prvCODE).pipe(
          switchMap((ampRes) => {
            this.ampDataCurrent = ampRes;
            this.cd.detectChanges();

            if (this.currentAddress?.ampCODE) {
              return this.metadataService.getTumbons(this.currentAddress.prvCODE, this.currentAddress.ampCODE).pipe(
                switchMap((tumbonRes) => {
                  this.tumbonDataCurrent = tumbonRes;
                  const zip = this.onZipcodeChangeCurrent(this.currentAddress.prvCODE, this.currentAddress.ampCODE, this.currentAddress.tmbCODE);
                  if (zip) {
                    this.customerForm.get('currentAddress.zipcodeCurrent')?.patchValue(zip);
                  }
                  this.cd.detectChanges();
                  return of(true);
                })
              );
            }
            return of(true);
          })
        )
      );
    }

    return forkJoin(tasks.length ? tasks : [of(true)]);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const submitter = (event as SubmitEvent).submitter as HTMLButtonElement;
    if (!submitter) return;
    
    if (!this.customerForm.valid) {
      console.warn("Form is not valid!");
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        text: 'กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้องและครบถ้วน',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    if (this.mode === 'new-shareholder') {
      this.submitNewShareholder();
    } else {
      this.submitExistingCustomer();
    }
  }

  submitNewShareholder() {
    const formData = this.customerForm.value;
    const customerData = formData.customer;
    const homeAddressData = formData.homeAddress;
    const currentAddressData = formData.currentAddress;
    const dividendData = formData.dividend;
    const detailSale = formData.detailSale;

    const requestPayload = {
      customer: {
        cusId: customerData.cusiD,
        cusCODE: customerData.cusCODE,
        docTYPE: customerData.docTYPE,
        titleCode: customerData.titleCode,
        cusFName: customerData.cusFName,
        cusLName: customerData.cusLName,
        cusTAXid: customerData.cusTAXid,
        phonE_MOBILE: customerData.phonE_MOBILE,
        email: customerData.email,
        brCode: customerData.brCode || '0001'
      },
      homeAddress: homeAddressData,
      currentAddress: currentAddressData,
      dividend: dividendData,
      stock: {
        stkTYPE: detailSale.stkTYPE || 'A',
        stkUNiT: detailSale.stkUNiT || 0,
        stkValue: detailSale.stkValue || 0,
        stkPayType: detailSale.stkPayTypeDetail || '',
        stkACCno: dividendData.stkACCno || '',
        stkACCname: dividendData.stkACCname || '',
        stkACCtype: dividendData.stkACCtype || ''
      }
    };

    this.loading = true;

    this.customerService.createNewShareholder(requestPayload).subscribe({
      next: (response: any) => {
        this.loading = false;
        
        Swal.fire({
          icon: 'success',
          title: 'สร้างผู้ถือหุ้นใหม่สำเร็จ!',
          text: 'ข้อมูลผู้ถือหุ้นใหม่ได้รับการบันทึกเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/dashboard-admin/search-edit']);
          }
        });
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Create new shareholder failed:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: error.error?.message || 'ไม่สามารถสร้างผู้ถือหุ้นใหม่ได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง'
        });
      }
    });
  }

  submitExistingCustomer() {
    const dividendData = this.customerForm.get('dividend')?.value;
    const detailSale = this.customerForm.get('detailSale')?.value;
    const formattedDate = this.convertDateToBuddhistFormat(detailSale?.stkSaleByCHQdat);

    const requestPayload = {
      stkOWNiD: this.cusId,
      stkTYPE: "A",
      stkPayType: detailSale?.stkPayTypeDetail || '',
      sktACCno: dividendData?.stkACCno || '',
      stkACCname: dividendData?.stkACCname || '',
      stkACCtype: dividendData?.stkACCtype || '',
      stkUNiT: detailSale?.stkUNiT || 0,
      stkValue: detailSale?.stkValue || 0,
      stkTRCode: "CSD",
      stkTRType: "STK",
      stkReqNo: detailSale?.stkReqNo || '',
      stkSaleByTRACCno: detailSale?.stkSaleByTRACCno || '',
      stkSaleByTRACCname: detailSale?.stkSaleByTRACCname || '',
      stkSaleByCHQno: detailSale?.stkSaleByCHQno || '',
      stkSaleByCHQdat: formattedDate || '',
      stkSaleByCHQbnk: detailSale?.stkSaleByCHQbnk || '',
      stkSaleByCHQbrn: detailSale?.stkSaleByCHQbrn || '',
    };
    
    requestPayload.stkValue = detailSale?.stkValue.replace(/,/g, '');
    requestPayload.stkUNiT = Number(requestPayload.stkUNiT);
    requestPayload.stkValue = Number(requestPayload.stkValue);

    this.loading = true;

    this.stockService.stockManage(requestPayload).subscribe({
      next: (response) => {
        this.res = response;
        this.loading = false;
        
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          html: `
          <p style="font-family: 'Prompt', sans-serif;">${this.res[1].RST} : ${this.res[1].errLine}${this.res[1].errNumber}${this.res[1].errSeverity}${this.res[1].errState} : ${this.res[1].MSG}</p>
          <p style="font-family: 'Prompt', sans-serif;">${this.res[0].RST} : ${this.res[0].errLine}${this.res[0].errNumber}${this.res[0].errSeverity}${this.res[0].errState} : ${this.res[0].MSG}</p>
          `,
          confirmButtonText: 'ตกลง',
        }).then((result) => {
          if (result.isConfirmed) {
            this.loading = false;
            this.activeView = 'search';
            this.cd.detectChanges();
          }
        });
        this.activeView = 'search';
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error("Update failed:", error);
        this.loading = false;
        
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          html: `
          <p style="font-family: 'Prompt', sans-serif;">${this.res[1].RST} : ${this.res[1].errLine}${this.res[1].errNumber}${this.res[1].errSeverity}${this.res[1].errState} : ${this.res[1].MSG}</p>
          <p style="font-family: 'Prompt', sans-serif;">${this.res[0].RST} : ${this.res[0].errLine}${this.res[0].errNumber}${this.res[0].errSeverity}${this.res[0].errState} : ${this.res[0].MSG}</p>
          `,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#dc3545',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            this.loading = false;
            this.cd.detectChanges();
          }
        });
      }
    });
  }

  convertDateToBuddhistFormat(date: Date): string {
    if (!date) return '';

    const year = date.getFullYear() + 543;
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    return `${year}${month}${day}`;
  }

  onUnitInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const numericString = input.value.replace(/\D/g, '');
    const numericValue = numericString ? Number(numericString) : 0;
    
    if (!numericValue) {
      this.unitText = '';
      this.valueText = '';
      this.customerForm.patchValue({
        detailSale: { stkValue: '' }
      }, { emitEvent: false });
      return;
    }
    
    input.value = numericValue.toLocaleString('en-US');
    
    // ตรวจสอบว่า pricePerUnit มีค่าหรือไม่
    if (!this.pricePerUnit || !this.pricePerUnit.stkBv) {
      console.warn('pricePerUnit is not available');
      return;
    }
    
    const stkValue = numericValue * this.pricePerUnit.stkBv;
    
    this.customerForm.patchValue({
      detailSale: { stkValue: stkValue.toLocaleString('en-US') }
    }, { emitEvent: false });
    
    this.valueText = ThaiBahtText(stkValue.toString());
    this.unitText = ThaiBahtText(numericValue.toString()).replace('บาทถ้วน', 'หุ้น');
    this.cd.detectChanges();
  }

  onBack() {
    this.activeView = 'search';
    this.cd.detectChanges();
  }
}