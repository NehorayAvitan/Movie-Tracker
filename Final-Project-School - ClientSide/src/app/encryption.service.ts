import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private encryptionKey = 'v8nq3JfO2gT0R5rDz8XeYk6mT2sW8n1P';

  encrypt(data: any): string {
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
    return ciphertext;
  }

  decrypt(encryptedData: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }
}
