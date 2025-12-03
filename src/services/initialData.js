export const initialData = {
    journal: [
        {
            id: 1,
            title: "The Heist at the Silkshore Docks",
            date: "2023-10-27",
            content: "We infiltrated the warehouse under the cover of fog. The Bluecoats were patrolling, but we managed to slip past...",
            tags: ["Score", "Stealth"]
        }
    ],
    crew: {
        name: "The Black Lotus",
        reputation: 0,
        heat: 0,
        coin: 0,
        tier: 0,
        hold: "Weak",
        claims: [],
        upgrades: [],
        cohorts: []
    },
    characters: [
        {
            id: "char_1",
            name: "Silas",
            playbook: "Cutter",
            stress: 0,
            trauma: [],
            coin: 0,
            stash: 0,
            attributes: {
                insight: 0,
                prowess: 1,
                resolve: 0
            },
            actions: {
                hunt: 0, study: 0, survey: 0, tinker: 0,
                finesse: 0, prowl: 0, skirmish: 2, wreck: 1,
                attune: 0, command: 1, consort: 0, sway: 0
            },
            items: ["Blade", "Burglary Gear"],
            specialAbilities: []
        },
        {
            id: "char_2",
            name: "Nyx",
            playbook: "Lurk",
            stress: 0,
            trauma: [],
            coin: 0,
            stash: 0,
            attributes: {
                insight: 1,
                prowess: 1,
                resolve: 0
            },
            actions: {
                hunt: 0, study: 0, survey: 0, tinker: 1,
                finesse: 2, prowl: 2, skirmish: 0, wreck: 0,
                attune: 0, command: 0, consort: 0, sway: 0
            },
            items: ["Silence Potion", "Lockpicks"],
            specialAbilities: []
        }
    ]
};
