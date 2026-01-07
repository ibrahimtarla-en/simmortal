import { Options } from 'qr-code-styling';

const baseConfig: Options = {
  type: 'svg',
  shape: 'square',
  margin: 0,
  imageOptions: {
    saveAsBlob: true,
    hideBackgroundDots: true,
    imageSize: 0.5,
    margin: 0,
  },
  backgroundOptions: {
    color: 'transparent',
  },
  qrOptions: { mode: 'Byte', errorCorrectionLevel: 'M' },
};

export const simmTags: Options[] = [
  {
    ...baseConfig,
    image: '/simmtag/qr-logo-m-100.svg',
    dotsOptions: { type: 'dots', color: 'var(--color-mauveine-100)', roundSize: false },
    cornersSquareOptions: { type: 'extra-rounded', color: 'var(--color-mauveine-100)' },
    cornersDotOptions: { type: 'dot', color: 'var(--color-mauveine-100)' },
  },
  {
    ...baseConfig,
    image: '/simmtag/qr-logo-white.svg',
    dotsOptions: { type: 'dots', color: 'white', roundSize: false },
    cornersSquareOptions: { type: 'extra-rounded', color: 'white' },
    cornersDotOptions: { type: 'dot', color: 'white' },
  },
  {
    ...baseConfig,
    image: '/simmtag/qr-logo-m-200.svg',
    dotsOptions: { type: 'extra-rounded', color: 'var(--color-mauveine-100)', roundSize: false },
    cornersSquareOptions: { type: 'extra-rounded', color: 'var(--color-mauveine-200)' },
    cornersDotOptions: { type: 'dot', color: 'var(--color-mauveine-100)' },
  },
  {
    ...baseConfig,
    image: '/simmtag/qr-logo-white.svg',
    dotsOptions: { type: 'dots', color: 'white', roundSize: false },
    cornersSquareOptions: { type: 'dot', color: 'white' },
    cornersDotOptions: { type: 'dot', color: 'white' },
  },
];
