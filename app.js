const ROLES = [
  {
    id: "preparer",
    name: "Alex Rivera",
    label: "Preparer",
    audience: "staff",
    context: "Firm work",
    description: "Owns preparation, source review, client requests, and field corrections.",
  },
  {
    id: "reviewer",
    name: "Dana Patel",
    label: "Reviewer",
    audience: "staff",
    context: "Review queue",
    description: "Approves prepared values and sees reviewer-level risk evidence.",
  },
  {
    id: "admin",
    name: "Morgan Lee",
    label: "Firm admin",
    audience: "staff",
    context: "Team oversight",
    description: "Sees workload and permissions, but does not edit return values.",
  },
  {
    id: "client",
    name: "Maya Chen",
    label: "Business owner",
    audience: "client",
    context: "Client portal",
    description: "Sees requests, documents, and plain-language return status.",
  },
  {
    id: "multi",
    name: "Alex Rivera",
    label: "Firm employee + personal return",
    audience: "mixed",
    context: "Context switch",
    description: "Demonstrates a user with firm permissions and a personal 1040.",
  },
];

const TICK = {
  human_verified: { symbol: "✓", label: "Traced to source", tone: "verified" },
  ai_calculated: { symbol: "⊞", label: "Footed by system", tone: "calculated" },
  ai_extracted: { symbol: "✓", label: "AI extracted", tone: "verified" },
  awaiting_client: { symbol: "?", label: "Awaiting client", tone: "awaiting" },
  needs_approval: { symbol: "~", label: "Needs review", tone: "estimated" },
  human_overridden: { symbol: "△", label: "Human override", tone: "override" },
  locked: { symbol: "⊘", label: "Locked after filing", tone: "locked" },
  conflicted: { symbol: "!", label: "Conflicting sources", tone: "override" },
  missing_source: { symbol: "?", label: "Missing source", tone: "awaiting" },
  stale_source: { symbol: "~", label: "Source changed", tone: "estimated" },
  ai_declined: { symbol: "?", label: "AI declined", tone: "awaiting" },
};

const STATUS_STEPS = [
  {
    key: "collecting",
    staff: "Collecting source documents",
    client: "We are collecting your documents",
    owner: "Client",
  },
  {
    key: "prep",
    staff: "Preparation in progress",
    client: "We are preparing your return",
    owner: "Preparer",
  },
  {
    key: "client_wait",
    staff: "Waiting on client clarification",
    client: "We need one answer from you",
    owner: "Client",
  },
  {
    key: "review",
    staff: "Reviewer approval",
    client: "Your return is being reviewed",
    owner: "Reviewer",
  },
  {
    key: "ready",
    staff: "Ready to file",
    client: "Ready for your signature",
    owner: "Client",
  },
  {
    key: "filed",
    staff: "Filed and locked",
    client: "Filed",
    owner: "Firm",
  },
];

const clients = [
  {
    id: "client-verdant",
    name: "Verdant Fields Cultivation, LLC",
    entityType: "Cannabis cultivator",
    industry: "Cannabis",
    form: "1120S",
    taxYear: "2025",
  },
  {
    id: "client-priya",
    name: "Priya Raghavan",
    entityType: "High-net-worth individual",
    industry: "Individual",
    form: "1040",
    taxYear: "2025",
  },
  {
    id: "client-ravensworth",
    name: "Ravensworth Unified School District",
    entityType: "Governmental / nonprofit",
    industry: "Education",
    form: "990 support package",
    taxYear: "2025",
  },
];

const returns = [
  {
    id: "ret-verdant",
    clientId: "client-verdant",
    form: "1120S",
    status: "Waiting on Client",
    stage: "client_wait",
    owner: "Maya Chen",
    ownerRole: "Client",
    dueDate: "2026-08-09",
    blocker: "Security wage allocation needs client confirmation",
    nextAction: "Resolve security wage allocation",
    taxImpact: 52080,
    aiFlags: 3,
    unreadThreads: 2,
    staffOnlyDetail: "Reviewer is waiting on one open §280E workpaper item.",
  },
  {
    id: "ret-priya",
    clientId: "client-priya",
    form: "1040",
    status: "Source Conflict",
    stage: "prep",
    owner: "Alex Rivera",
    ownerRole: "Preparer",
    dueDate: "2026-08-12",
    blocker: "Original W-2 conflicts with amended W-2",
    nextAction: "Resolve amended W-2 conflict",
    taxImpact: 1840,
    aiFlags: 1,
    unreadThreads: 0,
    staffOnlyDetail: "Amended W-2 supersedes prior extraction; dependent lines need re-check.",
  },
  {
    id: "ret-ravensworth",
    clientId: "client-ravensworth",
    form: "Audit support",
    status: "Ready for Review",
    stage: "review",
    owner: "Dana Patel",
    ownerRole: "Reviewer",
    dueDate: "2026-08-18",
    blocker: "",
    nextAction: "Reviewer approval",
    taxImpact: 0,
    aiFlags: 0,
    unreadThreads: 1,
    staffOnlyDetail: "All district grant schedules tied out; reviewer signoff remains.",
  },
  {
    id: "ret-alex-personal",
    clientId: "client-alex",
    form: "1040",
    status: "Collecting Info",
    stage: "collecting",
    owner: "Alex Rivera",
    ownerRole: "Client",
    dueDate: "2026-08-28",
    blocker: "K-1 not uploaded",
    nextAction: "Upload missing K-1",
    taxImpact: 0,
    aiFlags: 0,
    unreadThreads: 1,
    staffOnlyDetail: "Personal context hides firm-only controls and client records.",
  },
];

const baseDocuments = [
  {
    id: "doc-security-invoice",
    clientId: "client-verdant",
    type: "Invoice",
    state: "low_confidence",
    title: "SecureSite Staffing Invoice #SS-4519",
    filename: "SecureSite_Staffing_June_2025.pdf",
    uploadedBy: "Maya Chen",
    uploadedAt: "2026-08-04",
    pages: 3,
    linkedFieldIds: ["field-security"],
    note: "Source region highlights mixed facility and front-of-house security services.",
  },
  {
    id: "doc-cultivation-supplies",
    clientId: "client-verdant",
    type: "Invoice",
    state: "verified",
    title: "North Coast Cultivation Supplies",
    filename: "NorthCoast_Cultivation_Q2.pdf",
    uploadedBy: "Maya Chen",
    uploadedAt: "2026-07-29",
    pages: 12,
    linkedFieldIds: ["field-supplies"],
    note: "Matched to GL account 5020; source total ties out.",
  },
  {
    id: "doc-payroll-summary",
    clientId: "client-verdant",
    type: "Payroll",
    state: "stale_source",
    title: "Payroll Summary - Security Team",
    filename: "Payroll_Security_Team_v2.xlsx",
    uploadedBy: "Maya Chen",
    uploadedAt: "2026-08-05",
    pages: 1,
    supersedes: "doc-payroll-summary-v1",
    linkedFieldIds: ["field-security"],
    note: "Re-uploaded after extraction; field needs re-verification.",
  },
  {
    id: "doc-original-w2",
    clientId: "client-priya",
    type: "W-2",
    state: "conflicted",
    title: "Original W-2 - Blue Harbor Labs",
    filename: "BlueHarbor_W2_original.pdf",
    uploadedBy: "Priya Raghavan",
    uploadedAt: "2026-07-21",
    pages: 2,
    linkedFieldIds: ["field-wages"],
    note: "Superseded by amended W-2; retained for audit trail.",
  },
  {
    id: "doc-amended-w2",
    clientId: "client-priya",
    type: "W-2",
    state: "conflicted",
    title: "Amended W-2 - Blue Harbor Labs",
    filename: "BlueHarbor_W2_corrected.pdf",
    uploadedBy: "Priya Raghavan",
    uploadedAt: "2026-08-02",
    pages: 2,
    supersedes: "doc-original-w2",
    linkedFieldIds: ["field-wages"],
    note: "Corrected Box 1 wages by $1,840.",
  },
  {
    id: "doc-1099-missing",
    clientId: "client-priya",
    type: "Expected",
    state: "missing_source",
    title: "Expected 1099-B - Eastline Brokerage",
    filename: "Not uploaded",
    uploadedBy: "System expectation",
    uploadedAt: "",
    pages: 0,
    linkedFieldIds: ["field-capital-gains"],
    note: "Brokerage import indicates a tax form exists, but no document has been uploaded.",
  },
  {
    id: "doc-1099-int",
    clientId: "client-priya",
    type: "1099",
    state: "verified",
    title: "1099-INT - Eastline Brokerage",
    filename: "Eastline_1099INT_2025.pdf",
    uploadedBy: "Priya Raghavan",
    uploadedAt: "2026-07-24",
    pages: 1,
    linkedFieldIds: ["field-interest"],
    note: "Box 1 interest ties to the return without adjustment.",
  },
  {
    id: "doc-alex-w2",
    clientId: "client-alex",
    type: "W-2",
    state: "verified",
    title: "W-2 - Meridian & Co. CPAs",
    filename: "Meridian_W2_2025.pdf",
    uploadedBy: "Alex Rivera",
    uploadedAt: "2026-07-30",
    pages: 1,
    linkedFieldIds: ["field-alex-wages"],
    note: "Firm payroll W-2 for the employee's personal return.",
  },
  {
    id: "doc-alex-k1-missing",
    clientId: "client-alex",
    type: "Expected",
    state: "missing_source",
    title: "Expected K-1 - Riverbend Partners",
    filename: "Not uploaded",
    uploadedBy: "System expectation",
    uploadedAt: "",
    pages: 0,
    linkedFieldIds: ["field-alex-k1"],
    note: "A prior-year K-1 indicates a partnership interest, but no document has been uploaded yet.",
  },
];

const returnFields = [
  {
    id: "field-gross-receipts",
    returnId: "ret-verdant",
    form: "1120S",
    lineRef: "Line 1a",
    label: "Gross receipts",
    value: 2480000,
    state: "human_verified",
    confidence: 0.97,
    owner: "Preparer",
    documentId: "doc-cultivation-supplies",
    source: "QuickBooks sales summary, Page 1",
    action: "Verified",
  },
  {
    id: "field-security",
    returnId: "ret-verdant",
    form: "1120S",
    lineRef: "COGS workpaper",
    label: "Security wages",
    value: 84000,
    state: "needs_approval",
    confidence: 0.71,
    owner: "Client",
    documentId: "doc-security-invoice",
    source: "SecureSite invoice, Page 2, Services table",
    action: "Clarify facility allocation",
    split: { cogs: 62, disallowed: 38 },
    aiRationale:
      "The invoice combines cultivation floor security and dispensary front-of-house coverage, so the model proposed a split allocation instead of treating the full amount as COGS.",
    uncertainty:
      "The invoice labels two zones, but the hours by zone are not explicit. Client confirmation is needed before final review.",
  },
  {
    id: "field-retail-security",
    returnId: "ret-verdant",
    form: "1120S",
    lineRef: "M-1 workpaper",
    label: "Retail front-of-house security",
    value: 51400,
    state: "awaiting_client",
    confidence: 0.64,
    owner: "Client",
    documentId: "doc-security-invoice",
    source: "SecureSite invoice, Page 2, Notes",
    action: "Awaiting client response",
  },
  {
    id: "field-supplies",
    returnId: "ret-verdant",
    form: "1120S",
    lineRef: "COGS workpaper",
    label: "Cultivation supplies",
    value: 312450,
    state: "human_verified",
    confidence: 0.95,
    owner: "Preparer",
    documentId: "doc-cultivation-supplies",
    source: "North Coast invoice pack, Pages 3-9",
    action: "Verified",
  },
  {
    id: "field-total-cogs",
    returnId: "ret-verdant",
    form: "1120S",
    lineRef: "Line 2",
    label: "Total COGS",
    value: 1160540,
    state: "ai_calculated",
    confidence: 0.71,
    owner: "Preparer",
    documentId: "doc-security-invoice",
    source: "Sum of verified COGS inputs",
    action: "Propagates lowest input confidence",
  },
  {
    id: "field-officer-comp",
    returnId: "ret-verdant",
    form: "1120S",
    lineRef: "Line 7",
    label: "Officer compensation",
    value: 180000,
    state: "locked",
    confidence: 1,
    owner: "Firm",
    documentId: "doc-payroll-summary",
    source: "Filed payroll package",
    action: "Locked after e-file acceptance",
  },
  {
    id: "field-ai-decline",
    returnId: "ret-verdant",
    form: "1120S",
    lineRef: "Other deductions",
    label: "Unlabeled cash adjustment",
    value: null,
    state: "ai_declined",
    confidence: 0,
    owner: "Preparer",
    documentId: "doc-payroll-summary",
    source: "Unclear GL memo",
    action: "AI declined to classify",
  },
  {
    id: "field-wages",
    returnId: "ret-priya",
    form: "1040",
    lineRef: "Line 1a",
    label: "Wages, salaries, tips",
    value: 148920,
    state: "conflicted",
    confidence: 0.58,
    owner: "Preparer",
    documentId: "doc-amended-w2",
    source: "Original and amended W-2 disagree",
    action: "Resolve conflict",
  },
  {
    id: "field-interest",
    returnId: "ret-priya",
    form: "1040",
    lineRef: "Line 2b",
    label: "Taxable interest",
    value: 6241,
    state: "human_verified",
    confidence: 0.98,
    owner: "Preparer",
    documentId: "doc-1099-int",
    source: "1099-INT Box 1",
    action: "Verified",
  },
  {
    id: "field-capital-gains",
    returnId: "ret-priya",
    form: "1040",
    lineRef: "Schedule D",
    label: "Capital gains",
    value: null,
    state: "missing_source",
    confidence: 0,
    owner: "Client",
    documentId: "doc-1099-missing",
    source: "Expected document not uploaded",
    action: "Request 1099-B",
  },
  {
    id: "field-alex-wages",
    returnId: "ret-alex-personal",
    form: "1040",
    lineRef: "Line 1a",
    label: "Wages, salaries, tips",
    value: 112400,
    state: "human_verified",
    confidence: 0.98,
    owner: "Preparer",
    documentId: "doc-alex-w2",
    source: "Meridian & Co. W-2, Box 1",
    action: "Verified",
  },
  {
    id: "field-alex-k1",
    returnId: "ret-alex-personal",
    form: "1040",
    lineRef: "Schedule E",
    label: "Partnership income (K-1)",
    value: null,
    state: "missing_source",
    confidence: 0,
    owner: "Client",
    documentId: "doc-alex-k1-missing",
    source: "Expected document not uploaded",
    action: "Upload K-1",
  },
];

