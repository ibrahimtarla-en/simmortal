// mail/mailAdapter.ts
// Tiny adapter accessible from plain TS (outside Nest DI)
type MailAdapter = {
  sendVerification: (to: string, html: string, subject: string) => Promise<any>;
  sendPasswordReset: (to: string, html: string, subject: string) => Promise<any>;
  sendWelcomeEmail: (to: string, html: string, subject: string) => Promise<any>;
};

let mailAdapter: MailAdapter | null = null;

export function registerMailAdapter(adapter: MailAdapter) {
  mailAdapter = adapter;
}

export function getMailAdapter(): MailAdapter {
  if (!mailAdapter) throw new Error('Mail adapter not initialized yet');
  return mailAdapter;
}
