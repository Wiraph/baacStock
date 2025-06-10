import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    // Here you would typically make an API call to authenticate
    if (this.username && this.password) {
      // For demo purposes, we'll just log in with any credentials
      console.log('Login attempt:', { username: this.username, password: this.password });
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Please enter both username and password';
    }
  }
} 