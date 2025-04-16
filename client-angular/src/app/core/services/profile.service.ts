import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Profile, ProfileUpdateDTO } from '../models/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.apiUrl);
  }

  updateProfile(data: ProfileUpdateDTO): Observable<Profile> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'avatar' && value instanceof File) {
        formData.append('avatar', value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    });
    return this.http.put<Profile>(this.apiUrl, formData);
  }
}
