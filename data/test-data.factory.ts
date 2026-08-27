import { faker } from '@faker-js/faker';

export interface SignUpData {
  firstName: string;
  lastName: string;
  phone: string;
  province: string;
  email: string;
  password: string;
  confirmPassword: string;
  consent: boolean;
}

const VALID_PASSWORD = 'TestPassw0rd123';

/** All province codes selectable in the "Province of purchase" field. */
export const PROVINCE_CODES = [
  'ON',
  'QC',
  'AB',
  'BC',
  'MB',
  'NB',
  'NS',
  'NL',
  'PE',
  'SK',
  'NT',
  'YT',
  'NU',
] as const;

/** Unique email per call so every run can create a fresh QA account without collisions. */
export function uniqueEmail(tag = 'qaframe'): string {
  return `${tag}.${Date.now()}.${faker.string.alphanumeric(6).toLowerCase()}@nesto-test.dev`;
}

export function validSignUpData(overrides: Partial<SignUpData> = {}): SignUpData {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phone: `4165${faker.string.numeric(6)}`,
    province: 'ON',
    email: uniqueEmail(),
    password: VALID_PASSWORD,
    confirmPassword: VALID_PASSWORD,
    consent: false,
    ...overrides,
  };
}

/** Passwords that each violate exactly one rule of the stated policy (12-32 chars, upper, lower, digit). */
export const invalidPasswords = {
  tooShort: 'Short1a', // < 12 chars
  tooLong: `Aa1${faker.string.alpha(31)}`, // > 32 chars
  noUppercase: 'testpassw0rd123',
  noLowercase: 'TESTPASSW0RD123',
  noDigit: 'TestPasswordOnly',
};

export const invalidEmails = [
  'not-an-email',
  'missing-domain@',
  '@missing-local.com',
  'spaces in@email.com',
];

export const invalidPhones = ['123', 'abcdefghij', '555'];
