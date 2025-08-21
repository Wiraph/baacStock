import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/dashboard-admin/dashboard-admin';
import { AuthGuard } from './guards/auth-guard';
import { HomeComponent } from './components/dashboard-admin/home/home';
import { StocksComponent } from './components/dashboard-admin/stocks/stocks';
import { UsersComponent } from './components/dashboard-admin/users/users';
import { ManageUserComponent } from './components/dashboard-admin/manage-user/manage-user';
import { ApproveItemComponent } from './components/dashboard-admin/approve-item/approve-item';
import { SearchEditComponent } from './components/dashboard-admin/search-edit/search-edit';
import { ContactComponent } from './components/dashboard-admin/contact/contact';
import { ChangePasswordComponent } from './components/dashboard-admin/change-password/change-password';
import { CratenewsharecertificateComponent } from './components/dashboard-admin/cratenewsharecertificate/cratenewsharecertificate';
import { TransferShareComponent } from './components/dashboard-admin/transfer-share/transfer-share.component';
import { EditCustomerComponent } from './components/dashboard-admin/edit-customer/edit-customer.component';
import { PrintSharePurchaseRequestComponent } from './components/dashboard-admin/print-share-purchase-request/print-share-purchase-request';
import { PrintCertificatesComponent } from './components/dashboard-admin/print-certificates/print-certificates.component';
import { CreateSpinFilesComponent } from './components/dashboard-admin/create-spin-files/create-spin-files';
import { SpinFilesComponent } from './components/dashboard-admin/spin-files/spin-files';
import { BlockCertificatesComponent } from './components/dashboard-admin/block-certificates/block-certificates.component';
import { DividendComponent } from './components/dashboard-admin/dividend/dividend.component';
import { ReportsComponent } from './components/dashboard-admin/reports/reports.component';
import { DashboardHeadOfficeComponent } from './components/dashboard-head-office/dashboard-head-office';
import { ApproveIssue } from './components/dashboard-admin/approve-issue/approve-issue';
import { FormsProceduresComponent } from './components/dashboard-admin/forms-procedures/forms-procedures.component';
import { UploadComponent } from './components/dashboard-admin/upload-document/upload.component';
import { UserManualComponent } from './components/dashboard-admin/user-manual/user-manual.component';
import { Pnd2Component } from './components/dashboard-admin/pnd-system/pnd2/pnd2.component';
import { Pnd2aComponent } from './components/dashboard-admin/pnd-system/pnd2a/pnd2a.component';
import { Pnd53Component } from './components/dashboard-admin/pnd-system/pnd53/pnd53.component';
import { SaleStockComponent } from './components/dashboard-admin/sale-stock/sale-stock';
import { AnnualdividendcalculatorComponent } from './components/dashboard-admin/annualdividendcalculator/annualdividendcalculator';
import { NewCusComponent } from './components/dashboard-admin/newcus/newcus';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  // Dashboard Admin Routes
  {
    path: 'dashboard-admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard], // ✅ ใช้ AuthGuard เพื่อป้องกันการเข้าถึง
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent }, // ✅ เพิ่มเส้นทางสำหรับ HomeComponent
      { path: 'users', component: UsersComponent },
      { path: 'stocks', component: StocksComponent }, // ✅ เพิ่มเส้นทางสำหรับ StocksComponent
      { path: 'manage-user', component: ManageUserComponent }, // ✅ เพิ่มเส้นทางสำหรับ ManageUserComponent
      { path: 'contact', component: ContactComponent }, // ✅ เพิ่มเส้นทางสำหรับ ContactComponent
      { path: 'change-password', component: ChangePasswordComponent }, // ✅ เพิ่มเส้นทางสำหรับ ChangePasswordComponent
      { path: 'search-edit', component: SearchEditComponent}, // ✅ เพิ่มเส้นทางสำหรับ SearchEditComponent
      { path: 'editcustomer', component: EditCustomerComponent},
      { path: 'salestock', component: SaleStockComponent},
      { path: 'headoffice', component: DashboardHeadOfficeComponent},
      { path: 'transfer-share', component: TransferShareComponent }, // ✅ เพิ่มเส้นทางสำหรับ TransferShareComponent
      { path: 'approve-item', component: ApproveItemComponent},
      { path: 'approve-issue', component: ApproveIssue},
      { path: 'block-certificates', component: BlockCertificatesComponent},
      { path: 'print-certificates', component: PrintCertificatesComponent},
      { path: 'create-spin-files', component: CreateSpinFilesComponent },
      { path: 'spin-files', component: SpinFilesComponent },
      { path: 'dividend', component: DividendComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'cratenewsharecertificate', component: CratenewsharecertificateComponent },
      { path: 'print-share-purchase-request', component: PrintSharePurchaseRequestComponent },
      { path: 'documents/upload', component: UploadComponent }, 
      { path: 'documents/forms-procedures', component: FormsProceduresComponent },
      { path: 'documents/user-manual', component: UserManualComponent },
      { path: 'pnd2', component: Pnd2Component },
      { path: 'pnd2a', component: Pnd2aComponent },
      { path: 'pnd53', component: Pnd53Component },
      { path: 'AnnualDividendCalculatorComponent', component: AnnualdividendcalculatorComponent },
      { path: 'newcus', component: NewCusComponent }
    ]
  },
  {
    path: 'head-office',
    component: DashboardHeadOfficeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      // { path: 'common-shares', component: CommonSharesComponent },
      { path: 'stocks', component: StocksComponent },
      { path: 'users', component: UsersComponent },
      { path: 'manage-user', component: ManageUserComponent },
      { path: 'approve-item', component: ApproveItemComponent },
      { path: 'search-edit', component: SearchEditComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'transfer-share', component: TransferShareComponent },
      { path: 'edit-customer', component: EditCustomerComponent },
      { path: 'print-certificates', component: PrintCertificatesComponent },
      { path: 'block-certificates', component: BlockCertificatesComponent },
      { path: 'dividend', component: DividendComponent },
      { path: 'reports', component: ReportsComponent }
    ]
  },

  { path: '**', redirectTo: '/login' }
];
