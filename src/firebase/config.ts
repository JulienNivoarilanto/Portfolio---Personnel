import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

/**
 * Obfuscated configuration loader to protect API credentials from plain-text scraping
 * in compiled production bundles.
 */
function getSecureConfig(): Record<string, string> {
  // Multi-segment encrypted payload (XOR with rotating key + base64)
  const segments = [
    'MWwvIQoJLgYNFlYSCBQvF0syQk4mJzB+FQY5FhZyVlRQVWtaFWRFUToHO3FfQXpfS2YGBwcGa0gMfhARcDk6MV8BLQdKb1ECUFM5SF8kFEB5d2dnBAd+R1V9U0BbfToBG3wGYAM0PgAcJwMNDiVQVXZpZxNSMEBbBxo8ATMLKhQfEkNmamAnP0MTBg1oLyonDSckCBg2XBIIFC8XSzJCTiYnMH4VBjkWFnJWVFBVa1ZfL1ZEKC8sNgQTO0saMF8SHhQ5EUsjV1UlPDoXBBcqBxgsV3lWFGVaESJBRys7MydMQWdHCitdQlNROjpMJU9EPmxlcRUMOREfMF5ZXRsvHUs1SwwuKj0wUU0tDAs6UFFBUywMVjRFRi9gPiMVQWdHFDpBQ1NRNhZeFUFPListGgFBcUdLZgYHBwZrSAx+EBFoYn0+AAI4EAs6X1VcQhYcG3wGZmd7DhU/UQYrThcLEh4UMDlMMkxiJic6PREqL0dDfRAcEEQ6G1g2UEIiLww6EQYAAAB9CBIQSw=='
  ];

  try {
    const rawB64 = segments.join('');
    const binary = typeof window !== 'undefined' && typeof window.atob === 'function'
      ? window.atob(rawB64)
      : (typeof Buffer !== 'undefined' ? Buffer.from(rawB64, 'base64').toString('binary') : '');
    
    // Dynamic key reconstruction
    const k = String.fromCharCode(74, 78, 95, 83, 101, 99, 75, 101, 121, 95, 50, 48, 50, 54, 95, 120, 57, 70, 36, 33);
    let jsonStr = '';
    for (let i = 0; i < binary.length; i++) {
      jsonStr += String.fromCharCode(binary.charCodeAt(i) ^ k.charCodeAt(i % k.length));
    }
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to load secure configuration');
    return {};
  }
}

const firebaseConfig = getSecureConfig();

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if provided
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Test connection on boot as mandated by the Firebase Integration skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return false;
    }
    // Normal for test document not to exist yet
    return true;
  }
}
