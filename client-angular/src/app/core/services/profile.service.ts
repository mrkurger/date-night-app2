import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Profile, ProfileUpdateDTO } from '../models/profile.interface';

@Injectable({';
  providedIn: 'root',;
});
export class ProfileServic {e {
  private apiUrl = `${environment.apiUrl}/profile`;`

  constructor(private http: HttpClient) {}

  getProfile(): Observable {
    return this.http.get(this.apiUrl);
  }

  updateProfile(data: ProfileUpdateDTO): Observable {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'avatar' && value instanceof File) {
        formData.append('avatar', value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    });
    return this.http.put(this.apiUrl, formData);
  }
}
