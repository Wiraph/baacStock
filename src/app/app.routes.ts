import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/dashboard-admin/dashboard-admin';
import { UsersComponent } from './components/dashboard-admin/users/users'; // ✅ path ใหม่
import { AuthGuard } from './guards/auth-guard';
import { StocksComponent } from './components/dashboard-admin/stocks/stocks';
import { ManageUserComponent } from './components/dashboard-admin/manage-user/manage-user';
import { HomeComponent } from './components/dashboard-admin/home/home';
import { ContactComponent } from './components/dashboard-admin/contact/contact';
import { ChangePasswordComponent } from './components/dashboard-admin/change-password/change-password';
import { SearchEditComponent } from './components/dashboard-admin/search-edit/search-edit';
import { CommonSharesComponent } from './components/dashboard-admin/common-shares/common-shares';
import { DashboardHeadOfficeComponent } from './components/dashboard-head-office/dashboard-head-office';
import { HomeHeadOfficeComponent } from './components/dashboard-head-office/home/home';
import { ChangePasswordHeadOfficeComponent } from './components/dashboard-head-office/change-password/change-password';
import { PrintSharePurchaseRequestComponent } from './components/dashboard-admin/print-share-purchase-request/print-share-purchase-request';
import { CratenewsharecertificateComponent } from './components/dashboard-admin/cratenewsharecertificate/cratenewsharecertificate';
import { TransferShareComponent } from './components/dashboard-admin/transfer-share/transfer-share.component';
import { ApproveItemComponent } from './components/dashboard-admin/approve-item/approve-item';
import { ApproveIssue } from './components/dashboard-admin/approve-issue/approve-issue';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

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
      { path: 'common-shares', component: CommonSharesComponent},
      { path: 'headoffice', component: DashboardHeadOfficeComponent},
      { path: 'print-share-purchase-request', component: PrintSharePurchaseRequestComponent }, // ✅ เพิ่มเส้นทางสำหรับ PrintSharePurchaseRequestComponent
      { path: 'cratenewsharecertificate', component: CratenewsharecertificateComponent }, // ✅ เพิ่มเส้นทางสำหรับ CratenewsharecertificateComponent
      { path: 'transfer-share', component: TransferShareComponent }, // ✅ เพิ่มเส้นทางสำหรับ TransferShareComponent
      { path: 'approve-item', component: ApproveItemComponent},
      { path: 'approve-issue', component: ApproveIssue}
    ]
  },
  {
    path: 'head-office',
    component: DashboardHeadOfficeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeHeadOfficeComponent},
      { path: 'change-password', component: ChangePasswordHeadOfficeComponent }
    ]
  }
];
