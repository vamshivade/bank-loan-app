import { environment } from '../../../environments/environment.development';

export const API_CONSTANTS = {
  BASE_URL: environment.apiUrl,

  USER_KEY: 'bankloan_user',
  USER_TOKEN: 'bankloan_token',

  AUTH: {
    LOGIN: '/api/BankLoan/login',
    REGISTER_CUSTOMER: '/api/BankLoan/RegisterCustomer',
    REGISTER_BANK_USER: '/api/BankLoan/RegisterAsBankUser',
  },

  APPLICATION: {
    ADD_APPLICATION: '/api/BankLoan/AddNewApplication',
    GET_MY_APPLICATIONS: '/api/BankLoan/GetMyApplications',
  },

  USER: {},
};
