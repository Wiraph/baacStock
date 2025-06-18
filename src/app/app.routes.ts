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
      { path: 'common-shares', component: CommonSharesComponent}
    ]
  }
];
