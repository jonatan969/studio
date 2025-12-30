export const DRAFT_PICK_TIME = 90; // 1 minute 30 seconds
export const SUPER_ART_PICK_TIME = 60; // 1 minute
export const ROOM_CLOSE_TIME = 180; // 3 minutes

export const PICK_ORDER = [
    { team: 'Orange', picks: 1 },
    { team: 'Purple', picks: 2 },
    { team: 'Orange', picks: 2 },
    { team: 'Purple', picks: 2 },
    { team: 'Orange', picks: 2 },
    { team: 'Purple', picks: 1 },
] as const;
