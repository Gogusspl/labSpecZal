import {Component, OnInit, OnDestroy, ElementRef, HostListener, ViewChild, Output, EventEmitter} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../AuthService';

@Component({
  selector: 'app-shared-model',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, RouterLinkActive],
  templateUrl: './shared-model.html',
  styleUrls: ['./shared-model.css'],
})
export class SharedModel implements OnInit, OnDestroy {

  showLogin = false;
  isRegister = false;
  showSidebar = false;
  showUserMenu = false;

  username: string | null = null;

  @Output() loginRequested = new EventEmitter<void>();

  email = '';
  usernameInput = '';
  password = '';
  confirmPassword = '';
  country = '';

  private userSub?: Subscription;

  @ViewChild('userMenu', { static: false }) userMenuRef?: ElementRef;

  constructor(private authService: AuthService, private el: ElementRef) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe((user: string | null) => {
      this.username = user;
      if (!user) this.showUserMenu = false;
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    if (!this.showUserMenu) return;
    const target = event.target as Node | null;
    if (this.userMenuRef && this.userMenuRef.nativeElement) {
      const menuEl: Node = this.userMenuRef.nativeElement;
      if (target && !menuEl.contains(target)) {
        this.showUserMenu = false;
      }
    } else {
      this.showUserMenu = false;
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  openLogin() {
    this.showLogin = true;
    this.isRegister = false;
    this.loginRequested.emit();
  }

  closeLogin() {
    this.showLogin = false;
  }

  toggleRegister() {
    this.isRegister = !this.isRegister;
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
    this.showSidebar = false;
  }

  onSubmit() {
    if (this.isRegister) {
      if (this.password !== this.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      this.authService.register(this.usernameInput, this.email, this.password, this.country)
        .subscribe({
          next: () => {
            this.showLogin = true;
            this.isRegister = false;
          },
          error: err => {
            console.error('Registration failed:', err);
            const errorMessage = err.error?.error ?? 'An unexpected error occurred.';
            alert('Registration failed: ' + errorMessage);
          }
        });
    } else {
      this.authService.login(this.email, this.password)
        .subscribe({
          next: () => this.showLogin = false,
          error: err => {
            console.error('Login failed:', err);
            const errorMessage = err.error?.error ?? 'An unexpected error occurred.';
            alert('Login failed: ' + errorMessage);
          }
        });
    }
  }
}
