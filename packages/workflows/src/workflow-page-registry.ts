import type { WorkflowAuthorityPage } from "./workflow-page-contract.js";
import { WORKFLOW_AUTHORITY_SECTIONS } from "./workflow-page-contract.js";

const page = (workflowId: string, vertical: string, title: string, pipeline: string, slug: string, primaryIntent: string): WorkflowAuthorityPage => ({
  workflowId,
  vertical,
  pipeline,
  title,
  canonicalPath: `/${vertical}/${slug}`,
  primaryIntent,
  maturity: "placeholder",
  authoritySections: WORKFLOW_AUTHORITY_SECTIONS,
  officialSources: [],
  relatedWorkflows: [],
});

export const WORKFLOW_AUTHORITY_PAGES: readonly WorkflowAuthorityPage[] = [
  // Appeal Mail
  page("denied-claim", "appeal", "Appeal a Denied Claim", "P03_APPEAL", "denied-claim", "appeal denied claim"),
  page("government-decision", "appeal", "Appeal a Government Decision", "P03_APPEAL", "government-decision", "appeal a government decision"),
  page("court-ruling", "appeal", "Respond to a Court Ruling", "P04_COURT", "court-ruling", "respond to a court ruling"),
  page("reconsideration", "appeal", "Request Reconsideration", "P03_APPEAL", "reconsideration", "request reconsideration"),
  page("insurance-claim-denial", "appeal", "Appeal an Insurance Claim Denial", "P03_APPEAL", "insurance-claim-denial", "appeal insurance claim denial"),
  page("insurance-denial-letter", "appeal", "Respond to an Insurance Denial Letter", "P03_APPEAL", "insurance-denial-letter", "insurance denial letter response"),
  page("insurance-coverage-denial", "appeal", "Appeal an Insurance Coverage Denial", "P03_APPEAL", "insurance-coverage-denial", "appeal insurance coverage denial"),
  page("medical-insurance-denial", "appeal", "Appeal a Medical Insurance Denial", "P03_APPEAL", "medical-insurance-denial", "medical insurance denial appeal"),
  page("medical-necessity-appeal", "appeal", "Appeal a Medical Necessity Denial", "P03_APPEAL", "medical-necessity-appeal", "medical necessity appeal"),
  page("prior-authorization-denial", "appeal", "Appeal a Prior Authorization Denial", "P03_APPEAL", "prior-authorization-denial", "appeal prior authorization denial"),
  page("out-of-network-denial", "appeal", "Appeal an Out-of-Network Denial", "P03_APPEAL", "out-of-network-denial", "out-of-network denial appeal"),
  page("dental-insurance-appeal", "appeal", "Appeal a Dental Insurance Denial", "P03_APPEAL", "dental-insurance-appeal", "dental insurance appeal"),
  page("car-insurance-appeal", "appeal", "Appeal a Car Insurance Claim", "P03_APPEAL", "car-insurance-appeal", "car insurance appeal"),
  page("life-insurance-denial", "appeal", "Appeal a Life Insurance Denial", "P03_APPEAL", "life-insurance-denial", "life insurance denial appeal"),
  page("claim-denial-letter", "appeal", "Respond to a Claim Denial Letter", "P03_APPEAL", "claim-denial-letter", "claim denial letter response"),
  page("ssdi-denial", "appeal", "Appeal an SSDI Denial", "P03_APPEAL", "ssdi-denial", "SSDI denial appeal"),
  page("ssi-denial", "appeal", "Appeal an SSI Denial", "P03_APPEAL", "ssi-denial", "SSI denial appeal"),
  page("social-security-denial", "appeal", "Appeal a Social Security Denial", "P03_APPEAL", "social-security-denial", "Social Security denial appeal"),
  page("medicaid-denial", "appeal", "Appeal a Medicaid Denial", "P03_APPEAL", "medicaid-denial", "Medicaid denial appeal"),
  page("unemployment-denial", "appeal", "Appeal an Unemployment Denial", "P03_APPEAL", "unemployment-denial", "unemployment denial appeal"),
  page("edd-denial", "appeal", "Appeal an EDD Denial", "P03_APPEAL", "edd-denial", "EDD denial appeal"),
  page("financial-aid-appeal", "appeal", "Appeal a Financial Aid Decision", "P03_APPEAL", "financial-aid-appeal", "financial aid appeal"),
  page("sap-appeal", "appeal", "Build a SAP Appeal", "P03_APPEAL", "sap-appeal", "SAP appeal"),
  page("financial-aid-suspension-appeal", "appeal", "Appeal a Financial Aid Suspension", "P03_APPEAL", "financial-aid-suspension-appeal", "financial aid suspension appeal"),
  page("financial-aid-reinstatement", "appeal", "Request Financial Aid Reinstatement", "P03_APPEAL", "financial-aid-reinstatement", "financial aid reinstatement"),
  page("financial-aid-special-circumstances", "appeal", "Appeal for Financial Aid Special Circumstances", "P03_APPEAL", "financial-aid-special-circumstances", "financial aid special circumstances appeal"),
  page("scholarship-appeal", "appeal", "Appeal a Scholarship Decision", "P03_APPEAL", "scholarship-appeal", "scholarship appeal"),
  page("fafsa-appeal", "appeal", "Appeal a FAFSA / Financial Aid Decision", "P03_APPEAL", "fafsa-appeal", "FAFSA appeal"),
  page("license-suspension-appeal", "appeal", "Appeal a License Suspension", "P09_REGULATORY", "license-suspension-appeal", "license suspension appeal"),
  page("drivers-license-suspension", "appeal", "Appeal a Driver's License Suspension", "P09_REGULATORY", "drivers-license-suspension", "driver license suspension appeal"),
  page("license-revocation-appeal", "appeal", "Appeal a License Revocation", "P09_REGULATORY", "license-revocation-appeal", "license revocation appeal"),
  page("dmv-suspension-appeal", "appeal", "Appeal a DMV Suspension", "P09_REGULATORY", "dmv-suspension-appeal", "DMV suspension appeal"),
  page("registration-suspension-appeal", "appeal", "Appeal a Registration Suspension", "P09_REGULATORY", "registration-suspension-appeal", "registration suspension appeal"),

  // Notice Respond
  page("irs-notice", "notice", "Respond to an IRS Notice", "P02_OFFICIAL_RESPONSE", "irs-notice", "respond to an IRS notice"),
  page("cp2000-response", "notice", "Respond to a CP2000 Notice", "P02_OFFICIAL_RESPONSE", "cp2000-response", "CP2000 response"),
  page("court-summons", "notice", "Respond to a Court Summons", "P04_COURT", "court-summons", "respond to a court summons"),
  page("agency-action", "notice", "Respond to an Agency Action", "P02_OFFICIAL_RESPONSE", "agency-action", "respond to a government agency action"),
  page("file-appeal", "notice", "File an Appeal", "P03_APPEAL", "file-appeal", "file an appeal"),

  // Immigration Mail
  page("respond-to-notice", "immigration", "Respond to an Immigration Notice", "P05_IMMIGRATION", "respond-to-notice", "respond to an immigration notice"),
  page("supporting-documents", "immigration", "Submit Supporting Immigration Documents", "P05_IMMIGRATION", "supporting-documents", "submit immigration supporting documents"),
  page("explanation-letter", "immigration", "Prepare an Immigration Explanation Letter", "P05_IMMIGRATION", "explanation-letter", "immigration explanation letter"),

  // Dispute Mail
  page("debt-collection-dispute", "dispute", "Dispute a Debt Collection", "P06_DISPUTE", "debt-collection-dispute", "dispute a debt collection"),
  page("dispute-collection-agency", "dispute", "Dispute a Collection Agency", "P06_DISPUTE", "dispute-collection-agency", "dispute collection agency"),
  page("debt-dispute", "dispute", "Dispute a Debt Account", "P06_DISPUTE", "debt-dispute", "dispute a debt"),
  page("debt-validation", "dispute", "Request Debt Validation", "P06_DISPUTE", "debt-validation", "request debt validation"),
  page("credit-report", "dispute", "Dispute a Credit Report Error", "P06_DISPUTE", "credit-report", "dispute credit report error"),
  page("credit-report-collections", "dispute", "Dispute a Collection on a Credit Report", "P06_DISPUTE", "credit-report-collections", "dispute credit report collection"),
  page("hard-inquiry", "dispute", "Dispute a Hard Credit Inquiry", "P06_DISPUTE", "hard-inquiry", "dispute hard inquiry"),
  page("charge-off", "dispute", "Dispute Charge-Off Reporting", "P06_DISPUTE", "charge-off", "dispute charge off"),
  page("medical-collections", "dispute", "Dispute Medical Collections", "P06_DISPUTE", "medical-collections", "dispute medical collections"),
  page("student-loan", "dispute", "Dispute a Student Loan Account", "P06_DISPUTE", "student-loan", "dispute student loan account"),
  page("credit-card-billing", "dispute", "Dispute a Credit Card Billing Error", "P06_DISPUTE", "credit-card-billing", "credit card billing dispute"),
  page("unauthorized-charge", "dispute", "Dispute an Unauthorized Charge", "P06_DISPUTE", "unauthorized-charge", "dispute unauthorized charge"),
  page("billing-error", "dispute", "Dispute a Billing Error", "P06_DISPUTE", "billing-error", "dispute billing error"),
  page("subscription-billing", "dispute", "Dispute a Subscription Charge", "P06_DISPUTE", "subscription-billing", "dispute subscription charge"),
  page("service-contract", "dispute", "Dispute a Service Contract", "P06_DISPUTE", "service-contract", "dispute service contract"),
  page("insurance-billing", "dispute", "Dispute Insurance Billing or Payment", "P06_DISPUTE", "insurance-billing", "dispute insurance billing"),
  page("follow-up-no-response", "dispute", "Follow Up on a Dispute With No Response", "P06_DISPUTE", "follow-up-no-response", "follow up on dispute"),
  page("inadequate-response", "dispute", "Escalate an Unresolved Dispute", "P06_DISPUTE", "inadequate-response", "escalate unresolved dispute"),
  page("cease-contact", "dispute", "Document a Collection Communication Request", "P06_DISPUTE", "cease-contact", "collection communication request"),

  // Small Business Mail
  page("payment-reminder", "business", "Payment Reminder", "P07_BUSINESS", "payment-reminder", "business payment reminder"),
  page("payment-demand", "business", "Payment Demand", "P07_BUSINESS", "payment-demand", "business payment demand"),
  page("contract-renewal", "business", "Contract Renewal", "P07_BUSINESS", "contract-renewal", "contract renewal letter"),
  page("compliance-notice", "business", "Compliance Notice", "P07_BUSINESS", "compliance-notice", "business compliance notice"),
  page("customer-dispute-response", "business", "Customer Dispute Response", "P07_BUSINESS", "customer-dispute-response", "customer dispute response"),
];

export const workflowAuthorityPageIds = WORKFLOW_AUTHORITY_PAGES.map((page) => page.workflowId);
export function getWorkflowAuthorityPage(workflowId: string): WorkflowAuthorityPage | undefined {
  return WORKFLOW_AUTHORITY_PAGES.find((page) => page.workflowId === workflowId);
}
