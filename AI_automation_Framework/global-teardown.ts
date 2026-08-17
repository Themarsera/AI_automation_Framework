import { writeAllureReportMetadata } from './utils/allure/report-metadata';
import { closeDataProviderConnections } from './utils/data-providers/provider-factory';

async function globalTeardown() {
  await closeDataProviderConnections();
  writeAllureReportMetadata();
}

export default globalTeardown;
