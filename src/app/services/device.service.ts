import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Device } from '../models/device';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  apiUrl = `${environment.apiUrl}/devices`;

  publishUrl = `${environment.apiUrl}/publish`;

  constructor(private httpClient: HttpClient) {

  }

  getAll(): Observable<Device[]> {
    return this.httpClient.get<Device[]>(this.apiUrl);
  }

  getOne(deviceId: string): Observable<Device> {
    return this.httpClient.get<Device>(`${this.apiUrl}/${deviceId}`);
  }

  sendCommand(deviceId: string): Observable<any> {
    return this.httpClient.post<Device>(`${this.publishUrl}/${deviceId}/`, null);
  }

}
