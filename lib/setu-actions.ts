'server only';
const CLIENT_ID = process.env.SETU_CLIENT_ID;
const CLIENT_SECRET = process.env.SETU_CLIENT_SECRET;
const GRANT_TYPE = 'client_credentials';

const ACCOUNT_PRODUCT_ID = process.env.SETU_ACCOUNT_PRODUCT_ID;
const REDIRECT_URL = `${process.env.NEXT_PUBLIC_APP_URl}/settings`;
const SETU_URL = 'https://fiu-sandbox.setu.co/v2';

import axios from 'axios';
import { subYears } from 'date-fns';

const dataRange = {
  from: subYears(new Date(), 1).toISOString(),
  to: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString(),
};

export const createDataSession = async (consent_id: string) => {
  const body = {
    consentId: consent_id,
    DataRange: dataRange,
    format: 'json',
  };

  const requestConfig = {
    method: 'post',
    url: SETU_URL + '/sessions',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CLIENT_ID,
      'x-client-secret': CLIENT_SECRET,
    },
    data: body,
  };

  return await axios.request(requestConfig);
};

export const getFiDataBySessionId = async (sessionId: string) => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('CLIENT_ID or CLIENT_SECRET not found in .env file.');
  }

  const requestConfig = {
    method: 'get',
    url: SETU_URL + '/sessions/' + sessionId,
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CLIENT_ID,
      'x-client-secret': CLIENT_SECRET,
    },
  };

  return await axios.request(requestConfig);
};

export const getToken = async () => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('CLIENT_ID or CLIENT_SECRET not found in .env file.');
  }

  var options = {
    method: 'post',
    url: 'https://orgservice-prod.setu.co/v1/users/login',
    headers: { client: 'bridge' },
    data: {
      grant_type: GRANT_TYPE,
      secret: CLIENT_SECRET,
      clientID: CLIENT_ID,
    },
  };
  const res = await axios.request(options);
  return res;
};

export const createConsent = async (token: string, phone: string) => {
  if (!ACCOUNT_PRODUCT_ID || !REDIRECT_URL) {
    throw new Error('ACCOUNT_PRODUCT_ID or REDIRECT_URL not found in .env file.');
  }
  var options = {
    method: 'post',
    url: 'https://fiu-sandbox.setu.co/v2/consents',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-product-instance-id': ACCOUNT_PRODUCT_ID,
    },
    data: {
      consentDuration: {
        unit: 'YEAR',
        value: '2',
      },
      vua: `${phone}@onemoney`,
      dataRange: dataRange,
      consentTypes: ['PROFILE', 'SUMMARY', 'TRANSACTIONS'],
      context: [],
      fetchType: 'PERIODIC',
      frequency: { unit: 'HOUR', value: 100 },
      purpose: {
        code: '101',
        text: 'required for wealth management',
        category: { type: 'Loan underwriting' },
        refUri: 'https://api.rebit.org.in/aa/purpose/101.xml',
      },
      consentMode: 'STORE',
      dataLife: { unit: 'MONTH', value: 12 },
      redirectUrl: REDIRECT_URL,
    },
  };

  const res = await axios.request(options);
  if (res.data) return res;
};
