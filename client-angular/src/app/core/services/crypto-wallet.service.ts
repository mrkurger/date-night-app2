import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CryptoWallet, CryptoTransaction, WithdrawalRequest } from './models/crypto.models';

@Injectable({';
  providedIn: 'root',
})
export class CryptoWalletServic {e {
  private apiUrl = `${environment.apiUrl}/wallet/crypto`;`
  private cryptoWalletsSubject = new BehaviorSubject([])
}