const threads = [
  {
    id: "thread-security",
    clientId: "client-verdant",
    subject: "Confirm security hours by facility area",
    visibility: "client_visible",
    anchorType: "field",
    anchorId: "field-security",
    owner: "Maya Chen",
    ownerRole: "Client",
    status: "Open",
    dueDate: "2026-08-07",
    messages: [
      {
        author: "Alex Rivera",
        role: "Preparer",
        body: "The invoice combines cultivation floor and retail coverage. Please confirm whether the attached hour split is accurate.",
        createdAt: "Aug 5, 9:14 AM",
        internal: false,
      },
      {
        author: "Dana Patel",
        role: "Reviewer",
        body: "Internal note: do not approve the §280E workpaper until the production-area percentage is confirmed.",
        createdAt: "Aug 5, 9:18 AM",
        internal: true,
      },
    ],
  },
  {
    id: "thread-w2",
    clientId: "client-priya",
    subject: "Resolve amended W-2",
    visibility: "internal",
    anchorType: "document",
    anchorId: "doc-amended-w2",
    owner: "Alex Rivera",
    ownerRole: "Preparer",
    status: "Open",
    dueDate: "2026-08-10",
    messages: [
      {
        author: "Alex Rivera",
        role: "Preparer",
        body: "Amended W-2 supersedes the original. Need to re-run dependent wage lines before review.",
        createdAt: "Aug 4, 4:42 PM",
        internal: true,
      },
    ],
  },
  {
    id: "thread-k1",
    clientId: "client-alex",
    subject: "Upload missing K-1",
    visibility: "client_visible",
    anchorType: "task",
    anchorId: "task-k1",
    owner: "Alex Rivera",
    ownerRole: "Client",
    status: "Open",
    dueDate: "2026-08-20",
    messages: [
      {
        author: "LedgerProof",
        role: "System",
        body: "Your personal return is waiting on one K-1 before preparation can begin.",
        createdAt: "Aug 2, 8:00 AM",
        internal: false,
      },
    ],
  },
];

const auditEvents = [
  {
    entityId: "field-security",
    actor: "LedgerProof AI",
    action: "Proposed split allocation",
    before: "Unclassified",
    after: "62% COGS / 38% disallowed",
    reason: "Mixed security services detected on source invoice.",
    time: "Aug 5, 8:57 AM",
  },
  {
    entityId: "field-security",
    actor: "Alex Rivera",
    action: "Opened client request",
    before: "Needs approval",
    after: "Awaiting client",
    reason: "Invoice did not separate facility hours.",
    time: "Aug 5, 9:14 AM",
  },
];

const generatedReturns = makeGeneratedReturns();
const documents = [...baseDocuments, ...makeGeneratedDocuments()];

const appState = {
  role: "preparer",
  view: "dashboard",
  selectedReturnId: "ret-verdant",
  selectedFieldId: "field-security",
  selectedDocId: "doc-security-invoice",
  selectedThreadId: "thread-security",
  dashboardFilter: "mine",
  docQuery: "",
  docType: "all",
  docState: "all",
  disclosure: "evidence",
  commandOpen: false,
  commandQuery: "",
  commandIndex: 0,
  overrideCogs: "45",
  overrideValue: "",
  overrideReason: "",
  clientCompleted: false,
  personalCompleted: false,
  messageDraft: "",
};

function makeGeneratedReturns() {
  const names = [
    "Harbor Thread Studio",
    "Aster Ridge Holdings",
    "North Pier Botanicals",
    "Crescent Field Labs",
    "Juniper Market LLC",
    "Mosaic Dental Group",
    "Willow Creek Properties",
    "Orange Line Analytics",
  ];
  const statuses = ["Waiting on Client", "Needs Review", "Ready for Prep", "Source Conflict", "Filed"];
  const owners = ["Alex Rivera", "Dana Patel", "Maya Chen", "Seasonal Pool"];
  return Array.from({ length: 216 }, (_, index) => {
    const status = statuses[index % statuses.length];
    const dueDay = 7 + (index % 21);
    const blocked = status === "Waiting on Client" || status === "Source Conflict";
    const aiFlags = index % 6 === 0 ? 3 : index % 4 === 0 ? 1 : 0;
    return {
      id: `ret-generated-${index}`,
      clientId: `client-generated-${index}`,
      clientName: `${names[index % names.length]} ${index + 1}`,
      form: index % 3 === 0 ? "1120S" : index % 3 === 1 ? "1040" : "1065",
      status,
      stage: status === "Filed" ? "filed" : status === "Needs Review" ? "review" : status === "Waiting on Client" ? "client_wait" : "prep",
      owner: owners[index % owners.length],
      ownerRole: index % 4 === 2 ? "Client" : "Preparer",
      dueDate: `2026-08-${String(dueDay).padStart(2, "0")}`,
      blocker: blocked ? "Open item blocks completion" : "",
      nextAction: blocked ? "Resolve open item" : status === "Filed" ? "No action" : "Continue review",
      taxImpact: (index % 9) * 1240,
      aiFlags,
      unreadThreads: index % 5,
      staffOnlyDetail: "Generated mock return used to prove worklist scale and filtering.",
    };
  });
}

function makeGeneratedDocuments() {
  const types = ["W-2", "1099", "Invoice", "Payroll", "K-1", "Bank", "GL Export"];
  const states = ["verified", "low_confidence", "conflicted", "missing_source", "stale_source"];
  return Array.from({ length: 420 }, (_, index) => ({
    id: `doc-generated-${index}`,
    clientId: index % 2 === 0 ? "client-verdant" : "client-priya",
    type: types[index % types.length],
    state: states[index % states.length],
    title: `${types[index % types.length]} support packet ${String(index + 1).padStart(3, "0")}`,
    filename: `support_packet_${String(index + 1).padStart(3, "0")}.pdf`,
    uploadedBy: index % 3 === 0 ? "Client upload" : "System import",
    uploadedAt: `2026-07-${String((index % 28) + 1).padStart(2, "0")}`,
    pages: (index % 13) + 1,
    linkedFieldIds: [],
    note: "Generated mock document for volume, filtering, and search behavior.",
  }));
}

const COGS_OTHER_INPUTS = 1108460;

const generatedFieldsCache = new Map();

function fieldsForGeneratedReturn(returnItem) {
  if (!generatedFieldsCache.has(returnItem.id)) {
    const index = Number(returnItem.id.replace("ret-generated-", "")) || 0;
    const docId = (offset) => `doc-generated-${(index * 3 + offset) % 420}`;
    const openStates = {
      "Waiting on Client": { state: "awaiting_client", label: "Owner distribution classification", action: "Awaiting client response", owner: "Client" },
      "Source Conflict": { state: "conflicted", label: "Duplicate revenue source", action: "Resolve conflicting uploads", owner: "Preparer" },
      "Needs Review": { state: "needs_approval", label: "Estimated accrual adjustment", action: "Reviewer approval needed", owner: "Reviewer" },
      "Ready for Prep": { state: "ai_extracted", label: "Imported trial balance", action: "Begin preparation", owner: "Preparer" },
      Filed: { state: "locked", label: "Filed taxable income", action: "Locked after e-file acceptance", owner: "Firm" },
    };
    const open = openStates[returnItem.status] || openStates["Ready for Prep"];
    const gross = 180000 + index * 8375;
    const expenses = Math.round(gross * 0.62);
    generatedFieldsCache.set(returnItem.id, [
      {
        id: `gen-${index}-gross`,
        returnId: returnItem.id,
        form: returnItem.form,
        lineRef: "Line 1a",
        label: "Gross receipts",
        value: gross,
        state: "human_verified",
        confidence: 0.97,
        owner: "Preparer",
        documentId: docId(0),
        source: "GL revenue export, Page 1",
        action: "Verified",
      },
      {
        id: `gen-${index}-expense`,
        returnId: returnItem.id,
        form: returnItem.form,
        lineRef: "Line 19",
        label: "Operating expenses",
        value: expenses,
        state: "ai_extracted",
        confidence: 0.9,
        owner: "Preparer",
        documentId: docId(1),
        source: "Expense support packet",
        action: "AI extracted; spot-check suggested",
      },
      {
        id: `gen-${index}-open`,
        returnId: returnItem.id,
        form: returnItem.form,
        lineRef: "Open item",
        label: open.label,
        value: returnItem.status === "Filed" ? gross - expenses : Math.round(gross * 0.08),
        state: open.state,
        confidence: open.state === "locked" ? 1 : 0.66,
        owner: open.owner,
        documentId: docId(2),
        source: "Linked support document",
        action: open.action,
      },
      {
        id: `gen-${index}-total`,
        returnId: returnItem.id,
        form: returnItem.form,
        lineRef: "Total",
        label: "Net income (computed)",
        value: gross - expenses,
        state: "ai_calculated",
        confidence: 0.9,
        owner: "Preparer",
        documentId: docId(0),
        source: "Sum of source-linked inputs",
        action: "Footed by system",
      },
    ]);
  }
  return generatedFieldsCache.get(returnItem.id);
}

function priorityBreakdown(item) {
  const days = daysUntil(item.dueDate);
  const reasons = [];
  reasons.push({
    score: Math.max(4, Math.min(30, 30 - days * 2)),
    text: days <= 0 ? "Due today." : `Due in ${days} day${days === 1 ? "" : "s"}.`,
  });
  if (item.blocker) {
    reasons.push(
      item.ownerRole === "Client"
        ? { score: 30, text: "Client-owned blocker is stopping firm progress." }
        : { score: 18, text: "Blocker is waiting on firm staff." },
    );
  }
  if (item.aiFlags > 0) {
    reasons.push({ score: item.aiFlags * 6, text: `${item.aiFlags} AI finding${item.aiFlags === 1 ? "" : "s"} need review before filing.` });
  }
  const impactScore = Math.min(24, Math.round(item.taxImpact / 2500));
  if (impactScore > 0) {
    reasons.push({ score: impactScore, text: `${money(item.taxImpact)} potential tax impact on the open workpaper.` });
  }
  if (item.stage === "review") {
    reasons.push({ score: 8, text: "Reviewer is waiting on this return." });
  }
  return reasons.sort((a, b) => b.score - a.score);
}

