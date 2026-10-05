/**
 * SuperCalcee Preset Formulas Registry
 * =====================================
 * 
 * Standardized database of pre-configured scientific, financial, and mathematical 
 * operations supported out-of-the-box by the SuperCalcee calculation engines.
 * 
 * @module data/presetFormulas
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

/**
 * @typedef {Object} FormulaDefinition
 * @property {string} id - Unique identifier string (e.g. 'phys_velocity').
 * @property {string} name - Title display name.
 * @property {string} desc - Formula description and mathematical identity.
 * @property {string} expression - Math expression string for evaluation.
 * @property {string[]} variables - Ordered array of variable names required.
 * @property {string} unit - Result unit string.
 */

/** @type {Record<string, FormulaDefinition[]>} Category-mapped dictionary of formula presets */
export const PRESET_FORMULAS = {
  Physics: [
    {
      id: 'phys_velocity',
      name: 'Velocity (v = d/t)',
      desc: 'Calculates average velocity given distance (d) and time (t)',
      expression: 'd / t',
      variables: ['d', 't'],
      unit: 'm/s'
    },
    {
      id: 'phys_acceleration',
      name: 'Acceleration (a = Δv/t)',
      desc: 'Calculates acceleration given velocity change (v) and time (t)',
      expression: 'v / t',
      variables: ['v', 't'],
      unit: 'm/s²'
    },
    {
      id: 'phys_force',
      name: 'Force (F = m * a)',
      desc: "Newton's Second Law of Motion",
      expression: 'm * a',
      variables: ['m', 'a'],
      unit: 'N'
    },
    {
      id: 'phys_kinetic_energy',
      name: 'Kinetic Energy (KE = ½ m * v²)',
      desc: 'Kinetic energy of a moving body',
      expression: '0.5 * m * (v^2)',
      variables: ['m', 'v'],
      unit: 'J'
    },
    {
      id: 'phys_potential_energy',
      name: 'Potential Energy (PE = m * g * h)',
      desc: 'Gravitational potential energy near Earth surface',
      expression: 'm * 9.80665 * h',
      variables: ['m', 'h'],
      unit: 'J'
    },
    {
      id: 'phys_work',
      name: 'Work (W = F * d * cos(θ))',
      desc: 'Work performed by force F acting through displacement d at angle θ (degrees)',
      expression: 'F * d * cos(theta * pi / 180)',
      variables: ['F', 'd', 'theta'],
      unit: 'J'
    },
    {
      id: 'phys_power',
      name: 'Power (P = W / t)',
      desc: 'Rate of work performed or energy transferred over time',
      expression: 'W / t',
      variables: ['W', 't'],
      unit: 'W'
    },
    {
      id: 'phys_momentum',
      name: 'Momentum (p = m * v)',
      desc: 'Linear momentum of a mass in motion',
      expression: 'm * v',
      variables: ['m', 'v'],
      unit: 'kg·m/s'
    },
    {
      id: 'phys_ohm',
      name: "Ohm's Law (V = I * R)",
      desc: 'Electrical voltage given current (I) and resistance (R)',
      expression: 'I * R',
      variables: ['I', 'R'],
      unit: 'V'
    },
    {
      id: 'phys_electric_power',
      name: 'Electrical Power (P = V * I)',
      desc: 'Dissipated power in an electrical circuit',
      expression: 'V * I',
      variables: ['V', 'I'],
      unit: 'W'
    },
    {
      id: 'phys_coulomb',
      name: "Coulomb's Law (F = k * q1 * q2 / r²)",
      desc: 'Electrostatic force between two point charges q1, q2 separated by distance r',
      expression: '(8.9875517923e9 * q1 * q2) / (r^2)',
      variables: ['q1', 'q2', 'r'],
      unit: 'N'
    },
    {
      id: 'phys_gravitation',
      name: "Newton's Law of Universal Gravitation",
      desc: 'Gravitational attraction force F = G * m1 * m2 / r²',
      expression: '(6.67430e-11 * m1 * m2) / (r^2)',
      variables: ['m1', 'm2', 'r'],
      unit: 'N'
    },
    {
      id: 'phys_wave_speed',
      name: 'Wave Speed (v = f * λ)',
      desc: 'Propagation speed of a wave given frequency (f) and wavelength (lambda)',
      expression: 'f * lambda',
      variables: ['f', 'lambda'],
      unit: 'm/s'
    },
    {
      id: 'phys_photon_energy',
      name: 'Photon Energy (E = h * f)',
      desc: 'Quantum energy of a photon given electromagnetic frequency (f)',
      expression: '6.62607015e-34 * f',
      variables: ['f'],
      unit: 'J'
    }
  ],
  Accounts: [
    {
      id: 'acc_simple_interest',
      name: 'Simple Interest',
      desc: 'I = P * R * T / 100 (Principal P, Annual Rate R %, Time T years)',
      expression: '(P * R * T) / 100',
      variables: ['P', 'R', 'T'],
      unit: '$'
    },
    {
      id: 'acc_compound_interest',
      name: 'Compound Interest',
      desc: 'Total Maturity Value = P * (1 + R/100)^T',
      expression: 'P * ((1 + R/100)^T)',
      variables: ['P', 'R', 'T'],
      unit: '$'
    },
    {
      id: 'acc_compound_interest_continuous',
      name: 'Continuous Compound Interest',
      desc: 'Compounded amount A = P * e^(r * t)',
      expression: 'P * e^((R/100) * T)',
      variables: ['P', 'R', 'T'],
      unit: '$'
    },
    {
      id: 'acc_emi',
      name: 'EMI (Equated Monthly Installment)',
      desc: 'Monthly loan payment for principal P at annual rate R % over N months',
      expression: 'P * (R/1200) * (((1 + R/1200)^N) / (((1 + R/1200)^N) - 1))',
      variables: ['P', 'R', 'N'],
      unit: '$/month'
    },
    {
      id: 'acc_profit_margin',
      name: 'Profit Margin (%)',
      desc: 'Net profit percentage relative to total revenue',
      expression: '((Revenue - Cost) / Revenue) * 100',
      variables: ['Revenue', 'Cost'],
      unit: '%'
    },
    {
      id: 'acc_markup',
      name: 'Markup (%)',
      desc: 'Profit markup percentage relative to unit cost',
      expression: '((Revenue - Cost) / Cost) * 100',
      variables: ['Revenue', 'Cost'],
      unit: '%'
    },
    {
      id: 'acc_cagr',
      name: 'CAGR (Compound Annual Growth Rate)',
      desc: 'Geometric annual growth rate over specified investment years',
      expression: '((FinalValue / InitialValue)^(1/Years) - 1) * 100',
      variables: ['FinalValue', 'InitialValue', 'Years'],
      unit: '%'
    },
    {
      id: 'acc_roi',
      name: 'ROI (Return on Investment)',
      desc: 'Percentage return generated relative to initial cost',
      expression: '((CurrentValue - CostOfInvestment) / CostOfInvestment) * 100',
      variables: ['CurrentValue', 'CostOfInvestment'],
      unit: '%'
    },
    {
      id: 'acc_gst',
      name: 'Price with GST / Sales Tax',
      desc: 'Total inclusive purchase price adding tax percentage',
      expression: 'Price + (Price * (GST_Rate / 100))',
      variables: ['Price', 'GST_Rate'],
      unit: '$'
    },
    {
      id: 'acc_depreciation_slm',
      name: 'Straight Line Depreciation',
      desc: 'Annual asset depreciation expense = (Cost - Salvage) / Life',
      expression: '(Cost - Salvage) / Life',
      variables: ['Cost', 'Salvage', 'Life'],
      unit: '$/year'
    }
  ],
  Math: [
    {
      id: 'math_pythagoras',
      name: 'Pythagorean Hypotenuse (c)',
      desc: 'Hypotenuse length c = √(a² + b²) of right triangle with legs a, b',
      expression: 'sqrt(a^2 + b^2)',
      variables: ['a', 'b'],
      unit: ''
    },
    {
      id: 'math_circle_area',
      name: 'Area of Circle',
      desc: 'Area A = π * r² for radius r',
      expression: 'pi * (r^2)',
      variables: ['r'],
      unit: 'sq units'
    },
    {
      id: 'math_cylinder_volume',
      name: 'Volume of Cylinder',
      desc: 'Volume V = π * r² * h for radius r and height h',
      expression: 'pi * (r^2) * h',
      variables: ['r', 'h'],
      unit: 'cubic units'
    },
    {
      id: 'math_sphere_volume',
      name: 'Volume of Sphere',
      desc: 'Volume V = (4/3) * π * r³ for radius r',
      expression: '(4/3) * pi * (r^3)',
      variables: ['r'],
      unit: 'cubic units'
    },
    {
      id: 'math_quadratic_pos',
      name: 'Quadratic Root (+)',
      desc: 'Positive root x = (-b + √(b² - 4ac)) / (2a)',
      expression: '(-b + sqrt(b^2 - 4*a*c)) / (2*a)',
      variables: ['a', 'b', 'c'],
      unit: ''
    },
    {
      id: 'math_quadratic_neg',
      name: 'Quadratic Root (-)',
      desc: 'Negative root x = (-b - √(b² - 4ac)) / (2a)',
      expression: '(-b - sqrt(b^2 - 4*a*c)) / (2*a)',
      variables: ['a', 'b', 'c'],
      unit: ''
    },
    {
      id: 'math_log_base_a',
      name: 'Logarithm Base a of b',
      desc: 'Change of base log_a(b) = ln(b) / ln(a)',
      expression: 'log(b) / log(a)',
      variables: ['a', 'b'],
      unit: ''
    },
    {
      id: 'math_distance_2d',
      name: 'Euclidean Distance (2D)',
      desc: 'Distance between points (x1, y1) and (x2, y2)',
      expression: 'sqrt((x2 - x1)^2 + (y2 - y1)^2)',
      variables: ['x1', 'y1', 'x2', 'y2'],
      unit: ''
    }
  ],
  Astrophysics: [
    {
      id: 'astro_schwarzschild',
      name: 'Schwarzschild Radius (Rs = 2GM/c²)',
      desc: 'Event horizon radius of a non-rotating spherical mass (M)',
      expression: '(2 * 6.6743e-11 * M) / (299792458^2)',
      variables: ['M'],
      unit: 'm'
    },
    {
      id: 'astro_kepler_period',
      name: "Kepler's Third Law (T = √(4π²a³/GM))",
      desc: 'Orbital period given semi-major axis (a) and central body mass (M)',
      expression: 'sqrt((4 * (pi^2) * (a^3)) / (6.6743e-11 * M))',
      variables: ['a', 'M'],
      unit: 's'
    },
    {
      id: 'astro_drake',
      name: 'Drake Equation',
      desc: 'N = R* * fp * ne * fl * fi * fc * L (Active communicative alien civilizations)',
      expression: 'R * fp * ne * fl * fi * fc * L',
      variables: ['R', 'fp', 'ne', 'fl', 'fi', 'fc', 'L'],
      unit: 'civilizations'
    },
    {
      id: 'astro_escape_velocity',
      name: 'Escape Velocity',
      desc: 've = √(2*G*M / R) minimum speed to escape gravitational pull',
      expression: 'sqrt((2 * 6.6743e-11 * M) / R)',
      variables: ['M', 'R'],
      unit: 'm/s'
    },
    {
      id: 'astro_orbital_velocity',
      name: 'Circular Orbital Velocity',
      desc: 'vo = √(G*M / r) velocity required for circular orbit',
      expression: 'sqrt((6.6743e-11 * M) / r)',
      variables: ['M', 'r'],
      unit: 'm/s'
    },
    {
      id: 'astro_hubbles_law',
      name: "Hubble's Law (Recession Velocity)",
      desc: 'v = H0 * d (cosmic recession speed at distance d in Mpc)',
      expression: 'H0 * d',
      variables: ['H0', 'd'],
      unit: 'km/s'
    },
    {
      id: 'astro_wien_displacement',
      name: "Wien's Displacement Law",
      desc: 'λmax = b / T peak blackbody radiation wavelength',
      expression: '2.897771955e-3 / T',
      variables: ['T'],
      unit: 'm'
    },
    {
      id: 'astro_parallax_distance',
      name: 'Stellar Parallax Distance',
      desc: 'd = 1 / p distance in parsecs given parallax angle p in arcseconds',
      expression: '1 / p',
      variables: ['p'],
      unit: 'parsecs'
    },
    {
      id: 'astro_stellar_luminosity',
      name: 'Stellar Radiated Luminosity',
      desc: 'L = 4 * π * R² * σ * T⁴ total radiated power of a star',
      expression: '4 * pi * (R^2) * 5.670374e-8 * (T^4)',
      variables: ['R', 'T'],
      unit: 'W'
    },
    {
      id: 'astro_redshift_velocity',
      name: 'Cosmological Redshift Velocity',
      desc: 'v = z * c velocity from redshift parameter z',
      expression: 'z * 299792458',
      variables: ['z'],
      unit: 'm/s'
    }
  ],
  Chemistry: [
    {
      id: 'chem_nernst',
      name: 'Nernst Equation (Electrochemical Potential)',
      desc: 'E = E0 - (RT/nF) * ln(Q) at temperature T for n electrons transferred',
      expression: 'E0 - ((8.31446 * T) / (n * 96485.33)) * log(Q)',
      variables: ['E0', 'n', 'Q', 'T'],
      unit: 'V'
    },
    {
      id: 'chem_gibbs',
      name: 'Gibbs Free Energy (ΔG = ΔH - TΔS)',
      desc: 'Thermodynamic spontaneity from enthalpy change, temperature, and entropy change',
      expression: 'delta_H - T * delta_S',
      variables: ['delta_H', 'T', 'delta_S'],
      unit: 'J'
    },
    {
      id: 'chem_kinetics',
      name: 'First-Order Chemical Kinetics',
      desc: '[A] = [A0] * e^(-k*t) for decay/reaction over time t',
      expression: 'A0 * exp(-k * t)',
      variables: ['A0', 'k', 't'],
      unit: 'M'
    },
    {
      id: 'chem_arrhenius_k',
      name: 'Arrhenius Reaction Rate Constant',
      desc: 'k = A * e^(-Ea / (R * T)) rate constant from activation energy',
      expression: 'A * exp(-Ea / (8.31446 * T))',
      variables: ['A', 'Ea', 'T'],
      unit: 's⁻¹'
    },
    {
      id: 'chem_henderson_hasselbalch',
      name: 'Henderson-Hasselbalch Buffer pH',
      desc: 'pH = pKa + log10([A-] / [HA])',
      expression: 'pKa + log10(A_minus / HA)',
      variables: ['pKa', 'A_minus', 'HA'],
      unit: 'pH'
    },
    {
      id: 'chem_beer_lambert',
      name: 'Beer-Lambert Absorbance',
      desc: 'A = ε * c * l absorbance given molar absorptivity ε, concentration c, and path length l',
      expression: 'epsilon * c * l',
      variables: ['epsilon', 'c', 'l'],
      unit: 'absorbance'
    },
    {
      id: 'chem_molarity',
      name: 'Solution Molarity (M)',
      desc: 'M = moles / volume in liters',
      expression: 'moles / volume',
      variables: ['moles', 'volume'],
      unit: 'mol/L'
    },
    {
      id: 'chem_dilution',
      name: 'Dilution Equation (Final Volume V2)',
      desc: 'V2 = (M1 * V1) / M2',
      expression: "(M1 * V1) / M2",
      variables: ['M1', 'V1', 'M2'],
      unit: 'L'
    },
    {
      id: 'chem_half_life',
      name: 'First-Order Reaction Half-Life',
      desc: 't1/2 = ln(2) / k = 0.693147 / k',
      expression: '0.69314718 / k',
      variables: ['k'],
      unit: 's'
    },
    {
      id: 'chem_ideal_gas_p',
      name: 'Ideal Gas Law (Pressure P)',
      desc: 'P = (n * R * T) / V (R = 8.31446 J/(mol·K))',
      expression: '(n * 8.31446 * T) / V',
      variables: ['n', 'T', 'V'],
      unit: 'Pa'
    }
  ],
  Biology: [
    {
      id: 'bio_michaelis_menten',
      name: 'Michaelis-Menten Enzyme Kinetics',
      desc: 'v = (Vmax * [S]) / (Km + [S]) reaction rate at substrate concentration [S]',
      expression: '(Vmax * S) / (Km + S)',
      variables: ['Vmax', 'Km', 'S'],
      unit: 'mol/(L·s)'
    },
    {
      id: 'bio_hw_heterozygote',
      name: 'Hardy-Weinberg Heterozygote Proportion (2pq)',
      desc: 'Genotype proportion 2*p*(1-p) for allele frequency p',
      expression: '2 * p * (1 - p)',
      variables: ['p'],
      unit: 'ratio'
    },
    {
      id: 'bio_hw_recessive',
      name: 'Hardy-Weinberg Recessive Proportion (q²)',
      desc: 'Homozygous recessive genotype frequency (1-p)²',
      expression: '(1 - p)^2',
      variables: ['p'],
      unit: 'ratio'
    },
    {
      id: 'bio_exponential_growth',
      name: 'Exponential Population Growth (Nt)',
      desc: 'Nt = N0 * e^(r * t) unrestricted population growth',
      expression: 'N0 * exp(r * t)',
      variables: ['N0', 'r', 't'],
      unit: 'individuals'
    },
    {
      id: 'bio_logistic_growth_rate',
      name: 'Logistic Growth Rate (dN/dt)',
      desc: 'dN/dt = r * N * (1 - N / K) population growth with carrying capacity K',
      expression: 'r * N * (1 - (N / K))',
      variables: ['r', 'N', 'K'],
      unit: 'individuals/time'
    },
    {
      id: 'bio_bmi_metric',
      name: 'Body Mass Index (BMI)',
      desc: 'BMI = weight / (height²) with weight in kg and height in meters',
      expression: 'weight / (height^2)',
      variables: ['weight', 'height'],
      unit: 'kg/m²'
    },
    {
      id: 'bio_cardiac_output',
      name: 'Cardiac Output (CO)',
      desc: 'CO = HR * SV (Heart Rate in bpm * Stroke Volume in mL)',
      expression: 'HR * SV',
      variables: ['HR', 'SV'],
      unit: 'mL/min'
    },
    {
      id: 'bio_ficks_diffusion',
      name: "Fick's First Law of Diffusion",
      desc: 'J = -D * (delta_C / delta_x) diffusion flux across membrane',
      expression: '-1 * D * (delta_C / delta_x)',
      variables: ['D', 'delta_C', 'delta_x'],
      unit: 'mol/(m²·s)'
    },
    {
      id: 'bio_bmr_male',
      name: 'Basal Metabolic Rate (BMR Male)',
      desc: 'BMR = 88.362 + (13.397*weight) + (4.799*height) - (5.677*age)',
      expression: '88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)',
      variables: ['weight', 'height', 'age'],
      unit: 'kcal/day'
    },
    {
      id: 'bio_generation_time',
      name: 'Bacterial Generation Doubling Time (G)',
      desc: 'G = t / (3.322 * log10(b / B)) doubling time',
      expression: 't / (3.322 * log10(b / B))',
      variables: ['t', 'b', 'B'],
      unit: 'minutes'
    }
  ],
  ComputerScience: [
    {
      id: 'cs_entropy_binary',
      name: 'Shannon Binary Information Entropy',
      desc: 'H(X) = -p*log2(p) - (1-p)*log2(1-p) in bits',
      expression: '- (p * (log(p)/log(2)) + (1 - p) * (log(1 - p)/log(2)))',
      variables: ['p'],
      unit: 'bits'
    },
    {
      id: 'cs_cpu_exec_time',
      name: 'CPU Execution Time',
      desc: 'Time = InstructionCount * CPI * ClockCycleTime (in seconds)',
      expression: 'instructions * cpi * cycle_time',
      variables: ['instructions', 'cpi', 'cycle_time'],
      unit: 's'
    },
    {
      id: 'cs_shannon_capacity',
      name: 'Shannon Channel Capacity (Hartley-Shannon)',
      desc: 'C = B * log2(1 + SNR) maximum error-free data rate over bandwidth B',
      expression: 'B * (log(1 + snr) / log(2))',
      variables: ['B', 'snr'],
      unit: 'bits/s'
    },
    {
      id: 'cs_cache_amat',
      name: 'Average Memory Access Time (AMAT)',
      desc: 'AMAT = HitTime + (MissRate * MissPenalty)',
      expression: 'hit_time + (miss_rate * miss_penalty)',
      variables: ['hit_time', 'miss_rate', 'miss_penalty'],
      unit: 'ns'
    },
    {
      id: 'cs_ram_bandwidth',
      name: 'DDR RAM Theoretical Peak Bandwidth',
      desc: 'Bandwidth = ClockFreq_MHz * 8 bytes * 2 transfers / 1000',
      expression: '(clock_mhz * 8 * 2) / 1000',
      variables: ['clock_mhz'],
      unit: 'GB/s'
    },
    {
      id: 'cs_amdahls_law',
      name: "Amdahl's Law Speedup",
      desc: 'Speedup = 1 / ((1 - p) + (p / s)) with parallel fraction p (0-1) and s processor count',
      expression: '1 / ((1 - p) + (p / s))',
      variables: ['p', 's'],
      unit: 'speedup'
    },
    {
      id: 'cs_littles_law',
      name: "Little's Law (Queueing Theory)",
      desc: 'L = λ * W average items in system given arrival rate λ and average wait time W',
      expression: 'arrival_rate * wait_time',
      variables: ['arrival_rate', 'wait_time'],
      unit: 'items'
    },
    {
      id: 'cs_network_delay',
      name: 'Total Network Delay',
      desc: 'Delay = (PacketSize_bits / Bandwidth_bps) + (Distance_meters / 2e8)',
      expression: '(packet_bits / bandwidth_bps) + (distance_m / 200000000)',
      variables: ['packet_bits', 'bandwidth_bps', 'distance_m'],
      unit: 's'
    },
    {
      id: 'cs_mips_rating',
      name: 'Processor MIPS Rating',
      desc: 'MIPS = ClockFrequency_MHz / (CPI)',
      expression: 'clock_freq_mhz / cpi',
      variables: ['clock_freq_mhz', 'cpi'],
      unit: 'MIPS'
    }
  ]
};
