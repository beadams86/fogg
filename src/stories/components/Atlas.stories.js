import React from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';

import Atlas from '../../components/Atlas';
import ItemList from '../../components/ItemList';
import Panel from '../../components/Panel';

import Request from '../../models/request';

const stories = storiesOf('Components|Atlas', module);

const ALEXANDRIA = {
  lat: 38.8048,
  lng: -77.0469
};

stories.add('Default', () => {
  function handleResolveOnSearch ({ geoJson }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([
          {
            label: `#1 from ${JSON.stringify(geoJson)}`,
            to: '#'
          },
          {
            label: `#2 from ${JSON.stringify(geoJson)} 2`,
            to: '#'
          }
        ]);
      }, 1000);
    });
  }

  function testPatchTextQuery (args) {
    const { textInput } = args;
    console.log('testPatchTextQuery', textInput);
    return handleResolveOnSearch(args);
  }

  return (
    <>
      <Atlas
        defaultCenter={ALEXANDRIA}
        zoom={3}
        resolveOnSearch={testPatchTextQuery}
        SidebarComponents={SidebarPanels}
      />
    </>
  );
});

stories.add('Open Street Map', () => {
  const services = [
    {
      name: 'open_street_map',
      format: 'png',
      attribution: '&copy; OpenStreetMap contributors',
      tileEndpoint: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
    }
  ];
  return (
    <>
      <Atlas
        defaultCenter={ALEXANDRIA}
        zoom={3}
        services={services}
        map="open_street_map"
      />
    </>
  );
});

stories.add('Earth Search', () => {
  async function handleResolveOnSearch ({ geoJson = {}, textInput } = {}) {
    const { features = [] } = geoJson;
    const { geometry } = features[0] || {};
    let response;
    let responseFeatures;

    const request = new Request(
      'https://earth-search.aws.element84.com/stac/search'
    );

    if (!geometry) {
      return [];
    }

    request.setData({
      intersects: geometry
    });

    request.setOptions({
      headers: {
        Accept: 'application/geo+json',
        'Content-Type': 'application/json'
      }
    });

    try {
      response = await request.post();
    } catch (e) {
      throw new Error(`Failed to get search results: ${e}`);
    }

    responseFeatures = response && response.data && response.data.features;

    return Array.isArray(responseFeatures)
      ? responseFeatures.map((feature = {}) => {
        const { properties, id } = feature;
        const { collection } = properties;
        return {
          label: `${id}`,
          sublabels: [
            `Collection: ${collection}`,
            `GeoJSON: ${JSON.stringify(geoJson)}`
          ],
          to: '#'
        };
      })
      : [];
  }

  return (
    <>
      <Atlas
        defaultCenter={ALEXANDRIA}
        zoom={3}
        resolveOnSearch={handleResolveOnSearch}
        SidebarComponents={SidebarPanels}
      />
    </>
  );
});

const SidebarPanels = ({ results }) => {
  const hasResults = Array.isArray(results) && results.length > 0;

  return (
    <>
      {!hasResults && (
        <>
          <Panel header="Explore">
            <p>Explore stuff</p>
          </Panel>
          <Panel header="Past Searches">
            <ItemList
              items={[
                {
                  label: 'Alexandria, VA',
                  to: '#'
                },
                {
                  label: 'Montes Claros, MG',
                  to: '#'
                }
              ]}
            />
          </Panel>
        </>
      )}

      {hasResults && (
        <Panel header="Results">
          <ItemList items={results} />
        </Panel>
      )}
    </>
  );
};

SidebarPanels.propTypes = {
  results: PropTypes.array
};
