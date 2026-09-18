export interface InfraProject {
  id: string
  code: string
  name: string
  hindiName?: string
  ministry: 'Railways' | 'Road Transport & Highways' | 'Power' | 'Civil Aviation' | 'Ports & Shipping' | 'Housing & Urban Affairs' | 'Jal Shakti' | 'Ministry of Power' | 'MoRTH' | 'Ministry of Railways'
  agency: string
  state: string
  location: { lat: number; lng: number }
  originalCostCr: number
  revisedCostCr: number
  costOverrunPercent: number
  originalCompletionYear: number
  revisedCompletionYear: number
  delayMonths: number
  physicalProgressPercent: number
  financialProgressPercent: number
  riskScore: number // 0 - 100
  riskTier: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'At Risk' | 'Delayed' | 'Critical Bottleneck' | 'On Track' | 'Intervention Active'
  primaryBottleneck: string
  contractor: string
  lastInspected: string
  sensorCount: number
  droneTelemetryActive: boolean
  auditNotes: { author: string; date: string; note: string }[]
}

export interface AnomalyAlert {
  id: string
  projectId: string
  projectName: string
  ministry: string
  severity: 'Critical' | 'Warning' | 'High' | 'Medium' | 'Info'
  type: 'Critical' | 'Warning' | 'Info' | 'Cost Escalation' | 'Contractor Default' | 'Geo Hazard / Flood' | 'Right-of-Way Litigation' | 'Supply Chain'
  title: string
  description: string
  timestamp: string
  status: 'Pending Review' | 'Acknowledged' | 'Escalated to MoSPI' | 'Resolved'
  predictedImpact: string
  assignedTaskforce?: string
}

export interface Directive {
  id: string
  code: string
  title: string
  targetMinistry: string
  leadAgency: string
  issuedBy: string
  issuedDate: string
  targetDate: string
  status: 'Draft' | 'Issued' | 'In Progress' | 'Escalated' | 'Completed'
  priority: 'Urgent' | 'High' | 'Routine'
  progressPercent: number
  actionItems: { text: string; done: boolean }[]
}

export interface StateDistribution {
  name: string
  shortCode: string
  count: number
  x: number // SVG coordinates 0 - 1000
  y: number
  tier: '> 200' | '101 - 200' | '51 - 100' | '11 - 50' | '≤ 10'
  color: string
}

