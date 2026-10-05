/**
 * Frontend Unit Tests: Formula Selection, Presets & Pack Registry
 * Runner: Node 22 native test runner (node:test)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRESET_FORMULAS } from '../src/data/presetFormulas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKS_DIR = path.join(__dirname, '..', 'src', 'data', 'formula_packs');

describe('Formula Selection & Pack Registry Catalog', () => {
  it('validates preset formulas database structure', () => {
    assert.ok(Array.isArray(PRESET_FORMULAS.Physics));
    assert.ok(Array.isArray(PRESET_FORMULAS.Accounts));
    assert.ok(Array.isArray(PRESET_FORMULAS.Math));

    assert.equal(PRESET_FORMULAS.Physics.length, 14);
    assert.equal(PRESET_FORMULAS.Accounts.length, 10);
    assert.equal(PRESET_FORMULAS.Math.length, 8);

    // Every formula must have id, name, expression, variables, unit
    for (const [cat, formulas] of Object.entries(PRESET_FORMULAS)) {
      for (const f of formulas) {
        assert.ok(f.id, `Formula in ${cat} missing id`);
        assert.ok(f.name, `Formula in ${cat} missing name`);
        assert.ok(f.expression, `Formula in ${cat} missing expression`);
        assert.ok(Array.isArray(f.variables), `Formula in ${cat} variables not array`);
        assert.ok(f.variables.length > 0, `Formula in ${cat} has empty variables`);
      }
    }
  });

  it('validates all 14 formula pack JSON files on disk', () => {
    const packFiles = fs.readdirSync(PACKS_DIR).filter(f => f.endsWith('.json'));
    assert.equal(packFiles.length, 14);

    let totalFormulas = 0;
    for (const file of packFiles) {
      const content = fs.readFileSync(path.join(PACKS_DIR, file), 'utf-8');
      const formulas = JSON.parse(content);
      assert.ok(Array.isArray(formulas), `Pack ${file} is not an array`);
      assert.ok(formulas.length > 0, `Pack ${file} is empty`);
      totalFormulas += formulas.length;
    }
    assert.equal(totalFormulas, 116);
  });

  it('resolves active domain formulas combining presets and installed packs', () => {
    const installedPackIds = ['pack_physics_mech'];

    // Load sample mechanics pack directly
    const mechPackContent = JSON.parse(
      fs.readFileSync(path.join(PACKS_DIR, 'physics_mechanics.json'), 'utf-8')
    );
    const mockPacks = [
      {
        id: 'pack_physics_mech',
        category: 'Physics',
        formulas: mechPackContent
      }
    ];

    // Replicate App.jsx:127-144 logic
    const categoryMap = {
      physics: 'Physics',
      accounts: 'Accounts',
      math: 'Math'
    };
    const catName = categoryMap['physics'];
    const builtIn = PRESET_FORMULAS[catName] || [];
    const installedFromPacks = mockPacks
      .filter(pack => pack.category === catName && installedPackIds.includes(pack.id))
      .flatMap(pack => pack.formulas);

    const combined = [...builtIn, ...installedFromPacks];
    // Builtin physics: 14, Mechanics pack: 14 -> Total: 28
    assert.equal(builtIn.length, 14);
    assert.equal(installedFromPacks.length, 14);
    assert.equal(combined.length, 28);
  });
});
