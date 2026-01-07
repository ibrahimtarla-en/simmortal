import { MemorialLivePortraitEffect } from 'src/memorial/interface/memorial.interface';

export const GREETING_VOICE_TEXTS = {
  en: 'Thank you very much for your kind wishes.',
  tr: 'Güzel dilekleriniz için çok teşekkür ederim.',
};

export const GO_ENHANCE_AI_EFFECT_IDS: Record<MemorialLivePortraitEffect, string> = {
  [MemorialLivePortraitEffect.EFFECT_ONE]: 'old-photo',
  [MemorialLivePortraitEffect.EFFECT_TWO]: 'old_photo_revival',
};
