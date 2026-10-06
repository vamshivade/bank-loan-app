export interface MyApplication {
  applicantID: number;
  dateApplied: string;
  applicationStatus: string;
  employmentStatus: string;
  assignedToBankEmployee: string;
  panCard: string;
}

export interface GetMyApplicationsResponse {
  message: string;
  result: boolean;
  data: MyApplication[];
}
