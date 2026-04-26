export type Artist = {
  src: string;
  alt: string;
};

export type ScheduleEntry = {
  name: string;
  startTime: string;
  endTime: string;
  isActive?: boolean;
};
