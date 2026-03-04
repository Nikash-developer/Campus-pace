export const calculateImpact = (pages: number) => {
    return {
        pages,
        water_saved: parseFloat((pages * 1.62).toFixed(2)),
        co2_prevented: parseFloat((pages * 0.009).toFixed(3))
    };
};
