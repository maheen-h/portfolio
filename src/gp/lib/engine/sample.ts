// Clearly labelled SAMPLE data. Figures are illustrative, not checked against live sources.
import type { Evidence, FxTable, Intake, RouteResearch } from "./types";

export const SAMPLE_NOTICE =
  "Sample analysis — figures are illustrative examples for demonstration and have not been checked against live sources. Do not rely on them for decisions.";

export const SAMPLE_FX: FxTable = {
  base: "INR",
  rates: { CAD: 0.0163, EUR: 0.0109, AUD: 0.0181, GBP: 0.0093, USD: 0.0118 },
  asOf: null,
  source: "Illustrative sample rates",
  sourceUrl: null,
};

const ev = (id: string, routeKey: string, topic: Evidence["topic"], claim: string, publisher: string, url: string, geography: string): Evidence => ({
  id, routeKey, topic, claim, statistic: null, unit: null, population: null, geography, publisher, title: publisher, url,
  publishedDate: null, referenceYear: null, sourceType: "sample", checkedAt: null,
});

export const SAMPLE_EVIDENCE: Evidence[] = [
  ev("s-de-1", "de-bluecard", "immigration", "EU Blue Card rules for skilled workers, family reunification and spouse work rights (illustrative summary).", "Make it in Germany (Federal Government portal)", "https://www.make-it-in-germany.com/en/", "Germany"),
  ev("s-de-2", "de-bluecard", "licensing", "Recognition of foreign degrees via the ZAB statement of comparability (illustrative).", "Central Office for Foreign Education (ZAB)", "https://www.kmk.org/zab/central-office-for-foreign-education.html", "Germany"),
  ev("s-ca-1", "ca-express", "immigration", "Express Entry, proof-of-funds table and accompanying family rules (illustrative).", "Immigration, Refugees and Citizenship Canada", "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html", "Canada"),
  ev("s-ca-2", "ca-express", "licensing", "Engineering licensure in Canada usually requires Canadian experience before P.Eng (illustrative).", "Engineers Canada", "https://engineerscanada.ca/", "Canada"),
  ev("s-uk-1", "uk-msc", "dependents", "Most taught master's students can no longer bring dependants on the Student route (illustrative).", "UK Visas and Immigration", "https://www.gov.uk/student-visa", "United Kingdom"),
  ev("s-au-1", "au-later", "licensing", "Engineers Australia migration skills assessment (illustrative).", "Engineers Australia", "https://www.engineersaustralia.org.au/", "Australia"),
  ev("s-au-2", "au-later", "immigration", "Skilled Independent visa and family members (illustrative).", "Department of Home Affairs", "https://immi.homeaffairs.gov.au/", "Australia"),
  ev("s-de-3", "de-msc", "education", "Study in Germany: blocked account and tuition at public universities (illustrative).", "DAAD", "https://www.daad.de/en/", "Germany"),
  ev("s-us-1", "us-h1b", "immigration", "H-1B selection process and H-4 dependant work authorisation limits (illustrative).", "U.S. Citizenship and Immigration Services", "https://www.uscis.gov/", "United States"),
];

let n = 0;
const id = () => `c${++n}`;

