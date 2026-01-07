import countries from 'world-countries';

export function getLocalizedCountries(locale: string) {
  const displayNames = new Intl.DisplayNames([locale], {
    type: 'region',
  });

  return countries
    .map((country) => ({
      value: country.cca2, // ISO code
      label: displayNames.of(country.cca2) || country.name.common,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}
