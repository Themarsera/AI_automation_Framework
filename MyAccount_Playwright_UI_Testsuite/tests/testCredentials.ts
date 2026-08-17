import fs from 'fs';
import path from 'path';

export type Creds = {
  user: string;
  pass: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardFirstName: string;
  cardLastName: string;
} | null;

export function getTestCredentials(): Creds {
  const user = process.env.TEST_USER;
  const pass = process.env.TEST_PASS;
  const cardNumber = process.env.TEST_CARD_NUMBER;
  const cardExpiry = process.env.TEST_CARD_EXPIRY;
  const cardCvv = process.env.TEST_CARD_CVV;
  const cardFirstName = process.env.TEST_CARD_FIRST_NAME ?? 'Rakesh';
  const cardLastName = process.env.TEST_CARD_LAST_NAME ?? 'Lenka';

  if (user && pass && cardNumber && cardExpiry && cardCvv) {
    return { user, pass, cardNumber, cardExpiry, cardCvv, cardFirstName, cardLastName };
  }

  const candidates = [
    path.resolve(process.cwd(), 'test-credentials.json'),
    path.resolve(process.cwd(), '.auth/test-credentials.json'),
    path.resolve(process.cwd(), '.test-creds.json'),
  ];

  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) {
        const raw = fs.readFileSync(c, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed?.user && parsed?.pass) {
          return {
            user: parsed.user,
            pass: parsed.pass,
            cardNumber: parsed.cardNumber ?? '',
            cardExpiry: parsed.cardExpiry ?? '',
            cardCvv: parsed.cardCvv ?? '',
            cardFirstName: parsed.cardFirstName ?? 'Rakesh',
            cardLastName: parsed.cardLastName ?? 'Lenka',
          };
        }
      }
    } catch (e) {
      // ignore parse errors and continue
    }
  }
  return null;
}
