import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { DatePicker } from '../date-picker/date-picker';
import { LeaveServices } from '../../services/leave/leave-services';
import { ILeaveByIdObject, ILeaveCreate } from '../../modal/leave';
import { Auth } from '../../services/auth';
import { LeaveRequestTab } from '../leave-request-tab/leave-request-tab';
import { LeaveHistoryTab } from '../leave-history-tab/leave-history-tab';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ToastServices } from '../../services/toast/toast-services';
import { Breadcrum } from '../breadcrum/breadcrum';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [
    MatTabsModule,
    CommonModule,
    DatePicker,
    ReactiveFormsModule,
    LeaveRequestTab,
    LeaveHistoryTab,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: './leave.html',
  styleUrl: './leave.css',
})
export class Leave implements OnInit {
  leaveForm!: FormGroup;
  leaveServices = inject(LeaveServices);
  authServices = inject(Auth);
  toast = inject(ToastServices);
  userDeatils = this.authServices.getUserDetails();
  userRole = this.userDeatils?.roles?.[0]?.name;
  min = new Date(1900, 0, 1);
  max = new Date(2100, 11, 31);
  activePanelId: string | null = null;
  leaveDetailsObj: ILeaveByIdObject = {
    details: '',
    employeeId: 0,
    employeeName: '',
    fromDate: '',
    leaveId: 0,
    leaveType: '',
    noOfDays: 0,
    toDate: '',
    approvedDate: '',
    isApproved: '',
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.leaveForm = this.fb.group(
      {
        leaveType: ['', Validators.required],
        fromDate: [null],
        fromSession: [''],
        toDate: [null],
        toSession: [''],
        applyingTo: ['', Validators.required],
        cc: [''],
        contactDetails: ['', Validators.required],
        reason: ['', [Validators.required, Validators.minLength(5)]],
      },
      {
        validators: [this.dateRangeValidator()],
      }
    );

    this.leaveForm.get('fromDate')?.valueChanges.subscribe(() => {
      this.clearControlError('fromDate', 'duplicate');
      this.dateRangeValidator();
      this.leaveForm.updateValueAndValidity();
    });
    this.leaveForm.get('toDate')?.valueChanges.subscribe(() => {
      this.clearControlError('toDate', 'duplicate');
      this.dateRangeValidator();
      this.leaveForm.updateValueAndValidity();
    });
  }

  clearControlError(controlName: string, errorKey: string): void {
    const control = this.leaveForm.get(controlName);
    if (control?.errors?.[errorKey]) {
      const errors = { ...control.errors };
      delete errors[errorKey];
      control.setErrors(Object.keys(errors).length ? errors : null);
    }
  }
  //Date range validation
  dateRangeValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const fromDate = group.get('fromDate')?.value;
      const toDate = group.get('toDate')?.value;

      if (!fromDate || !toDate) {
        return {
          bothRequired: {
            message: 'Both From Date and To Date are required.',
          },
        };
      }

      const from = new Date(fromDate).setHours(0, 0, 0, 0);
      const to = new Date(toDate).setHours(0, 0, 0, 0);

      if (from > to) {
        return {
          dateRangeInvalid: {
            message: 'To Date must be greater than or equal to From Date.',
          },
        };
      }

      return null;
    };
  }

  //Get error message fun
  getFormError(controlName: string): string {
    const control = this.leaveForm.get(controlName);
    if (control && control.touched && control.invalid) {
      if (control.errors?.['required']) {
        return 'This field is required.';
      }
      if (control.errors?.['minlength']) {
        return `Minimum ${control.errors['minlength'].requiredLength} characters required.`;
      }
    }
    return '';
  }

  get f() {
    return this.leaveForm.controls;
  }

  togglePanel(panelId: string): void {
    this.activePanelId = this.activePanelId === panelId ? null : panelId;
  }

  isPanelOpen(panelId: string): boolean {
    return this.activePanelId === panelId;
  }

  calculateNoOfDays(fromDateIso: string, toDateIso: string): number {
    const fromDate = new Date(fromDateIso);
    const toDate = new Date(toDateIso);

    // Strip time to ensure date-only comparison (in UTC)
    const fromUTC = Date.UTC(
      fromDate.getUTCFullYear(),
      fromDate.getUTCMonth(),
      fromDate.getUTCDate()
    );
    const toUTC = Date.UTC(
      toDate.getUTCFullYear(),
      toDate.getUTCMonth(),
      toDate.getUTCDate()
    );

    // Difference in milliseconds / ms per day + 1 to include both days
    const daysDiff = Math.floor((toUTC - fromUTC) / (1000 * 60 * 60 * 24)) + 1;

    return daysDiff > 0 ? daysDiff : 0;
  }

  //API Save/Add Leave
  addLeaveReq(data: any) {
    const userId = this.userDeatils?.userId;
    const numberOfDays = this.calculateNoOfDays(data.fromDate, data.toDate);
    // const req: ILeaveCreate = {
    //   leaveType: data.leaveType,
    //   employeeId: userId,
    //   noOfDays: numberOfDays,
    //   fromDate: data.fromDate,
    //   toDate: data.toDate,
    //   details: data.reason,
    // };
    const req: ILeaveCreate = {
      leaveType: data.leaveType,
      userId: userId,
      noOfDays: numberOfDays,
      startDate: data.fromDate,
      endDate: data.toDate,
      reason: data.reason,
    };
    this.leaveServices.addLeave(req).subscribe({
      next: (resp) => {
        // if (resp.result) {
          this.toast.success(resp.message || 'Leave applied successfully');
          // this.getLeaveById(userId);
          this.leaveForm.reset({
            leaveType: '',
            fromDate: null,
            fromSession: '',
            toDate: null,
            toSession: '',
            applyingTo: '',
            cc: '',
            contactDetails: '',
            reason: '',
          });
          this.leaveForm.setErrors(null);
        // } else {
        //   this.toast.success(resp.message || 'Something went wrong');
        // }
      },
      error: (err) => {
        this.toast.success(err.message || 'Something went wrong');
        console.log('Something went wrong', err);
      },
    });
  }

  onSubmit() {
    this.leaveForm.updateValueAndValidity();
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }
    console.log('first) ',this.leaveForm.value)
    this.addLeaveReq(this.leaveForm.value);
  }

  resetForm() {
    this.leaveForm.reset({
      leaveType: '',
      fromDate: null,
      fromSession: '',
      toDate: null,
      toSession: '',
      applyingTo: '',
      cc: '',
      contactDetails: '',
      reason: '',
    });
    this.leaveForm.markAsPristine();
    this.leaveForm.markAsUntouched();
    this.leaveForm.updateValueAndValidity();
  }
}
