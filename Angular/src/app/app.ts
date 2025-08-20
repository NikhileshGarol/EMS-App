import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Auth } from './services/auth';
import { MatDialog } from '@angular/material/dialog';
import { SessionTimeoutDialogComponent } from './components/modals/session-timeout/session-timeout-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'angular-poc';
  private intervalId: any;
  router = inject(Router);
  auth = inject(Auth);
  dialog = inject(MatDialog);

  ngOnInit() {
    const updateActivity = () => {
      localStorage.setItem('lastActiveTime', Date.now().toString());
    };
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);

    updateActivity();
    let dialogOpen = false;
    this.intervalId = setInterval(() => {
      if (!this.auth.isUserActive() && !dialogOpen) {
        dialogOpen = true;
        const dialogRef = this.dialog.open(SessionTimeoutDialogComponent, {
          width: '400px',
          disableClose: true,
        });
        // when the dialog closes, reset flag
        dialogRef.afterClosed().subscribe(() => {
          dialogOpen = false;
        });
      }
    }, 30 * 1000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}
