import { Component, inject, OnInit } from '@angular/core';
import { LeaveServices } from '../../services/leave/leave-services';
import { Auth } from '../../services/auth';
import { DatePipe } from '@angular/common';

const data = [
  {
      "details": "Sick Leave",
      "employeeId": 936,
      "employeeName": "Nik J",
      "fromDate": "2025-07-15T06:16:35.34",
      "leaveId": 184,
      "leaveType": "Annual",
      "noOfDays": 1,
      "toDate": "2025-07-16T06:16:35.34",
      "approvedDate": "2025-07-14T16:25:42.263",
      "isApproved": false
    },
]
@Component({
  selector: 'app-leave-history-tab',
  imports: [DatePipe],
  templateUrl: './leave-history-tab.html',
  styleUrl: './leave-history-tab.css',
})
export class LeaveHistoryTab implements OnInit {
  leaveServices = inject(LeaveServices);
  authServices = inject(Auth);
  userDeatils = this.authServices.getUserDetails();
  leavesList: any[] = [];
  activePanelId: string | null = null;

  togglePanel(panelId: string): void {
    this.activePanelId = this.activePanelId === panelId ? null : panelId;
  }

  isPanelOpen(panelId: string): boolean {
    return this.activePanelId === panelId;
  }

  ngOnInit(): void {
    const userId = this.userDeatils?.userId;
    //API Get Leaves by userId
    if (userId) {
      this.getLeaveById(userId);
    }
  }

  //API Get LeaveByID
  getLeaveById(id: number) {
    this.leaveServices.getAllLeavesByEmployeeId(id).subscribe({
      next: (response) => {
        if (response) {
          this.leavesList = response;
          // this.leavesList = data;
        }
      },
      error: (err) => {
        console.log('Something Went wrong', err);
      },
    });
  }
}
