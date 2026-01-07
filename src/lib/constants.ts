export const DRAFT_PICK_TIME = 90; // 90 seconds
export const SUPER_ART_PICK_TIME = 60; // 1 minute
export const ROOM_CLOSE_TIME = 60; // 1 minute
export const DRAFT_START_TIMER = 10; // 10 seconds - DEPRECATED, but kept for reference
export const COIN_FLIP_DURATION = 5; // 5 seconds for the coin flip animation phase

type TeamId = 'team1' | 'team2';

export const getPickOrder = (teamSize: number, firstPicker: TeamId): { team: TeamId; picks: number }[] => {
    const order: { team: TeamId; picks: number }[] = [];
    const secondPicker: TeamId = firstPicker === 'team1' ? 'team2' : 'team1';
    let picksMadeTeam1 = 0;
    let picksMadeTeam2 = 0;
    let turn = 0;
    const totalPicks = teamSize * 2;

    // First pick
    if (teamSize > 0) {
        order.push({ team: firstPicker, picks: 1 });
        if (firstPicker === 'team1') picksMadeTeam1++; else picksMadeTeam2++;
        turn++;
    }

    // Subsequent picks
    while (picksMadeTeam1 + picksMadeTeam2 < totalPicks) {
        const currentPicker = turn % 2 === 1 ? secondPicker : firstPicker;
        const picksRemainingForTeam = currentPicker === 'team1' 
            ? teamSize - picksMadeTeam1 
            : teamSize - picksMadeTeam2;
        
        const picksThisTurn = Math.min(2, picksRemainingForTeam);
        
        if (picksThisTurn > 0) {
            order.push({ team: currentPicker, picks: picksThisTurn });
            if (currentPicker === 'team1') {
                picksMadeTeam1 += picksThisTurn;
            } else {
                picksMadeTeam2 += picksThisTurn;
            }
        }
        
        turn++;
        
        // Safety break to prevent infinite loops on incorrect logic
        if (turn > totalPicks * 2) {
            console.error("Infinite loop detected in getPickOrder");
            break;
        }
    }

    return order;
};
