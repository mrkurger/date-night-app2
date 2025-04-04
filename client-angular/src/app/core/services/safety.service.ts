import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SafetyService {
  private apiUrl = `${environment.apiUrl}/safety`;

  constructor(private http: HttpClient) { }

  /**
   * Create a new safety check-in
   * @param checkinData Check-in data
   */
  createSafetyCheckin(checkinData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkin`, checkinData);
  }

  /**
   * Get all safety check-ins for the current user
   * @param status Optional status filter
   * @param page Page number
   * @param limit Items per page
   */
  getUserSafetyCheckins(
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Observable<any> {
    let url = `${this.apiUrl}/checkins?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get(url);
  }

  /**
   * Get a specific safety check-in
   * @param checkinId Check-in ID
   */
  getSafetyCheckin(checkinId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/checkin/${checkinId}`);
  }

  /**
   * Update a safety check-in
   * @param checkinId Check-in ID
   * @param updates Updated check-in data
   */
  updateSafetyCheckin(checkinId: string, updates: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/checkin/${checkinId}`, updates);
  }

  /**
   * Start a safety check-in
   * @param checkinId Check-in ID
   */
  startSafetyCheckin(checkinId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkin/${checkinId}/start`, {});
  }

  /**
   * Complete a safety check-in
   * @param checkinId Check-in ID
   */
  completeSafetyCheckin(checkinId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkin/${checkinId}/complete`, {});
  }

  /**
   * Record a check-in response
   * @param checkinId Check-in ID
   * @param response Response type (safe, need_more_time, distress)
   * @param coordinates Optional coordinates [longitude, latitude]
   */
  recordCheckInResponse(
    checkinId: string,
    response: 'safe' | 'need_more_time' | 'distress',
    coordinates?: [number, number]
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkin/${checkinId}/respond`, {
      response,
      coordinates
    });
  }

  /**
   * Verify check-in with safety code
   * @param checkinId Check-in ID
   * @param code Safety or distress code
   */
  verifyWithSafetyCode(checkinId: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkin/${checkinId}/verify`, { code });
  }

  /**
   * Add emergency contact to a check-in
   * @param checkinId Check-in ID
   * @param contactData Contact data
   */
  addEmergencyContact(checkinId: string, contactData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkin/${checkinId}/emergency-contact`, contactData);
  }

  /**
   * Remove emergency contact from a check-in
   * @param checkinId Check-in ID
   * @param contactId Contact ID
   */
  removeEmergencyContact(checkinId: string, contactId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/checkin/${checkinId}/emergency-contact/${contactId}`);
  }

  /**
   * Get user's safety settings
   */
  getUserSafetySettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/settings`);
  }

  /**
   * Update user's safety settings
   * @param settings Updated safety settings
   */
  updateSafetySettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings`, settings);
  }

  /**
   * Admin: Get check-ins requiring attention
   */
  getCheckinsRequiringAttention(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/attention-required`);
  }
}