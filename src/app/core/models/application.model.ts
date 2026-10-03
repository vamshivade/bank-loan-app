export interface LoanRequest {
  bankName: string;
  loanAmount: number;
  emi: number;
}

export interface AddApplicationRequest {
  applicantID: number;
  fullName: string;
  applicationStatus: string;
  panCard: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  annualIncome: number;
  employmentStatus: string;
  creditScore: number;
  assets: string;
  dateApplied: string;
  loans: LoanRequest[];
  customerId: number;
}

export interface AddApplicationResponse {
  message: string;
  result: boolean;
  data: AddApplicationRequest;
}
