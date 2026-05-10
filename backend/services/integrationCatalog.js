const DEFAULT_MATCH_FIELDS = [
  'result',
  'kills',
  'deaths',
  'assists',
  'accuracy',
  'placement',
  'duration'
];

const INTEGRATION_CATALOG = [
  {
    gameSlug: 'valorant',
    name: 'Valorant',
    hasOfficialApi: true,
    provider: 'Riot Games',
    requiredFields: {
      api: ['apiKey', 'region', 'accountId'],
      capture: ['inGameUsername', 'region']
    },
    telemetryFields: DEFAULT_MATCH_FIELDS,
    captureStrategy: {
      method: 'observer-bot',
      notes: 'Use packet capture + local telemetry parser when API access is missing.'
    }
  },
  {
    gameSlug: 'bgmi',
    name: 'BGMI',
    hasOfficialApi: false,
    provider: 'Krafton',
    requiredFields: {
      api: [],
      capture: ['inGameUsername', 'region', 'platform']
    },
    telemetryFields: DEFAULT_MATCH_FIELDS,
    captureStrategy: {
      method: 'observer-bot',
      notes: 'Capture on-device telemetry + match recap screenshots for post-match parsing.'
    }
  },
  {
    gameSlug: 'codm',
    name: 'Call of Duty Mobile',
    hasOfficialApi: false,
    provider: 'Activision',
    requiredFields: {
      api: [],
      capture: ['inGameUsername', 'region', 'platform']
    },
    telemetryFields: DEFAULT_MATCH_FIELDS,
    captureStrategy: {
      method: 'observer-bot',
      notes: 'Use packet mirroring + replay parser to reconstruct match events.'
    }
  }
];

const getIntegrationCatalog = () => INTEGRATION_CATALOG;

const getIntegrationBySlug = (slug) =>
  INTEGRATION_CATALOG.find((entry) => entry.gameSlug === slug);

module.exports = {
  DEFAULT_MATCH_FIELDS,
  INTEGRATION_CATALOG,
  getIntegrationCatalog,
  getIntegrationBySlug
};
