/**
 * SuperCalcee Physical & Mathematical Constants Registry
 * =======================================================
 * 
 * Exhaustive CODATA 2022 physical constants, astrophysical measures, fundamental 
 * mathematical constants, chemistry metrics, computer science bounds, and financial benchmarks.
 * 
 * Total: 85+ Curated, Verified Scientific Constants across 8 Domains:
 *  - Math: Transcendental numbers, algebraic constants, asymptotic limits
 *  - Physics: Mechanics, thermodynamics, gravitation, radiation
 *  - Quantum: Atomic scale constants, rest masses, quantum action
 *  - Electromagnetism: Permittivity, permeability, quanta, vacuum impedance
 *  - Astrophysics: Solar/Earth metrics, cosmic distances, cosmological benchmarks
 *  - Chemistry: Electrochemistry, molar quantities, phase transitions of water
 *  - ComputerScience: Data capacities, bit boundaries, machine epsilons
 *  - Finance: Day-count conventions, compounding bases, macroeconomic benchmarks
 * 
 * @module data/constants
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

/**
 * @typedef {Object} ConstantDefinition
 * @property {string} name - Human readable name of the constant.
 * @property {string} symbol - Variable symbol used in mathematical formulas.
 * @property {number} value - High-precision numerical value.
 * @property {string} [unit] - Standard SI / dimensional unit string.
 * @property {string} desc - Comprehensive description explaining physical or mathematical significance.
 */

