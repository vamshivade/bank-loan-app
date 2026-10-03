export const ROLE_CONSTANTS = {
  CUSTOMER: 'Customer',
  BANK_EMPLOYEE: 'BankEmployee',
} as const;

export const ROLE_ROUTES = {
  [ROLE_CONSTANTS.CUSTOMER]: '/pages/customer',
  [ROLE_CONSTANTS.BANK_EMPLOYEE]: '/pages/employee',
} as const;