export const SAMPLE_ROUTES: RouteResearch[] = [
  {
    key: "de-bluecard", title: "Get your degree recognised, then apply for civil engineering jobs in Germany on an EU Blue Card",
    destination: "Germany", city: "Munich / Frankfurt region", pathway: "direct_employment", occupationOrProgram: "Civil engineer (Bauingenieur)", timing: "now",
    where: "Germany — larger metro regions with infrastructure hiring", when: "Start recognition now; move after a job offer (6–12 months)", how: "ZAB recognition → job offer → EU Blue Card; family can join",
    costItems: [
      { id: id(), label: "ZAB statement of comparability", category: "credential", amount: 200, currency: "EUR", perPerson: false, milestone: "preparation", refundable: false, kind: "estimate", evidenceIds: ["s-de-2"] },
      { id: id(), label: "German A2 course (helpful for interviews)", category: "test", amount: 600, currency: "EUR", perPerson: false, milestone: "preparation", refundable: false, kind: "estimate", evidenceIds: [] },
      { id: id(), label: "National visa fee", category: "fee", amount: 75, currency: "EUR", perPerson: true, milestone: "application", refundable: false, kind: "estimate", evidenceIds: ["s-de-1"] },
      { id: id(), label: "Flights", category: "travel", amount: 550, currency: "EUR", perPerson: true, milestone: "pre_departure", refundable: false, kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Rental deposit (3 months' rent)", category: "deposit", amount: 3300, currency: "EUR", perPerson: false, milestone: "arrival", refundable: true, kind: "estimate", evidenceIds: [] },
    ],
    proofOfFunds: null,
    monthlyLiving: { singleAdult: 1400, perAdditionalAdult: 550, perChild: 400, currency: "EUR", geography: "German metro area", kind: "estimate", evidenceIds: [] },
    timeline: [
      { id: id(), label: "Degree recognition (ZAB)", minMonths: 2, maxMonths: 4, parallel: true, factor: "processing", kind: "estimate", evidenceIds: ["s-de-2"] },
      { id: id(), label: "Job search to signed offer", minMonths: 4, maxMonths: 9, parallel: true, factor: "other", kind: "assumption", evidenceIds: [] },
      { id: id(), label: "Visa appointment and processing", minMonths: 1, maxMonths: 3, parallel: false, factor: "processing", kind: "estimate", evidenceIds: ["s-de-1"] },
    ],
    wage: { low: 48000, high: 60000, currency: "EUR", population: "Civil engineers, early career, gross annual", geography: "Germany (national)", referenceYear: "sample", kind: "estimate", evidenceIds: [] },
    spouseMonthlyIncomeEstimate: 1800,
    family: { dependentsAllowed: "yes", spouseCanWork: "yes", spouseWorkNote: "Spouses of Blue Card holders may work (illustrative).", schoolingNote: "Public schooling is free; German-language schools by default.", evidenceIds: ["s-de-1"] },
    longTerm: { prPathway: "yes", note: "Settlement permit possible after a qualifying period on the Blue Card (illustrative).", evidenceIds: ["s-de-1"] },
    eligibility: { status: "likely", note: "Depends on degree recognition and a qualifying job offer.", futureAction: null, futureActionMonths: null, evidenceIds: ["s-de-1"] },
    assessment: { careerFit: 7.5, careerFitReason: "Your civil engineering degree and experience map directly to Bauingenieur roles; German language is the main hiring barrier.", longTerm: 8, longTermReason: "Clear route to settlement and strong infrastructure demand." },
    tradeoff: "You give up English-language working life: many site and client roles expect German within 1–2 years.",
    postArrival: "Likely entry at junior/mid engineer level; progression faster once German reaches B2.",
    verifyBeforePaying: ["Confirm your exact degree shows as comparable in anabin/ZAB before paying for courses", "Confirm the Blue Card salary threshold for engineers in the current year", "Confirm the employer's offer meets Blue Card conditions"],
    unresolvedQuestions: ["How long will your job search take without German?"],
    assumptions: ["Job offer within 9 months", "Spouse finds work at a modest wage within 3 months"],
  },
  {
    key: "ca-express", title: "Get an education assessment and IELTS score, then apply for permanent residence in Canada as a civil engineer",
    destination: "Canada", city: "Ontario / Alberta", pathway: "direct_employment", occupationOrProgram: "Civil engineer (EIT on arrival)", timing: "now",
    where: "Canada — Ontario or Alberta", when: "Profile in 3–4 months; arrival after invitation and processing (10–20 months)", how: "IELTS + ECA → Express Entry profile → invitation → permanent residence",
    costItems: [
      { id: id(), label: "Educational credential assessment", category: "credential", amount: 300, currency: "CAD", perPerson: false, milestone: "preparation", refundable: false, kind: "estimate", evidenceIds: ["s-ca-1"] },
      { id: id(), label: "IELTS General test", category: "test", amount: 320, currency: "CAD", perPerson: false, milestone: "preparation", refundable: false, kind: "estimate", evidenceIds: [] },
      { id: id(), label: "PR processing and right-of-PR fees", category: "fee", amount: 1500, currency: "CAD", perPerson: true, milestone: "application", refundable: false, kind: "estimate", evidenceIds: ["s-ca-1"] },
      { id: id(), label: "Medicals and police certificates", category: "fee", amount: 250, currency: "CAD", perPerson: true, milestone: "application", refundable: false, kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Flights", category: "travel", amount: 1100, currency: "CAD", perPerson: true, milestone: "pre_departure", refundable: false, kind: "estimate", evidenceIds: [] },
    ],
    proofOfFunds: { amount: 15000, perAdditionalMember: 4000, currency: "CAD", overlapsSettlement: true, note: "Settlement funds must be shown but are yours to spend after arrival (illustrative).", kind: "estimate", evidenceIds: ["s-ca-1"] },
    monthlyLiving: { singleAdult: 2300, perAdditionalAdult: 900, perChild: 700, currency: "CAD", geography: "Toronto / Calgary", kind: "estimate", evidenceIds: [] },
    timeline: [
      { id: id(), label: "IELTS preparation and test", minMonths: 1, maxMonths: 3, parallel: true, factor: "other", kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Credential assessment", minMonths: 2, maxMonths: 4, parallel: true, factor: "processing", kind: "estimate", evidenceIds: ["s-ca-1"] },
      { id: id(), label: "Wait for invitation to apply", minMonths: 1, maxMonths: 8, parallel: false, factor: "application_window", kind: "assumption", evidenceIds: ["s-ca-1"] },
      { id: id(), label: "PR application processing", minMonths: 6, maxMonths: 8, parallel: false, factor: "processing", kind: "estimate", evidenceIds: ["s-ca-1"] },
    ],
    wage: { low: 62000, high: 80000, currency: "CAD", population: "Engineers-in-training / junior civil engineers, gross annual", geography: "Ontario", referenceYear: "sample", kind: "estimate", evidenceIds: [] },
    spouseMonthlyIncomeEstimate: 2600,
    family: { dependentsAllowed: "yes", spouseCanWork: "yes", spouseWorkNote: "Accompanying spouse also becomes a permanent resident and can work.", schoolingNote: "Public schooling free for PR children.", evidenceIds: ["s-ca-1"] },
    longTerm: { prPathway: "yes", note: "You arrive as a permanent resident.", evidenceIds: ["s-ca-1"] },
    eligibility: { status: "unresolved", note: "Invitation depends on your points score versus draw cut-offs, which change each round.", futureAction: null, futureActionMonths: null, evidenceIds: ["s-ca-1"] },
    assessment: { careerFit: 7, careerFitReason: "Strong match to civil roles, but you will work as an engineer-in-training until P.Eng licensure (Canadian experience usually required).", longTerm: 9, longTermReason: "Permanent residence from day one; long-term licensure path is clear." },
    tradeoff: "Not guaranteed: an invitation depends on draw cut-offs. You may start below your current seniority until licensed.",
    postArrival: "Entry as EIT or technologist; P.Eng after Canadian experience requirement.",
    verifyBeforePaying: ["Estimate your points score with the official tool before paying for an ECA", "Check recent draw cut-offs for your profile type", "Confirm proof-of-funds for your family size"],
    unresolvedQuestions: ["Will your score meet recent cut-offs?"],
    assumptions: ["Invitation within 8 months of creating a profile"],
  },
  {
    key: "uk-msc", title: "Study a one-year MSc in Civil Engineering in the UK, then switch to the Graduate visa",
    destination: "United Kingdom", city: "Birmingham / Manchester", pathway: "study", occupationOrProgram: "MSc Civil / Structural Engineering", timing: "now",
    where: "UK university outside London", when: "September intake (9–12 months away)", how: "Offer → CAS → Student visa → Graduate visa (2 years) → skilled job",
    costItems: [
      { id: id(), label: "Tuition (international, 1 year)", category: "tuition", amount: 24000, currency: "GBP", perPerson: false, milestone: "pre_departure", refundable: false, kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Tuition deposit to secure place", category: "deposit", amount: 4000, currency: "GBP", perPerson: false, milestone: "application", refundable: false, kind: "estimate", evidenceIds: [] },
      { id: id(), label: "IELTS Academic", category: "test", amount: 210, currency: "GBP", perPerson: false, milestone: "preparation", refundable: false, kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Visa fee + Immigration Health Surcharge", category: "fee", amount: 1300, currency: "GBP", perPerson: true, milestone: "application", refundable: false, kind: "estimate", evidenceIds: ["s-uk-1"] },
      { id: id(), label: "Flights", category: "travel", amount: 600, currency: "GBP", perPerson: true, milestone: "pre_departure", refundable: false, kind: "estimate", evidenceIds: [] },
    ],
    proofOfFunds: { amount: 9500, perAdditionalMember: 6000, currency: "GBP", overlapsSettlement: true, note: "Living-cost funds held for 28 days (illustrative).", kind: "estimate", evidenceIds: ["s-uk-1"] },
    monthlyLiving: { singleAdult: 1200, perAdditionalAdult: 500, perChild: 450, currency: "GBP", geography: "UK regional city", kind: "estimate", evidenceIds: [] },
    timeline: [
      { id: id(), label: "Applications and offer", minMonths: 2, maxMonths: 5, parallel: true, factor: "application_window", kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Wait for September intake", minMonths: 3, maxMonths: 9, parallel: true, factor: "application_window", kind: "estimate", evidenceIds: [] },
      { id: id(), label: "MSc study", minMonths: 12, maxMonths: 12, parallel: false, factor: "education", kind: "estimate", evidenceIds: [] },
    ],
    wage: { low: 30000, high: 38000, currency: "GBP", population: "Graduate civil engineers, gross annual", geography: "UK (national)", referenceYear: "sample", kind: "estimate", evidenceIds: [] },
    spouseMonthlyIncomeEstimate: null,
    family: { dependentsAllowed: "no", spouseCanWork: "no", spouseWorkNote: "Dependants generally not allowed for taught master's.", schoolingNote: "", evidenceIds: ["s-uk-1"] },
    longTerm: { prPathway: "conditional", note: "Needs a sponsored skilled job after the Graduate visa.", evidenceIds: ["s-uk-1"] },
    eligibility: { status: "likely", note: "Admission depends on grades and English score.", futureAction: null, futureActionMonths: null, evidenceIds: [] },
    assessment: { careerFit: 6.5, careerFitReason: "A UK MSc adds a recognised qualification, but you already hold a relevant degree — the main value is the post-study work visa.", longTerm: 6, longTermReason: "Settlement depends on finding a sponsoring employer within two years." },
    tradeoff: "Highest upfront cost and a year without earnings; only worth it if you value the UK specifically.",
    postArrival: "Graduate engineer roles; sponsorship not guaranteed.",
    verifyBeforePaying: ["Confirm the exact programme is accredited by the relevant UK engineering institution", "Confirm dependant rules for this course before paying a deposit"],
    unresolvedQuestions: ["Would a sponsor hire you within the Graduate visa period?"],
    assumptions: ["Graduate role found within 6 months of graduating"],
  },
  {
    key: "au-later", title: "Gain two more years of civil engineering experience in India, then apply to Australia as a skilled independent migrant",
    destination: "Australia", city: "Melbourne / Brisbane", pathway: "local_experience_then_move", occupationOrProgram: "Civil engineer", timing: "later",
    where: "Australia — Melbourne or Brisbane", when: "Apply in ~2 years; arrive in 2.5–3 years", how: "Build experience → Engineers Australia assessment → points-tested visa",
    costItems: [
      { id: id(), label: "Engineers Australia skills assessment", category: "credential", amount: 1100, currency: "AUD", perPerson: false, milestone: "preparation", refundable: false, kind: "estimate", evidenceIds: ["s-au-1"] },
      { id: id(), label: "English test (PTE/IELTS)", category: "test", amount: 450, currency: "AUD", perPerson: false, milestone: "preparation", refundable: false, kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Visa application charge", category: "fee", amount: 3000, currency: "AUD", perPerson: true, milestone: "application", refundable: false, kind: "estimate", evidenceIds: ["s-au-2"] },
      { id: id(), label: "Flights", category: "travel", amount: 1200, currency: "AUD", perPerson: true, milestone: "pre_departure", refundable: false, kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Rental bond", category: "deposit", amount: 3200, currency: "AUD", perPerson: false, milestone: "arrival", refundable: true, kind: "estimate", evidenceIds: [] },
    ],
    proofOfFunds: null,
    monthlyLiving: { singleAdult: 2600, perAdditionalAdult: 1000, perChild: 800, currency: "AUD", geography: "Melbourne", kind: "estimate", evidenceIds: [] },
    timeline: [
      { id: id(), label: "Two more years of relevant experience", minMonths: 24, maxMonths: 24, parallel: true, factor: "experience", kind: "assumption", evidenceIds: [] },
      { id: id(), label: "Skills assessment", minMonths: 2, maxMonths: 4, parallel: false, factor: "processing", kind: "estimate", evidenceIds: ["s-au-1"] },
      { id: id(), label: "Invitation and visa processing", minMonths: 6, maxMonths: 12, parallel: false, factor: "processing", kind: "estimate", evidenceIds: ["s-au-2"] },
    ],
    wage: { low: 80000, high: 100000, currency: "AUD", population: "Civil engineers, early-mid career, gross annual", geography: "Australia (national)", referenceYear: "sample", kind: "estimate", evidenceIds: [] },
    spouseMonthlyIncomeEstimate: 3200,
    family: { dependentsAllowed: "yes", spouseCanWork: "yes", spouseWorkNote: "Family members included in the visa can work.", schoolingNote: "Public schooling for permanent residents.", evidenceIds: ["s-au-2"] },
    longTerm: { prPathway: "yes", note: "Permanent visa on grant.", evidenceIds: ["s-au-2"] },
    eligibility: { status: "not_yet", note: "More experience raises your points to a competitive level.", futureAction: "Gain two more years of civil engineering experience to raise your points score", futureActionMonths: 24, evidenceIds: ["s-au-2"] },
    assessment: { careerFit: 7.5, careerFitReason: "Direct match to your occupation, with higher pay after arrival — but only after you build more experience.", longTerm: 9, longTermReason: "Permanent residence on grant; strong infrastructure pipeline." },
    tradeoff: "You wait 2+ years before moving, but you keep earning and saving in the meantime.",
    postArrival: "Mid-level engineer roles; chartership possible with local experience.",
    verifyBeforePaying: ["Confirm your occupation is on the current skilled list", "Check recent invitation points for civil engineers"],
    unresolvedQuestions: ["Will invitation points for civil engineers stay at a level you can reach?"],
    assumptions: ["Occupation stays eligible over the next two years"],
  },
  {
    key: "de-msc", title: "Study a two-year Master's in Civil Engineering at a German public university, then stay to work",
    destination: "Germany", city: "Aachen / Stuttgart", pathway: "study", occupationOrProgram: "M.Sc. Civil Engineering (English-taught)", timing: "now",
    where: "German technical university", when: "Winter intake (10–14 months away)", how: "Admission → blocked account → student visa → 18-month job-seeker permit",
    costItems: [
      { id: id(), label: "Semester contributions (4 semesters)", category: "tuition", amount: 1400, currency: "EUR", perPerson: false, milestone: "pre_departure", refundable: false, kind: "estimate", evidenceIds: ["s-de-3"] },
      { id: id(), label: "IELTS Academic", category: "test", amount: 220, currency: "EUR", perPerson: false, milestone: "preparation", refundable: false, kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Application handling (uni-assist)", category: "fee", amount: 150, currency: "EUR", perPerson: false, milestone: "application", refundable: false, kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Visa fee", category: "fee", amount: 75, currency: "EUR", perPerson: true, milestone: "application", refundable: false, kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Flights", category: "travel", amount: 550, currency: "EUR", perPerson: true, milestone: "pre_departure", refundable: false, kind: "estimate", evidenceIds: [] },
    ],
    proofOfFunds: { amount: 11900, perAdditionalMember: 6000, currency: "EUR", overlapsSettlement: true, note: "Blocked account released monthly for living costs (illustrative).", kind: "estimate", evidenceIds: ["s-de-3"] },
    monthlyLiving: { singleAdult: 1100, perAdditionalAdult: 500, perChild: 380, currency: "EUR", geography: "German university town", kind: "estimate", evidenceIds: [] },
    timeline: [
      { id: id(), label: "Applications and admission", minMonths: 4, maxMonths: 8, parallel: true, factor: "application_window", kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Visa processing", minMonths: 1, maxMonths: 3, parallel: false, factor: "processing", kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Master's study", minMonths: 24, maxMonths: 24, parallel: false, factor: "education", kind: "estimate", evidenceIds: [] },
    ],
    wage: { low: 48000, high: 60000, currency: "EUR", population: "Civil engineers, early career, gross annual", geography: "Germany (national)", referenceYear: "sample", kind: "estimate", evidenceIds: [] },
    spouseMonthlyIncomeEstimate: 1600,
    family: { dependentsAllowed: "conditional", spouseCanWork: "yes", spouseWorkNote: "Family can join if extra funds and housing are shown.", schoolingNote: "Public schooling free.", evidenceIds: ["s-de-3"] },
    longTerm: { prPathway: "yes", note: "Graduates can seek work and later settle.", evidenceIds: ["s-de-3"] },
    eligibility: { status: "likely", note: "Admission depends on grades and course fit.", futureAction: null, futureActionMonths: null, evidenceIds: ["s-de-3"] },
    assessment: { careerFit: 6, careerFitReason: "You already hold an engineering degree, so a second degree mainly adds local recognition and German networks.", longTerm: 8, longTermReason: "Good local hiring after graduation." },
    tradeoff: "Two years without a full salary; you restart as a graduate.",
    postArrival: "Working student jobs during study; graduate engineer roles after.",
    verifyBeforePaying: ["Confirm the programme admits your exact bachelor's degree", "Confirm family reunification funds for students"],
    unresolvedQuestions: [],
    assumptions: ["Admission at first attempt"],
  },
  {
    key: "us-h1b", title: "Seek a US employer to sponsor you for an H-1B civil engineering role",
    destination: "United States", city: "Texas / California", pathway: "direct_employment", occupationOrProgram: "Civil engineer", timing: "now",
    where: "United States", when: "Selection once a year; start date the following October", how: "Employer offer → annual H-1B selection → petition → visa",
    costItems: [
      { id: id(), label: "Visa application (MRV) fee", category: "fee", amount: 205, currency: "USD", perPerson: true, milestone: "application", refundable: false, kind: "estimate", evidenceIds: ["s-us-1"] },
      { id: id(), label: "Credential evaluation", category: "credential", amount: 250, currency: "USD", perPerson: false, milestone: "preparation", refundable: false, kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Flights", category: "travel", amount: 1000, currency: "USD", perPerson: true, milestone: "pre_departure", refundable: false, kind: "estimate", evidenceIds: [] },
      { id: id(), label: "Rental deposit", category: "deposit", amount: 3000, currency: "USD", perPerson: false, milestone: "arrival", refundable: true, kind: "estimate", evidenceIds: [] },
    ],
    proofOfFunds: null,
    monthlyLiving: { singleAdult: 2800, perAdditionalAdult: 900, perChild: 900, currency: "USD", geography: "Houston", kind: "estimate", evidenceIds: [] },
    timeline: [
      { id: id(), label: "Find a sponsoring employer", minMonths: 3, maxMonths: 12, parallel: true, factor: "other", kind: "assumption", evidenceIds: [] },
      { id: id(), label: "Annual selection to start date", minMonths: 7, maxMonths: 12, parallel: false, factor: "application_window", kind: "estimate", evidenceIds: ["s-us-1"] },
    ],
    wage: { low: 70000, high: 90000, currency: "USD", population: "Civil engineers, entry level, gross annual", geography: "Texas", referenceYear: "sample", kind: "estimate", evidenceIds: [] },
    spouseMonthlyIncomeEstimate: null,
    family: { dependentsAllowed: "yes", spouseCanWork: "conditional", spouseWorkNote: "H-4 spouses can work only in limited circumstances.", schoolingNote: "Public schooling available.", evidenceIds: ["s-us-1"] },
    longTerm: { prPathway: "conditional", note: "Green card requires employer sponsorship; long backlogs for Indian nationals.", evidenceIds: ["s-us-1"] },
    eligibility: { status: "unresolved", note: "Depends on random annual selection; approval odds cannot be predicted.", futureAction: null, futureActionMonths: null, evidenceIds: ["s-us-1"] },
    assessment: { careerFit: 6.5, careerFitReason: "High pay, but few civil engineering employers sponsor compared with tech.", longTerm: 5, longTermReason: "Long green card backlog for your nationality." },
    tradeoff: "You may wait a year or more and still not be selected.",
    postArrival: "Engineer roles tied to the sponsoring employer.",
    verifyBeforePaying: ["Confirm the employer will file and pay for the petition", "Confirm spouse work options for your case"],
    unresolvedQuestions: ["Will a civil engineering employer sponsor you?"],
    assumptions: ["Employer pays petition fees"],
  },
];

const base: Intake = {
  starting: { citizenship: "India", residence: "India", age: 29, movingWindow: "6_12" },
  education: { highestLevel: "Bachelor's", field: "Civil Engineering", institution: "University of Mumbai", awardCountry: "India", graduationYear: "2019", grades: "First class", licenses: "" },
  career: { currentRole: "Site engineer", yearsExperience: 5, responsibilities: "Site supervision, quantity estimation, contractor coordination", skills: "AutoCAD, STAAD Pro, project scheduling", targetOccupation: "Civil engineer", willingToRetrain: "unsure", currentMonthlyIncome: 90000 },
  language: { entries: [{ language: "English", proficiency: "advanced", test: "", score: "", testDate: "" }] },
  finances: { currency: "INR", savings: 4000000, householdIncomeMonthly: 90000, monthlySavings: 60000, maxBorrowing: 0, fundingNeeds: "" },
  family: { movingWith: "alone", mustMoveTogether: false, spouseOccupation: "", spouseNeedsWorkImmediately: "no", childrenAges: "" },
  destination: { preferred: [], excluded: [], openToSuggestions: true, routeTypes: [], routeTypesOpen: true, locationPrefs: "", supportNetwork: "" },
  goals: { desiredCareer: "Senior civil / structural engineer", incomeGoal: "", wantsPermanentResidence: "yes", acceptableYearsBeforeProgress: 2 },
  priorities: { mustHaves: [], ranked: ["career_fit", "speed", "long_term"] },
};

/** Acceptance-test persona A: alone, can move now, substantial savings. */
export const SAMPLE_PROFILE_SOLO: Intake = base;

/** Acceptance-test persona B: spouse + child, limited savings, spouse must work. */
export const SAMPLE_PROFILE_FAMILY: Intake = {
  ...base,
  finances: { ...base.finances, savings: 800000, monthlySavings: 25000, householdIncomeMonthly: 110000, maxBorrowing: 500000 },
  family: { movingWith: "partner_children", mustMoveTogether: true, spouseOccupation: "Accountant", spouseNeedsWorkImmediately: "yes", childrenAges: "4" },
  priorities: { mustHaves: ["move_together", "spouse_work"], ranked: ["affordability", "family_fit", "career_fit"] },
};
