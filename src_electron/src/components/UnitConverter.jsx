/**
 * SuperCalcee Unit Converter Component
 * ====================================
 * 
 * Multi-category scientific dimensional unit converter featuring:
 *  - 12 standard engineering and scientific categories
 *  - High-precision offline conversion factors to standard SI base units
 *  - Interactive 1-to-All unit comparison matrix
 *  - Quick swap (⇄) between input and target units
 *  - One-click copy-to-clipboard functionality
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, Copy, Check, Sparkles } from 'lucide-react';

const UNIT_CATEGORIES = {
  Length: {
    base: 'm',
    units: {
      'Nanometers (nm)': 1e-9,
      'Micrometers (µm)': 1e-6,
      'Millimeters (mm)': 0.001,
      'Centimeters (cm)': 0.01,
      'Meters (m)': 1,
      'Kilometers (km)': 1000,
      'Inches (in)': 0.0254,
      'Feet (ft)': 0.3048,
      'Yards (yd)': 0.9144,
      'Miles (mi)': 1609.344,
      'Nautical Miles (nmi)': 1852,
      'Light Years (ly)': 9.46073e15
    }
  },
  Mass: {
    base: 'kg',
    units: {
      'Micrograms (µg)': 1e-9,
      'Milligrams (mg)': 1e-6,
      'Grams (g)': 0.001,
      'Kilograms (kg)': 1,
      'Metric Tonnes (t)': 1000,
      'Ounces (oz)': 0.0283495,
      'Pounds (lb)': 0.453592,
      'Stone (st)': 6.35029,
      'Carats (ct)': 0.0002
    }
  },
  Temperature: {
    special: true,
    units: ['Celsius (°C)', 'Fahrenheit (°F)', 'Kelvin (K)', 'Rankine (°R)']
  },
  Time: {
    base: 's',
    units: {
      'Microseconds (µs)': 1e-6,
      'Milliseconds (ms)': 0.001,
      'Seconds (s)': 1,
      'Minutes (min)': 60,
      'Hours (hr)': 3600,
      'Days (d)': 86400,
      'Weeks (wk)': 604800,
      'Years (yr)': 31536000
    }
  },
  Speed: {
    base: 'm/s',
    units: {
      'Meters/sec (m/s)': 1,
      'Kilometers/hour (km/h)': 1 / 3.6,
      'Miles/hour (mph)': 0.44704,
      'Feet/sec (ft/s)': 0.3048,
      'Knots (kn)': 0.514444,
      'Speed of Light (c)': 299792458
    }
  },
  Area: {
    base: 'm²',
    units: {
      'Square Millimeters (mm²)': 1e-6,
      'Square Centimeters (cm²)': 1e-4,
      'Square Meters (m²)': 1,
      'Hectares (ha)': 10000,
      'Square Kilometers (km²)': 1e6,
      'Square Inches (in²)': 0.00064516,
      'Square Feet (ft²)': 0.092903,
      'Square Yards (yd²)': 0.836127,
      'Acres (ac)': 4046.86,
      'Square Miles (mi²)': 2589988.11
    }
  },
  Volume: {
    base: 'L',
    units: {
      'Milliliters (mL)': 0.001,
      'Liters (L)': 1,
      'Cubic Meters (m³)': 1000,
      'Cubic Centimeters (cm³)': 0.001,
      'Fluid Ounces US (fl oz)': 0.0295735,
      'Cups US': 0.236588,
      'Pints US (pt)': 0.473176,
      'Quarts US (qt)': 0.946353,
      'Gallons US (gal)': 3.78541,
      'Cubic Feet (ft³)': 28.3168
    }
  },
  Pressure: {
    base: 'Pa',
    units: {
      'Pascals (Pa)': 1,
      'Kilopascals (kPa)': 1000,
      'Megapascals (MPa)': 1e6,
      'Bar': 100000,
      'Millibar (mbar)': 100,
      'Atmospheres (atm)': 101325,
      'Pounds/sq inch (psi)': 6894.76,
      'Torr / mmHg': 133.322
    }
  },
  Energy: {
    base: 'J',
    units: {
      'Joules (J)': 1,
      'Kilojoules (kJ)': 1000,
      'Megajoules (MJ)': 1e6,
      'Calories (cal)': 4.184,
      'Kilocalories (kcal)': 4184,
      'Watt-hours (Wh)': 3600,
      'Kilowatt-hours (kWh)': 3.6e6,
      'Electron-volts (eV)': 1.60218e-19,
      'British Thermal Units (BTU)': 1055.06
    }
  },
  Power: {
    base: 'W',
    units: {
      'Milliwatts (mW)': 0.001,
      'Watts (W)': 1,
      'Kilowatts (kW)': 1000,
      'Megawatts (MW)': 1e6,
      'Horsepower Metric (hp)': 735.499,
      'Horsepower Mechanical (hp)': 745.7,
      'Foot-pounds/sec': 1.35582
    }
  },
  Data: {
    base: 'B',
    units: {
      'Bits (b)': 0.125,
      'Bytes (B)': 1,
      'Kilobytes (KB)': 1000,
      'Megabytes (MB)': 1e6,
      'Gigabytes (GB)': 1e9,
      'Terabytes (TB)': 1e12,
      'Petabytes (PB)': 1e15,
      'Kibibytes (KiB)': 1024,
      'Mebibytes (MiB)': 1048576,
      'Gibibytes (GiB)': 1073741824,
      'Tebibytes (TiB)': 1099511627776
    }
  },
  Angle: {
    base: 'deg',
    units: {
      'Degrees (deg)': 1,
      'Radians (rad)': 180 / Math.PI,
      'Gradians (grad)': 0.9,
      'Arcminutes (arcmin)': 1 / 60,
      'Arcseconds (arcsec)': 1 / 3600,
      'Revolutions / Turns': 360
    }
  }
};

/**
 * Temperature converter helper.
 */
