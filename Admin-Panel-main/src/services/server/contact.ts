'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { ContactFormSubmission } from '@/types/contact';
import { getBaseURL } from '../env';

export async function getOpenContactForms(): Promise<ContactFormSubmission[]> {
  return axios
    .get(`${getBaseURL()}/api/v1/admin/contact-forms`)
    .then((response: AxiosResponse<ContactFormSubmission[]>) => {
      return response.data;
    });
}

export async function getContactFormById(formId: string): Promise<ContactFormSubmission | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/admin/contact-forms/${formId}`)
    .then((response: AxiosResponse<ContactFormSubmission>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function closeContactForm(formId: string): Promise<void> {
  return axios.patch(`${getBaseURL()}/api/v1/admin/contact-forms/close/${formId}`).then(() => {
    return;
  });
}
