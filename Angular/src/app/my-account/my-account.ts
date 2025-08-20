import { Component, inject, OnChanges, SimpleChanges } from '@angular/core';
import { Auth } from '../services/auth';
import { Breadcrum } from '../components/breadcrum/breadcrum';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Employee } from '../modal/client';
import { EmployeeServices } from '../services/employee-services';
import { ToastServices } from '../services/toast/toast-services';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-account',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './my-account.html',
  styleUrl: './my-account.css',
})
export class MyAccount {
  authService = inject(Auth);
  employeeServices = inject(EmployeeServices);
  toast = inject(ToastServices);
  router = inject(Router);
  userDetails: any = '';
  selectedFile: File | null = null;
  previewImageUrl: string | null = null; // for showing preview immediately


  userDetailsForm: FormGroup = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', [Validators.required]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[6-9]\d{9}$/),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  ngOnInit() {
    this.getUserDetails();
  }

  getUserDetails() {
    this.userDetails = this.authService.getUserDetails();
    console.log(this.userDetails);
    if (this.userDetails) {
      this.userDetailsForm.patchValue({
        firstName: this.userDetails.firstName,
        lastName: this.userDetails.lastName,
        phone: this.userDetails.phone,
        email: this.userDetails.email,
      });
      // Set initial preview from server
      if (this.userDetails.profile_image) {
        // this.previewImageUrl = `http://localhost:8000/${this.userDetails.profile_image}`;
        this.previewImageUrl = `${environment.apiBaseUrl}/${this.userDetails.profile_image}`;
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    // Allowed image types
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif',
    ];
    if (file) {
      this.selectedFile = file; //Save file for later upload
      const reader = new FileReader();
      if (!allowedTypes.includes(file.type)) {
        this.toast.error('Only image files are allowed (PNG, JPG).');
        return;
      }
      reader.onload = (e: any) => {
        this.previewImageUrl = e.target.result; // Base64 for immediate preview
      };
      reader.readAsDataURL(file);
    }
  }

  saveEmployee() {
      const payload = {
      id: this.userDetails.userId,
      email: this.userDetails.email,
      phone: this.userDetails.phone,
      firstName: this.userDetails.firstName,
      lastName: this.userDetails.lastName,
    };
    // Update existing employee
    this.employeeServices.updateEmployee(payload).subscribe({
      next: (res) => {
        this.toast.success(
          res?.message || 'Employee details updated successfully.'
        );
        this.authService.setUserDetails({
          ...this.userDetails,
          ...payload,
        });
      },
      error: (err) => {
        this.toast.error(err.message || 'Error saving employee');
        console.log(err);
      },
    });
  }

  onSubmit() {
    if (this.userDetailsForm.valid) {
      this.userDetails = {
        ...this.userDetails,
        ...this.userDetailsForm.value,
      };
      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile as Blob);
        formData.append('userId', this.userDetails.userId.toString());
        this.employeeServices
          .uploadFile(formData, this.userDetails.userId)
          .subscribe({
            next: (res) => {
              this.toast.success('Profile image uploaded successfully.');
              const updatedUser = {
                ...this.userDetails,
                profile_image: res?.profile_image,
              };
              this.authService.setUserDetails(updatedUser);
            },
            error: (err) => {
              this.toast.error(err.message || 'Error uploading profile image');
              console.log(err);
            },
          });
      }
        this.saveEmployee();
    }
  }
  cancelUpload() {
    this.selectedFile = null;
    this.previewImageUrl = `http://localhost:8000/${this.userDetails.profile_image}`;
    this.userDetailsForm.reset({
      firstName: this.userDetails.firstName,
      lastName: this.userDetails.lastName,
      phone: this.userDetails.phone,
      email: this.userDetails.email,
    });
  }
}
