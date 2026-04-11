// Campus Pace - Stable Upload & Sync Update - 2026-04-11
export const calculateImpact = (pages: number) => {
    return {
        pages,
        water_saved: parseFloat((pages * 10).toFixed(2)),
        co2_prevented: parseFloat((pages * 4.64).toFixed(3)),
        trees_preserved: parseFloat((pages / 8333).toFixed(6))
    };
};
