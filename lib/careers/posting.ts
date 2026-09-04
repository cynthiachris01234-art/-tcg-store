// ─── Levy Real Estate — job posting content ───────────────────────────────────
// Content lives here so the posting page, the careers index and the structured
// JobPosting metadata all render from one source.

export interface JobPosting {
  slug: string;
  title: string;
  summary: string;
  location: string;
  workType: string;
  employmentType: string;
  training: string;
  /** Training rate in USD per hour. */
  trainingRate: number;
  about: string;
  responsibilities: string[];
  requirements: string[];
  /** ISO date the posting opened — used for the JobPosting structured data. */
  datePosted: string;
}

export const PROPERTY_DATA_ENTRY: JobPosting = {
  slug: 'property-data-entry',
  title: 'Remote Property Data Entry',
  summary:
    'Support our property operations team by maintaining accurate and up-to-date real estate listing information from a remote working environment.',
  location: 'Remote — USA',
  workType: 'Remote',
  employmentType: 'Full-time',
  training: 'Paid training',
  trainingRate: 40,
  about:
    'The Property Data Entry position supports the maintenance and organization of property information across digital systems used by the real estate team.',
  responsibilities: [
    'Enter property information into company systems.',
    'Update listing information, pricing and availability.',
    'Upload property photographs and descriptions.',
    'Review records for missing or incorrect information.',
    'Maintain spreadsheets and digital property records.',
    'Follow established data-quality procedures.',
    'Communicate with the property operations team.',
  ],
  requirements: [
    'Good attention to detail.',
    'Basic computer and internet skills.',
    'Ability to work with spreadsheets.',
    'Good written communication.',
    'Reliable internet connection.',
    'Ability to work independently.',
  ],
  datePosted: '2026-09-04',
};

export const OPEN_POSITIONS: JobPosting[] = [PROPERTY_DATA_ENTRY];

export function getPosting(slug: string): JobPosting | undefined {
  return OPEN_POSITIONS.find((p) => p.slug === slug);
}