function priorityScoreFor(item) {
  return priorityBreakdown(item).reduce((sum, reason) => sum + reason.score, 0);
}

function roleClientId(role = getRole()) {
  if (role.id === "client") return "client-verdant";
  if (role.id === "multi") return "client-alex";
  return null;
}

function scopedDocuments(role = getRole()) {
  if (role.audience === "client") return documents.filter((doc) => doc.clientId === roleClientId(role));
  return documents;
}

function visibleThreads(role = getRole()) {
  if (role.audience === "client") {
    return threads.filter((thread) => thread.visibility === "client_visible" && thread.clientId === roleClientId(role));
  }
  return threads;
}

function getFieldsFor(returnItem) {
  if (returnItem.id.startsWith("ret-generated")) return fieldsForGeneratedReturn(returnItem);
  return returnFields.filter((field) => field.returnId === returnItem.id);
}

function findField(id) {
  const base = returnFields.find((field) => field.id === id);
  if (base) return base;
  const match = /^gen-(\d+)-/.exec(id || "");
  if (match) {
    const returnItem = generatedReturns.find((item) => item.id === `ret-generated-${match[1]}`);
    if (returnItem) return fieldsForGeneratedReturn(returnItem).find((field) => field.id === id) || null;
  }
  return null;
}

function primaryFieldId(returnItem) {
  const fields = getFieldsFor(returnItem);
  const open = fields.find((field) => !["human_verified", "ai_calculated", "locked"].includes(field.state));
  return (open || fields[0] || {}).id || "";
}

function recomputeTotalCogs() {
  const security = returnFields.find((item) => item.id === "field-security");
  const total = returnFields.find((item) => item.id === "field-total-cogs");
  if (!security || !total || security.value === null || !security.split) return;
  total.value = COGS_OTHER_INPUTS + Math.round(security.value * security.split.cogs * 0.01);
  total.confidence = Math.min(security.confidence, 0.95);
}

// Simulated model boundary. In production this call goes to the extraction
// service; the UI only ever consumes this response shape.
function mockAiResponse(field) {
  const doc = getDocument(field.documentId);
  return {
    model: "ledgerproof-extract-mock-1",
    field_id: field.id,
    extracted_value: field.value,
    confidence: field.confidence,
    rationale: field.aiRationale || summaryForField(field),
    uncertainty: field.uncertainty || null,
    evidence: [{ document_id: doc.id, document_title: doc.title, region: field.source }],
    proposed_action: field.action,
    split: field.split || null,
  };
}

function getRole() {
  return ROLES.find((role) => role.id === appState.role) || ROLES[0];
}

function getReturn(id = appState.selectedReturnId) {
  const found = returns.find((item) => item.id === id) || generatedReturns.find((item) => item.id === id) || returns[0];
  const role = getRole();
  if (role.audience === "client" && found.clientId !== roleClientId(role)) {
    return returns.find((item) => item.clientId === roleClientId(role)) || returns[0];
  }
  return found;
}

function getClient(returnItem = getReturn()) {
  if (returnItem.id === "ret-alex-personal") {
    return {
      id: "client-alex",
      name: "Alex Rivera",
      entityType: "Individual",
      industry: "Individual",
      form: "1040",
      taxYear: "2025",
    };
  }
  return (
    clients.find((client) => client.id === returnItem.clientId) || {
      id: returnItem.clientId || "client-generated",
      name: returnItem.clientName || "Generated client",
      entityType: "Mock engagement",
      industry: "Generated",
      form: returnItem.form || "Return",
      taxYear: "2025",
    }
  );
}

function getField() {
  const fields = getFieldsFor(getReturn());
  return fields.find((field) => field.id === appState.selectedFieldId) || fields[0] || returnFields[1];
}

function getDocument(id = appState.selectedDocId) {
  const scoped = scopedDocuments();
  return scoped.find((document) => document.id === id) || scoped[0] || documents[0];
}

