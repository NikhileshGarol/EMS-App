import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IEmployeeResponse } from '../../modal/employee';
import { ILeaveCreate } from '../../modal/leave';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LeaveServices {
  http = inject(HttpClient);
  apiBaseUrl = environment.apiBaseUrl;
  // apibaseUrl = 'https://freeapi.miniprojectideas.com/api/EmployeeLeave';

  addLeave(payload: ILeaveCreate): Observable<IEmployeeResponse> {
    return this.http.post<IEmployeeResponse>(
      `${this.apiBaseUrl}${environment.endpoints.createLeave}`,
      payload
    );
  }

  getAllLeaves(): Observable<any> {
    return this.http.get<any>(
      `${this.apiBaseUrl}${environment.endpoints.getAllLeaves}`
    );
  }

  getAllLeavesByEmployeeId(id: number): Observable<any> {
    console.log(
      `${this.apiBaseUrl}${environment.endpoints.getLeavesById}?userId=${id}`
    );
    return this.http.get<any>(
      `${this.apiBaseUrl}${environment.endpoints.getLeavesById}?userId=${id}`
    );
  }

  approveLeaveById(id: number, payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiBaseUrl}${environment.endpoints.approveLeave}?userId=${id}`,
      payload
    );
  }

  rejectLeaveById(id: number): Observable<IEmployeeResponse> {
    return this.http.get<IEmployeeResponse>(
      `${this.apiBaseUrl}/RejectLeave?id=${id}`
    );
  }
}