export const STATE_DISTRIBUTIONS: StateDistribution[] = [
  { name: 'Ladakh', shortCode: 'LA', count: 12, x: 330, y: 110, tier: '11 - 50', color: '#10b981' },
  { name: 'J&K', shortCode: 'JK', count: 48, x: 285, y: 135, tier: '11 - 50', color: '#f59e0b' },
  { name: 'Himachal Pradesh', shortCode: 'HP', count: 28, x: 325, y: 195, tier: '11 - 50', color: '#10b981' },
  { name: 'Punjab', shortCode: 'PB', count: 65, x: 270, y: 230, tier: '51 - 100', color: '#f59e0b' },
  { name: 'Uttarakhand', shortCode: 'UK', count: 52, x: 360, y: 240, tier: '51 - 100', color: '#f59e0b' },
  { name: 'Haryana & Delhi', shortCode: 'DL', count: 121, x: 285, y: 310, tier: '101 - 200', color: '#ef4444' },
  { name: 'Rajasthan', shortCode: 'RJ', count: 89, x: 190, y: 375, tier: '51 - 100', color: '#f59e0b' },
  { name: 'Uttar Pradesh', shortCode: 'UP', count: 298, x: 420, y: 365, tier: '> 200', color: '#dc2626' },
  { name: 'Bihar', shortCode: 'BR', count: 103, x: 550, y: 385, tier: '101 - 200', color: '#f59e0b' },
  { name: 'Sikkim', shortCode: 'SK', count: 8, x: 620, y: 300, tier: '≤ 10', color: '#059669' },
  { name: 'Arunachal Pradesh', shortCode: 'AR', count: 17, x: 790, y: 260, tier: '11 - 50', color: '#10b981' },
  { name: 'Assam', shortCode: 'AS', count: 51, x: 740, y: 330, tier: '51 - 100', color: '#f59e0b' },
  { name: 'Nagaland', shortCode: 'NL', count: 11, x: 810, y: 345, tier: '11 - 50', color: '#10b981' },
  { name: 'Meghalaya', shortCode: 'ML', count: 16, x: 690, y: 370, tier: '11 - 50', color: '#10b981' },
  { name: 'Manipur', shortCode: 'MN', count: 12, x: 800, y: 395, tier: '11 - 50', color: '#10b981' },
  { name: 'Tripura', shortCode: 'TR', count: 8, x: 710, y: 430, tier: '≤ 10', color: '#059669' },
  { name: 'Mizoram', shortCode: 'MZ', count: 6, x: 775, y: 450, tier: '≤ 10', color: '#059669' },
  { name: 'Gujarat', shortCode: 'GJ', count: 89, x: 140, y: 475, tier: '51 - 100', color: '#f59e0b' },
  { name: 'Madhya Pradesh', shortCode: 'MP', count: 112, x: 330, y: 480, tier: '101 - 200', color: '#f59e0b' },
  { name: 'Chhattisgarh', shortCode: 'CG', count: 64, x: 475, y: 505, tier: '51 - 100', color: '#f59e0b' },
  { name: 'Odisha', shortCode: 'OD', count: 97, x: 550, y: 535, tier: '51 - 100', color: '#f59e0b' },
  { name: 'Maharashtra', shortCode: 'MH', count: 221, x: 265, y: 590, tier: '> 200', color: '#dc2626' },
  { name: 'Telangana', shortCode: 'TS', count: 108, x: 390, y: 610, tier: '101 - 200', color: '#f59e0b' },
  { name: 'Andhra Pradesh', shortCode: 'AP', count: 124, x: 420, y: 695, tier: '101 - 200', color: '#f59e0b' },
  { name: 'Goa', shortCode: 'GA', count: 6, x: 215, y: 700, tier: '≤ 10', color: '#059669' },
  { name: 'Karnataka', shortCode: 'KA', count: 109, x: 285, y: 720, tier: '101 - 200', color: '#f59e0b' },
  { name: 'Tamil Nadu', shortCode: 'TN', count: 138, x: 360, y: 810, tier: '101 - 200', color: '#f59e0b' },
  { name: 'Kerala', shortCode: 'KL', count: 42, x: 295, y: 835, tier: '11 - 50', color: '#10b981' }
]

export const SECTOR_BREAKDOWN = [
  { name: 'Transport & Logistics', count: 412, percent: 20.8, color: '#f59e0b' },
  { name: 'Energy', count: 298, percent: 15.0, color: '#10b981' },
  { name: 'Water & Sanitation', count: 214, percent: 10.8, color: '#059669' },
  { name: 'Communication', count: 186, percent: 9.4, color: '#ea580c' },
  { name: 'Social Infrastructure', count: 172, percent: 8.7, color: '#f97316' },
  { name: 'Coal, Steel & Mining', count: 164, percent: 8.3, color: '#dc2626' },
  { name: 'Urban Development', count: 143, percent: 7.2, color: '#9333ea' },
  { name: 'Others', count: 392, percent: 19.8, color: '#64748b' }
]

export const OVERRUN_TRENDS = [
  { year: '2021', costOverrun: 11, timeOverrun: 7 },
  { year: '2022', costOverrun: 17, timeOverrun: 11 },
  { year: '2023', costOverrun: 21, timeOverrun: 14 },
  { year: '2024', costOverrun: 25, timeOverrun: 16 },
  { year: '2025', costOverrun: 29, timeOverrun: 18 },
  { year: '2026', costOverrun: 32, timeOverrun: 18 }
]

