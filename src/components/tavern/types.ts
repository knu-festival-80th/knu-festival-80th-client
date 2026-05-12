import type { Tavern } from '@/constants/taverns';
import type { WaitingRegisterResponse } from '@/apis/modules/waiting';

export type TopTab = 'intro' | 'map' | 'list' | 'reservation';

export type WaitingReservation = {
  tavern: Tavern;
  name: string;
  partySize: string;
  phoneNumber: string;
  response: WaitingRegisterResponse;
};

export type ReservationLookupResult = {
  id: number;
  tavernName: string;
  aheadTeams: number;
  waitingNumber: number;
  status: string;
  name: string;
  partySize: string;
  phoneNumber: string;
};
