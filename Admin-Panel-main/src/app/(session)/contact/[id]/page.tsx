import ContactFormDetails from '@/components/ContactFormDetails/ContactFormDetails';
import { getContactFormById } from '@/services/server/contact';
import { DynamicRouteParams } from '@/types/util';
import React from 'react';

async function ContactFormDetailPage({ params }: DynamicRouteParams<{ id: string }>) {
  const { id } = await params;
  const form = await getContactFormById(id);

  if (!form) {
    return <div className="my-10 text-center text-lg">Contact form not found</div>;
  }

  return <ContactFormDetails form={form} />;
}

export default ContactFormDetailPage;
