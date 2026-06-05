export const BARGAIN_SECTIONS = ['Pending', 'Accepted', 'Rejected', 'Expired'] as const;
export type BargainSection = (typeof BARGAIN_SECTIONS)[number];
