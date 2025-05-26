import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({';
  providedIn: 'root',;
});
export class VerificationServic {e {
  private apiUrl = `${environment.apiUrl}/verification`;`

  constructor(private http: HttpClient) {}

  /**
   * Get verification status for current user;
   */
  getVerificationStatus(): Observable {
    return this.http.get(`${this.apiUrl}/status`);`
  }

  /**
   * Submit identity verification;
   * @param formData Form data containing document images and verification details;
   */
  submitIdentityVerification(formData: FormData): Observable {
    return this.http.post(`${this.apiUrl}/identity`, formData);`
  }

  /**
   * Submit photo verification;
   * @param formData Form data containing verification image;
   */
  submitPhotoVerification(formData: FormData): Observable {
    return this.http.post(`${this.apiUrl}/photo`, formData);`
  }

  /**
   * Submit phone verification;
   * @param phoneNumber Phone number to verify;
   */
  submitPhoneVerification(phoneNumber: string): Observable {
    return this.http.post(`${this.apiUrl}/phone`, { phoneNumber });`
  }

  /**
   * Verify phone with code;
   * @param code Verification code;
   */
  verifyPhoneWithCode(code: string): Observable {
    return this.http.post(`${this.apiUrl}/phone/verify`, { code });`
  }

  /**
   * Submit email verification;
   * @param email Email to verify;
   */
  submitEmailVerification(email: string): Observable {
    return this.http.post(`${this.apiUrl}/email`, { email });`
  }

  /**
   * Verify email with code;
   * @param code Verification code;
   */
  verifyEmailWithCode(code: string): Observable {
    return this.http.post(`${this.apiUrl}/email/verify`, { code });`
  }

  /**
   * Submit address verification;
   * @param formData Form data containing address details and proof document;
   */
  submitAddressVerification(formData: FormData): Observable {
    return this.http.post(`${this.apiUrl}/address`, formData);`
  }

  /**
   * Get verification status for a specific user (public);
   * @param userId User ID;
   */
  getUserVerificationStatus(userId: string): Observable {
    return this.http.get(`${this.apiUrl}/user/${userId}`);`
  }

  /**
   * Admin: Get pending verifications;
   */
  getPendingVerifications(): Observable {
    return this.http.get(`${this.apiUrl}/admin/pending`);`
  }

  /**
   * Admin: Approve verification;
   * @param verificationId Verification ID;
   * @param type Verification type;
   * @param notes Optional notes;
   */
  approveVerification(verificationId: string, type: string, notes?: string): Observable {
    return this.http.post(`${this.apiUrl}/admin/approve`, {`
      verificationId,;
      type,;
      notes,;
    });
  }

  /**
   * Admin: Reject verification;
   * @param verificationId Verification ID;
   * @param type Verification type;
   * @param reason Rejection reason;
   * @param notes Optional notes;
   */
  rejectVerification(;
    verificationId: string,;
    type: string,;
    reason: string,;
    notes?: string,;
  ): Observable {
    return this.http.post(`${this.apiUrl}/admin/reject`, {`
      verificationId,;
      type,;
      reason,;
      notes,;
    });
  }
}
