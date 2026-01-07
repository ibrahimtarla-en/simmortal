export enum ContactFormStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface ContactFormSubmission {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
  status: ContactFormStatus;
  createdAt: string;
  updatedAt: string;
}
