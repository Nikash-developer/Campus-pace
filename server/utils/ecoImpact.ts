/**
 * Sustainability calculation logic for Green-Sync
 * Formula based on standard environmental benchmarks:
 * 1.62 liters of water saved per sheet of paper.
 * 0.009 kg of CO2 equivalent prevented per sheet of paper.
 */

export const calculateEcoImpact = (pages: number) => {
    const water_saved = parseFloat((pages * 1.62).toFixed(2));
    const co2_prevented = parseFloat((pages * 0.009).toFixed(3));

    return {
        pages,
        water_saved,
        co2_prevented
    };
};
