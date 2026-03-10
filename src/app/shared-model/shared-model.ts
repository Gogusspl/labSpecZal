import { Component, OnInit, OnDestroy, ElementRef, HostListener, ViewChild, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
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

  isLoading = false;

  private userSub?: Subscription;

  @ViewChild('userMenu', { static: false }) userMenuRef?: ElementRef;

  constructor(
    private authService: AuthService,
    private el: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe((user: string | null) => {
      this.username = user;
      if (!user) this.showUserMenu = false;
      this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      }
    } else {
      this.showUserMenu = false;
      this.cdr.detectChanges();
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.cdr.detectChanges();
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    this.cdr.detectChanges();
  }

  openLogin() {
    this.showLogin = true;
    this.isRegister = false;
    this.loginRequested.emit();
    this.cdr.detectChanges();
  }

  closeLogin() {
    this.showLogin = false;
    this.cdr.detectChanges();
  }

  toggleRegister() {
    this.isRegister = !this.isRegister;
    this.cdr.detectChanges();
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
    this.showSidebar = false;
    this.cdr.detectChanges();
  }

  onSubmit() {
    if (this.isLoading) return;

    if (this.isRegister) {
      if (this.password !== this.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      this.isLoading = true;
      this.authService.register(this.usernameInput, this.email, this.password, this.country)
        .pipe(finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
          next: () => {
            this.isRegister = false;
            this.showLogin = true;
            this.password = '';
            this.confirmPassword = '';
            this.cdr.detectChanges();
          },
          error: err => {
            console.error('Registration failed:', err);
            const errorMessage = err.error?.error ?? err.message ?? 'An unexpected error occurred.';
            alert('Registration failed: ' + errorMessage);
            this.cdr.detectChanges();
          }
        });

    } else {
      this.isLoading = true;
      this.authService.login(this.email, this.password)
        .pipe(finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
          next: () => {
            this.showLogin = false;
            this.email = '';
            this.password = '';
            this.cdr.detectChanges();
          },
          error: err => {
            console.error('Login failed:', err);
            const errorMessage = err.error?.error ?? err.message ?? 'An unexpected error occurred.';
            alert('Login failed: ' + errorMessage);
            this.cdr.detectChanges();
          }
        });
    }
  }
}