export const TOP_HIGH_RISK_PROJECTS: InfraProject[] = [
  {
    id: 'hr-01',
    code: 'RRTS-01',
    name: 'Delhi–Meerut RRTS',
    hindiName: 'दिल्ली-मेरठ रैपिड रेल',
    ministry: 'MoRTH',
    agency: 'NCRTC',
    state: 'Delhi / Uttar Pradesh',
    location: { lat: 28.6692, lng: 77.4538 },
    originalCostCr: 30274,
    revisedCostCr: 34800,
    costOverrunPercent: 14.9,
    originalCompletionYear: 2024,
    revisedCompletionYear: 2026,
    delayMonths: 24,
    physicalProgressPercent: 88.5,
    financialProgressPercent: 91.0,
    riskScore: 92,
    riskTier: 'Critical',
    status: 'Critical Bottleneck',
    primaryBottleneck: 'Sarai Kale Khan station multi-modal transit hub interchange clearance and high-speed signalling integration',
    contractor: 'L&T / Alstom Transport',
    lastInspected: '2026-03-15',
    sensorCount: 1540,
    droneTelemetryActive: true,
    auditNotes: [
      {
        author: 'Chief Engineer (NCRTC)',
        date: '2026-03-12',
        note: 'High-speed automated train trials initiated at 160 km/h. Signal interface clearance filed with CRS.'
      }
    ]
  },
  {
    id: 'hr-02',
    code: 'KKNPP-03',
    name: 'Kudankulam Nuclear Plant',
    hindiName: 'कुडनकुलम परमाणु ऊर्जा संयंत्र (इकाई 3 एवं 4)',
    ministry: 'Ministry of Power',
    agency: 'NPCIL / Rosatom',
    state: 'Tamil Nadu',
    location: { lat: 8.1691, lng: 77.7126 },
    originalCostCr: 39849,
    revisedCostCr: 49621,
    costOverrunPercent: 24.5,
    originalCompletionYear: 2023,
    revisedCompletionYear: 2027,
    delayMonths: 48,
    physicalProgressPercent: 72.4,
    financialProgressPercent: 78.0,
    riskScore: 88,
    riskTier: 'Critical',
    status: 'Critical Bottleneck',
    primaryBottleneck: 'Reactor pressure vessel specialized valve component delivery lead times from overseas suppliers',
    contractor: 'NPCIL Nuclear Construction Wing',
    lastInspected: '2026-03-11',
    sensorCount: 2200,
    droneTelemetryActive: true,
    auditNotes: [
      {
        author: 'AERB Safety Commissioner',
        date: '2026-03-05',
        note: 'Secondary coolant system ultrasonic test completed without micro-fractures.'
      }
    ]
  },
  {
    id: 'hr-03',
    code: 'MCR-01',
    name: 'Mumbai Coastal Road',
    hindiName: 'मुंबई तटीय मार्ग (धर्मवीर संभाजी महाराज मार्ग)',
    ministry: 'MoRTH',
    agency: 'BMC / MMRDA',
    state: 'Maharashtra',
    location: { lat: 18.9750, lng: 72.8050 },
    originalCostCr: 12721,
    revisedCostCr: 14850,
    costOverrunPercent: 16.7,
    originalCompletionYear: 2023,
    revisedCompletionYear: 2026,
    delayMonths: 32,
    physicalProgressPercent: 94.0,
    financialProgressPercent: 95.2,
    riskScore: 85,
    riskTier: 'Critical',
    status: 'At Risk',
    primaryBottleneck: 'Bandra-Worli Sea Link connector bowstring arch bridge installation and marine tidal window',
    contractor: 'L&T Heavy Civil / HCC JV',
    lastInspected: '2026-03-14',
    sensorCount: 940,
    droneTelemetryActive: true,
    auditNotes: [
      {
        author: 'BMC Chief Engineer',
        date: '2026-03-08',
        note: 'Northbound carriageway open for peak hours. Final connector girder load testing underway.'
      }
    ]
  },
  {
    id: 'hr-04',
    code: 'PARB-02',
    name: 'Parbati Hydroelectric',
    hindiName: 'पार्वती जलविद्युत परियोजना चरण-II',
    ministry: 'Ministry of Power',
    agency: 'NHPC Limited',
    state: 'Himachal Pradesh',
    location: { lat: 31.8542, lng: 77.2145 },
    originalCostCr: 3919,
    revisedCostCr: 11200,
    costOverrunPercent: 185.7,
    originalCompletionYear: 2009,
    revisedCompletionYear: 2026,
    delayMonths: 198,
    physicalProgressPercent: 96.2,
    financialProgressPercent: 98.4,
    riskScore: 83,
    riskTier: 'Critical',
    status: 'Critical Bottleneck',
    primaryBottleneck: 'Head Race Tunnel (HRT) massive water ingress fault zone boring and heavy silt mitigation',
    contractor: 'Gammon India / Patel Engineering',
    lastInspected: '2026-03-09',
    sensorCount: 680,
    droneTelemetryActive: false,
    auditNotes: [
      {
        author: 'Central Electricity Authority Advisor',
        date: '2026-02-28',
        note: 'Last 120m of HRT tunnel heading day-lighted. Wet testing scheduled for Q3 2026.'
      }
    ]
  },
  {
    id: 'hr-05',
    code: 'BRHM-06',
    name: 'Brahmaputra Bridge',
    hindiName: 'धुबरी-फुलबारी ब्रह्मपुत्र महासेतु',
    ministry: 'Ministry of Railways',
    agency: 'NHIDCL / NFR',
    state: 'Assam / Meghalaya',
    location: { lat: 26.0125, lng: 89.9820 },
    originalCostCr: 4994,
    revisedCostCr: 6200,
    costOverrunPercent: 24.1,
    originalCompletionYear: 2026,
    revisedCompletionYear: 2028,
    delayMonths: 24,
    physicalProgressPercent: 54.0,
    financialProgressPercent: 58.0,
    riskScore: 81,
    riskTier: 'Critical',
    status: 'At Risk',
    primaryBottleneck: 'Monsoon high-discharge riverbed scouring at Well Foundation Pier 24 to 31',
    contractor: 'Larsen & Toubro Ltd',
    lastInspected: '2026-03-04',
    sensorCount: 810,
    droneTelemetryActive: true,
    auditNotes: [
      {
        author: 'IIT Guwahati Geotech Auditor',
        date: '2026-02-20',
        note: 'Riprap boulder mattresses dumped around active scour zones. Caisson sinking progressing.'
      }
    ]
  }
]

