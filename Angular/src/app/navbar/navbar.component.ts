import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  router = inject(Router);
  authService = inject(Auth);
  userDeatils = this.authService.getUserDetails();
  userName = this.userDeatils ? this.userDeatils?.firstName + " " + this.userDeatils?.lastName  : '';
  profileImageUrl = '';
  showProfileMenu = false;
  private elementRef = inject(ElementRef);
  baseUrl = environment.apiBaseUrl;

  ngOnInit() {
  this.authService.user$.subscribe(user => {
    if (user) {
      this.userName = `${user.firstName} ${user.lastName}`;
      this.profileImageUrl = user.profile_image || '';
    } else {
      this.userName = '';
      this.profileImageUrl = '';
    }
  });
}


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showProfileMenu && this.elementRef.nativeElement) {
      const clickedInside = this.elementRef.nativeElement.contains(
        event.target
      );
      if (!clickedInside) {
        this.showProfileMenu = false;
      }
    }
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  goToAbout() {
    this.router.navigateByUrl('/about');
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  openMenu() {}
}