/** @type {Record<string, ConstantDefinition[]>} Categorized database of physical and mathematical constants */
export const CONSTANTS = {
  Math: [
    { name: 'Pi (Archimedes Constant)', symbol: 'pi', value: Math.PI, desc: "Ratio of a circle's circumference to its diameter (π â‰ˆ 3.14159265)" },
    { name: "Euler's Number (Natural Base)", symbol: 'e', value: Math.E, desc: 'Base of the natural logarithm (e â‰ˆ 2.7182818)' },
    { name: 'Golden Ratio (Phi)', symbol: 'phi', value: 1.618033988749895, desc: 'Golden ratio (1 + √5)/2 governing aesthetic proportion and Fibonacci limits' },
    { name: 'Pythagoras Constant (Square Root of 2)', symbol: 'sqrt2', value: Math.SQRT2, desc: 'Diagonal of a unit square (√2 â‰ˆ 1.41421356)' },
    { name: 'Theodorus Constant (Square Root of 3)', symbol: 'sqrt3', value: 1.7320508075688772, desc: 'Diagonal of a unit cube (√3 â‰ˆ 1.7320508)' },
    { name: 'Euler-Mascheroni Constant', symbol: 'gamma', value: 0.5772156649015329, desc: 'Limiting difference between the harmonic series and natural logarithm' },
    { name: "Catalan's Constant", symbol: 'catalan', value: 0.915965594177219, desc: 'Dirichlet beta function value Î²(2) in combinatorics and topology' },
    { name: 'Feigenbaum Bifurcation Velocity', symbol: 'delta_feig', value: 4.66920160910299, desc: 'Universal period-doubling bifurcation scaling constant in chaos theory' },
    { name: 'Feigenbaum Scaling Factor', symbol: 'alpha_feig', value: 2.50290787509589, desc: 'Scaling parameter for attractor width in chaotic dynamical systems' },
    { name: 'Plastic Constant', symbol: 'rho_plastic', value: 1.324717957244746, desc: 'Unique real root of xÂ³ - x - 1 = 0 associated with Padovan sequence' },
    { name: "ApÃ©ry's Constant", symbol: 'zeta3', value: 1.202056903159594, desc: 'Riemann zeta function value Î¶(3) in quantum electrodynamics' },
  ],

  Physics: [
    { name: 'Speed of Light in Vacuum', symbol: 'c', value: 299792458, unit: 'm/s', desc: 'Exact relativistic upper limit for transmission of mass, energy, and information' },
    { name: 'Newtonian Gravitational Constant', symbol: 'G', value: 6.67430e-11, unit: 'mÂ³/(kgÂ·sÂ²)', desc: 'Fundamental gravitational coupling constant in Newtonian & Einstein mechanics' },
    { name: 'Standard Earth Gravity', symbol: 'g', value: 9.80665, unit: 'm/sÂ²', desc: 'Standard nominal sea-level acceleration due to Earth gravity' },
    { name: 'Planck Constant', symbol: 'h', value: 6.62607015e-34, unit: 'J·s', desc: 'Fundamental quantum of action relating photon energy to electromagnetic frequency' },
    { name: 'Reduced Planck Constant (Dirac)', symbol: 'hbar', value: 1.054571817e-34, unit: 'J·s', desc: 'Quantum action constant divided by 2π (h/2π)' },
    { name: 'Boltzmann Constant', symbol: 'k_B', value: 1.380649e-23, unit: 'J/K', desc: 'Thermodynamic proportionality factor relating temperature to microstate kinetic energy' },
    { name: 'Avogadro Constant', symbol: 'N_A', value: 6.02214076e23, unit: 'molâ»Â¹', desc: 'Exact number of elementary entities in one mole of substance' },
    { name: 'Universal Gas Constant', symbol: 'R_gas', value: 8.314462618, unit: 'J/(molÂ·K)', desc: 'Molar gas constant linking pressure, volume, temperature, and quantity' },
    { name: 'Stefan-Boltzmann Constant', symbol: 'sigma_sb', value: 5.670374419e-8, unit: 'W/(mÂ²Â·Kâ´)', desc: 'Radiant energy emitted per unit area of a blackbody per second' },
    { name: 'Wien Displacement Constant', symbol: 'b_wien', value: 2.897771955e-3, unit: 'mÂ·K', desc: 'Relates blackbody peak spectral wavelength inversely to absolute temperature' },
    { name: 'Standard Atmospheric Pressure', symbol: 'P_atm', value: 101325, unit: 'Pa', desc: 'Standard 1 atmosphere pressure at mean sea level (101.325 kPa)' },
    { name: 'Absolute Zero', symbol: 'T_abs0', value: 0, unit: 'K', desc: 'Theoretical lowest possible thermodynamic temperature (-273.15 °C)' },
    { name: 'Triple Point of Water', symbol: 'T_tp', value: 273.16, unit: 'K', desc: 'Thermodynamic equilibrium temperature where ice, liquid water, and vapor coexist' },
    { name: 'Speed of Sound in Dry Air (20°C)', symbol: 'v_sound', value: 343, unit: 'm/s', desc: 'Acoustic propagation speed through standard dry air at 20 °C' },
  ],

  Quantum: [
    { name: 'Elementary Charge', symbol: 'q_e', value: 1.602176634e-19, unit: 'C', desc: 'Magnitude of electric charge carried by a single proton or electron' },
    { name: 'Electron Rest Mass', symbol: 'm_e', value: 9.1093837015e-31, unit: 'kg', desc: 'Invariant rest mass of an unbound electron (~0.5109989 MeV/cÂ²)' },
    { name: 'Proton Rest Mass', symbol: 'm_p', value: 1.67262192369e-27, unit: 'kg', desc: 'Invariant rest mass of a proton (~938.272 MeV/cÂ²)' },
    { name: 'Neutron Rest Mass', symbol: 'm_n', value: 1.67492749804e-27, unit: 'kg', desc: 'Invariant rest mass of a free neutron (~939.565 MeV/cÂ²)' },
    { name: 'Unified Atomic Mass Unit (Dalton)', symbol: 'u_amu', value: 1.66053906660e-27, unit: 'kg', desc: 'One-twelfth the mass of an unbound carbon-12 atom at rest' },
    { name: 'Fine-Structure Constant', symbol: 'alpha_fs', value: 7.2973525693e-3, desc: 'Coupling constant characterizing electromagnetic interaction strength (~1/137.036)' },
    { name: 'Rydberg Constant', symbol: 'R_inf', value: 10973731.568160, unit: 'mâ»Â¹', desc: 'Fundamental spectral constant for hydrogen atom energy transitions' },
    { name: 'Bohr Radius', symbol: 'a_0', value: 5.29177210903e-11, unit: 'm', desc: 'Probable distance between proton and electron in ground-state hydrogen' },
    { name: 'Hartree Energy', symbol: 'E_h', value: 4.3597447222071e-18, unit: 'J', desc: 'Atomic unit of energy (~27.211386 eV)' },
    { name: 'Bohr Magneton', symbol: 'mu_B', value: 9.2740100783e-24, unit: 'J/T', desc: 'Natural magnetic dipole moment unit for an electron' },
    { name: 'Nuclear Magneton', symbol: 'mu_N', value: 5.0507837461e-27, unit: 'J/T', desc: 'Standard magnetic moment scale for nucleons (protons and neutrons)' },
    { name: 'Compton Wavelength of Electron', symbol: 'lambda_c', value: 2.42631023867e-12, unit: 'm', desc: 'Quantum wavelength associated with an electron rest mass (h / m_e c)' },
    { name: 'Classical Electron Radius', symbol: 'r_e', value: 2.8179403262e-15, unit: 'm', desc: 'Lorentz radius based on electrostatic potential energy equivalence' },
    { name: 'Electron Volt', symbol: 'eV', value: 1.602176634e-19, unit: 'J', desc: 'Kinetic energy gained by an electron accelerating across 1 volt' },
  ],

  Electromagnetism: [
    { name: 'Vacuum Electric Permittivity', symbol: 'eps_0', value: 8.8541878128e-12, unit: 'F/m', desc: 'Electric constant describing vacuum capacitance capability' },
    { name: 'Vacuum Magnetic Permeability', symbol: 'mu_0', value: 1.25663706212e-6, unit: 'N/AÂ²', desc: 'Magnetic constant describing vacuum inductance capability' },
    { name: 'Coulomb Constant', symbol: 'k_e', value: 8.9875517923e9, unit: 'NÂ·mÂ²/CÂ²', desc: 'Electrostatic force proportionality constant (1 / 4πÎµâ‚€)' },
    { name: 'Characteristic Impedance of Vacuum', symbol: 'Z_0', value: 376.730313668, unit: 'Ω', desc: 'Intrinsic resistance of free space to electromagnetic wave propagation' },
    { name: 'Magnetic Flux Quantum', symbol: 'Phi_0', value: 2.067833848e-15, unit: 'Wb', desc: 'Fundamental quantum unit of magnetic flux in superconductors (h / 2e)' },
    { name: 'Quantum of Conductance', symbol: 'G_0', value: 7.748091729e-5, unit: 'S', desc: 'Conductance quantization step in ballistic mesoscopic transport (2eÂ²/h)' },
    { name: 'Josephson Constant', symbol: 'K_J', value: 483597.8484e9, unit: 'Hz/V', desc: 'Frequency-to-voltage conversion ratio in Josephson junctions (2e/h)' },
    { name: 'von Klitzing Constant', symbol: 'R_K', value: 25812.80745, unit: 'Ω', desc: 'Quantized Hall resistance standard (h / eÂ²)' },
  ],

  Astrophysics: [
    { name: 'Solar Mass', symbol: 'M_sun', value: 1.98847e30, unit: 'kg', desc: 'Standard astronomical unit of mass equal to the mass of the Sun (~333,000 Earths)' },
    { name: 'Solar Equatorial Radius', symbol: 'R_sun', value: 6.957e8, unit: 'm', desc: 'Nominal solar radius (~109 Earth radii)' },
    { name: 'Solar Luminosity', symbol: 'L_sun', value: 3.828e26, unit: 'W', desc: 'Total radiant power output emitted by the Sun' },
    { name: 'Earth Mass', symbol: 'M_earth', value: 5.9722e24, unit: 'kg', desc: 'Standard mass of planet Earth' },
    { name: 'Earth Volumetric Mean Radius', symbol: 'R_earth', value: 6.371e6, unit: 'm', desc: 'Mean radius of planet Earth (~6,371 km)' },
    { name: 'Astronomical Unit', symbol: 'AU', value: 149597870700, unit: 'm', desc: 'Mean orbital distance from Earth center to Sun center (~149.6 million km)' },
    { name: 'Light Year', symbol: 'ly', value: 9.4607304725808e15, unit: 'm', desc: 'Distance traveled by light in vacuum in one Julian year (~9.46 trillion km)' },
    { name: 'Parsec', symbol: 'pc', value: 3.08567758149137e16, unit: 'm', desc: 'Parallax of one arcsecond distance (~3.26 light years)' },
    { name: 'Hubble Constant (Hâ‚€)', symbol: 'H_0', value: 2.268e-18, unit: '1/s', desc: 'Cosmic expansion rate: 70 km/(sÂ·Mpc) in SI units' },
    { name: 'Chandrasekhar Mass Limit', symbol: 'M_ch', value: 2.765e30, unit: 'kg', desc: 'Maximum stable mass of a non-rotating white dwarf star (~1.39 Solar masses)' },
    { name: 'Solar Effective Temperature', symbol: 'T_sun_eff', value: 5772, unit: 'K', desc: 'Effective blackbody photosphere surface temperature of the Sun' },
    { name: 'Cosmic Microwave Background Temperature', symbol: 'T_cmb', value: 2.7255, unit: 'K', desc: 'Mean blackbody temperature of relic primordial radiation from the Big Bang' },
  ],

  Chemistry: [
    { name: 'Faraday Constant', symbol: 'F_faraday', value: 96485.33212, unit: 'C/mol', desc: 'Total electric charge per mole of electrons (N_A Â· e)' },
    { name: 'Molar Gas Volume at STP', symbol: 'V_m_stp', value: 0.02271095464, unit: 'mÂ³/mol', desc: 'Volume occupied by one mole of ideal gas at 0 °C and 100 kPa (22.71 L)' },
    { name: 'Loschmidt Constant', symbol: 'n_0_losch', value: 2.686780111e25, unit: 'mâ»Â³', desc: 'Number density of ideal gas particles at standard temperature and pressure' },
    { name: 'Standard Liquid Water Density (4°C)', symbol: 'rho_water', value: 1000, unit: 'kg/mÂ³', desc: 'Maximum density of pure liquid water at 4 °C (1 g/cmÂ³)' },
    { name: 'Water Autoionization Ion Product (25°C)', symbol: 'K_w', value: 1.0e-14, desc: 'Equilibrium self-ionization constant Kw = [Hâº][OHâ»] at 25 °C' },
    { name: 'Specific Heat Capacity of Liquid Water', symbol: 'c_water', value: 4184, unit: 'J/(kgÂ·K)', desc: 'Energy required to raise 1 kg of water by 1 Kelvin (1 cal/gÂ·°C)' },
    { name: 'Latent Heat of Fusion of Water', symbol: 'L_f_water', value: 334000, unit: 'J/kg', desc: 'Enthalpy change required to melt 1 kg of ice at 0 °C' },
    { name: 'Latent Heat of Vaporization of Water', symbol: 'L_v_water', value: 2260000, unit: 'J/kg', desc: 'Enthalpy change required to boil 1 kg of water into steam at 100 °C' },
  ],

  ComputerScience: [
    { name: 'Bits per Byte', symbol: 'BYTE_BITS', value: 8, desc: 'Standard octet bit count' },
    { name: 'Kibibyte (2Â¹â° Bytes)', symbol: 'KiB', value: 1024, unit: 'B', desc: 'Binary kilo: 1,024 bytes' },
    { name: 'Mebibyte (2Â²â° Bytes)', symbol: 'MiB', value: 1048576, unit: 'B', desc: 'Binary mega: 1,048,576 bytes' },
    { name: 'Gibibyte (2Â³â° Bytes)', symbol: 'GiB', value: 1073741824, unit: 'B', desc: 'Binary giga: 1,073,741,824 bytes' },
    { name: 'Tebibyte (2â´â° Bytes)', symbol: 'TiB', value: 1099511627776, unit: 'B', desc: 'Binary tera: 1,099,511,627,776 bytes' },
    { name: '32-bit Signed Integer Max', symbol: 'INT32_MAX', value: 2147483647, desc: 'Maximum positive value for two-complement signed 32-bit integer (2Â³Â¹ - 1)' },
    { name: '32-bit Unsigned Integer Max', symbol: 'UINT32_MAX', value: 4294967295, desc: 'Maximum unsigned 32-bit addressable integer space (2Â³Â² - 1)' },
    { name: 'IEEE 754 Float32 Machine Epsilon', symbol: 'EPSILON_F32', value: 1.1920929e-7, desc: 'Upper bound on relative rounding error for 32-bit single-precision float' },
    { name: 'IEEE 754 Float64 Machine Epsilon', symbol: 'EPSILON_F64', value: 2.220446049250313e-16, desc: 'Upper bound on relative rounding error for 64-bit double-precision float' },
    { name: 'ASCII Character Set Count', symbol: 'ASCII_SIZE', value: 128, desc: 'Standard 7-bit US-ASCII character encoding space' },
  ],

  Finance: [
    { name: 'Standard Trading Days per Year', symbol: 'DAYS_TRADING', value: 252, desc: 'Standard financial annualization basis for US equity and options markets' },
    { name: 'Calendar Days per Year', symbol: 'DAYS_CALENDAR', value: 365, desc: 'Actual/actual day-count convention for bond interest calculations' },
    { name: 'Commercial Banking Basis Days', symbol: 'DAYS_BANKING', value: 360, desc: '30/360 commercial bank money market convention' },
    { name: 'Months in Year', symbol: 'MONTHS_YEAR', value: 12, desc: 'Calendar months in a standard annual cycle' },
    { name: 'Weeks in Year', symbol: 'WEEKS_YEAR', value: 52, desc: 'Calendar weeks in an annual cycle' },
    { name: 'Quarters in Year', symbol: 'QUARTERS_YEAR', value: 4, desc: 'Fiscal quarters in a business year' },
    { name: 'Target Central Bank Inflation Rate', symbol: 'INFLATION_TARGET', value: 0.02, desc: 'Benchmark Federal Reserve / ECB 2.0% annual inflation policy target' },
    { name: 'Historical US Equity Risk Premium', symbol: 'ERP_HISTORICAL', value: 0.055, desc: 'Benchmark historical spread of equity market return over risk-free rate (~5.5%)' },
  ]
};