function convertTemperature(value, from, to) {
  let kelvin = value;
  if (from.includes('Celsius')) kelvin = value + 273.15;
  else if (from.includes('Fahrenheit')) kelvin = (value - 32) * (5 / 9) + 273.15;
  else if (from.includes('Rankine')) kelvin = value * (5 / 9);
  else if (from.includes('Kelvin')) kelvin = value;

  if (to.includes('Celsius')) return kelvin - 273.15;
  if (to.includes('Fahrenheit')) return (kelvin - 273.15) * (9 / 5) + 32;
  if (to.includes('Rankine')) return kelvin * (9 / 5);
  return kelvin;
}

const UnitConverter = () => {
  const [activeCategory, setActiveCategory] = useState('Length');
  const [inputValue, setInputValue] = useState('1');
  const [fromUnit, setFromUnit] = useState(() => {
    const cat = UNIT_CATEGORIES.Length;
    return cat.special ? cat.units[0] : Object.keys(cat.units)[4]; // Meters
  });
  const [toUnit, setToUnit] = useState(() => {
    const cat = UNIT_CATEGORIES.Length;
    return cat.special ? cat.units[1] : Object.keys(cat.units)[6]; // Feet
  });
  const [copiedKey, setCopiedKey] = useState(null);

  const categoryConfig = UNIT_CATEGORIES[activeCategory];
  const unitKeys = categoryConfig.special ? categoryConfig.units : Object.keys(categoryConfig.units);

  const handleCategoryChange = (newCat) => {
    setActiveCategory(newCat);
    const cfg = UNIT_CATEGORIES[newCat];
    const keys = cfg.special ? cfg.units : Object.keys(cfg.units);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const convertedValue = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return '—';

    if (categoryConfig.special) {
      const res = convertTemperature(val, fromUnit, toUnit);
      return parseFloat(res.toFixed(6));
    }

    const fromFactor = categoryConfig.units[fromUnit];
    const toFactor = categoryConfig.units[toUnit];
    const baseValue = val * fromFactor;
    const result = baseValue / toFactor;

    if (Math.abs(result) > 0 && Math.abs(result) < 1e-4) {
      return result.toExponential(4);
    }
    return parseFloat(result.toFixed(6));
  }, [inputValue, fromUnit, toUnit, categoryConfig]);

  // Compute 1-to-All conversion matrix
  const allEquivalents = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return [];

    return unitKeys.map(unitName => {
      let eqVal;
      if (categoryConfig.special) {
        eqVal = convertTemperature(val, fromUnit, unitName);
      } else {
        const fromFactor = categoryConfig.units[fromUnit];
        const targetFactor = categoryConfig.units[unitName];
        eqVal = (val * fromFactor) / targetFactor;
      }

      let formatted;
      if (Math.abs(eqVal) > 0 && (Math.abs(eqVal) < 1e-4 || Math.abs(eqVal) >= 1e8)) {
        formatted = eqVal.toExponential(4);
      } else {
        formatted = String(parseFloat(eqVal.toFixed(6)));
      }

      return { unit: unitName, value: formatted };
    });
  }, [inputValue, fromUnit, unitKeys, categoryConfig]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        {Object.keys(UNIT_CATEGORIES).map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            style={{
              background: activeCategory === cat ? '#FF9500' : 'rgba(255,255,255,0.05)',
              color: activeCategory === cat ? '#000' : '#E5E5EA',
              border: activeCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Primary Conversion Card */}
      <div className="glass-panel" style={{ background: '#1C1C1E', border: '1px solid rgba(255,149,0,0.4)' }}>
        <h3 style={{ color: '#FF9500', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} />
          {activeCategory} Converter
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Source Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: '#8E8E93' }}>From</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              style={{
                background: '#2C2C2E',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            >
              {unitKeys.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Value..."
              style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            title="Swap Units"
            style={{
              background: '#2C2C2E',
              color: '#FF9500',
              border: '1px solid rgba(255,149,0,0.3)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginTop: '20px',
              transition: 'transform 0.2s ease'
            }}
          >
            <ArrowLeftRight size={18} />
          </button>

          {/* Target Output */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: '#8E8E93' }}>To</label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              style={{
                background: '#2C2C2E',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            >
              {unitKeys.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>

            <div style={{
              minHeight: '48px',
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid #FF9500',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#fff',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              <span>{convertedValue}</span>
              <button
                onClick={() => copyToClipboard(String(convertedValue), 'primary')}
                style={{
                  background: 'transparent',
                  color: copiedKey === 'primary' ? '#10b981' : '#8E8E93',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Copy Result"
              >
                {copiedKey === 'primary' ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* All Equivalents Matrix */}
      <div>
        <h4 style={{ color: '#E5E5EA', marginBottom: '12px', fontSize: '1rem' }}>
          All {activeCategory} Equivalents for {inputValue} {fromUnit}
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '12px'
        }}>
          {allEquivalents.map((item, idx) => (
            <div
              key={item.unit}
              style={{
                background: item.unit === toUnit ? 'rgba(255,149,0,0.12)' : '#1C1C1E',
                border: item.unit === toUnit ? '1px solid #FF9500' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ overflow: 'hidden', paddingRight: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: '#8E8E93' }}>{item.unit}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {item.value}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(item.value, idx)}
                style={{
                  background: 'transparent',
                  color: copiedKey === idx ? '#10b981' : '#8E8E93',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Copy Value"
              >
                {copiedKey === idx ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;
