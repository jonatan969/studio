export const DRAFT_PICK_TIME = 90; // 1 minute 30 seconds
export const SUPER_ART_PICK_TIME = 60; // 1 minute
export const ROOM_CLOSE_TIME = 180; // 3 minutes
export const DRAFT_START_TIMER = 10; // 10 seconds

type TeamId = 'team1' | 'team2';

export const getPickOrder = (teamSize: number, firstPicker: TeamId) => {
    const order: { team: TeamId; picks: number }[] = [];
    const secondPicker: TeamId = firstPicker === 'team1' ? 'team2' : 'team1';
    let picksMade = 0;
    let turn = 0;
    const totalPicks = teamSize * 2;

    // First pick
    if (picksMade < totalPicks) {
        order.push({ team: firstPicker, picks: 1 });
        picksMade += 1;
        turn++;
    }

    // Subsequent picks in sets of 2
    while (picksMade < totalPicks) {
        const currentPicker = turn % 2 === 1 ? secondPicker : firstPicker;
        const remainingPicks = totalPicks - picksMade;
        const picksThisTurn = Math.min(2, remainingPicks);
        
        order.push({ team: currentPicker, picks: picksThisTurn });
        picksMade += picksThisTurn;
        turn++;
    }

    return order;
};
