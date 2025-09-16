import { QuizQuestion } from '../components/QuizComponent';
import { ActionPrompt } from '../components/QuizComponent';

export type ScoringCategory = 'timelyPainManagement' | 'clinicalJudgment' | 'communication' | 'culturalSafety' | 'biasMitigation';

export interface SceneData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  posterUrl?: string;
  audioNarration?: string;
  iframeUrl?: string;
  clinicalFindings?: string[];
  scoringCategories?: ScoringCategory[]; // Categories this scene contributes to
  vitals: {
    heartRate: number;
    systolic: number;
    diastolic: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    temperature: number;
    isAlarmOn: boolean;
    patientName: string;
    age: number;
    bedNumber: string;
    mrn: string;
    procedureTime: string;
  };
  quiz?: {
    questions: QuizQuestion[];
  };
  actionPrompt?: ActionPrompt;
  discussionPrompts?: string[];
}

export const scenes: SceneData[] = [
  {
    id: '1',
    title: 'Scene 1: EMS Handoff',
    description: 'Tobiloba "Tobi" Johnson, a 15-year-old with sickle cell disease, is being handed off from EMS to the emergency department team. His mother reports increasing pain over the past 2 days.',
    videoUrl: '',
    posterUrl: '',
    scoringCategories: ['timelyPainManagement', 'clinicalJudgment'],
    vitals: {
      heartRate: 126,
      systolic: 126,
      diastolic: 79,
      respiratoryRate: 24,
      oxygenSaturation: 98,
      temperature: 37.0,
      isAlarmOn: true,
      patientName: 'Johnson, Tobiloba "Tobi"',
      age: 15,
      bedNumber: '008',
      mrn: '14839412',
      procedureTime: ''
    },
    actionPrompt: {
      type: 'multi-select',
      title: 'Select initial actions for Tobi\'s care:',
      content: 'Choose the most appropriate initial interventions for a 15-year-old with sickle cell disease presenting with severe pain.',
      options: [
        'Delay meds and observe',
        'Begin focused assessment, establish IV, draw labs',
        'Administer oral meds and discharge'
      ],
      correctAnswers: ['Begin focused assessment, establish IV, draw labs'],
      explanation: 'Early aggressive management of VOC is key. Delay can worsen outcomes and risk ACS. Beginning focused assessment, establishing IV access, and drawing labs allows for prompt treatment and monitoring.'
    },
    discussionPrompts: [
      'What might the consequences of selecting "Delay meds and observe" or "Administer oral meds and discharge" be?',
      'How can implicit bias affect provider responses to Black youth presenting with pain?'
    ]
  },
  {
    id: '2',
    title: 'Initial Assessment',
    description: 'Tobi rates his pain as 9/10. The medical team needs to conduct an initial assessment and respond appropriately to the parent\'s concerns about pain management.',
    videoUrl: '', // Will be populated via admin or database
    iframeUrl: 'https://app.vectary.com/p/0S4bpLPueSyrn3zdyJNURg',
    scoringCategories: ['culturalSafety', 'communication'],
    clinicalFindings: [
      'Dry mucous membranes',
      'Guarding limbs, warm to touch',
      'Clear lung sounds'
    ],
    vitals: {
      heartRate: 118,
      systolic: 135,
      diastolic: 88,
      respiratoryRate: 22,
      oxygenSaturation: 97,
      temperature: 37.8,
      isAlarmOn: false,
      patientName: 'Johnson, Tobiloba "Tobi"',
      age: 15,
      bedNumber: '008',
      mrn: '14839412',
      procedureTime: ''
    },
    actionPrompt: {
      type: 'action-selection',
      title: 'Cultural Safety Prompt: How do you respond to the parent?',
      content: 'The parent expresses concern about their child\'s pain not being taken seriously. Choose the most culturally appropriate response.',
      options: [
        'A. "We treat everyone the same."',
        'B. "I understand your concern. We\'re taking his pain seriously."',
        'C. "Let\'s wait and see if it gets worse."'
      ],
      correctAnswers: ['B. "I understand your concern. We\'re taking his pain seriously."'],
      explanation: 'Cultural humility involves affirming parental concern and demonstrating commitment to pain relief. This response validates the family\'s experience and builds trust.'
    },
    discussionPrompts: [
      'Why might parents of children with SCD feel the need to advocate strongly?',
      'How can providers reduce this burden on families?'
    ]
  },
  {
    id: '3',
    title: 'Scene 3: Initial Management',
    description: 'Tobi\'s pain is being addressed with appropriate analgesia. The team needs to implement initial management interventions including hydration and monitoring.',
    videoUrl: '',
    scoringCategories: ['timelyPainManagement', 'clinicalJudgment'],
    vitals: {
      heartRate: 102,
      systolic: 125,
      diastolic: 80,
      respiratoryRate: 20,
      oxygenSaturation: 99,
      temperature: 37.1,
      isAlarmOn: false,
      patientName: 'Johnson, Tobiloba "Tobi"',
      age: 15,
      bedNumber: '008',
      mrn: '14839412',
      procedureTime: ''
    },
    actionPrompt: {
      type: 'multi-select',
      title: 'Select appropriate interventions for Tobi\'s continued care:',
      content: 'Choose all interventions that should be implemented for optimal hydration and monitoring.',
      options: [
        'Maintain IV fluids at 1.5-2.0 times maintenance',
        'Monitor intake and output closely',
        'Assess for signs of fluid overload',
        'Continue pain reassessment every 30 minutes',
        'Restrict all oral fluids',
        'Discontinue IV access'
      ],
      correctAnswers: [
        'Maintain IV fluids at 1.5-2.0 times maintenance',
        'Monitor intake and output closely',
        'Assess for signs of fluid overload',
        'Continue pain reassessment every 30 minutes'
      ],
      explanation: 'Adequate hydration is crucial in sickle cell crisis to help prevent further sickling and improve blood flow. Typically 1.5-2.0 times maintenance fluids are recommended unless contraindicated by cardiac or renal conditions. Close monitoring prevents complications while ensuring therapeutic benefit.'
    },
    discussionPrompts: [
      'Review the SBAR handoff described in the script. What makes it an effective and safe tool for interprofessional communication?',
      'The Charge Nurse, Monique Allen, is described as "calm, attentive, and authoritative". How does a charge nurse\'s leadership style influence team communication and overall patient care in a busy ED?'
    ]
  },
  {
    id: '4',
    title: 'Scene 4: Team Communication',
    description: 'Tobi\'s condition is stabilizing. The team needs to conduct effective SBAR handoff communication to ensure continuity of care and address family concerns.',
    videoUrl: '',
    scoringCategories: ['communication'],
    vitals: {
      heartRate: 95,
      systolic: 118,
      diastolic: 76,
      respiratoryRate: 18,
      oxygenSaturation: 99,
      temperature: 36.9,
      isAlarmOn: false,
      patientName: 'Johnson, Tobiloba "Tobi"',
      age: 15,
      bedNumber: '008',
      mrn: '14839412',
      procedureTime: ''
    },
    actionPrompt: {
      type: 'sbar',
      title: 'Conduct SBAR Handoff',
      content: 'Prepare a comprehensive SBAR handoff for the incoming team. Include all relevant clinical information and family concerns.',
      explanation: 'Effective SBAR communication ensures continuity of care and addresses both clinical needs and family concerns. This structured approach improves patient safety and team coordination.'
    },
    discussionPrompts: [
      'Review the SBAR handoff described in the script. What makes it an effective and safe tool for interprofessional communication?',
      'The Charge Nurse, Monique Allen, is described as "calm, attentive, and authoritative". How does a charge nurse\'s leadership style influence team communication and overall patient care in a busy ED?'
    ]
  },
  {
    id: '5',
    title: 'Scene 5: Reassessment (30 minutes)',
    description: 'Thirty minutes have passed since initial treatment. Tobi\'s pain persists despite opioids. The team must reassess and consider next steps including potential complications.',
    videoUrl: '',
    scoringCategories: ['timelyPainManagement', 'clinicalJudgment'],
    vitals: {
      heartRate: 110,
      systolic: 130,
      diastolic: 85,
      respiratoryRate: 26,
      oxygenSaturation: 94,
      temperature: 38.1,
      isAlarmOn: true,
      patientName: 'Johnson, Tobiloba "Tobi"',
      age: 15,
      bedNumber: '008',
      mrn: '14839412',
      procedureTime: ''
    },
    quiz: {
      questions: [
        {
          id: 'bias_response_6',
          type: 'multiple-choice',
          question: 'How do you respond to a team member who suggests Tobi might be exaggerating his pain?',
          options: [
            'Ignore the comment',
            'Address it privately and reinforce SCD pain protocols',
            'Agree silently with the concern'
          ],
          correctAnswer: 'Address it privately and reinforce SCD pain protocols',
          explanation: 'Addressing bias is critical. Studies show SCD patients often face stigma and inadequate analgesia. It\'s important to address these concerns privately while reinforcing evidence-based pain management protocols.'
        }
      ]
    },
    discussionPrompts: [
      'How can healthcare providers balance concerns around opioid prescribing with adequate pain treatment?',
      'What do we know about the actual pain severity of VOCs?'
    ]
  },
  {
    id: '6',
    title: 'Scene 6: Clinical Bias Challenge',
    description: 'A team member makes a comment suggesting Tobi might be exaggerating his pain. This scenario challenges the team to address clinical bias and ensure appropriate pain management.',
    videoUrl: '',
    scoringCategories: ['biasMitigation', 'culturalSafety'],
    vitals: {
      heartRate: 115,
      systolic: 140,
      diastolic: 90,
      respiratoryRate: 28,
      oxygenSaturation: 92,
      temperature: 38.5,
      isAlarmOn: true,
      patientName: 'Johnson, Tobiloba "Tobi"',
      age: 15,
      bedNumber: '008',
      mrn: '14839412',
      procedureTime: ''
    },
    quiz: {
      questions: [
        {
          id: 'bias_response_6',
          type: 'multiple-choice',
          question: 'How do you respond to a team member who suggests Tobi might be exaggerating his pain?',
          options: [
            'Ignore the comment',
            'Address it privately and reinforce SCD pain protocols',
            'Agree silently with the concern'
          ],
          correctAnswer: 'Address it privately and reinforce SCD pain protocols',
          explanation: 'Addressing bias is critical. Studies show SCD patients often face stigma and inadequate analgesia. It\'s important to address these concerns privately while reinforcing evidence-based pain management protocols.'
        }
      ]
    },
    discussionPrompts: [
      'How can healthcare providers balance concerns around opioid prescribing with adequate pain treatment?',
      'What do we know about the actual pain severity of VOCs?'
    ]
  },
  {
    id: '7',
    title: 'Scene 7: Complication Risk',
    description: 'Tobi develops chest pain and shortness of breath. The team must assess for acute chest syndrome and implement appropriate interventions.',
    videoUrl: '',
    scoringCategories: ['clinicalJudgment', 'timelyPainManagement'],
    vitals: {
      heartRate: 105,
      systolic: 128,
      diastolic: 82,
      respiratoryRate: 24,
      oxygenSaturation: 96,
      temperature: 37.8,
      isAlarmOn: false,
      patientName: 'Johnson, Tobiloba "Tobi"',
      age: 15,
      bedNumber: '008',
      mrn: '14839412',
      procedureTime: ''
    },
    actionPrompt: {
      type: 'multi-select',
      title: 'Select appropriate interventions for suspected acute chest syndrome:',
      content: 'Tobi is showing signs of acute chest syndrome. Choose all appropriate interventions.',
      options: [
        'Chest X-ray',
        'O2 via nasal cannula',
        'Notify hematology',
        'Continue current pain management only',
        'Discharge with oral antibiotics'
      ],
      correctAnswers: [
        'Chest X-ray',
        'O2 via nasal cannula',
        'Notify hematology'
      ],
      explanation: 'ACS is life-threatening. Early signs include desaturation and pain. Escalation is vital. Chest X-ray confirms diagnosis, oxygen therapy maintains oxygenation, and hematology consultation ensures expert management.'
    }
  },
  {
    id: '8',
    title: 'Scene 8: Admission Planning',
    description: 'Tobi\'s condition stabilizes with treatment. The team focuses on admission planning and continued care coordination.',
    videoUrl: '',
    scoringCategories: ['communication', 'clinicalJudgment'],
    vitals: {
      heartRate: 88,
      systolic: 120,
      diastolic: 75,
      respiratoryRate: 20,
      oxygenSaturation: 98,
      temperature: 37.2,
      isAlarmOn: false,
      patientName: 'Johnson, Tobiloba "Tobi"',
      age: 15,
      bedNumber: '008',
      mrn: '14839412',
      procedureTime: ''
    },
    actionPrompt: {
      type: 'multi-select',
      title: 'Select appropriate admission planning considerations:',
      content: 'Tobi will be admitted to the pediatric unit. Choose all relevant planning considerations for his continued care.',
      options: [
        'Coordinate with pediatric hematology team',
        'Ensure pain management protocol continuity',
        'Plan for family education and support',
        'Monitor for complications of acute chest syndrome',
        'Discharge immediately to reduce hospital exposure',
        'Restrict family visitation'
      ],
      correctAnswers: [
        'Coordinate with pediatric hematology team',
        'Ensure pain management protocol continuity',
        'Plan for family education and support',
        'Monitor for complications of acute chest syndrome'
      ],
      explanation: 'Comprehensive admission planning includes specialist consultation, pain management continuity, family support, and ongoing monitoring. These elements ensure optimal care coordination and patient outcomes.'
    },
  },
  {
    id: '9',
    title: 'Scene 9: Debrief & Reflection',
    description: 'Tobi\'s pain is well-controlled and vital signs have normalized. The team reflects on the care provided and lessons learned from this experience.',
    videoUrl: '',
    scoringCategories: ['culturalSafety', 'biasMitigation'],
    vitals: {
      heartRate: 82,
      systolic: 115,
      diastolic: 72,
      respiratoryRate: 18,
      oxygenSaturation: 100,
      temperature: 36.8,
      isAlarmOn: false,
      patientName: 'Johnson, Tobiloba "Tobi"',
      age: 15,
      bedNumber: '008',
      mrn: '14839412',
      procedureTime: ''
    },
    actionPrompt: {
      type: 'reflection',
      title: 'Debrief & Reflection',
      content: 'What did you learn from this experience? Reflect on the clinical decisions, communication approaches, and cultural competency demonstrated throughout Tobi\'s care.',
      explanation: 'Reflection is essential for professional growth and improved patient care. Consider how cultural humility, evidence-based practice, and effective communication contributed to positive outcomes.'
    },
    discussionPrompts: [
      'Looking back, how did the domains of Communication and Cultural Safety directly impact Timely Pain Management and Clinical Judgment in this scenario?',
      'What was the most critical moment or decision point in this simulation that could significantly change the outcome for Tobi?',
      'Reflecting on the challenges and biases presented, what is one concrete action you can incorporate into your practice to provide more equitable and effective care for patients with sickle cell disease?'
    ]
  },
  {
    id: '10',
    title: 'Simulation Complete',
    description: 'You have successfully completed the sickle cell crisis management simulation. Review your performance and continue your learning journey.',
    videoUrl: '',
    vitals: {
      heartRate: 78,
      systolic: 110,
      diastolic: 70,
      respiratoryRate: 16,
      oxygenSaturation: 100,
      temperature: 36.7,
      isAlarmOn: false,
      patientName: 'Johnson, Tobiloba "Tobi"',
      age: 15,
      bedNumber: '008',
      mrn: '14839412',
      procedureTime: ''
    },
    isCompletionScene: true
  }
];