function getThread(id = appState.selectedThreadId) {
  const visible = visibleThreads();
  return visible.find((thread) => thread.id === id) || visible[0] || threads[0];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value) {
  if (value === null || value === undefined) return "Not set";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function percent(value) {
  return `${Math.round(value * 100)}%`;
}

function dateLabel(value) {
  if (!value) return "No date";
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysUntil(value) {
  const now = new Date("2026-08-06T12:00:00");
  const due = new Date(`${value}T12:00:00`);
  return Math.ceil((due - now) / 86400000);
}

function statusClass(status) {
  if (status.includes("Filed")) return "status-done";
  if (status.includes("Waiting") || status.includes("Conflict") || status.includes("Collecting")) return "status-blocked";
  return "status-review";
}

function stateChip(field) {
  const info = TICK[field.state] || TICK.ai_extracted;
  const tone =
    info.tone === "verified" || info.tone === "calculated"
      ? "verified"
      : info.tone === "override"
        ? "override"
        : "attention";
  return `<span class="state-chip ${tone}">${escapeHtml(info.label)}</span>`;
}

function setView(view, payload = {}) {
  appState.view = view;
  Object.assign(appState, payload);
  updateRoute();
  render();
}

let syncingHash = false;

function updateRoute() {
  const routes = {
    dashboard: "dashboard",
    return: `return/${appState.selectedReturnId}/${appState.selectedFieldId}`,
    documents: `documents/${appState.selectedDocId}`,
    requests: `requests/${appState.selectedThreadId}`,
    clientHome: "client-home",
    status: `status/${appState.selectedReturnId}`,
    roles: "roles",
  };
  const next = `#${routes[appState.view] || appState.view}`;
  if (window.location.hash !== next) {
    syncingHash = true;
    window.location.hash = next;
  }
}

function restoreRoute() {
  const parts = window.location.hash.replace(/^#/, "").split("/");
  if (!parts[0]) return;
  if (parts[0] === "return") {
    appState.view = "return";
    appState.selectedReturnId = parts[1] || appState.selectedReturnId;
    const fields = getFieldsFor(getReturn());
    const field = fields.find((item) => item.id === parts[2]) || fields[0];
    if (field) {
      appState.selectedFieldId = field.id;
      appState.selectedDocId = field.documentId || appState.selectedDocId;
    }
  } else if (parts[0] === "documents") {
    appState.view = "documents";
    appState.selectedDocId = parts[1] || appState.selectedDocId;
  } else if (parts[0] === "requests") {
    appState.view = "requests";
    appState.selectedThreadId = parts[1] || appState.selectedThreadId;
  } else if (parts[0] === "status") {
    appState.view = "status";
    if (parts[1]) appState.selectedReturnId = parts[1];
  } else if (["dashboard", "client-home", "roles"].includes(parts[0])) {
    appState.view = parts[0] === "client-home" ? "clientHome" : parts[0];
  }
}

window.addEventListener("hashchange", () => {
  if (syncingHash) {
    syncingHash = false;
    return;
  }
  restoreRoute();
  render();
});

function navItemsForRole() {
  const role = getRole();
  const docCount = String(scopedDocuments(role).length);
  const threadCount = String(visibleThreads(role).length);
  if (role.id === "client") {
    return [
      ["clientHome", "Home", appState.clientCompleted ? "" : "1"],
      ["requests", "Requests", threadCount],
      ["documents", "Documents", docCount],
      ["status", "Status", ""],
    ];
  }
  if (role.id === "multi") {
    return [
      ["roles", "Context", ""],
      ["dashboard", "Firm work", String(rankedWorklist().length)],
      ["clientHome", "Personal", appState.personalCompleted ? "" : "1"],
      ["documents", "Documents", docCount],
      ["requests", "Requests", threadCount],
      ["status", "Status", ""],
    ];
  }
  return [
    ["dashboard", "Dashboard", String(rankedWorklist().length)],
    ["return", "Return review", String(getFieldsFor(getReturn()).length)],
    ["documents", "Documents", docCount],
    ["requests", "Requests", threadCount],
    ["status", "Status", ""],
    ["roles", "Roles", "demo"],
  ];
}

function render() {
  const app = document.querySelector("#app");
  // Re-rendering replaces the DOM, so remember which control had focus (and
  // its caret) and restore it afterwards — otherwise typing loses focus.
  const active = document.activeElement;
  let focusSelector = null;
  let caret = null;
  if (active && active !== document.body) {
    const attrName = active.getAttributeNames?.().find((name) => name.startsWith("data-"));
    if (attrName) {
      focusSelector = `[${attrName}="${CSS.escape(active.getAttribute(attrName))}"]`;
      if (active.matches("input, textarea") && typeof active.selectionStart === "number") {
        caret = { start: active.selectionStart, end: active.selectionEnd };
      }
    }
  }
  app.innerHTML = `
    <div class="app-shell">
      ${renderSidebar()}
      <main class="main">
        ${renderTopbar()}
        <div class="content">
          ${renderView()}
        </div>
      </main>
    </div>
    ${appState.commandOpen ? renderCommandPalette() : ""}
  `;
  if (appState.commandOpen) {
    // The palette owns focus while open; otherwise the restore below would
    // hand keystrokes back to whatever input was focused underneath it.
    const input = document.querySelector("[data-command-query]");
    if (input) {
      input.focus();
      const keepCaret = caret && focusSelector && focusSelector.includes("data-command-query");
      const end = input.value.length;
      try {
        input.setSelectionRange(keepCaret ? caret.start : end, keepCaret ? caret.end : end);
      } catch {
        // ignore
      }
    }
    return;
  }
  if (focusSelector) {
    const next = document.querySelector(focusSelector);
    if (next) {
      next.focus();
      if (caret && typeof next.setSelectionRange === "function") {
        try {
          next.setSelectionRange(caret.start, caret.end);
        } catch {
          // selects and numeric inputs without selection support
        }
      }
    }
  }
}

function renderSidebar() {
  const role = getRole();
  const navItems = navItemsForRole();
  return `
    <aside class="side-nav" aria-label="Primary">
      <div class="brand-row">
        <div class="brand-mark">LP</div>
        <div class="brand-text">
          <strong>LedgerProof</strong>
          <span>AI tax workpapers</span>
        </div>
      </div>

      <nav class="nav-group">
        <div class="nav-label">Workspace</div>
        ${navItems
          .map(
            ([view, label, count]) => `
              <button class="nav-button ${appState.view === view ? "active" : ""}" data-nav="${view}">
                <span>${escapeHtml(label)}</span>
                ${count ? `<span class="nav-count">${escapeHtml(count)}</span>` : ""}
              </button>
            `,
          )
          .join("")}
      </nav>

      ${
        role.audience === "client"
          ? ""
          : `
      <div class="nav-group">
        <div class="nav-label">Open item</div>
        <button class="nav-button" data-open-return="ret-verdant" data-field="field-security">
          <span>§280E security split</span>
          <span class="nav-count">~</span>
        </button>
        <button class="nav-button" data-open-return="ret-priya" data-field="field-wages">
          <span>Amended W-2 conflict</span>
          <span class="nav-count">!</span>
        </button>
      </div>`
      }

      <div class="persona-card">
        <div>
          <div class="micro-label">Persona</div>
          <strong>${escapeHtml(role.name)}</strong>
          <div class="row-subtitle">${escapeHtml(role.label)}</div>
        </div>
        <select aria-label="Switch role" data-role-select>
          ${ROLES.map((item) => `<option value="${item.id}" ${item.id === appState.role ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
        </select>
      </div>
    </aside>
  `;
}

function renderTopbar() {
  const role = getRole();
  const returnItem = getReturn();
  const client = getClient(returnItem);
  const crumb = breadcrumbForView(client, returnItem);
  const clientStatus =
    role.audience === "client" ? clientFriendlyStatus(returnItem.stage) : returnItem.status;
  return `
    <header class="topbar">
      <div>
        <div class="breadcrumb">${crumb}</div>
        <div class="context-row">
          <h1 class="context-title">${escapeHtml(client.name)} · ${escapeHtml(client.taxYear)} ${escapeHtml(returnItem.form)}</h1>
          <span class="status-pill ${statusClass(returnItem.status)}">${escapeHtml(clientStatus)}</span>
          <span class="owner-pill">Owner: ${escapeHtml(role.audience === "client" ? clientOwnerLabel(returnItem) : returnItem.owner)}</span>
          <span class="badge">Due ${dateLabel(returnItem.dueDate)}</span>
          <span class="badge">${escapeHtml(role.context)}</span>
        </div>
      </div>
      <div class="top-actions">
        <button class="search-trigger" data-action="open-command">
          <span>Jump to field, document, request</span>
          <span class="mono">⌘K</span>
        </button>
      </div>
    </header>
  `;
}

function breadcrumbForView(client, returnItem) {
  const labels = {
    dashboard: "Dashboard",
    return: "Return review",
    documents: "Documents",
    requests: "Requests",
    clientHome: "Client home",
    status: "Status",
    roles: "Roles",
  };
  const field = appState.view === "return" ? getField() : null;
  return `
    <strong>${escapeHtml(client.name)}</strong>
    <span>/</span>
    <span>${escapeHtml(returnItem.taxYear || "2025")}</span>
    <span>/</span>
    <span>${escapeHtml(labels[appState.view] || "Workspace")}</span>
    ${field ? `<span>/</span><span>${escapeHtml(field.label)}</span>` : ""}
  `;
}

function clientFriendlyStatus(stage) {
  const step = STATUS_STEPS.find((item) => item.key === stage);
  return step ? step.client : "Your return is in progress";
}

function clientOwnerLabel(returnItem) {
  if (returnItem.stage === "client_wait" || returnItem.ownerRole === "Client") return "You";
  return "Your tax team";
}

function renderView() {
  if (appState.view === "dashboard") return renderDashboard();
  if (appState.view === "return") return renderReturnReview();
  if (appState.view === "documents") return renderDocuments();
  if (appState.view === "requests") return renderRequests();
  if (appState.view === "clientHome") return renderClientHome();
  if (appState.view === "status") return renderStatus();
  if (appState.view === "roles") return renderRoles();
  return renderDashboard();
}

function renderDashboard() {
  const work = rankedWorklist();
  const top = work[0];
  const activeId = appState.selectedReturnId;
  return `
    <section>
      <div class="page-head">
        <div>
          <h1>Work now</h1>
          <p>Ranked by deadline, blocker ownership, AI findings, tax impact, and reviewer wait.</p>
        </div>
        <div class="toolbar">
          ${renderDashboardFilters()}
        </div>
      </div>

      ${
        top
          ? `
      <div class="next-up">
        <div class="next-up-main">
          <div class="micro-label">Next up · Score ${priorityScoreFor(top)}</div>
          <h2 class="next-title">${escapeHtml(getClient(top).name || top.clientName)}</h2>
          <p class="row-subtitle">${escapeHtml(top.nextAction)} · ${escapeHtml(top.form)} · Due ${dateLabel(top.dueDate)} · ${escapeHtml(top.ownerRole)}: ${escapeHtml(top.owner)}</p>
          <button class="button primary" data-open-return="${top.id}" data-field="${primaryFieldId(top)}">Open exact review item</button>
        </div>
        <ul class="reason-list" aria-label="Why this is first">
          ${priorityBreakdown(top)
            .slice(0, 4)
            .map((reason) => `<li><span class="reason-score">+${reason.score}</span><span>${escapeHtml(reason.text)}</span></li>`)
            .join("")}
        </ul>
      </div>`
          : `<div class="empty-state"><h2>Nothing matches this filter</h2><p>Switch filters to see the rest of the worklist.</p></div>`
      }

      ${
        work.length
          ? `
      <div class="panel">
        <table class="return-table worklist-table">
          <thead>
            <tr><th>#</th><th>Client</th><th>Status</th><th>Owner</th><th>Due</th></tr>
          </thead>
          <tbody>
            ${work
              .slice(0, 15)
              .map((item, index) => renderWorkRow(item, index, item.id === activeId))
              .join("")}
          </tbody>
        </table>
        ${work.length > 15 ? `<div class="list-footnote">Showing the top 15 of ${work.length} ranked returns. Use filters or ⌘K to reach the rest.</div>` : ""}
      </div>`
          : ""
      }
    </section>
  `;
}

function renderDashboardFilters() {
  const filters = [
    ["mine", "Mine"],
    ["blocked", "Blocked"],
    ["ai", "AI flagged"],
    ["review", "Needs review"],
  ];
  return `
    <div class="segmented" aria-label="Dashboard filters">
      ${filters
        .map(
          ([id, label]) =>
            `<button class="${appState.dashboardFilter === id ? "active" : ""}" data-filter="${id}">${escapeHtml(label)}</button>`,
        )
        .join("")}
    </div>
  `;
}

function rankedWorklist() {
  const all = [...returns, ...generatedReturns].filter((item) => item.stage !== "filed");
  const filtered = all.filter((item) => {
    if (appState.dashboardFilter === "blocked") return Boolean(item.blocker);
    if (appState.dashboardFilter === "ai") return item.aiFlags > 0;
    if (appState.dashboardFilter === "review") return item.stage === "review" || item.status.includes("Review");
    return item.owner === getRole().name || item.id === "ret-verdant" || item.id === "ret-priya";
  });
  return filtered.sort((a, b) => priorityScoreFor(b) - priorityScoreFor(a));
}

function renderWorkRow(item, index, active) {
  const clientName = getClient(item).name || item.clientName;
  return `
    <tr class="work-row ${active ? "active" : ""}" data-open-return="${item.id}" data-field="${primaryFieldId(item)}" tabindex="0" role="button">
      <td class="rank">${String(index + 1).padStart(2, "0")}</td>
      <td>
        <span class="row-title">${escapeHtml(clientName)}</span>
        <div class="row-subtitle">${escapeHtml(item.nextAction)}</div>
      </td>
      <td><span class="status-pill ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td>
      <td><span class="owner-pill">${escapeHtml(item.ownerRole)} · ${escapeHtml(item.owner)}</span></td>
      <td class="mono">${dateLabel(item.dueDate)}</td>
    </tr>
  `;
}

function renderReturnReview() {
  const returnItem = getReturn();
  const client = getClient(returnItem);
  const fields = getFieldsFor(returnItem);
  const field = getField();
  const role = getRole();
  if (!fields.length || !field) {
    return `
      <section>
        <div class="page-head">
          <div>
            <h1>${escapeHtml(client.name)} return review</h1>
            <p>${escapeHtml(returnItem.nextAction)}</p>
          </div>
        </div>
        <div class="empty-state">
          <h2>No prepared fields yet</h2>
          <p>This return is still collecting source documents. Fields appear here once extraction runs.</p>
          <button class="button primary" data-nav="dashboard">Back to worklist</button>
        </div>
      </section>
    `;
  }
  return `
    <section>
      <div class="page-head">
        <div>
          <h1>${escapeHtml(client.name)} return review</h1>
          <p>${escapeHtml(returnItem.nextAction)}${role.audience === "client" ? "" : ` · ${escapeHtml(returnItem.staffOnlyDetail)}`}</p>
        </div>
        <div class="legend">
          ${Object.entries({
            human_verified: "Verified",
            needs_approval: "Estimated",
            awaiting_client: "Awaiting client",
            human_overridden: "Override",
            locked: "Locked",
          })
            .map(([state, label]) => {
              const info = TICK[state];
              return `<span><span class="tick ${info.tone}">${info.symbol}</span>${escapeHtml(label)}</span>`;
            })
            .join("")}
        </div>
      </div>

      <div class="workspace">
        <div class="panel">
          <div class="panel-header">
            <h2>Return fields</h2>
            <span class="badge">Field-level provenance</span>
          </div>
          <table class="return-table">
            <thead>
              <tr>
                <th>Tick</th>
                <th>Line</th>
                <th>Field</th>
                <th>Value</th>
                <th>State</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              ${fields.map((item) => renderFieldRow(item, item.id === field.id)).join("")}
            </tbody>
          </table>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h2>Source document</h2>
            <button class="button ghost" data-nav="documents">Open library</button>
          </div>
          <div class="panel-body">
            ${renderDocumentPreview(field)}
          </div>
        </div>

        <aside class="panel">
          <div class="panel-header">
            <h2>${field.state === "human_verified" || field.state === "locked" ? "Provenance" : "AI evidence"}</h2>
          </div>
          <div class="panel-body">
            ${renderProvenance(field)}
          </div>
        </aside>
      </div>
    </section>
  `;
}

function renderFieldRow(field, active) {
  const info = TICK[field.state] || TICK.ai_extracted;
  return `
    <tr class="field-row ${active ? "active" : ""}" data-select-field="${field.id}" tabindex="0" role="button" aria-pressed="${active}">
      <td><span class="tick ${info.tone}" title="${escapeHtml(info.label)}">${info.symbol}</span></td>
      <td class="mono">${escapeHtml(field.lineRef)}</td>
      <td>
        <strong>${escapeHtml(field.label)}</strong>
        <div class="row-subtitle">${escapeHtml(field.action)}</div>
      </td>
      <td>${renderValueAffordance(field)}</td>
      <td>${stateChip(field)}</td>
      <td><span class="owner-pill">${escapeHtml(field.owner)}</span></td>
    </tr>
  `;
}

function renderValueAffordance(field) {
  const rendered = field.value === null ? "Needs source" : money(field.value);
  if (field.state === "locked") {
    return `<span class="amount locked-value" title="Locked because the return has been filed">${rendered}</span>`;
  }
  if (field.state === "needs_approval" || field.state === "awaiting_client" || field.state === "conflicted") {
    return `<span class="amount editable-value">${rendered}<span aria-hidden="true">✎</span></span>`;
  }
  return `<span class="amount clickable-value">${rendered}<span aria-hidden="true">›</span></span>`;
}

function docPreviewModel(doc, field) {
  const fieldId = field ? field.id : "";
  if (doc.id === "doc-security-invoice" || (doc.id === "doc-payroll-summary" && fieldId === "field-security")) {
    return {
      kind: "Source document",
      refLabel: "Invoice #SS-4519",
      page: 2,
      columns: ["Service zone", "Hours", "Rate", "Total"],
      numericCols: [1, 2, 3],
      rows: [
        { cells: ["Cultivation floor patrol", "1,240", "$42", "$52,080"], highlight: fieldId === "field-security" },
        { cells: ["Dispensary front-of-house", "760", "$42", "$31,920"], highlight: fieldId === "field-retail-security" },
        { cells: ["Shared dispatch support", "180", "$0", "$0"] },
        { cells: ["Total security staffing", "2,000", "", "$84,000"], strong: true },
      ],
      callout:
        "<strong>Highlighted source:</strong> the selected return field points to this exact document section. The allocation still needs confirmation because source labels imply but do not prove tax treatment.",
    };
  }
  if (doc.id === "doc-cultivation-supplies") {
    return {
      kind: "Source document",
      refLabel: "Invoice pack Q2",
      page: 3,
      columns: ["Line item", "GL account", "Total"],
      numericCols: [2],
      rows: [
        { cells: ["Nutrient program", "5020", "$118,200"] },
        { cells: ["Substrate and media", "5020", "$84,610"] },
        { cells: ["Trellis and supports", "5020", "$62,400"] },
        { cells: ["Misc cultivation supplies", "5020", "$47,240"] },
        { cells: ["Total cultivation supplies", "", "$312,450"], strong: true, highlight: fieldId === "field-supplies" },
      ],
      callout: "<strong>Tied out:</strong> the invoice pack total matches GL account 5020 and the return field without adjustment.",
    };
  }
  if (doc.id === "doc-payroll-summary") {
    return {
      kind: "Payroll summary",
      refLabel: "Pay period Jun 2025",
      page: 1,
      columns: ["Payroll line", "Period", "Amount"],
      numericCols: [2],
      rows: [
        { cells: ["Officer compensation", "YTD", "$180,000"], highlight: fieldId === "field-officer-comp" },
        { cells: ["Security team gross wages", "YTD", "$84,000"] },
        { cells: ["Unlabeled cash adjustment", "Jun", "$12,400"], highlight: fieldId === "field-ai-decline" },
        { cells: ["Payroll taxes accrued", "YTD", "$21,730"] },
      ],
      callout:
        fieldId === "field-ai-decline"
          ? "<strong>Why the AI declined:</strong> the GL memo on this adjustment is too vague to support a defensible classification. A human needs to decide."
          : "<strong>Re-uploaded source:</strong> this payroll summary was replaced after extraction, so linked fields need re-verification.",
    };
  }
  if (doc.id === "doc-amended-w2") {
    return {
      kind: "Corrected wage statement",
      refLabel: "Tax year 2025",
      page: 1,
      columns: ["Box", "Description", "Original", "Corrected"],
      numericCols: [2, 3],
      rows: [
        { cells: ["1", "Wages, tips, other compensation", "$147,080", "$148,920"], highlight: fieldId === "field-wages" },
        { cells: ["2", "Federal income tax withheld", "$31,214", "$31,214"] },
        { cells: ["12", "Code D elective deferrals", "$18,500", "$18,500"] },
      ],
      callout:
        "<strong>Conflict retained:</strong> the original W-2 remains linked and is marked superseded. Dependent fields cannot be approved until this is resolved.",
    };
  }
  if (doc.id === "doc-original-w2") {
    return {
      kind: "Wage statement",
      refLabel: "Tax year 2025",
      page: 1,
      columns: ["Box", "Description", "Amount"],
      numericCols: [2],
      rows: [
        { cells: ["1", "Wages, tips, other compensation", "$147,080"], highlight: fieldId === "field-wages" },
        { cells: ["2", "Federal income tax withheld", "$31,214"] },
      ],
      callout: "<strong>Superseded:</strong> a corrected W-2C was uploaded on Aug 2. This copy is retained for the audit trail.",
    };
  }
  if (doc.id === "doc-1099-int") {
    return {
      kind: "Interest statement",
      refLabel: "Tax year 2025",
      page: 1,
      columns: ["Box", "Description", "Amount"],
      numericCols: [2],
      rows: [
        { cells: ["1", "Interest income", "$6,241"], highlight: fieldId === "field-interest" },
        { cells: ["4", "Federal income tax withheld", "$0"] },
      ],
      callout: "<strong>Tied out:</strong> Box 1 matches the return field without adjustment.",
    };
  }
  if (doc.id === "doc-alex-w2") {
    return {
      kind: "Wage statement",
      refLabel: "Tax year 2025",
      page: 1,
      columns: ["Box", "Description", "Amount"],
      numericCols: [2],
      rows: [
        { cells: ["1", "Wages, tips, other compensation", "$112,400"], highlight: fieldId === "field-alex-wages" },
        { cells: ["2", "Federal income tax withheld", "$22,910"] },
      ],
      callout: "<strong>Tied out:</strong> firm payroll W-2 matches the personal return without adjustment.",
    };
  }
  // Generated fixture documents: deterministic generic content by type.
  const seed = Number((doc.id.match(/\d+/) || [0])[0]);
  const amount = (base) => money(base + seed * 137);
  const rows =
    doc.type === "W-2"
      ? [
          { cells: ["1", "Wages, tips, other compensation", amount(64000)], highlight: Boolean(field && field.documentId === doc.id) },
          { cells: ["2", "Federal income tax withheld", amount(9800)] },
        ]
      : [
          { cells: ["Line item A", "Ref 1", amount(1200)], highlight: Boolean(field && field.documentId === doc.id) },
          { cells: ["Line item B", "Ref 2", amount(880)] },
          { cells: ["Line item C", "Ref 3", amount(410)] },
        ];
  return {
    kind: `${doc.type} support`,
    refLabel: doc.filename,
    page: 1,
    columns: doc.type === "W-2" ? ["Box", "Description", "Amount"] : ["Line item", "Reference", "Amount"],
    numericCols: [2],
    rows,
    callout: `<strong>Generated fixture:</strong> ${escapeHtml(doc.note)}`,
  };
}

function renderDocumentPreview(field) {
  const doc = getDocument(field.documentId);
  if (field.state === "missing_source") {
    return `
      <div class="empty-state">
        <span class="tick awaiting">?</span>
        <h2>Source document missing</h2>
        <p>${escapeHtml(doc.note)}</p>
        ${getRole().audience === "client" || getRole().id === "admin" ? "" : `<button class="button primary" data-action="ask-client">Ask client</button>`}
      </div>
    `;
  }
  const preview = docPreviewModel(doc, field);
  return `
    <div class="doc-preview">
      <span class="doc-page-label">Page ${preview.page} of ${Math.max(doc.pages || 1, preview.page)}</span>
      <div class="invoice-head">
        <div>
          <p class="micro-label">${escapeHtml(preview.kind)}</p>
          <h3 class="invoice-title">${escapeHtml(doc.title)}</h3>
          <div class="row-subtitle">${escapeHtml(doc.filename)}</div>
        </div>
        <div class="mono">${escapeHtml(preview.refLabel)}</div>
      </div>
      <table class="invoice-table">
        <thead><tr>${preview.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead>
        <tbody>
          ${preview.rows
            .map(
              (row) => `
                <tr class="${[row.highlight ? "source-highlight" : "", row.strong ? "total-row" : ""].filter(Boolean).join(" ")}">
                  ${row.cells
                    .map((cell, index) => {
                      const content = row.strong ? `<strong>${escapeHtml(cell)}</strong>` : escapeHtml(cell);
                      return `<td class="${preview.numericCols.includes(index) ? "amount" : ""}">${content}</td>`;
                    })
                    .join("")}
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
      <div class="doc-callout">${preview.callout}</div>
    </div>
  `;
}

function renderProvenance(field) {
  const info = TICK[field.state] || TICK.ai_extracted;
  const ai = mockAiResponse(field);
  const audit = auditEvents.filter((event) => event.entityId === field.id);
  const band = ai.confidence >= 0.9 ? "high" : ai.confidence >= 0.7 ? "mid" : "low";
  return `
    <div class="provenance">
      <div>
        <div class="micro-label">Field state</div>
        <div class="context-row">
          <span class="tick ${info.tone}">${info.symbol}</span>
          <strong>${escapeHtml(field.label)}</strong>
          ${stateChip(field)}
        </div>
      </div>

      <div>
        <div class="micro-label">Confidence</div>
        <div class="context-row">
          <div class="confidence-meter" style="flex:1"><span class="${band}" style="width:${Math.round(ai.confidence * 100)}%"></span></div>
          <span class="mono">${percent(ai.confidence)}</span>
        </div>
      </div>

      <div class="segmented" aria-label="AI disclosure">
        ${["summary", "evidence", "audit"]
          .map(
            (item) =>
              `<button class="${appState.disclosure === item ? "active" : ""}" data-disclosure="${item}">${item[0].toUpperCase()}${item.slice(1)}</button>`,
          )
          .join("")}
      </div>

      ${renderDisclosure(field, ai, audit)}
      ${renderFieldActions(field)}
    </div>
  `;
}

function renderDisclosure(field, ai, audit) {
  if (appState.disclosure === "summary") {
    return `
      <div class="fact">
        <div class="micro-label">What the AI did</div>
        <p>${escapeHtml(ai.rationale)}</p>
      </div>
    `;
  }

  if (appState.disclosure === "audit") {
    return `
      <div class="message-stack">
        ${audit.length
          ? audit
              .map(
                (event) => `
                  <div class="message">
                    <div class="context-row">
                      <strong>${escapeHtml(event.action)}</strong>
                      <span class="badge">${escapeHtml(event.time)}</span>
                    </div>
                    <p>${escapeHtml(event.actor)} changed <span class="mono">${escapeHtml(event.before)}</span> to <span class="mono">${escapeHtml(event.after)}</span>.</p>
                    <p class="row-subtitle">${escapeHtml(event.reason)}</p>
                  </div>
                `,
              )
              .join("")
          : `<div class="empty-state"><p>No human changes recorded for this field.</p></div>`}
      </div>
    `;
  }

  if (ai.split) {
    const cogs = ai.split.cogs;
    const disallowed = 100 - cogs;
    return `
      <div class="fact-grid">
        <div class="fact">
          <div class="micro-label">Source value</div>
          <strong>${money(field.value)}</strong>
        </div>
        <div class="fact">
          <div class="micro-label">Current split</div>
          <strong>${cogs}% / ${disallowed}%</strong>
        </div>
      </div>
      <div class="calc-chain">
        <div><span>Total security wages</span><strong class="amount">${money(field.value)}</strong></div>
        <div><span>COGS-allocable at ${cogs}%</span><strong class="amount">${money(field.value * cogs * 0.01)}</strong></div>
        <div><span>Disallowed at ${disallowed}%</span><strong class="amount">${money(field.value * disallowed * 0.01)}</strong></div>
      </div>
      <div class="fact">
        <div class="micro-label">Reasoning</div>
        <p>${escapeHtml(ai.rationale)}</p>
        ${ai.uncertainty ? `<p class="row-subtitle">${escapeHtml(ai.uncertainty)}</p>` : ""}
      </div>
    `;
  }

  return `
    <div class="fact">
      <div class="micro-label">Evidence</div>
      <p>${escapeHtml(ai.rationale)}</p>
      <p class="row-subtitle">Source: ${escapeHtml(ai.evidence[0].document_title)} · ${escapeHtml(ai.evidence[0].region)}</p>
      ${ai.uncertainty ? `<p class="row-subtitle">${escapeHtml(ai.uncertainty)}</p>` : ""}
    </div>
  `;
}

function summaryForField(field) {
  const summaries = {
    "field-wages": "The AI found two wage sources for the same employer. The corrected W-2 appears newer, but the original value is retained until the preparer resolves the conflict.",
    "field-capital-gains": "The system expected a brokerage statement but did not find a matching upload, so the AI did not estimate the amount.",
    "field-total-cogs": "This total is recomputed from source-linked inputs. Its confidence is capped by the weakest underlying input.",
    "field-officer-comp": "The value is locked because this return was e-filed. It can be amended, but the filed value is not editable here.",
    "field-ai-decline": "The AI declined to classify the adjustment because the source memo lacks enough detail to support a defensible tax treatment.",
  };
  return summaries[field.id] || field.aiRationale || `${field.label} is linked to ${field.source}.`;
}

function renderFieldActions(field) {
  const role = getRole();
  if (role.audience === "client") {
    return `
      <div class="fact">
        <div class="micro-label">Available to you</div>
        <p>This item is visible because your tax team needs context. Internal review notes and tax workpaper controls are hidden.</p>
        <button class="button primary" data-action="resolve-client-question">Answer request</button>
      </div>
    `;
  }
  if (field.state === "locked") {
    return `
      <div class="fact">
        <div class="micro-label">Why read-only</div>
        <p>This field is locked because the return was accepted for e-file. Start an amendment workflow to change it.</p>
        <button class="button" disabled>Correct value</button>
      </div>
    `;
  }
  if (role.id === "admin") {
    return `
      <div class="fact">
        <div class="micro-label">Why read-only</div>
        <p>Firm administrators can reassign work and monitor status, but cannot edit or approve prepared values.</p>
        <div class="split-actions">
          <button class="button" disabled title="Admins cannot edit prepared values">Correct value</button>
          <button class="button" disabled title="Admins cannot approve values">Approve value</button>
        </div>
      </div>
    `;
  }
  const reviewerCopy =
    role.id === "reviewer"
      ? `<button class="button primary" data-action="approve-value">Approve correction</button>`
      : `<button class="button primary" data-action="approve-value">Approve value</button>`;
  const correctionInput = field.split
    ? `
      <label>
        <span class="micro-label">Correct COGS allocation (%)</span>
        <input value="${escapeHtml(appState.overrideCogs)}" inputmode="numeric" data-override-cogs />
      </label>`
    : `
      <label>
        <span class="micro-label">Corrected value (USD)</span>
        <input value="${escapeHtml(appState.overrideValue)}" inputmode="decimal" data-override-value />
      </label>`;
  return `
    <div class="form-grid">
      ${correctionInput}
      <label>
        <span class="micro-label">Required reason</span>
        <textarea data-override-reason placeholder="Reason is required for human override">${escapeHtml(appState.overrideReason)}</textarea>
      </label>
      <div class="split-actions">
        ${reviewerCopy}
        <button class="button" data-action="save-override">Correct value</button>
        <button class="button" data-action="ask-client">Ask client</button>
      </div>
    </div>
  `;
}

function renderDocuments() {
  const filtered = filteredDocuments();
  const selected = getDocument();
  return `
    <section>
      <div class="page-head">
        <div>
          <h1>Document library</h1>
          <p>Search and filter hundreds of source documents without leaving the return context.</p>
        </div>
        <span class="badge">${filtered.length} of ${documents.length} documents</span>
      </div>

      <div class="document-layout">
        <div class="panel">
          <div class="panel-header">
            <h2>Source files</h2>
          </div>
          <div class="panel-body">
            <div class="doc-toolbar">
              <input class="filter-input" placeholder="Search documents" value="${escapeHtml(appState.docQuery)}" data-doc-search />
              <select class="filter-select" data-doc-type>
                ${["all", "Invoice", "W-2", "1099", "Payroll", "K-1", "Bank", "GL Export", "Expected"]
                  .map((type) => `<option value="${type}" ${appState.docType === type ? "selected" : ""}>${type}</option>`)
                  .join("")}
              </select>
              <select class="filter-select" data-doc-state>
                ${["all", "verified", "low_confidence", "conflicted", "missing_source", "stale_source"]
                  .map((state) => `<option value="${state}" ${appState.docState === state ? "selected" : ""}>${state.replaceAll("_", " ")}</option>`)
                  .join("")}
              </select>
            </div>
          </div>
          <div class="doc-list">
            ${filtered
              .slice(0, 80)
              .map(
                (doc) => `
                  <button class="doc-row ${doc.id === selected.id ? "active" : ""}" data-select-doc="${doc.id}">
                    <span>
                      <strong>${escapeHtml(doc.title)}</strong>
                      <span class="row-subtitle">${escapeHtml(doc.filename)}</span>
                    </span>
                    <span class="badge">${escapeHtml(doc.type)}</span>
                    <span class="state-chip ${doc.state === "verified" ? "verified" : doc.state === "conflicted" ? "override" : "attention"}">${escapeHtml(doc.state.replaceAll("_", " "))}</span>
                  </button>
                `,
              )
              .join("")}
            ${filtered.length > 80 ? `<div class="list-footnote">Showing the first 80 of ${filtered.length} matches. Refine the search or filters to narrow.</div>` : ""}
            ${filtered.length === 0 ? `<div class="list-footnote">No documents match. Clear the search or filters to see everything.</div>` : ""}
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h2>${escapeHtml(selected.title)}</h2>
            <span class="badge">${escapeHtml(selected.pages)} pages</span>
          </div>
          <div class="panel-body">
            <div class="fact-grid">
              <div class="fact"><div class="micro-label">Uploaded by</div><strong>${escapeHtml(selected.uploadedBy)}</strong></div>
              <div class="fact"><div class="micro-label">Uploaded</div><strong>${escapeHtml(selected.uploadedAt || "Not uploaded")}</strong></div>
              <div class="fact"><div class="micro-label">State</div><strong>${escapeHtml(selected.state.replaceAll("_", " "))}</strong></div>
              <div class="fact"><div class="micro-label">Linked fields</div><strong>${selected.linkedFieldIds.length || 0}</strong></div>
            </div>
            <div style="height: 12px"></div>
            <p>${escapeHtml(selected.note)}</p>
            ${selected.supersedes ? `<p class="status-pill status-blocked">Supersedes ${escapeHtml(selected.supersedes)}</p>` : ""}
            <div style="height: 12px"></div>
            <button class="button primary" data-action="open-linked-field">Open linked field</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function filteredDocuments() {
  const query = appState.docQuery.trim().toLowerCase();
  return scopedDocuments().filter((doc) => {
    const matchesQuery =
      !query ||
      doc.title.toLowerCase().includes(query) ||
      doc.filename.toLowerCase().includes(query) ||
      doc.type.toLowerCase().includes(query) ||
      doc.note.toLowerCase().includes(query);
    const matchesType = appState.docType === "all" || doc.type === appState.docType;
    const matchesState = appState.docState === "all" || doc.state === appState.docState;
    return matchesQuery && matchesType && matchesState;
  });
}

function renderRequests() {
  const role = getRole();
  const threadsToShow = visibleThreads(role);
  const selected = getThread();
  return `
    <section>
      <div class="page-head">
        <div>
          <h1>Contextual requests</h1>
          <p>Every conversation is attached to a field, document, or task with owner and visibility.</p>
        </div>
      </div>

      <div class="requests-layout">
        <div class="panel">
          <div class="panel-header">
            <h2>Open threads</h2>
            <span class="badge">${threadsToShow.length} visible</span>
          </div>
          ${threadsToShow
            .map(
              (thread) => `
                <button class="thread-row ${thread.id === selected.id ? "active" : ""}" data-select-thread="${thread.id}">
                  <span class="row-title">${escapeHtml(thread.subject)}</span>
                  <span class="context-row">
                    <span class="state-chip ${thread.visibility === "internal" ? "override" : "verified"}">${escapeHtml(thread.visibility.replace("_", " "))}</span>
                    <span class="owner-pill">Owner: ${escapeHtml(thread.owner)}</span>
                    <span class="badge">Due ${dateLabel(thread.dueDate)}</span>
                  </span>
                </button>
              `,
            )
            .join("")}
        </div>

        <div class="panel">
          <div class="panel-header">
            <h2>${escapeHtml(selected.subject)}</h2>
            <span class="status-pill ${selected.status === "Open" ? "status-blocked" : "status-review"}">${escapeHtml(selected.status)}</span>
          </div>
          <div class="panel-body">
            <div class="fact-grid">
              <div class="fact"><div class="micro-label">Visibility</div><strong>${escapeHtml(selected.visibility.replace("_", " "))}</strong></div>
              <div class="fact"><div class="micro-label">Anchor</div><strong>${escapeHtml(selected.anchorType)} · ${escapeHtml(selected.anchorId)}</strong></div>
              <div class="fact"><div class="micro-label">Next owner</div><strong>${escapeHtml(selected.ownerRole)} · ${escapeHtml(selected.owner)}</strong></div>
              <div class="fact"><div class="micro-label">Due</div><strong>${dateLabel(selected.dueDate)}</strong></div>
            </div>
            <div style="height: 12px"></div>
            <div class="message-stack">
              ${selected.messages
                .filter((message) => role.audience !== "client" || !message.internal)
                .map(
                  (message) => `
                    <div class="message ${message.internal ? "internal" : "client"}">
                      <div class="context-row">
                        <strong>${escapeHtml(message.author)}</strong>
                        <span class="badge">${escapeHtml(message.role)}</span>
                        <span class="badge">${escapeHtml(message.createdAt)}</span>
                        ${message.internal ? `<span class="state-chip override">Internal note</span>` : `<span class="state-chip verified">Client visible</span>`}
                      </div>
                      <p>${escapeHtml(message.body)}</p>
                    </div>
                  `,
                )
                .join("")}
            </div>
            <div style="height: 12px"></div>
            <div class="form-grid">
              <label>
                <span class="micro-label">Reply</span>
                <textarea data-message-draft placeholder="Write a contextual reply">${escapeHtml(appState.messageDraft)}</textarea>
              </label>
              <div class="split-actions">
                ${
                  role.audience === "client"
                    ? `<button class="button primary" data-action="send-message">Send reply</button>`
                    : selected.visibility === "internal"
                      ? `<button class="button primary" data-action="send-internal">Add internal note</button>`
                      : `<button class="button primary" data-action="send-message">Send to client</button>
                         <button class="button" data-action="send-internal">Add internal note</button>`
                }
                <button class="button" data-action="open-anchor">Open anchor</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderClientHome() {
  if (getRole().id === "multi") return renderPersonalHome();
  if (!appState.clientCompleted) {
    return `
      <section class="client-layout">
        <div class="client-hero">
          <div class="micro-label">First sign-in</div>
          <h1>One answer is needed before your tax team can keep going.</h1>
          <p>Verdant Fields has a security invoice that mixes cultivation and retail coverage. Your answer controls whether the return can move into review.</p>
          <div class="primary-task">
            <strong>Confirm the security hours split</strong>
            <span>Estimated time: 2 minutes · Due Aug 7 · Owner: You</span>
            <button class="button primary" data-action="complete-client-task">Answer now</button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h2>Visible status</h2>
            <span class="status-pill status-blocked">We need one answer from you</span>
          </div>
          <div class="panel-body">
            <p>Your documents are uploaded. Your tax team is waiting only on the security allocation answer.</p>
            ${renderClientStatusSummary(false)}
          </div>
        </div>
      </section>
    `;
  }
  return `
    <section class="client-layout">
      <div class="client-hero">
        <div class="micro-label">Client portal</div>
        <h1>Your answer was sent to your tax team.</h1>
        <p>The return is back with the preparer. You can track progress, but no action is required from you right now.</p>
        <button class="button primary" data-nav="status">View status</button>
      </div>
      <div class="panel">
        <div class="panel-header">
          <h2>What changed</h2>
          <span class="status-pill status-review">Your tax team is reviewing</span>
        </div>
        <div class="panel-body">
          ${renderClientStatusSummary(true)}
        </div>
      </div>
    </section>
  `;
}

function renderPersonalHome() {
  if (!appState.personalCompleted) {
    return `
      <section class="client-layout">
        <div class="client-hero">
          <div class="micro-label">Personal return</div>
          <h1>Your return is waiting on one document.</h1>
          <p>Preparation cannot begin until the Riverbend Partners K-1 is uploaded. Firm controls are hidden in this context; you are acting as a taxpayer here.</p>
          <div class="primary-task">
            <strong>Upload your K-1</strong>
            <span>Estimated time: 1 minute · Due Aug 28 · Owner: You</span>
            <button class="button primary" data-action="upload-k1">Upload K-1 (simulated)</button>
          </div>
        </div>
        <div class="panel">
          <div class="panel-header">
            <h2>Visible status</h2>
            <span class="status-pill status-blocked">We need one document from you</span>
          </div>
          <div class="panel-body">
            <p>Your W-2 is in. The only thing blocking preparation is the missing K-1.</p>
            ${renderPersonalStatusSummary(false)}
          </div>
        </div>
      </section>
    `;
  }
  return `
    <section class="client-layout">
      <div class="client-hero">
        <div class="micro-label">Personal return</div>
        <h1>Your K-1 is in. Preparation starts now.</h1>
        <p>No action is required from you. You can track progress here or switch back to firm work.</p>
        <button class="button primary" data-nav="status">View status</button>
      </div>
      <div class="panel">
        <div class="panel-header">
          <h2>What changed</h2>
          <span class="status-pill status-review">Preparation in progress</span>
        </div>
        <div class="panel-body">
          ${renderPersonalStatusSummary(true)}
        </div>
      </div>
    </section>
  `;
}

function renderPersonalStatusSummary(done) {
  return `
    <div class="timeline">
      <div class="timeline-step done"><span class="timeline-dot"></span><div><strong>W-2 received</strong><div class="row-subtitle">Firm payroll W-2 verified.</div></div><span class="mono">Done</span></div>
      <div class="timeline-step ${done ? "done" : "current"}"><span class="timeline-dot"></span><div><strong>K-1 upload</strong><div class="row-subtitle">${done ? "Uploaded and queued for review." : "Waiting for your upload."}</div></div><span class="mono">${done ? "Done" : "Now"}</span></div>
      <div class="timeline-step ${done ? "current" : ""}"><span class="timeline-dot"></span><div><strong>Preparation</strong><div class="row-subtitle">${done ? "Your preparer is reviewing the K-1." : "Starts after your upload."}</div></div><span class="mono">${done ? "Now" : "Next"}</span></div>
    </div>
  `;
}

function renderClientStatusSummary(done) {
  return `
    <div class="timeline">
      <div class="timeline-step done"><span class="timeline-dot"></span><div><strong>Documents received</strong><div class="row-subtitle">Uploaded W-2s, invoices, and payroll reports.</div></div><span class="mono">Done</span></div>
      <div class="timeline-step ${done ? "done" : "current"}"><span class="timeline-dot"></span><div><strong>Security split answer</strong><div class="row-subtitle">${done ? "Answer received." : "Waiting for your confirmation."}</div></div><span class="mono">${done ? "Done" : "Now"}</span></div>
      <div class="timeline-step ${done ? "current" : ""}"><span class="timeline-dot"></span><div><strong>Tax team review</strong><div class="row-subtitle">${done ? "Your preparer is reviewing the answer." : "Starts after your answer."}</div></div><span class="mono">${done ? "Now" : "Next"}</span></div>
    </div>
  `;
}

function renderStatus() {
  const role = getRole();
  const returnItem = getReturn();
  const currentIndex = STATUS_STEPS.findIndex((step) => step.key === returnItem.stage);
  return `
    <section>
      <div class="page-head">
        <div>
          <h1>Return status</h1>
          <p>${role.audience === "client" ? "Client vocabulary hides internal workpaper detail but keeps ownership clear." : "Staff view exposes blockers, internal stage, and reviewer dependencies."}</p>
        </div>
        <span class="status-pill ${statusClass(returnItem.status)}">${escapeHtml(role.audience === "client" ? clientFriendlyStatus(returnItem.stage) : returnItem.status)}</span>
      </div>
      <div class="status-layout">
        <div class="panel">
          <div class="panel-header">
            <h2>${role.audience === "client" ? "Your progress" : "Internal progress"}</h2>
          </div>
          <div class="panel-body">
            <div class="timeline">
              ${STATUS_STEPS.map((step, index) => {
                const cls = index < currentIndex ? "done" : index === currentIndex ? (returnItem.blocker ? "blocked current" : "current") : "";
                return `
                  <div class="timeline-step ${cls}">
                    <span class="timeline-dot"></span>
                    <div>
                      <strong>${escapeHtml(role.audience === "client" ? step.client : step.staff)}</strong>
                      <div class="row-subtitle">Owner: ${escapeHtml(role.audience === "client" ? (step.owner === "Client" ? "You" : "Your tax team") : step.owner)}</div>
                    </div>
                    <span class="mono">${index < currentIndex ? "Done" : index === currentIndex ? "Now" : "Next"}</span>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>
        <aside class="panel">
          <div class="panel-header">
            <h2>Blocking detail</h2>
          </div>
          <div class="panel-body">
            ${returnItem.blocker
              ? `<p><strong>${escapeHtml(role.audience === "client" ? "Action needed" : returnItem.blocker)}</strong></p>
                 <p>${escapeHtml(role.audience === "client" ? "Your tax team needs one answer before review can continue." : returnItem.staffOnlyDetail)}</p>
                 <button class="button primary" data-nav="${role.audience === "client" ? "clientHome" : "return"}">${role.audience === "client" ? "Answer request" : "Open blocker"}</button>`
              : `<p>No blocker is stopping the return.</p><button class="button primary" data-nav="return">Open return</button>`}
          </div>
        </aside>
      </div>
    </section>
  `;
}

function renderRoles() {
  const role = getRole();
  return `
    <section>
      <div class="page-head">
        <div>
          <h1>Role-aware experience</h1>
          <p>Same product shell, different navigation, permissions, vocabulary, and personal-return context.</p>
        </div>
      </div>
      <div class="role-grid">
        ${ROLES.map(
          (item) => `
            <button class="role-card ${item.id === appState.role ? "active" : ""}" data-set-role="${item.id}">
              <div class="micro-label">${escapeHtml(item.context)}</div>
              <h2>${escapeHtml(item.label)}</h2>
              <p>${escapeHtml(item.description)}</p>
            </button>
          `,
        ).join("")}
      </div>
      <div style="height: 14px"></div>
      <div class="panel">
        <div class="panel-header">
          <h2>Current permissions</h2>
          <span class="badge">${escapeHtml(role.name)}</span>
        </div>
        <table class="return-table">
          <thead><tr><th>Action</th><th>Available</th><th>Reason shown to user</th></tr></thead>
          <tbody>
            ${permissionRows(role).map(
              (row) => `
                <tr>
                  <td>${escapeHtml(row.action)}</td>
                  <td>${row.allowed ? `<span class="state-chip verified">Yes</span>` : `<span class="state-chip attention">No</span>`}</td>
                  <td>${escapeHtml(row.reason)}</td>
                </tr>
              `,
            ).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function permissionRows(role) {
  if (role.id === "client") {
    return [
      { action: "Answer client request", allowed: true, reason: "The request is assigned to you." },
      { action: "View internal notes", allowed: false, reason: "Internal firm notes are hidden from clients." },
      { action: "Correct tax workpaper value", allowed: false, reason: "Only firm staff can edit prepared values." },
    ];
  }
  if (role.id === "reviewer") {
    return [
      { action: "Approve corrected value", allowed: true, reason: "Reviewer role owns final signoff." },
      { action: "Send client request", allowed: true, reason: "Reviewer can ask for clarification from review." },
      { action: "Edit filed return", allowed: false, reason: "Filed returns are locked outside amendment workflow." },
    ];
  }
  if (role.id === "admin") {
    return [
      { action: "View team workload", allowed: true, reason: "Firm administrator can balance assignments." },
      { action: "Correct tax value", allowed: false, reason: "Admin can reassign but not prepare values." },
      { action: "View personal client docs", allowed: false, reason: "No engagement role on that client." },
    ];
  }
  if (role.id === "multi") {
    return [
      { action: "Switch firm/personal context", allowed: true, reason: "This user has both firm and taxpayer roles." },
      { action: "View staff notes on personal return", allowed: false, reason: "Personal context uses client permissions." },
      { action: "Prepare assigned firm returns", allowed: true, reason: "Firm context grants preparer access." },
    ];
  }
  return [
    { action: "Correct unfiled value", allowed: true, reason: "Preparer owns the workpaper." },
    { action: "Create client-visible request", allowed: true, reason: "Open item needs client confirmation." },
    { action: "Approve own work", allowed: false, reason: "Reviewer signoff is required." },
  ];
}

function renderCommandPalette() {
  const results = commandResults();
  const activeIndex = Math.min(appState.commandIndex, Math.max(0, results.length - 1));
  return `
    <div class="command-overlay" data-action="close-command">
      <div class="command-box" role="dialog" aria-label="Command palette" data-command-box>
        <input autofocus placeholder="Jump to anything" value="${escapeHtml(appState.commandQuery)}" data-command-query aria-label="Search fields, documents, requests, and views" />
        <div class="command-list">
          ${
            results.length
              ? results
                  .map(
                    (item, index) => `
                      <button class="command-item ${index === activeIndex ? "active" : ""}" data-command="${item.action}" data-id="${item.id}">
                        <span class="badge">${escapeHtml(item.type)}</span>
                        <span>
                          <strong>${escapeHtml(item.title)}</strong>
                          <span class="row-subtitle">${escapeHtml(item.subtitle)}</span>
                        </span>
                        <span class="mono">↵</span>
                      </button>
                    `,
                  )
                  .join("")
              : `<div class="list-footnote">No matches. Try a client name, field, document, or request.</div>`
          }
        </div>
      </div>
    </div>
  `;
}

function commandCandidates() {
  const role = getRole();
  const items = [];
  const staffViews = [
    { type: "View", title: "Document library", subtitle: `${scopedDocuments(role).length} documents with filters`, action: "view", id: "documents", pinned: true },
    { type: "View", title: "Role-aware experience", subtitle: "Permissions and multi-role context", action: "view", id: "roles", pinned: true },
    { type: "View", title: "Client first sign-in", subtitle: "One obvious next action", action: "view", id: "clientHome", pinned: true },
  ];
  const clientViews = [
    { type: "View", title: "Home", subtitle: "Your next action", action: "view", id: "clientHome", pinned: true },
    { type: "View", title: "Documents", subtitle: `${scopedDocuments(role).length} of your documents`, action: "view", id: "documents", pinned: true },
    { type: "View", title: "Status", subtitle: "Where your return stands", action: "view", id: "status", pinned: true },
  ];
  if (role.audience === "client") {
    items.push(...clientViews);
    const scopedReturn = getReturn();
    for (const field of getFieldsFor(scopedReturn)) {
      items.push({ type: "Field", title: field.label, subtitle: `${getClient(scopedReturn).name} · ${field.lineRef}`, action: "field", id: field.id });
    }
  } else {
    items.push(
      { type: "Field", title: "Security wages", subtitle: "Verdant Fields · source trace", action: "field", id: "field-security", pinned: true },
      { type: "Field", title: "Wages, salaries, tips", subtitle: "Priya Raghavan · amended W-2 conflict", action: "field", id: "field-wages", pinned: true },
      { type: "Document", title: "SecureSite Staffing Invoice", subtitle: "Highlighted evidence on page 2", action: "document", id: "doc-security-invoice", pinned: true },
      { type: "Request", title: "Confirm security hours by facility area", subtitle: "Client-visible thread", action: "thread", id: "thread-security", pinned: true },
      ...staffViews,
    );
    for (const returnItem of [...returns, ...generatedReturns]) {
      items.push({
        type: "Return",
        title: getClient(returnItem).name || returnItem.clientName,
        subtitle: `${returnItem.form} · ${returnItem.status}`,
        action: "return",
        id: returnItem.id,
      });
    }
    for (const field of returnFields) {
      items.push({ type: "Field", title: field.label, subtitle: `${field.lineRef} · ${field.source}`, action: "field", id: field.id });
    }
  }
  for (const doc of scopedDocuments(role)) {
    items.push({ type: "Document", title: doc.title, subtitle: doc.filename, action: "document", id: doc.id });
  }
  for (const thread of visibleThreads(role)) {
    items.push({ type: "Request", title: thread.subject, subtitle: `Owner: ${thread.owner}`, action: "thread", id: thread.id });
  }
  return items;
}

function commandResults() {
  const q = appState.commandQuery.trim().toLowerCase();
  const all = commandCandidates();
  if (!q) return all.filter((item) => item.pinned).slice(0, 8);
  const seen = new Set();
  return all
    .filter((item) => `${item.type} ${item.title} ${item.subtitle}`.toLowerCase().includes(q))
    .filter((item) => {
      const key = `${item.action}:${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

function runCommand(item) {
  appState.commandOpen = false;
  appState.commandQuery = "";
  appState.commandIndex = 0;
  if (item.action === "field") {
    selectField(item.id);
    setView("return");
  } else if (item.action === "return") {
    openReturn(item.id);
  } else if (item.action === "document") {
    setView("documents", { selectedDocId: item.id });
  } else if (item.action === "thread") {
    setView("requests", { selectedThreadId: item.id });
  } else {
    setView(item.id);
  }
}

function selectField(fieldId) {
  const field = findField(fieldId);
  if (!field) return;
  appState.selectedFieldId = field.id;
  appState.selectedReturnId = field.returnId;
  appState.selectedDocId = field.documentId;
  appState.disclosure = field.split ? "evidence" : "summary";
  appState.overrideValue = field.value ?? "";
  if (field.split) appState.overrideCogs = String(field.split.cogs);
}

function openReturn(returnId, fieldId) {
  const returnItem = getReturn(returnId);
  appState.selectedReturnId = returnItem.id;
  const fields = getFieldsFor(returnItem);
  const target = fields.find((item) => item.id === fieldId) || fields.find((item) => item.id === primaryFieldId(returnItem)) || fields[0];
  if (target) selectField(target.id);
  setView("return");
}

function applyRole(roleId) {
  appState.role = roleId;
  appState.commandOpen = false;
  const role = getRole();
  if (role.id === "client") {
    appState.view = "clientHome";
    appState.selectedReturnId = "ret-verdant";
    appState.selectedFieldId = "field-security";
    appState.selectedDocId = "doc-security-invoice";
    appState.selectedThreadId = "thread-security";
  } else if (role.id === "multi") {
    appState.view = "roles";
    appState.selectedReturnId = "ret-alex-personal";
    appState.selectedFieldId = "field-alex-k1";
    appState.selectedThreadId = "thread-k1";
  } else if (appState.view === "clientHome") {
    appState.view = "dashboard";
  }
  updateRoute();
  showToast(`Role switched to ${role.label}.`);
  render();
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2200);
}

function saveOverride() {
  const role = getRole();
  if (role.id === "admin" || role.audience === "client") {
    showToast("Your role cannot edit prepared values.");
    return;
  }
  const field = getField();
  if (field.state === "locked") {
    showToast("Locked fields can only change through an amendment workflow.");
    return;
  }
  if (!appState.overrideReason.trim()) {
    showToast("Reason is required before saving a human override.");
    return;
  }
  let before;
  let after;
  if (field.split) {
    const cogs = Number(appState.overrideCogs);
    if (!Number.isFinite(cogs) || cogs < 0 || cogs > 100) {
      showToast("Enter a COGS percentage from 0 to 100.");
      return;
    }
    before = `${field.split.cogs}% COGS / ${field.split.disallowed}% disallowed`;
    field.split = { cogs, disallowed: 100 - cogs };
    after = `${cogs}% COGS / ${100 - cogs}% disallowed`;
  } else {
    const raw = String(appState.overrideValue).replaceAll(/[$,\s]/g, "");
    const value = Number(raw);
    if (!raw || !Number.isFinite(value) || value < 0) {
      showToast("Enter the corrected amount as a positive number.");
      return;
    }
    before = money(field.value);
    field.value = value;
    after = money(value);
  }
  field.state = "human_overridden";
  field.confidence = 0.92;
  field.owner = "Reviewer";
  field.action = "Reviewer approval required";
  if (field.id === "field-security") recomputeTotalCogs();
  auditEvents.push({
    entityId: field.id,
    actor: role.name,
    action: "Saved human override",
    before,
    after,
    reason: appState.overrideReason.trim(),
    time: "Aug 6, 2:16 PM",
  });
  const ret = getReturn(field.returnId);
  ret.stage = "review";
  ret.status = "Pending Review";
  ret.owner = "Dana Patel";
  ret.ownerRole = "Reviewer";
  ret.blocker = "";
  ret.nextAction = "Reviewer approval";
  appState.disclosure = "audit";
  appState.overrideReason = "";
  showToast(field.id === "field-security" ? "Value corrected. Audit trail updated and downstream total recomputed." : "Value corrected. Audit trail updated and the return moved to review.");
  render();
}

function askClient() {
  const role = getRole();
  if (role.audience === "client" || role.id === "admin") {
    showToast("Your role cannot send client requests.");
    return;
  }
  const field = getField();
  const returnItem = getReturn(field.returnId);
  const client = getClient(returnItem);
  field.state = "awaiting_client";
  field.owner = "Client";
  field.action = "Awaiting client response";
  let thread = threads.find((item) => item.anchorType === "field" && item.anchorId === field.id);
  if (!thread) {
    thread = {
      id: `thread-${field.id}`,
      clientId: client.id,
      subject: `Clarify ${field.label.toLowerCase()}`,
      visibility: "client_visible",
      anchorType: "field",
      anchorId: field.id,
      owner: client.name,
      ownerRole: "Client",
      status: "Open",
      dueDate: returnItem.dueDate,
      messages: [
        {
          author: role.name,
          role: role.label,
          body: `Can you confirm the support for ${field.label.toLowerCase()}? The linked source does not fully support the value.`,
          createdAt: "Aug 6, 2:12 PM",
          internal: false,
        },
      ],
    };
    threads.push(thread);
  } else {
    thread.status = "Open";
    thread.owner = client.name;
    thread.ownerRole = "Client";
  }
  returnItem.stage = "client_wait";
  returnItem.status = "Waiting on Client";
  returnItem.owner = client.name;
  returnItem.ownerRole = "Client";
  returnItem.blocker = `${field.label} needs client confirmation`;
  returnItem.nextAction = `Resolve ${field.label.toLowerCase()}`;
  showToast("Client-visible request opened and linked to the selected field.");
  setView("requests", { selectedThreadId: thread.id });
}

function approveValue() {
  const role = getRole();
  if (role.id === "admin" || role.audience === "client") {
    showToast("Your role cannot approve prepared values.");
    return;
  }
  const field = getField();
  if (field.state === "locked") {
    showToast("Locked fields cannot be re-approved.");
    return;
  }
  if (role.id === "preparer" && field.state === "human_overridden") {
    showToast("Reviewer approval is required for this override.");
    return;
  }
  const before = (TICK[field.state] || {}).label || field.state;
  field.state = "human_verified";
  field.confidence = Math.max(field.confidence, 0.96);
  field.owner = "Firm";
  field.action = "Verified";
  auditEvents.push({
    entityId: field.id,
    actor: role.name,
    action: "Approved value",
    before,
    after: "Traced to source",
    reason: "Evidence and calculation reviewed.",
    time: "Aug 6, 2:21 PM",
  });
  showToast("Value approved.");
  render();
}

function completeClientTask() {
  if (appState.clientCompleted) {
    setView("status", { selectedReturnId: "ret-verdant" });
    return;
  }
  appState.clientCompleted = true;
  const field = returnFields.find((item) => item.id === "field-security");
  if (field) {
    field.state = "needs_approval";
    field.owner = "Preparer";
    field.action = "Client answered; preparer review needed";
  }
  const ret = getReturn("ret-verdant");
  ret.stage = "prep";
  ret.status = "Preparation in Progress";
  ret.owner = "Alex Rivera";
  ret.ownerRole = "Preparer";
  ret.blocker = "";
  ret.nextAction = "Review client answer";
  const thread = getThread("thread-security");
  thread.status = "Answered";
  thread.owner = "Alex Rivera";
  thread.ownerRole = "Preparer";
  thread.messages.push({
    author: "Maya Chen",
    role: "Business owner",
    body: "Confirmed: 45% of the hours were for cultivation floor coverage and 55% were for front-of-house coverage.",
    createdAt: "Aug 6, 2:08 PM",
    internal: false,
  });
  showToast("Client answer recorded. Ownership moved back to the preparer.");
  render();
}

function completePersonalTask() {
  if (appState.personalCompleted) {
    showToast("The K-1 is already uploaded in this demo.");
    return;
  }
  appState.personalCompleted = true;
  const field = findField("field-alex-k1");
  if (field) {
    field.state = "needs_approval";
    field.value = 24800;
    field.confidence = 0.74;
    field.owner = "Preparer";
    field.action = "Uploaded K-1 needs preparer review";
  }
  const doc = documents.find((item) => item.id === "doc-alex-k1-missing");
  if (doc) {
    doc.state = "low_confidence";
    doc.filename = "Riverbend_K1_2025.pdf";
    doc.uploadedAt = "2026-08-06";
    doc.uploadedBy = "Alex Rivera";
    doc.pages = 4;
    doc.note = "Uploaded K-1; extraction ran with moderate confidence and needs preparer review.";
  }
  const ret = getReturn("ret-alex-personal");
  ret.stage = "prep";
  ret.status = "Preparation in Progress";
  ret.blocker = "";
  ret.nextAction = "Review uploaded K-1";
  ret.ownerRole = "Preparer";
  const thread = threads.find((item) => item.id === "thread-k1");
  if (thread) {
    thread.status = "Answered";
    thread.ownerRole = "Preparer";
    thread.messages.push({
      author: "Alex Rivera",
      role: "Taxpayer",
      body: "Uploaded the Riverbend K-1 (simulated upload).",
      createdAt: "Aug 6, 2:30 PM",
      internal: false,
    });
  }
  showToast("K-1 upload simulated. Your tax team takes it from here.");
  render();
}

function sendMessage(internal = false) {
  if (!appState.messageDraft.trim()) {
    showToast("Write a reply before sending.");
    return;
  }
  const role = getRole();
  const thread = getThread();
  const isInternal = role.audience !== "client" && (internal || thread.visibility === "internal");
  thread.messages.push({
    author: role.name,
    role: role.label,
    body: appState.messageDraft.trim(),
    createdAt: "Just now",
    internal: isInternal,
  });
  appState.messageDraft = "";
  showToast(isInternal ? "Internal note added. Clients never see this." : "Reply sent to the client on this thread.");
  render();
}

document.addEventListener("click", (event) => {
  const commandBox = event.target.closest("[data-command-box]");
  const actionNode = event.target.closest("[data-action]");
  if (actionNode) {
    const action = actionNode.dataset.action;
    if (action === "open-command") {
      appState.commandOpen = true;
      render();
      return;
    }
    if (action === "close-command" && !commandBox) {
      appState.commandOpen = false;
      render();
      return;
    }
    if (action === "save-override") return saveOverride();
    if (action === "ask-client") return askClient();
    if (action === "approve-value") return approveValue();
    if (action === "complete-client-task" || action === "resolve-client-question") return completeClientTask();
    if (action === "upload-k1") return completePersonalTask();
    if (action === "send-message") return sendMessage(false);
    if (action === "send-internal") return sendMessage(true);
    if (action === "open-anchor") {
      const thread = getThread();
      if (thread.anchorType === "field") {
        selectField(thread.anchorId);
        setView("return");
      } else if (thread.anchorType === "document") {
        setView("documents", { selectedDocId: thread.anchorId });
      } else {
        setView("clientHome");
      }
      return;
    }
    if (action === "open-linked-field") {
      const doc = getDocument();
      if (doc.linkedFieldIds[0]) {
        selectField(doc.linkedFieldIds[0]);
        setView("return");
      } else {
        showToast("This generated document has no field anchor.");
      }
      return;
    }
  }

  const nav = event.target.closest("[data-nav]");
  if (nav) {
    const payload = {};
    if (nav.dataset.nav === "clientHome") {
      if (getRole().id === "multi") payload.selectedReturnId = "ret-alex-personal";
      if (getRole().id === "client") payload.selectedReturnId = "ret-verdant";
    }
    setView(nav.dataset.nav, payload);
    return;
  }

  const openReturnNode = event.target.closest("[data-open-return]");
  if (openReturnNode) {
    openReturn(openReturnNode.dataset.openReturn, openReturnNode.dataset.field);
    return;
  }

  const fieldRow = event.target.closest("[data-select-field]");
  if (fieldRow) {
    selectField(fieldRow.dataset.selectField);
    updateRoute();
    render();
    return;
  }

  const docRow = event.target.closest("[data-select-doc]");
  if (docRow) {
    appState.selectedDocId = docRow.dataset.selectDoc;
    updateRoute();
    render();
    return;
  }

  const threadRow = event.target.closest("[data-select-thread]");
  if (threadRow) {
    appState.selectedThreadId = threadRow.dataset.selectThread;
    updateRoute();
    render();
    return;
  }

  const filter = event.target.closest("[data-filter]");
  if (filter) {
    appState.dashboardFilter = filter.dataset.filter;
    render();
    return;
  }

  const disclosure = event.target.closest("[data-disclosure]");
  if (disclosure) {
    appState.disclosure = disclosure.dataset.disclosure;
    render();
    return;
  }

  const roleCard = event.target.closest("[data-set-role]");
  if (roleCard) {
    applyRole(roleCard.dataset.setRole);
    return;
  }

  const command = event.target.closest("[data-command]");
  if (command) {
    runCommand({ action: command.dataset.command, id: command.dataset.id });
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-doc-search]")) {
    appState.docQuery = event.target.value;
    render();
  }
  if (event.target.matches("[data-command-query]")) {
    appState.commandQuery = event.target.value;
    appState.commandIndex = 0;
    render();
  }
  if (event.target.matches("[data-override-cogs]")) {
    appState.overrideCogs = event.target.value;
  }
  if (event.target.matches("[data-override-value]")) {
    appState.overrideValue = event.target.value;
  }
  if (event.target.matches("[data-override-reason]")) {
    appState.overrideReason = event.target.value;
  }
  if (event.target.matches("[data-message-draft]")) {
    appState.messageDraft = event.target.value;
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-role-select]")) {
    applyRole(event.target.value);
  }
  if (event.target.matches("[data-doc-type]")) {
    appState.docType = event.target.value;
    render();
  }
  if (event.target.matches("[data-doc-state]")) {
    appState.docState = event.target.value;
    render();
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    appState.commandOpen = true;
    appState.commandIndex = 0;
    render();
    return;
  }
  if (appState.commandOpen) {
    if (event.key === "Escape") {
      appState.commandOpen = false;
      render();
      return;
    }
    const results = commandResults();
    if (event.key === "ArrowDown") {
      event.preventDefault();
      appState.commandIndex = Math.min(appState.commandIndex + 1, Math.max(0, results.length - 1));
      render();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      appState.commandIndex = Math.max(appState.commandIndex - 1, 0);
      render();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = results[Math.min(appState.commandIndex, results.length - 1)];
      if (item) runCommand(item);
      return;
    }
    return;
  }
  // Keyboard activation for row elements that are not native buttons.
  if (event.key === "Enter" || event.key === " ") {
    if (event.target.matches?.("[data-select-field]")) {
      event.preventDefault();
      selectField(event.target.dataset.selectField);
      updateRoute();
      render();
      return;
    }
    if (event.target.matches?.("[data-open-return]")) {
      event.preventDefault();
      openReturn(event.target.dataset.openReturn, event.target.dataset.field);
    }
  }
});

restoreRoute();
render();
