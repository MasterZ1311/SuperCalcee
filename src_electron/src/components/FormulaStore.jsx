/**
 * SuperCalcee Formula Store Component (Option B - Offline Compressed Archives)
 * ===========================================================================
 * 
 * Modular Formula Store library allowing users to browse, extract, and uninstall
 * domain-specific formula packs (Physics, Thermodynamics, Corporate Finance, Geometry,
 * Stellar Physics, Reaction Kinetics, Population Genetics, Systems Architecture).
 * 
 * Storage Mechanism (Option B):
 *  - Master formula packs are stored locally as compressed .zip archives.
 *  - On user demand, packs are extracted into local persistent storage (AppData).
 *  - Uninstalled packs are purged from active storage to reclaim space, while
 *    the compressed archives remain available offline for immediate re-installation.
 * 
 * @component
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  FORMULA_PACKS,
  fetchStorageSummary,
  installPackArchive,
  uninstallPackArchive
} from '../data/packRegistry';
import {
  Check,
  Search,
  BookOpen,
  Archive,
  HardDrive,
  Trash2,
  RefreshCw,
  FolderDown,
  Info
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Physics',
  'Accounts',
  'Math',
  'Astrophysics',
  'Chemistry',
  'Biology',
  'ComputerScience'
];

const FormulaStore = ({ installedPackIds, onToggleInstall }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [storageSummary, setStorageSummary] = useState(null);
  const [loadingPacks, setLoadingPacks] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

  // Load live storage summary from backend on mount and when installed packs change
  useEffect(() => {
    let isMounted = true;
    fetchStorageSummary()
      .then(summary => {
        if (isMounted) setStorageSummary(summary);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [installedPackIds]);

  // Total available formulas count across all packs
  const totalFormulasCount = useMemo(() => {
    return FORMULA_PACKS.reduce((sum, p) => sum + p.count, 0);
  }, []);

  // Total installed formulas count
  const installedFormulasCount = useMemo(() => {
    return FORMULA_PACKS
      .filter(p => installedPackIds.includes(p.id))
      .reduce((sum, p) => sum + p.count, 0);
  }, [installedPackIds]);

  // Filter packs based on category and search query
  const filteredPacks = useMemo(() => {
    return FORMULA_PACKS.filter(p => {
      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || 
        p.title.toLowerCase().includes(q) || 
        p.desc.toLowerCase().includes(q) || 
        p.source.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Handle extraction & install or uninstall of a pack archive
  const handleAction = async (packId) => {
    const isCurrentlyInstalled = installedPackIds.includes(packId);
    setLoadingPacks(prev => ({ ...prev, [packId]: true }));
    setStatusMessage(null);

    try {
      if (isCurrentlyInstalled) {
        // Uninstall and free disk space
        await uninstallPackArchive(packId);
        onToggleInstall(packId);
        setStatusMessage({
          type: 'success',
          text: `Pack uninstalled. Extracted files purged from AppData to free disk space.`
        });
      } else {
        // Extract from compressed .zip archive into AppData
        await installPackArchive(packId);
        onToggleInstall(packId);
        setStatusMessage({
          type: 'success',
          text: `Extracted & installed from offline .zip archive into AppData. Formulas are now active!`
        });
      }
      const updatedSummary = await fetchStorageSummary();
      setStorageSummary(updatedSummary);
    } catch (err) {
      console.error('Pack action error:', err);
      // Fallback to toggle
      onToggleInstall(packId);
      setStatusMessage({
        type: 'error',
        text: `Error updating pack: ${err.message || 'Unknown error'}`
      });
    } finally {
      setLoadingPacks(prev => ({ ...prev, [packId]: false }));
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Store Header Banner */}
      <div className="glass-panel" style={{ background: '#1C1C1E', border: '1px solid #FF9500' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ color: '#FF9500', margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={22} />
              Modular Formula Pack Catalog
            </h3>
            <p style={{ color: '#A5A5A5', fontSize: '0.9rem', margin: 0 }}>
              Specialized scientific and financial packs divided section-wise. Shipped as <strong>offline compressed archives (.zip)</strong>. Extract only what you need to conserve storage!
            </p>
          </div>

          {/* Storage Mode Badges */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ background: '#2C2C2E', padding: '6px 14px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#8E8E93', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Archive size={12} />
                OFFLINE ARCHIVE ({totalFormulasCount} formulas)
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff' }}>
                {storageSummary ? formatBytes(storageSummary.total_archive_size_bytes) : '~16 KB'} ({FORMULA_PACKS.length} packs)
              </div>
            </div>

            <div style={{ background: 'rgba(255,149,0,0.15)', border: '1px solid #FF9500', padding: '6px 14px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#FF9500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <HardDrive size={12} />
                EXTRACTED (ACTIVE)
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#FF9500' }}>
                {installedPackIds.length} packs ({installedFormulasCount} formulas)
              </div>
            </div>
          </div>
        </div>

        {/* Option B Architecture Explainer Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 149, 0, 0.08)',
          border: '1px solid rgba(255, 149, 0, 0.2)',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '1rem',
          fontSize: '0.82rem',
          color: '#D1D1D6'
        }}>
          <Info size={16} color="#FF9500" style={{ flexShrink: 0 }} />
          <span>
            <strong>Option B Active:</strong> Formula packs ship as local compressed .zip files. Clicking <em>"Extract & Install"</em> unzips the pack to your system's AppData directory completely offline. Uninstalling deletes extracted files to reclaim storage.
          </span>
        </div>

        {/* Status notification toast */}
        {statusMessage && (
          <div style={{
            background: statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            border: `1px solid ${statusMessage.type === 'error' ? '#ef4444' : '#22c55e'}`,
            color: statusMessage.type === 'error' ? '#fca5a5' : '#86efac',
            borderRadius: '8px',
            padding: '8px 12px',
            marginBottom: '1rem',
            fontSize: '0.85rem'
          }}>
            {statusMessage.text}
          </div>
        )}

        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '1rem'
        }}>
          <Search size={16} color="#8E8E93" />
          <input
            type="text"
            placeholder="Search packs by topic, formula name, or source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.9rem',
              width: '100%',
              outline: 'none',
              padding: 0,
              margin: 0
            }}
          />
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#FF9500' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === cat ? '#000' : '#E5E5EA',
                border: selectedCategory === cat ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat === 'Accounts' ? 'Finance' : cat === 'ComputerScience' ? 'Comp Sci' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Packs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filteredPacks.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#8E8E93', padding: '40px' }}>
            No formula packs match your filter.
          </div>
        ) : (
          filteredPacks.map(pack => {
            const isInstalled = installedPackIds.includes(pack.id);
            const isLoading = !!loadingPacks[pack.id];

            return (
              <div 
                key={pack.id} 
                className="glass-panel"
                style={{
                  background: isInstalled ? 'rgba(255, 149, 0, 0.08)' : '#1C1C1E',
                  border: isInstalled ? '1px solid #FF9500' : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '16px',
                  padding: '1.4rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                    <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: '600' }}>
                      {pack.title}
                    </h4>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: 'rgba(255, 149, 0, 0.15)', 
                      padding: '3px 8px', 
                      borderRadius: '6px',
                      color: '#FF9500',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}>
                      {pack.count} formulas
                    </span>
                  </div>
                  
                  <p style={{ color: '#8E8E93', fontSize: '0.85rem', marginBottom: '10px', lineHeight: '1.4' }}>
                    {pack.desc}
                  </p>
                  
                  {/* File & Compression Stats */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.75rem',
                    color: '#A5A5A5',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    marginBottom: '10px'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Archive size={12} color="#FF9500" />
                      Archive: <strong>{formatBytes(pack.archiveSizeBytes)}</strong> .zip
                    </span>
                    <span>â€¢</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HardDrive size={12} color="#007AFF" />
                      Extracted: <strong>{formatBytes(pack.uncompressedBytes)}</strong>
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#636366', marginBottom: '12px' }}>
                    Attribution: <em>{pack.source}</em>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Status Badge */}
                  <div style={{
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    color: isInstalled ? '#34C759' : '#8E8E93',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}>
                    {isInstalled ? (
                      <>
                        <Check size={14} color="#34C759" />
                        Extracted in AppData (Active in Calculator)
                      </>
                    ) : (
                      <>
                        <Archive size={14} color="#8E8E93" />
                        Stored in Offline ZIP Archive (Not Extracted)
                      </>
                    )}
                  </div>

                  {/* Primary Action Button */}
                  <button
                    onClick={() => handleAction(pack.id)}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      background: isInstalled ? 'rgba(239, 68, 68, 0.15)' : '#FF9500',
                      border: isInstalled ? '1px solid #ef4444' : 'none',
                      color: isInstalled ? '#ef4444' : '#000',
                      fontWeight: 'bold',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: isLoading ? 'wait' : 'pointer',
                      opacity: isLoading ? 0.7 : 1,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={16} className="spin-animation" />
                        {isInstalled ? 'Uninstalling & Purging...' : 'Extracting Archive...'}
                      </>
                    ) : isInstalled ? (
                      <>
                        <Trash2 size={16} />
                        Uninstall & Free Storage
                      </>
                    ) : (
                      <>
                        <FolderDown size={16} />
                        Extract & Install (Offline)
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FormulaStore;