export const RECENT_ALERTS: AnomalyAlert[] = [
  {
    id: 'ra-01',
    projectId: 'hr-01',
    projectName: 'Delhi–Meerut RRTS',
    ministry: 'MoRTH',
    severity: 'Critical',
    type: 'Critical',
    title: 'High risk of time overrun',
    description: 'Sarai Kale Khan multimodal interchange delay threatens full corridor commissioning date.',
    timestamp: '2 hours ago',
    status: 'Pending Review',
    predictedImpact: 'Estimated 3.5 month schedule ripple if signalling trials are not concurrent.',
    assignedTaskforce: 'NCRTC Operations Directorate'
  },
  {
    id: 'ra-02',
    projectId: 'hr-02',
    projectName: 'Kudankulam Nuclear Plant',
    ministry: 'Ministry of Power',
    severity: 'Warning',
    type: 'Warning',
    title: 'Cost escalation predicted',
    description: 'Procurement variance on steam generator instrumentation indicates +₹1,450 Cr contingency draw.',
    timestamp: '4 hours ago',
    status: 'Pending Review',
    predictedImpact: 'Requires Atomic Energy Commission revised budget sanction.',
    assignedTaskforce: 'NPCIL Procurement Committee'
  },
  {
    id: 'ra-03',
    projectId: 'p-107',
    projectName: 'Amaravati Capital Project',
    ministry: 'Housing & Urban Affairs',
    severity: 'Warning',
    type: 'Warning',
    title: 'Milestone delay detected',
    description: 'Core trunk infrastructure road package #4 contractor mobilization lagging by 28 days.',
    timestamp: '6 hours ago',
    status: 'Acknowledged',
    predictedImpact: 'AP CRDA instructed to release mobilization advance against bank guarantee.',
    assignedTaskforce: 'AP CRDA Project Cell'
  },
  {
    id: 'ra-04',
    projectId: 'hr-04',
    projectName: 'Parbati Hydroelectric Project',
    ministry: 'Ministry of Power',
    severity: 'Info',
    type: 'Info',
    title: 'Low expenditure against plan',
    description: 'Monthly capital disbursement 42% below budget due to severe sub-zero weather freeze in Sainj valley.',
    timestamp: '9 hours ago',
    status: 'Acknowledged',
    predictedImpact: 'Expenditure expected to normalize upon snowmelt in April 2026.',
    assignedTaskforce: 'NHPC Regional Finance'
  },
  {
    id: 'ra-05',
    projectId: 'hr-03',
    projectName: 'Mumbai Coastal Road',
    ministry: 'MoRTH',
    severity: 'Warning',
    type: 'Warning',
    title: 'Revised cost increase flagged',
    description: 'Realigned navigation span between pillars 7 & 8 added ₹340 Cr design modification cost.',
    timestamp: '12 hours ago',
    status: 'Escalated to MoSPI',
    predictedImpact: 'BMC Standing Committee approved escalation under marine works contingency.',
    assignedTaskforce: 'MMRDA Infrastructure Review Cell'
  }
]

