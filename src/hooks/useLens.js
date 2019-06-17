import { useState } from 'react';

import {
  geoJsonFromLatLn,
  clearLeafletElementLayers,
  addLeafletMarkerLayer
} from '../lib/leaflet';
import { resolveLensAutocomplete } from '../lib/lens';

import { useFilters, useLocation } from '../hooks';

const QUERY_SEARCH_PARAMS = ['q', 'properties'];

export default function useLens ({
  defaultCenter = {},
  resolveOnSearch,
  refMapDraw,
  availableFilters
}) {
  // const defaultGeoJson = typeof geoJsonFromLatLn === 'function' && geoJsonFromLatLn(defaultCenter);
  const mapConfigDefaults = {
    center: defaultCenter,
    geoJson: undefined,
    textInput: '',
    date: {},
    page: 1
  };
  const [mapConfig, updateMapConfig] = useState(mapConfigDefaults);
  const [results, updateResults] = useState();
  const [moreResultsAvailable, updateMoreResultsAvailable] = useState();

  const { search: locationSearch, history } = useLocation();

  const {
    filters,
    openFilters,
    storeFilterChanges,
    saveFilterChanges,
    setActiveFilters,
    cancelFilterChanges,
    clearActiveFilters
  } = useFilters(availableFilters);

  /**
   * search
   * @description HAndle search functionality given layer settings and a date
   */

  function search ({
    layer = {},
    date = mapConfig.date,
    textInput = mapConfig.textInput,
    page = 1,
    activeFilters = filters.active
  } = {}) {
    let { center = mapConfig.center, geoJson = mapConfig.geoJson } = layer;

    if (typeof geoJson === 'undefined') {
      geoJson = geoJsonFromLatLn(center);
    }

    const mapUpdate = {
      ...mapConfig,
      center,
      geoJson,
      textInput,
      date,
      page
    };

    const params = {
      geoJson,
      date,
      textInput,
      page,
      filters: activeFilters
    };

    if (typeof resolveOnSearch === 'function') {
      resolveOnSearch(params).then(({ features = [], hasMoreResults } = {}) => {
        // If the page is greater than 1, we should append the results
        const baseResults = Array.isArray(results) && page > 1 ? results : [];
        const updatedResults = [...baseResults, ...features];
        updateResults(updatedResults);
        updateMoreResultsAvailable(!!hasMoreResults);
      });
    }

    updateMapConfig(mapUpdate);
  }

  /**
   * handleOnSearch
   * @description Fires when a search is performed via SearchComplete
   */

  function handleOnSearch (
    { x, y } = {},
    date,
    textInput,
    activeFilters = filters.active
  ) {
    if (typeof x === 'undefined' || typeof y === 'undefined') {
      return;
    }

    const center = {
      lng: x,
      lat: y
    };

    addSearchMarker(center);

    search({
      layer: {
        geoJson: geoJsonFromLatLn(center),
        center
      },
      date,
      textInput,
      activeFilters
    });
  }

  /**
   * clearSearchMarkers
   * @description Clears all marker instances on map
   */

  function clearSearchMarkers () {
    const { current } = refMapDraw;
    const { leafletElement } = current || {};
    if (leafletElement) {
      clearLeafletElementLayers(leafletElement);
    }
  }

  /**
   * addSearchMarker
   * @description Adds a new marker at position on map, clears old
   */

  function addSearchMarker (position) {
    const { current } = refMapDraw;
    const { leafletElement } = current || {};
    if (leafletElement) {
      clearSearchMarkers();
      addLeafletMarkerLayer(position, leafletElement);
    }
  }

  /**
   * handleOnCreated
   * @description Fires when a layer is created
   */

  function handleOnCreated (layer) {
    search({
      layer
    });
  }

  /**
   * handleLoadMoreResults
   * @description Triggers a new search request with an additional argument for page
   */

  function handleLoadMoreResults () {
    search({
      page: mapConfig.page + 1
    });
  }

  /**
   * handleUpdateSearchParams
   * @description Handles lens events upon updating any search params
   */

  function handleUpdateSearchParams () {
    // Save and update any filter changes
    const updatedFilters = saveFilterChanges();

    // Trigger a new search
    search({
      activeFilters: updatedFilters.active
    });
  }

  /**
   * handleClearActiveFilters
   * @description Handles lens events upon clearing active filters
   */

  function handleClearActiveFilters () {
    const updatedFilters = clearActiveFilters();
    search({
      activeFilters: updatedFilters.active
    });
  }

  /**
   * handleQueryParams
   * @description Pulls in search related query params and updates search
   */

  function handleQueryParams () {
    const urlParams = new URLSearchParams(locationSearch);
    const urlQuery = urlParams.get('q');
    const availableFilters = filters.available;
    const properties = new URLSearchParams(urlParams.get('properties'));

    let queryFilters = [];

    // Loops through any available properties and adds to available filters

    for (let property of properties.entries()) {
      let key = property[0];
      let value = property[1];
      let id = `properties/${key}`;

      availableFilters.find(element => {
        if (element.id === id) {
          queryFilters.push({ id, value });
        }
        return element.id === id;
      });
    }

    // If we have any available search params, trigger an autocomplete with
    // the query to grab the first match then trigger a search with it

    if (urlQuery || queryFilters.length > 0) {
      resolveLensAutocomplete(urlQuery).then(queryResults => {
        if (Array.isArray(queryResults)) {
          const { value } = queryResults[0];
          handleOnSearch(value, {}, urlQuery, queryFilters);
          setActiveFilters(queryFilters);
        }
      });
    }
  }

  /**
   * clearQuerySearchParams
   * @description Remove all serach related query params from URL
   */

  function clearQuerySearchParams () {
    if (typeof locationSearch === 'undefined') return;
    const urlParams = new URLSearchParams(locationSearch);
    QUERY_SEARCH_PARAMS.forEach(param => {
      urlParams.delete(param);
    });
    if (history) {
      history.pushState('', '', `?${urlParams.toString()}`);
    }
  }

  /**
   * handleClearSearch
   * @description Clears all aspects of an active search from the state
   */

  function handleClearSearch () {
    clearQuerySearchParams();
    clearSearchMarkers();
    updateMapConfig(mapConfigDefaults);
    updateResults(undefined);
    updateMoreResultsAvailable(false);
  }

  return {
    mapConfig,
    results,
    handlers: {
      handleOnCreated,
      handleOnSearch,
      resolveLensAutocomplete,
      handleUpdateSearchParams,
      handleQueryParams,
      loadMoreResults: moreResultsAvailable ? handleLoadMoreResults : undefined,
      clearActiveSearch: handleClearSearch
    },
    filters: {
      ...filters,
      handlers: {
        openFilters,
        storeFilterChanges,
        cancelFilterChanges,
        clearActiveFilters: handleClearActiveFilters
      }
    }
  };
}
