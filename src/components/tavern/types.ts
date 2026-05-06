import type { Tavern } from '@/constants/taverns';

export type TopTab = 'intro' | 'map' | 'list' | 'reservation';

export type WaitingReservation = {
  tavern: Tavern;
  name: string;
  partySize: string;
  phoneNumber: string;
};

export type ReservationLookupResult = {
  id: string;
  tavernName: string;
  aheadTeams: number;
  name: string;
  partySize: string;
  phoneNumber: string;
};