export const INITIAL_PROJECTS: InfraProject[] = [
  ...TOP_HIGH_RISK_PROJECTS,
  {
    id: 'p-101',
    code: 'MAHSR-01',
    name: 'Mumbai-Ahmedabad High Speed Rail (Bullet Train)',
    hindiName: 'मुंबई-अहमदाबाद बुलेट ट्रेन',
    ministry: 'Railways',
    agency: 'NHSRCL',
    state: 'Gujarat / Maharashtra',
    location: { lat: 21.1702, lng: 72.8311 },
    originalCostCr: 108000,
    revisedCostCr: 165000,
    costOverrunPercent: 52.8,
    originalCompletionYear: 2022,
    revisedCompletionYear: 2027,
    delayMonths: 58,
    physicalProgressPercent: 44.5,
    financialProgressPercent: 51.2,
    riskScore: 84,
    riskTier: 'Critical',
    status: 'Critical Bottleneck',
    primaryBottleneck: 'Subsea tunnel undersea bedrock excavation & Palghar RoW alignment',
    contractor: 'L&T Heavy Civil / Kawasaki Consortium',
    lastInspected: '2026-03-12',
    sensorCount: 1420,
    droneTelemetryActive: true,
    auditNotes: [
      {
        author: 'Chief Vigilance Officer (MoSPI)',
        date: '2026-03-10',
        note: 'Maharashtra land acquisition completed to 99.7%. Undersea boring machine #2 deployed near Thane creek.'
      }
    ]
  },
  {
    id: 'p-102',
    code: 'WDFC-04',
    name: 'Western Dedicated Freight Corridor (Dadri to JNPT)',
    hindiName: 'पश्चिमी समर्पित माल गलियारा',
    ministry: 'Railways',
    agency: 'DFCCIL',
    state: 'Haryana / Rajasthan / Maharashtra',
    location: { lat: 26.9124, lng: 75.7873 },
    originalCostCr: 51000,
    revisedCostCr: 81459,
    costOverrunPercent: 59.7,
    originalCompletionYear: 2019,
    revisedCompletionYear: 2026,
    delayMonths: 72,
    physicalProgressPercent: 88.2,
    financialProgressPercent: 91.0,
    riskScore: 68,
    riskTier: 'High',
    status: 'Intervention Active',
    primaryBottleneck: 'Vaitarna-JNPT final 109km terrain and electrical interlocking trials',
    contractor: 'GMR-SEW / Sojitz-L&T JV',
    lastInspected: '2026-03-14',
    sensorCount: 980,
    droneTelemetryActive: true,
    auditNotes: []
  },
  {
    id: 'p-103',
    code: 'CHENAB-07',
    name: 'USBRL Rail Link - Chenab Arch Rail Bridge',
    hindiName: 'चिनाब रेलवे आर्च ब्रिज',
    ministry: 'Railways',
    agency: 'Northern Railway / Konkan Railway',
    state: 'Jammu & Kashmir',
    location: { lat: 33.1508, lng: 74.8778 },
    originalCostCr: 27946,
    revisedCostCr: 41100,
    costOverrunPercent: 47.1,
    originalCompletionYear: 2016,
    revisedCompletionYear: 2026,
    delayMonths: 104,
    physicalProgressPercent: 96.4,
    financialProgressPercent: 98.1,
    riskScore: 42,
    riskTier: 'Medium',
    status: 'At Risk',
    primaryBottleneck: 'Seismic acoustic sensors calibration & wind tunnel threshold tests at 359m elevation',
    contractor: 'Afcons Infrastructure',
    lastInspected: '2026-03-15',
    sensorCount: 650,
    droneTelemetryActive: true,
    auditNotes: []
  },
  {
    id: 'p-104',
    code: 'DME-02',
    name: 'Delhi-Mumbai Expressway (NE-4 Mega Highway)',
    hindiName: 'दिल्ली-मुंबई एक्सप्रेसवे',
    ministry: 'Road Transport & Highways',
    agency: 'NHAI',
    state: 'Delhi / Haryana / Rajasthan / MP / Gujarat / Maharashtra',
    location: { lat: 24.5854, lng: 73.7125 },
    originalCostCr: 98000,
    revisedCostCr: 103500,
    costOverrunPercent: 5.6,
    originalCompletionYear: 2023,
    revisedCompletionYear: 2026,
    delayMonths: 32,
    physicalProgressPercent: 92.5,
    financialProgressPercent: 90.1,
    riskScore: 36,
    riskTier: 'Low',
    status: 'On Track',
    primaryBottleneck: 'JNPT port connectivity packages in Maharashtra urban belt',
    contractor: 'Patel Engineering / IRB Infrastructure',
    lastInspected: '2026-03-16',
    sensorCount: 2300,
    droneTelemetryActive: true,
    auditNotes: []
  },
  {
    id: 'p-105',
    code: 'ZOJILA-09',
    name: 'Zojila All-Weather Tunnel (Srinagar-Leh Highway)',
    hindiName: 'ज़ोजिला सुरंग परियोजना',
    ministry: 'Road Transport & Highways',
    agency: 'NHIDCL',
    state: 'Ladakh / Jammu & Kashmir',
    location: { lat: 34.2801, lng: 75.4746 },
    originalCostCr: 6800,
    revisedCostCr: 8300,
    costOverrunPercent: 22.0,
    originalCompletionYear: 2026,
    revisedCompletionYear: 2028,
    delayMonths: 24,
    physicalProgressPercent: 61.2,
    financialProgressPercent: 64.0,
    riskScore: 78,
    riskTier: 'Critical',
    status: 'Critical Bottleneck',
    primaryBottleneck: 'Severe winter sub-zero freeze, high overburden rock bursts at Portal 1 & 2',
    contractor: 'Megha Engineering & Infrastructures Ltd (MEIL)',
    lastInspected: '2026-03-08',
    sensorCount: 420,
    droneTelemetryActive: false,
    auditNotes: []
  }
]

