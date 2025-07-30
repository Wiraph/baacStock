import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/dashboard-admin/dashboard-admin';
import { AuthGuard } from './guards/auth-guard';
import { HomeComponent } from './components/dashboard-admin/home/home';
import { CommonSharesComponent } from './components/dashboard-admin/common-shares/common-shares';
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
import { BlockCertificatesComponent } from './components/dashboard-admin/block-certificates/block-certificates.component';
import { DividendComponent } from './components/dashboard-admin/dividend/dividend.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  // Dashboard Admin Routes
  {
    path: 'dashboard-admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'common-shares', component: CommonSharesComponent },
      { path: 'stocks', component: StocksComponent },
      { path: 'users', component: UsersComponent },
      { path: 'manage-user', component: ManageUserComponent },
      { path: 'approve-item', component: ApproveItemComponent },
      { path: 'search-edit', component: SearchEditComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'cratenewsharecertificate', component: CratenewsharecertificateComponent },
      { path: 'transfer-share', component: TransferShareComponent },
      { path: 'edit-customer', component: EditCustomerComponent },
      { path: 'print-share-purchase-request', component: PrintSharePurchaseRequestComponent },
      { path: 'print-certificates', component: PrintCertificatesComponent },
      { path: 'block-certificates', component: BlockCertificatesComponent },
      { path: 'dividend', component: DividendComponent }
    ]
  },

  { path: '**', redirectTo: '/login' }
];
