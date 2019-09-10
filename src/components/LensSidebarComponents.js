import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { LensContext, LayersContext } from '../context';

import { latLngPositionFromCenter } from '../lib/leaflet';

const LensSidebarComponents = ({ SidebarComponents, ...rest }) => {
  const { lens = {}, filters = {} } = useContext(LensContext) || {};
  const { layers = {}, getDataForLayers, toggleLayer } =
    useContext(LayersContext) || {};

  const {
    handlers: lensHandlers = {},
    results,
    mapConfig = {},
    numberOfResults
  } = lens;
  const {
    loadMoreResults,
    clearActiveSearch,
    handleUpdateSearchParams
  } = lensHandlers;
  const { center = {}, geoJson } = mapConfig;

  if (!SidebarComponents) return null;

  return (
    <SidebarComponents
      mapPosition={latLngPositionFromCenter(center)}
      geoJson={geoJson}
      results={results}
      loadMoreResults={loadMoreResults}
      clearActiveSearch={clearActiveSearch}
      handleUpdateSearchParams={handleUpdateSearchParams}
      filters={filters}
      layers={layers}
      toggleLayer={toggleLayer}
      getDataForLayers={getDataForLayers}
      numberOfResults={numberOfResults}
      {...rest}
    />
  );
};

LensSidebarComponents.propTypes = {
  SidebarComponents: PropTypes.any
};

export default LensSidebarComponents;