export const INITIAL_DIRECTIVES: Directive[] = [
  {
    id: 'dir-301',
    code: 'DIR/2026/MoSPI/092',
    title: 'Fast-Track Land Dispute Resolution - Palghar Bullet Train Stretch',
    targetMinistry: 'Railways / Govt of Maharashtra',
    leadAgency: 'NHSRCL',
    issuedBy: 'Additional Secretary (IPMD, MoSPI)',
    issuedDate: '2026-03-01',
    targetDate: '2026-04-15',
    status: 'In Progress',
    priority: 'Urgent',
    progressPercent: 78,
    actionItems: [
      { text: 'Convene Joint Taskforce meeting with Divisional Commissioner Konkan', done: true },
      { text: 'Deposit revised compensation packages in direct DBT escrow', done: true },
      { text: 'Handover clear physical possession of 4.2 hectares right-of-way', done: false }
    ]
  },
  {
    id: 'dir-302',
    code: 'DIR/2026/MoSPI/088',
    title: 'Emergency Geotechnical Audit for Zojila Tunnel Fault Line',
    targetMinistry: 'Road Transport & Highways',
    leadAgency: 'NHIDCL',
    issuedBy: 'Director General (Project Monitoring, MoSPI)',
    issuedDate: '2026-02-20',
    targetDate: '2026-03-25',
    status: 'In Progress',
    priority: 'Urgent',
    progressPercent: 60,
    actionItems: [
      { text: 'Deploy 3D electrical resistivity tomography (ERT) sensors', done: true },
      { text: 'Procure high-tensile steel fiber shotcrete from Srinagar depot', done: true }
    ]
  }
]
