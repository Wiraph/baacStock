import * as CryptoJS from 'crypto-js';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly encryptionKey = environment.encryptionKey ;

  encryptPayload(payload: any): { Data: string; IV: string } {
    const json = JSON.stringify(payload);

    const iv = CryptoJS.lib.WordArray.random(16);
    const key = CryptoJS.enc.Utf8.parse(this.encryptionKey);
    const encrypted = CryptoJS.AES.encrypt(json, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return {
      Data: encrypted.toString(),
      IV: CryptoJS.enc.Base64.stringify(iv)
    };
  }
}
