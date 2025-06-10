import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <header class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <nav class="dashboard-nav">
          <ul>
            <li><a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a></li>
            <li><a routerLink="/admin/users" routerLinkActive="active">Users</a></li>
            <li><a routerLink="/admin/settings" routerLinkActive="active">Settings</a></li>
          </ul>
        </nav>
      </header>

      <main class="dashboard-content">
        <div class="dashboard-stats">
          <div class="stat-card">
            <h3>Total Users</h3>
            <p class="stat-number">1,234</p>
          </div>
          <div class="stat-card">
            <h3>Active Sessions</h3>
            <p class="stat-number">56</p>
          </div>
          <div class="stat-card">
            <h3>Total Orders</h3>
            <p class="stat-number">789</p>
          </div>
        </div>

        <div class="dashboard-recent">
          <h2>Recent Activity</h2>
          <div class="activity-list">
            <div class="activity-item">
              <span class="activity-time">10:30 AM</span>
              <span class="activity-text">New user registration</span>
            </div>
            <div class="activity-item">
              <span class="activity-time">09:45 AM</span>
              <span class="activity-text">Order #12345 completed</span>
            </div>
            <div class="activity-item">
              <span class="activity-time">09:15 AM</span>
              <span class="activity-text">System update completed</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 30px;
    }

    .dashboard-header h1 {
      color: #333;
      margin-bottom: 20px;
    }

    .dashboard-nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      gap: 20px;
    }

    .dashboard-nav a {
      text-decoration: none;
      color: #666;
      padding: 8px 16px;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .dashboard-nav a:hover,
    .dashboard-nav a.active {
      background-color: #f0f0f0;
      color: #333;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 1rem;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
      margin: 0;
    }

    .dashboard-recent {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .dashboard-recent h2 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 10px;
      border-radius: 4px;
      background: #f8f8f8;
    }

    .activity-time {
      color: #666;
      font-size: 0.9rem;
    }

    .activity-text {
      color: #333;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Initialize dashboard data here
  }
} 