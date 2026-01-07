export enum ContactFormStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface ContactFormRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
}
