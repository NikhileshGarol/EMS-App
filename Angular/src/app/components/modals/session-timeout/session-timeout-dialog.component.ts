// session-timeout-dialog.component.ts
import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-session-timeout-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './session-timeout-dialog.component.html',
  styleUrls: ['./session-timeout-dialog.component.css']
})
export class SessionTimeoutDialogComponent {
  auth = inject(Auth);
  constructor(public dialogRef: MatDialogRef<SessionTimeoutDialogComponent>) {}

  close(): void {
    this.dialogRef.close();
    this.auth.logout();
  }
}
