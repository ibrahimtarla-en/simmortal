'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { getBaseURL } from '../env';
import { ContactForm } from '@/types/contact';

export async function submitContactForm(form: ContactForm): Promise<void> {
  await axios
    .post(`${getBaseURL()}/api/v1/contact`, form)
    .then((response: AxiosResponse<void>) => response.data);
}
