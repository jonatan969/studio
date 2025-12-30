export const DRAFT_PICK_TIME = 90; // 1 minute 30 seconds
export const SUPER_ART_PICK_TIME = 60; // 1 minute
export const ROOM_CLOSE_TIME = 180; // 3 minutes
export const DRAFT_START_TIMER = 10; // 10 seconds

export const getPickOrder = (teamSize: number) => {
    const order = [];
    let picksMade = 0;
    let turn = 0;
    const teams: ('Orange' | 'Purple')[] = ['Orange', 'Purple'];

    // First pick is always 1
    order.push({ team: teams[turn % 2], picks: 1 });
    picksMade += 1;
    turn++;

    while (picksMade < teamSize * 2) {
        const remainingPicks = teamSize * 2 - picksMade;
        const picksThisTurn = Math.min(2, remainingPicks);
        order.push({ team: teams[turn % 2], picks: picksThisTurn });
        picksMade += picksThisTurn;
        turn++;
    }

    return order as { team: 'Orange' | 'Purple'; picks: number }[];
};
