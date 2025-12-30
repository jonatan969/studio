# **App Name**: Versus Draft

## Core Features:

- Room Creation: Admin users can create a draft room with customizable settings: team sizes (up to 6 players per team), spectator limit (up to 4), selection order.
- Character Draft: Implement a turn-based character selection process similar to League of Legends: teams alternate picking characters, with picks locked for the opposing team. Picking order automatically determined by the system.
- Super Art Selection: After the character draft, players secretly choose one Super Art from three options.
- Selection Reveal: An AI "tool" should generate suspense and create a feeling of payoff with its creative reveal. At the end of Super Art selection, all choices are revealed simultaneously with appropriate effects.
- Role-based Access Control: Implement user authentication and authorization to differentiate between admin (can create rooms) and player roles (can join rooms).
- Room Management: Rooms automatically close 3 minutes after all selections are made; selection rounds occur every 1 minute and 30 seconds. Track history of selections.
- UI Display: Display draftable characters as hexagonal tiles in the center, with columns on the sides for selected characters for each team.

## Style Guidelines:

- Primary color: Deep purple (#673AB7) to create a sophisticated and competitive atmosphere.
- Background color: Dark gray (#333333) for a modern, focused look.
- Accent color: Bright teal (#00BCD4) to highlight interactive elements and important information.
- Body and headline font: 'Space Grotesk' (sans-serif) for a clean, tech-forward look; if longer text is needed, use 'Inter' (sans-serif) for body text.
- Use vector icons that represent roles, characters, and actions with a modern, clean style.
- Employ a modular layout with clear divisions between the character selection area, team compositions, and player information. Use grid-based alignment to ensure responsiveness across devices.
- Incorporate subtle animations during character selections and reveals to enhance user engagement.