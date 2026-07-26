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
  ]
};
