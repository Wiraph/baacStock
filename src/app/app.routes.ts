import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/dashboard-admin/dashboard-admin';
import { UsersComponent } from './components/dashboard-admin/users/users'; // ✅ path ใหม่
import { AuthGuard } from './guards/auth-guard';
import { StocksComponent } from './components/dashboard-admin/stocks/stocks';
import { ManageUserComponent } from './components/dashboard-admin/manage-user/manage-user';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard-admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard], // ✅ ใช้ AuthGuard เพื่อป้องกันการเข้าถึง
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UsersComponent },
      { path: 'stocks', component: StocksComponent }, // ✅ เพิ่มเส้นทางสำหรับ StocksComponent
      { path: 'manage-user', component: ManageUserComponent } // ✅ เพิ่มเส้นทางสำหรับ ManageUserComponent
    ]
  }
];
