'use client';
import { ContactFormSubmission } from '@/types/contact';
import React from 'react';
import { Button } from '../ui/button';
import { closeContactForm } from '@/services/server/contact';
import { useRouter } from 'next/navigation';

export interface ContactFormDetailsProps {
  form: ContactFormSubmission;
}

function ContactFormDetails({ form }: ContactFormDetailsProps) {
  const router = useRouter();
  const handleClose = async () => {
    await closeContactForm(form.id);
    window.alert('Contact form closed');
    router.push('/contact');
  };

  return (
    <section className="grid grid-cols-2 gap-5 py-10">
      <div className="col-span-2 mb-5 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold">Contact Form Details</h2>
        <Button
          className="bg-mauveine-700 hover:bg-mauveine-500 ml-auto cursor-pointer"
          onClick={handleClose}>
          Close Form Request
        </Button>
      </div>
      <div>
        <div className="mb-2 font-serif text-xl">Name:</div>
        {form.firstName} {form.lastName}
      </div>
      <div>
        <div className="mb-2 font-serif text-xl">ID:</div> {form.id}
      </div>
      <div>
        <div className="mb-2 font-serif text-xl">Email:</div> {form.email}
      </div>
      <div>
        <div className="mb-2 font-serif text-xl">Phone Number:</div> {form.phoneNumber}
      </div>
      <div className="col-span-2 mt-2">
        <div>
          <div className="mb-2 font-serif text-xl">Message:</div>
          <div>{form.message}</div>
        </div>
      </div>
    </section>
  );
}

export default ContactFormDetails;
