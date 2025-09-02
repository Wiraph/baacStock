import { AfterViewInit, ChangeDetectorRef, Component, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, Input, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CustomerService } from '../../services/customer';
import { MatTabsModule } from '@angular/material/tabs';
import { AddressService, AddressDto } from '../../services/address';
import { of, forkJoin } from 'rxjs';
import { finalize, switchMap, map, catchError } from 'rxjs/operators';
import { Divident } from '../../services/divident';
import flatpickr from 'flatpickr';
import { Thai } from 'flatpickr/dist/l10n/th.js';
import { Thaidateadapter } from '../thaidateadapter/thaidateadapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import ThaiBahtText from 'thai-baht-text';
import { StockService } from '../../services/stock';
import { SystemMetadata } from '../../services/Metadata/system-metadata';
import { AddressMetadata } from '../../services/Metadata/address-metadata';
import { StockMetadata } from '../../services/Metadata/stock-metadata';
import { CustomerMetadata } from '../../services/Metadata/customer-metadata';

export const THAI_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'd MMMM yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'd MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};
@Component({
  standalone: true,
  selector: 'app-manage-from',
  imports: [CommonModule, ReactiveFormsModule, MatTabsModule, FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manage-from.html',
  styleUrl: './manage-from.css',
  providers: [
    { provide: DateAdapter, useClass: Thaidateadapter },
    { provide: MAT_DATE_FORMATS, useValue: THAI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' }
  ]
})
export class ManageFormComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() cusId!: string;
  @Input() mode!: string;
  @Output() back = new EventEmitter<string>();
  @Output() payload = new EventEmitter<FormGroup<any>>();
  readonly startDate = new Date();
  selectedDate?: Date;
  loading = false;
  customer: any = {};
  homeAddress: AddressDto | null = null;
  currentAddress: AddressDto | null = null;
  zipCodeHome: any = {};
  zipCodeCurrent: any = {};
  dividendData: any = {
    payDESC: '',
    stkPayType: '',
    stkACCno: '',
    stkACCname: ''
  };
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
  activeView = '';
  titleView: string | null = null;
  branch: string | null = null;
  customerForm!: FormGroup;

  constructor(
    private readonly customerService: CustomerService,
    private readonly cd: ChangeDetectorRef,
    private readonly addressService: AddressService,
    private readonly dividend: Divident,
    private readonly fb: FormBuilder,
    private readonly stockService: StockService,
    private readonly addressMetadataService: AddressMetadata,
    private readonly systemMetadataService: SystemMetadata,
    private readonly stockMetadataService: StockMetadata,
    private readonly customerMetadataServcie: CustomerMetadata,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) { }

  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift()!;
    return null;
  }

  ngOnInit(): void {
    this.loading = true;
    // ตรวจสอบว่าอยู่ใน browser environment หรือไม่
    if (isPlatformBrowser(this.platformId)) {
      console.log("All cookies:", document.cookie);
      const rawBrName = this.getCookie('BrName');
      this.branch = rawBrName ? decodeURIComponent(rawBrName) : null;
    }

    // ✅ สร้างฟอร์มก่อน
    this.customerForm = this.fb.group({
      customer: this.fb.group({
        cusCODE: [''],
        cusDESC: [''],
        cusCODEg: [''],
        cusDESCgABBR: [''],
        docTYPE: [''],
        cusiD: [''],
        cusiDnew: [''],
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
        stkACCtype: ['001']  // ตั้งค่าเริ่มต้นเป็น '001'
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

    // Initialize form control states
    this.updateFormControlStates();

    // Disable fields that should not be editable
    this.customerForm.get('detailSale.stkTYPE')?.disable();
    this.customerForm.get('dividend.stkACCtype')?.disable();

    // Subscribe to form value changes to update control states
    this.customerForm.get('detailSale.stkPayTypeDetail')?.valueChanges.subscribe(() => {
      this.updateFormControlStates();
    });

    this.customerForm.get('dividend.dividendStkPayType')?.valueChanges.subscribe(() => {
      this.updateFormControlStates();
    });

    // ✅ โหลด system config
    this.systemMetadataService.sysCfg().subscribe({
      next: (res: any) => {
        console.log('🔍 System config response:', res);
        this.pricePerUnit = res;  // เก็บ response ทั้งหมด
        console.log('🔍 pricePerUnit assigned:', this.pricePerUnit);
        this.cd.detectChanges();
      }, error: (err) => {
        console.log("Loading fail...", err);
      }
    });

    // ✅ ตรวจสอบ cusId ตั้งแต่เริ่มต้น (fallback)
    setTimeout(() => {
      console.log('🔍 Initial cusId check:', this.cusId);
      if (this.cusId && this.customerForm) {
        console.log('🔍 Loading data with initial cusId');
        this.handleData({ view: 'stksale', cusId: this.cusId });
      }
    }, 200);

  }

  ngOnChanges(changes: SimpleChanges): void {
    // ✅ เรียก updateFieldEditability เมื่อ mode เปลี่ยนแปลง
    if (changes['mode'] && this.customerForm) {
      console.log('🔍 mode changed to:', changes['mode'].currentValue);
      this.updateFieldEditability();
      this.cd.detectChanges();
    }

    // ✅ เรียก handleData เมื่อ cusId เปลี่ยนแปลง
    if (changes['cusId'].currentValue && this.customerForm) {
      setTimeout(() => {
        this.handleData({ view: 'stksale', cusId: changes['cusId'].currentValue });
      }, 100);
    }
  }

  ngAfterViewInit(): void {
    // ฟังก์ชันแปลงปี ค.ศ. เป็น พ.ศ.
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
    this.loading = true;

    if (!this.cusId) return;

    const requestPayload = { cusId: this.cusId };

    // โหลดข้อมูลหลักทั้งหมด
    forkJoin({
      customer: this.customerService.getCustomer(requestPayload).pipe(
        map(customerData => {
          console.log("Raw customer service response:", customerData);
          return customerData;
        }),
        catchError(err => {
          console.error("Customer service error:", err);
          return of(null);
        })
      ),
      address: this.addressService.getAddress(requestPayload).pipe(
        map(addressData => {
          return addressData;
        }),
        catchError(err => {
          console.error("Address service error:", err);
          return of({ homeAddress: null, currentAddress: null });
        })
      ),
      dividend: this.dividend.getDividend(requestPayload),
      provinces: this.addressMetadataService.getProvince(),
      titles: this.customerMetadataServcie.titles(),
      custypes: this.customerMetadataServcie.cusTypes(),
      doctypes: this.customerMetadataServcie.docTypes(),
      acctypes: this.stockMetadataService.accTypes(),
      stktypes: this.stockMetadataService.stkTyps(),
    })
      .pipe(
        switchMap((res) => {
          // เก็บข้อมูลตามโครงสร้าง API response - ข้อมูลอยู่ใน res.customer โดยตรง
          this.customer = res.customer || {};  // ข้อมูลลูกค้าจาก res.customer โดยตรง

          // Check if address data exists and has proper structure
          if (res.address && (res.address.homeAddress || res.address.currentAddress)) {
            this.homeAddress = res.address.homeAddress;
            this.currentAddress = res.address.currentAddress;
          } else {
            this.homeAddress = this.addressService.getDefaultAddress();
            this.currentAddress = this.addressService.getDefaultAddress();
          }

          this.dividendData = res.dividend || {
            payDESC: '',
            stkPayType: '',
            stkACCno: '',
            stkACCname: '',
            stkACCtype: '',
          };

          this.prvData = res.provinces;
          this.titleList = res.titles;
          this.custypeList = res.custypes;
          this.doctypeList = res.doctypes;
          this.actypeList = res.acctypes;
          this.stkTypeList = res.stktypes;

          // Populate ข้อมูลลูกค้าและที่อยู่ลงใน form
          this.populateCustomerForm();
          this.populateAddressForm();

          // Force immediate UI update
          setTimeout(() => {
            this.cd.detectChanges();
          }, 0);

          // โหลดอำเภอ/ตำบลของทั้งสองที่อยู่
          return this.loadInitialAddressDataObservable();
        }),
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          console.log("ข้อมูลทั้งหมดโหลดเรียบร้อย");
          this.loading = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error("โหลดข้อมูลผิดพลาด", err);
          this.loading = false;
        }
      });
  }

  populateCustomerForm() {
    if (this.customer && Object.keys(this.customer).length > 0) {
      const customerFormData = {
        cusCODE: this.customer.cusCODE || '',
        cusDESC: this.customer.cusDESCg || '', // ใช้ cusDESCg จาก API
        cusCODEg: this.customer.cusCODEg || '',
        cusDESCgABBR: this.customer.cusDESCgABBR || '',
        docTYPE: this.customer.docTYPE || '',
        cusiD: this.customer.cusiD || '',
        cusiDnew: this.customer.cusiD || '',
        brCode: this.customer.brCode || '',
        cusTAXid: this.customer.cusTAXid || '',
        cusFName: this.customer.cusFName || '',
        cusLName: this.customer.cusLName || '',
        unit: this.customer.unit || '0',  // ใช้ unit จาก customer object โดยตรง
        titleCode: this.customer.titleCode || '',
        email: this.customer.email || '',
        phonE_MOBILE: this.customer.phonE_MOBILE || ''
      };

      console.log('🔍 customerFormData:', customerFormData);

      this.customerForm.patchValue({
        customer: customerFormData,
        dividend: {
          stkPayType: this.dividendData?.stkPayType || '',
          dividendStkPayType: this.dividendData?.stkPayType || '',
          stkACCno: this.dividendData?.stkACCno || '',
          stkACCname: this.dividendData?.stkACCname || '',
          stkACCtype: this.dividendData?.stkACCtype || '001'  // ตั้งค่า fallback เป็น '001'
        }
      });

      console.log('🔍 Form values after patch:', this.customerForm.value);

      // ✅ เรียกใช้: จัดการ editable state ตาม mode
      setTimeout(() => {
        this.updateFieldEditability();
        this.cd.detectChanges();
      }, 0);

      // Ensure disabled fields remain disabled after populating data
      this.customerForm.get('detailSale.stkTYPE')?.disable();
      this.customerForm.get('dividend.stkACCtype')?.disable();
    } else {
      // Ensure disabled fields remain disabled after populating data
      this.customerForm.get('detailSale.stkTYPE')?.disable();
      this.customerForm.get('dividend.stkACCtype')?.disable();
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
      zipcodeHome: this.homeAddress?.zipcode || ''  // ✅ ใช้ zipcode จาก API
    };

    const currentAddressData = {
      housEno: this.currentAddress?.housEno || '',
      troG_SOI: this.currentAddress?.troG_SOI || '',
      road: this.currentAddress?.road || '',
      prvCODE: this.currentAddress?.prvCODE || '',
      ampCODE: this.currentAddress?.ampCODE || '',
      tmbCODE: this.currentAddress?.tmbCODE || '',
      phone: this.currentAddress?.phone || '',
      zipcodeCurrent: this.currentAddress?.zipcode || '',  // ✅ ใช้ zipcode จาก API
      addR1: this.currentAddress?.addR1 || '',
      addR2: this.currentAddress?.addR2 || ''
    };

    this.customerForm.patchValue({
      homeAddress: homeAddressData,
      currentAddress: currentAddressData
    });

    // อัปเดต zipcode variables ด้วยข้อมูลจาก API
    this.zipCodeHome = this.homeAddress?.zipcode || '';
    this.zipCodeCurrent = this.currentAddress?.zipcode || '';

    // Update zipcode immediately if data is available (fallback)
    if (this.homeAddress?.prvCODE && this.homeAddress?.ampCODE && this.homeAddress?.tmbCODE) {
      this.updateHomeZipcode();
    }
    if (this.currentAddress?.prvCODE && this.currentAddress?.ampCODE && this.currentAddress?.tmbCODE) {
      this.updateCurrentZipcode();
    }

    this.cd.detectChanges();
  }

  updateHomeZipcode() {
    // ใช้ zipcode จาก API ก่อน ถ้าไม่มีค่อยคำนวณใหม่
    if (this.homeAddress?.zipcode) {
      this.zipCodeHome = this.homeAddress.zipcode;
    } else if (this.homeAddress && this.tumbonDataHome?.length > 0) {
      const zip = this.onZipcodeChangeHome(this.homeAddress.prvCODE, this.homeAddress.ampCODE, this.homeAddress.tmbCODE);
      this.zipCodeHome = zip;
    }
  }

  updateCurrentZipcode() {
    // ใช้ zipcode จาก API ก่อน ถ้าไม่มีค่อยคำนวณใหม่
    if (this.currentAddress?.zipcode) {
      this.zipCodeCurrent = this.currentAddress.zipcode;
    } else if (this.currentAddress && this.tumbonDataCurrent?.length > 0) {
      const zip = this.onZipcodeChangeCurrent(this.currentAddress.prvCODE, this.currentAddress.ampCODE, this.currentAddress.tmbCODE);
      this.zipCodeCurrent = zip;
    }
  }

  onProvinceChangeHome(prvCode: string) {
    console.log('🔍 Province changed (Home):', prvCode);
    if (!prvCode) return;

    this.addressMetadataService.getAumphor(prvCode).subscribe({
      next: (res) => {
        console.log('🔍 Amphur data loaded (Home):', res);
        setTimeout(() => {
          this.ampDataHome = res;
          this.tumbonDataHome = [];
          // Reset form values
          this.customerForm.patchValue({
            homeAddress: {
              ampCODE: '',
              tmbCODE: '',
              zipcodeHome: ''
            }
          });
          this.zipCodeHome = '';
          this.cd.detectChanges();
        }, 0);
      },
      error: (err) => console.error('Error loading amphur (Home):', err)
    });
  }

  onZipcodeChangeHome(prvCode: string, ampCode: string, tmbCode: string): string {
    const match = this.tumbonDataHome.find(z =>
      z.prvCode == prvCode &&
      z.ampCode == ampCode &&
      z.tmbCode == tmbCode
    );
    const zip = match?.zipCode || '';
    this.zipCodeHome = zip;
    this.customerForm.patchValue({
      homeAddress: {
        zipcodeHome: zip
      }
    });
    return zip; // ✅ เพิ่ม return
  }


  onAumphorChangeHome(prvCode: string, ampCode: string) {
    console.log('🔍 Amphur changed (Home):', prvCode, ampCode);
    if (!prvCode || !ampCode) return;

    this.addressMetadataService.getTumbon(prvCode, ampCode).subscribe({
      next: (res) => {
        console.log('🔍 Tumbon data loaded (Home):', res);
        setTimeout(() => {
          this.tumbonDataHome = res;
          // Reset form values
          this.customerForm.patchValue({
            homeAddress: {
              tmbCODE: '',
              zipcodeHome: ''
            }
          });
          this.zipCodeHome = '';
          this.cd.detectChanges();
        }, 0);
      },
      error: (err) => console.error('Error loading tumbon (Home):', err)
    });
  }

  onProvinceChangeCurrent(prvCode: string) {
    console.log('🔍 Province changed (Current):', prvCode);
    if (!prvCode) return;

    this.addressMetadataService.getAumphor(prvCode).subscribe({
      next: (res) => {
        console.log('🔍 Amphur data loaded (Current):', res);
        setTimeout(() => {
          this.ampDataCurrent = res;
          this.tumbonDataCurrent = [];
          // Reset form values
          this.customerForm.patchValue({
            currentAddress: {
              ampCODE: '',
              tmbCODE: '',
              zipcodeCurrent: ''
            }
          });
          this.zipCodeCurrent = '';
          this.cd.detectChanges();
        }, 0);
      },
      error: (err) => console.error('Error loading amphur (Current):', err)
    });
  }

  onAumphorChangeCurrent(prvCode: string, ampCode: string) {
    console.log('🔍 Amphur changed (Current):', prvCode, ampCode);
    if (!prvCode || !ampCode) return;

    this.addressMetadataService.getTumbon(prvCode, ampCode).subscribe({
      next: (res) => {
        console.log('🔍 Tumbon data loaded (Current):', res);
        setTimeout(() => {
          this.tumbonDataCurrent = res;
          // Reset form values
          this.customerForm.patchValue({
            currentAddress: {
              tmbCODE: '',
              zipcodeCurrent: ''
            }
          });
          this.zipCodeCurrent = '';
          this.cd.detectChanges();
        }, 0);
      },
      error: (err) => console.error('Error loading tumbon (Current):', err)
    });
  }

  onZipcodeChangeCurrent(prvCode: string, ampCode: string, tmbCode: string) {
    const match = this.tumbonDataCurrent.find(z =>
      z.prvCode == prvCode &&
      z.ampCode == ampCode &&
      z.tmbCode == tmbCode
    );
    const zip = match?.zipCode || '';
    this.customerForm.patchValue({
      currentAddress: {
        zipcodeCurrent: zip
      }
    });

    return zip;
  }

  onTumbonChangeHome(tmbCode: string) {
    console.log('🔍 Tumbon changed (Home):', tmbCode);
    if (!tmbCode) return;

    const prvCode = this.customerForm.get('homeAddress.prvCODE')?.value;
    const ampCode = this.customerForm.get('homeAddress.ampCODE')?.value;

    if (prvCode && ampCode) {
      const zip = this.onZipcodeChangeHome(prvCode, ampCode, tmbCode);
      console.log('🔍 Zipcode calculated (Home):', zip);
    }
  }

  onTumbonChangeCurrent(tmbCode: string) {
    console.log('🔍 Tumbon changed (Current):', tmbCode);
    if (!tmbCode) return;

    const prvCode = this.customerForm.get('currentAddress.prvCODE')?.value;
    const ampCode = this.customerForm.get('currentAddress.ampCODE')?.value;

    if (prvCode && ampCode) {
      const zip = this.onZipcodeChangeCurrent(prvCode, ampCode, tmbCode);
      console.log('🔍 Zipcode calculated (Current):', zip);
    }
  }



  loadInitialAddressDataObservable() {
    const tasks = [];

    // สำหรับที่อยู่บ้าน
    if (this.homeAddress?.prvCODE) {
      tasks.push(
        this.addressMetadataService.getAumphor(this.homeAddress.prvCODE).pipe(
          switchMap((ampRes) => {
            // ใช้ setTimeout เพื่อหลีกเลี่ยง change detection error
            setTimeout(() => {
              this.ampDataHome = ampRes;
              this.cd.detectChanges();
            }, 0);

            if (this.homeAddress?.ampCODE) {
              return this.addressMetadataService.getTumbon(this.homeAddress.prvCODE, this.homeAddress.ampCODE).pipe(
                switchMap((tumbonRes) => {
                  setTimeout(() => {
                    this.tumbonDataHome = tumbonRes;

                    // 🔽 อัปเดต ZipCode จากฟังก์ชัน
                    const zip = this.homeAddress ? this.onZipcodeChangeHome(this.homeAddress.prvCODE, this.homeAddress.ampCODE, this.homeAddress.tmbCODE) : '';

                    // 🔽 ใส่ zip เข้า form
                    if (zip) {
                      this.customerForm.get('homeAddress.zipcodeHome')?.patchValue(zip);
                    }

                    this.cd.detectChanges();
                  }, 0);

                  return of(true);
                })
              );
            }

            return of(true);
          })
        )
      );
    }

    // สำหรับที่อยู่ปัจจุบัน
    if (this.currentAddress?.prvCODE) {
      tasks.push(
        this.addressMetadataService.getAumphor(this.currentAddress.prvCODE).pipe(
          switchMap((ampRes) => {
            // ใช้ setTimeout เพื่อหลีกเลี่ยง change detection error
            setTimeout(() => {
              this.ampDataCurrent = ampRes;
              this.cd.detectChanges();
            }, 0);

            if (this.currentAddress?.ampCODE) {
              return this.addressMetadataService.getTumbon(this.currentAddress.prvCODE, this.currentAddress.ampCODE).pipe(
                switchMap((tumbonRes) => {
                  setTimeout(() => {
                    this.tumbonDataCurrent = tumbonRes;

                    // 🔽 อัปเดต ZipCode จากฟังก์ชัน
                    const zip = this.currentAddress ? this.onZipcodeChangeCurrent(this.currentAddress.prvCODE, this.currentAddress.ampCODE, this.currentAddress.tmbCODE) : '';

                    // 🔽 ใส่ zip เข้า form
                    if (zip) {
                      this.customerForm.get('currentAddress.zipcodeCurrent')?.patchValue(zip);
                    }

                    this.cd.detectChanges();
                  }, 0);

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


  reloadCustomerData() {
    console.log("=== Reloading customer data ===");

    if (!this.cusId) {
      console.warn("No customer ID available for reload");
      return;
    }

    // เรียกใช้ handleData เพื่อโหลดข้อมูลใหม่
    const eventData = {
      view: 'edit',
      cusId: this.cusId
    };

    this.handleData(eventData);
  }

  convertDateToBuddhistFormat(date: Date): string {
    if (!date) return '';

    const year = date.getFullYear() + 543;
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    return `${year}${month}${day}`; // เช่น 25680707
  }

  onUnitInput(event: Event) {
    const input = event.target as HTMLInputElement;
    console.log('🔍 onUnitInput called, pricePerUnit:', this.pricePerUnit);

    // ดึงเฉพาะตัวเลข
    const numericString = input.value.replace(/\D/g, '');
    const numericValue = numericString ? Number(numericString) : 0;

    if (!numericValue) {
      this.unitText = '';
      this.valueText = '';
      this.customerForm.patchValue({
        detailSale: { stkValue: '' } // ให้เป็นค่าว่างเวลาไม่มีข้อมูล
      }, { emitEvent: false });
      return;
    }

    // ใส่ comma ในช่องจำนวนหุ้น
    input.value = numericValue.toLocaleString('en-US');

    // ตรวจสอบว่า pricePerUnit มีค่าหรือไม่
    const pricePerShare = this.pricePerUnit?.stkBv || this.pricePerUnit || 0;
    console.log('🔍 pricePerShare:', pricePerShare);

    if (!pricePerShare) {
      console.warn('⚠️ pricePerShare is 0 or undefined');
      this.unitText = '';
      this.valueText = '';
      return;
    }

    // คำนวณมูลค่า
    const stkValue = numericValue * pricePerShare;
    console.log('🔍 Calculation:', numericValue, '*', pricePerShare, '=', stkValue);

    // อัปเดตฟอร์ม โดยแสดง comma ในช่องมูลค่า
    this.customerForm.patchValue({
      detailSale: { stkValue: stkValue.toLocaleString('en-US') }
    }, { emitEvent: false });

    // แปลงเป็นข้อความภาษาไทย
    this.valueText = ThaiBahtText(stkValue.toString());
    this.unitText = ThaiBahtText(numericValue.toString()).replace('บาทถ้วน', 'หุ้น');

    console.log('🔍 unitText:', this.unitText);
    console.log('🔍 valueText:', this.valueText);

    this.cd.detectChanges();
  }


  // ฟังก์ชันสำหรับตรวจสอบวิธีการชำระเงิน
  getPaymentMethod(): string {
    return this.customerForm?.get('detailSale.stkPayTypeDetail')?.value || '';
  }

  // ฟังก์ชันสำหรับตรวจสอบว่าควรเป็นสีเทาหรือไม่
  shouldBeGrayedOut(fieldType: string): boolean {
    const paymentMethod = this.getPaymentMethod();

    if (fieldType === 'bankTransfer' && paymentMethod !== '001') {
      return true; // ช่องโอนจากบัญชีควรเป็นสีเทาเมื่อไม่ได้เลือก
    }

    if (fieldType === 'cheque' && paymentMethod !== '004') {
      return true; // ช่องเช็คควรเป็นสีเทาเมื่อไม่ได้เลือก
    }

    return false;
  }

  // ฟังก์ชันสำหรับตรวจสอบวิธีการรับเงินปันผล
  getDividendPaymentMethod(): string {
    return this.customerForm?.get('dividend.dividendStkPayType')?.value || '';
  }

  // ฟังก์ชันสำหรับตรวจสอบว่าควรเป็นสีเทาหรือไม่สำหรับรับเงินปันผล
  shouldBeGrayedOutDividend(fieldType: string): boolean {
    const dividendMethod = this.getDividendPaymentMethod();

    if (fieldType === 'bankAccount' && dividendMethod !== '001') {
      return true; // ช่องบัญชีเงินฝากควรเป็นสีเทาเมื่อไม่ได้เลือก
    }

    return false;
  }

  // ฟังก์ชันสำหรับจัดการ disabled state ของ form controls
  updateFormControlStates() {
    const paymentMethod = this.getPaymentMethod();
    const dividendMethod = this.getDividendPaymentMethod();

    // Payment method controls
    if (paymentMethod === '001') {
      this.customerForm.get('detailSale.stkSaleByTRACCno')?.enable();
      this.customerForm.get('detailSale.stkSaleByTRACCname')?.enable();
    } else {
      this.customerForm.get('detailSale.stkSaleByTRACCno')?.disable();
      this.customerForm.get('detailSale.stkSaleByTRACCname')?.disable();
    }

    if (paymentMethod === '004') {
      this.customerForm.get('detailSale.stkSaleByCHQno')?.enable();
      this.customerForm.get('detailSale.stkSaleByCHQdat')?.enable();
      this.customerForm.get('detailSale.stkSaleByCHQbnk')?.enable();
      this.customerForm.get('detailSale.stkSaleByCHQbrn')?.enable();
    } else {
      this.customerForm.get('detailSale.stkSaleByCHQno')?.disable();
      this.customerForm.get('detailSale.stkSaleByCHQdat')?.disable();
      this.customerForm.get('detailSale.stkSaleByCHQbnk')?.disable();
      this.customerForm.get('detailSale.stkSaleByCHQbrn')?.disable();
    }

    // Dividend method controls
    if (dividendMethod === '001') {
      this.customerForm.get('dividend.stkACCno')?.enable();
      this.customerForm.get('dividend.stkACCname')?.enable();
    } else {
      this.customerForm.get('dividend.stkACCno')?.disable();
      this.customerForm.get('dividend.stkACCname')?.disable();
    }

    if (this.mode === 'editcus') {
      this.titleView = 'แก้ไขข้อมูล ';
      this.customerForm.get('customer.cusFName')?.enable();
      this.cd.detectChanges();
    }
  }

  onBack() {
    this.back.emit();
  }

  // ✅ Helper method สำหรับ template
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  onSubmit() {
    this.payload.emit(this.customerForm);
  }

  // ✅ เพิ่ม: จัดการ editable state ของฟิลด์ต่างๆ
  private updateFieldEditability() {
    console.log('🔍 updateFieldEditability called, mode:', this.mode);

    if (this.mode === 'editcus') {
      // ฟิลด์ที่แก้ไขได้ - enable
      this.customerForm.get('customer.cusFName')?.enable();
      this.customerForm.get('customer.cusLName')?.enable();
      this.customerForm.get('customer.cusTAXid')?.enable();
      this.customerForm.get('customer.phonE_MOBILE')?.enable();
      this.customerForm.get('customer.email')?.enable();
      this.customerForm.get('customer.titleCode')?.enable();
      this.customerForm.get('customer.docTYPE')?.enable();
      this.customerForm.get('customer.cusCODE')?.enable();
      this.customerForm.get('customer.cusiDnew')?.enable();

      // ที่อยู่ที่แก้ไขได้
      this.customerForm.get('homeAddress.housEno')?.enable();
      this.customerForm.get('homeAddress.troG_SOI')?.enable();
      this.customerForm.get('homeAddress.road')?.enable();
      this.customerForm.get('homeAddress.phone')?.enable();
      this.customerForm.get('homeAddress.prvCODE')?.enable();
      this.customerForm.get('homeAddress.ampCODE')?.enable();
      this.customerForm.get('homeAddress.tmbCODE')?.enable();

      this.customerForm.get('currentAddress.housEno')?.enable();
      this.customerForm.get('currentAddress.troG_SOI')?.enable();
      this.customerForm.get('currentAddress.road')?.enable();
      this.customerForm.get('currentAddress.phone')?.enable();
      this.customerForm.get('currentAddress.prvCODE')?.enable();
      this.customerForm.get('currentAddress.ampCODE')?.enable();
      this.customerForm.get('currentAddress.tmbCODE')?.enable();

      // ฟิลด์ขายหุ้นที่แก้ไขได้
      this.customerForm.get('detailSale.stkReqNo')?.enable();
      this.customerForm.get('detailSale.stkUNiT')?.enable();
      this.customerForm.get('detailSale.stkPayTypeDetail')?.enable();
      this.customerForm.get('detailSale.stkSaleByTRACCno')?.enable();
      this.customerForm.get('detailSale.stkSaleByTRACCname')?.enable();
      this.customerForm.get('detailSale.stkSaleByCHQno')?.enable();
      this.customerForm.get('detailSale.stkSaleByCHQdat')?.enable();
      this.customerForm.get('detailSale.stkSaleByCHQbnk')?.enable();
      this.customerForm.get('detailSale.stkSaleByCHQbrn')?.enable();

      // ฟิลด์เงินปันผลที่แก้ไขได้
      this.customerForm.get('dividend.dividendStkPayType')?.enable();
      this.customerForm.get('dividend.stkACCno')?.enable();
      this.customerForm.get('dividend.stkACCname')?.enable();

      console.log('✅ All fields enabled for editcus mode');

    } else if (this.mode === 'stksale') {
      // ฟิลด์ที่แก้ไขได้ - enable
      this.customerForm.get('customer.cusFName')?.disable();
      this.customerForm.get('customer.cusLName')?.disable();
      this.customerForm.get('customer.cusTAXid')?.disable();
      this.customerForm.get('customer.phonE_MOBILE')?.disable();
      this.customerForm.get('customer.email')?.disable();
      this.customerForm.get('customer.titleCode')?.disable();
      this.customerForm.get('customer.docTYPE')?.disable();
      this.customerForm.get('customer.cusCODE')?.disable();
      this.customerForm.get('customer.cusiDnew')?.disable();

      // ที่อยู่ที่แก้ไขได้
      this.customerForm.get('homeAddress.housEno')?.disable();
      this.customerForm.get('homeAddress.troG_SOI')?.disable();
      this.customerForm.get('homeAddress.road')?.disable();
      this.customerForm.get('homeAddress.phone')?.disable();
      this.customerForm.get('homeAddress.prvCODE')?.disable();
      this.customerForm.get('homeAddress.ampCODE')?.disable();
      this.customerForm.get('homeAddress.tmbCODE')?.disable();

      this.customerForm.get('currentAddress.housEno')?.disable();
      this.customerForm.get('currentAddress.troG_SOI')?.disable();
      this.customerForm.get('currentAddress.road')?.disable();
      this.customerForm.get('currentAddress.phone')?.disable();
      this.customerForm.get('currentAddress.prvCODE')?.disable();
      this.customerForm.get('currentAddress.ampCODE')?.disable();
      this.customerForm.get('currentAddress.tmbCODE')?.disable();

      // ฟิลด์ขายหุ้นที่แก้ไขได้
      this.customerForm.get('detailSale.stkReqNo')?.enable();
      this.customerForm.get('detailSale.stkUNiT')?.enable();
      this.customerForm.get('detailSale.stkPayTypeDetail')?.enable();
      this.customerForm.get('detailSale.stkSaleByTRACCno')?.enable();
      this.customerForm.get('detailSale.stkSaleByTRACCname')?.enable();
      this.customerForm.get('detailSale.stkSaleByCHQno')?.enable();
      this.customerForm.get('detailSale.stkSaleByCHQdat')?.enable();
      this.customerForm.get('detailSale.stkSaleByCHQbnk')?.enable();
      this.customerForm.get('detailSale.stkSaleByCHQbrn')?.enable();

      // ฟิลด์เงินปันผลที่แก้ไขได้
      this.customerForm.get('dividend.dividendStkPayType')?.enable();
      this.customerForm.get('dividend.stkACCno')?.enable();
      this.customerForm.get('dividend.stkACCname')?.enable();
    } else {
      // ฟิลด์ที่แก้ไขไม่ได้ - disable
      this.customerForm.get('customer.cusFName')?.disable();
      this.customerForm.get('customer.cusLName')?.disable();
      this.customerForm.get('customer.cusTAXid')?.disable();
      this.customerForm.get('customer.phonE_MOBILE')?.disable();
      this.customerForm.get('customer.email')?.disable();
      this.customerForm.get('customer.titleCode')?.disable();
      this.customerForm.get('customer.docTYPE')?.disable();
      this.customerForm.get('customer.cusCODE')?.disable();
      this.customerForm.get('customer.cusiDnew')?.enable();

      // ที่อยู่ที่แก้ไขไม่ได้
      this.customerForm.get('homeAddress.housEno')?.disable();
      this.customerForm.get('homeAddress.troG_SOI')?.disable();
      this.customerForm.get('homeAddress.road')?.disable();
      this.customerForm.get('homeAddress.phone')?.disable();
      this.customerForm.get('homeAddress.prvCODE')?.disable();
      this.customerForm.get('homeAddress.ampCODE')?.disable();
      this.customerForm.get('homeAddress.tmbCODE')?.disable();

      this.customerForm.get('currentAddress.housEno')?.disable();
      this.customerForm.get('currentAddress.troG_SOI')?.disable();
      this.customerForm.get('currentAddress.road')?.disable();
      this.customerForm.get('currentAddress.phone')?.disable();
      this.customerForm.get('currentAddress.prvCODE')?.disable();
      this.customerForm.get('currentAddress.ampCODE')?.disable();
      this.customerForm.get('currentAddress.tmbCODE')?.disable();

      // ฟิลด์ขายหุ้นที่แก้ไขไม่ได้
      this.customerForm.get('detailSale.stkReqNo')?.disable();
      this.customerForm.get('detailSale.stkUNiT')?.disable();
      this.customerForm.get('detailSale.stkPayTypeDetail')?.disable();
      this.customerForm.get('detailSale.stkSaleByTRACCno')?.disable();
      this.customerForm.get('detailSale.stkSaleByTRACCname')?.disable();
      this.customerForm.get('detailSale.stkSaleByCHQno')?.disable();
      this.customerForm.get('detailSale.stkSaleByCHQdat')?.disable();
      this.customerForm.get('detailSale.stkSaleByCHQbnk')?.disable();
      this.customerForm.get('detailSale.stkSaleByCHQbrn')?.disable();

      // ฟิลด์เงินปันผลที่แก้ไขไม่ได้
      this.customerForm.get('dividend.dividendStkPayType')?.disable();
      this.customerForm.get('dividend.stkACCno')?.disable();
      this.customerForm.get('dividend.stkACCname')?.disable();

      console.log('✅ All fields disabled for non-editcus mode');
    }

    // ฟิลด์ที่ห้ามแก้ไขเสมอ
    this.customerForm.get('customer.unit')?.disable();
    this.customerForm.get('customer.brCode')?.disable();
    this.customerForm.get('customer.cusiD')?.disable();
    this.customerForm.get('currentAddress.addR1')?.disable();
    this.customerForm.get('currentAddress.addR2')?.disable();
  }
}