import * as CryptoJS from 'crypto-js';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly encryptionKey = environment.encryptionKey ;

  encrypPayload(payload: any): { data: string; iv: string } {
      const iv = CryptoJS.lib.WordArray.random(16);
      const keyWA = CryptoJS.enc.Utf8.parse(this.encryptionKey);
      const payloadStr = JSON.stringify(payload);
      const encrypted = CryptoJS.AES.encrypt(payloadStr, keyWA, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return {
        data: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
        iv: iv.toString(CryptoJS.enc.Base64),
      };
    }
}
