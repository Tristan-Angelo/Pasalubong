import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for lazy loading dashboard data
 * Only loads data for the active section to improve performance
 * Prevents section rendering until data is fully loaded
 */
const useLazyDashboardData = (activePage, dataLoaders) => {
  const [loadedSections, setLoadedSections] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [currentLoadingSection, setCurrentLoadingSection] = useState(null);
  const loadingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const loadedSectionsRef = useRef(new Set());
  const dataLoadersRef = useRef(dataLoaders);

  // Keep dataLoaders ref in sync
  useEffect(() => {
    dataLoadersRef.current = dataLoaders;
    console.log('📚 Data loaders updated:', Object.keys(dataLoaders));
  }, [dataLoaders]);

  // Load data for a specific section
  const loadSectionData = useCallback(async (section) => {
    // Prevent duplicate loads
    if (loadingRef.current) {
      console.log(`⏸️ Already loading, skipping section: ${section}`);
      return false;
    }
    if (loadedSectionsRef.current.has(section)) {
      console.log(`✅ Section already loaded: ${section}`);
      return true;
    }

    console.log(`🔄 Loading section: ${section}`);
    loadingRef.current = true;
    setIsLoading(true);
    setCurrentLoadingSection(section);

    // Create abort controller for this load operation
    abortControllerRef.current = new AbortController();

    try {
      const loaders = dataLoadersRef.current[section];
      if (loaders && loaders.length > 0) {
        console.log(`📥 Running ${loaders.length} loaders for section: ${section}`);
        const results = await Promise.allSettled(loaders.map(loader => loader()));
        
        // Log any failures
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`❌ Loader ${index} failed for ${section}:`, result.reason);
          }
        });
      } else {
        console.log(`⚠️ No loaders found for section: ${section}`);
      }
      
      // Update both state and ref immediately
      setLoadedSections(prev => {
        const newSet = new Set([...prev, section]);
        loadedSectionsRef.current = newSet; // Update ref immediately
        console.log(`📝 Updated loadedSections:`, Array.from(newSet));
        return newSet;
      });
      console.log(`✅ Section loaded successfully: ${section}`);
      return true;
    } catch (error) {
      console.error(`❌ Error loading data for ${section}:`, error);
      return false;
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
      setCurrentLoadingSection(null);
      abortControllerRef.current = null;
    }
  }, []); // No dependencies - uses refs

  // Load data when active page changes
  useEffect(() => {
    // Check if section is already loaded using ref
    if (loadedSectionsRef.current.has(activePage)) {
      console.log(`✅ Section ${activePage} already loaded, skipping`);
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
      return;
    }

    // Prevent loading if already in progress
    if (loadingRef.current) {
      console.log(`⏸️ Load already in progress, skipping ${activePage}`);
      return;
    }

    if (!initialLoadComplete) {
      // On initial load, load the current active page's data
      console.log(`🚀 Initial load for section: ${activePage}`);
      loadSectionData(activePage).then(() => {
        setInitialLoadComplete(true);
      });
    } else {
      // For subsequent page changes, load that section's data
      console.log(`📄 Loading new section: ${activePage}`);
      loadSectionData(activePage);
    }
  }, [activePage, initialLoadComplete, loadSectionData]);

  // Force reload a section
  const reloadSection = useCallback(async (section) => {
    console.log(`🔄 Force reloading section: ${section}`);
    setLoadedSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(section);
      return newSet;
    });
    await loadSectionData(section);
  }, [loadSectionData]);

  // Check if a section is loaded
  const isSectionLoaded = useCallback((section) => {
    return loadedSections.has(section);
  }, [loadedSections]);

  // Check if section can be rendered (must be fully loaded)
  const canRenderSection = useCallback((section) => {
    // Section must be fully loaded (in the loadedSections set)
    // Allow rendering even if another section is loading (for better UX)
    const canRender = loadedSections.has(section);
    console.log(`🎨 canRenderSection(${section}):`, canRender, 'loadedSections:', Array.from(loadedSections));
    return canRender;
  }, [loadedSections]);

  // Function to check if navigation is allowed
  const canNavigate = useCallback(() => {
    return !loadingRef.current && !isLoading;
  }, [isLoading]);

  return {
    isLoading,
    isSectionLoaded,
    canRenderSection,
    canNavigate,
    reloadSection,
    initialLoadComplete,
    loadingRef // Expose ref for immediate checks
  };
};

export default useLazyDashboardData;