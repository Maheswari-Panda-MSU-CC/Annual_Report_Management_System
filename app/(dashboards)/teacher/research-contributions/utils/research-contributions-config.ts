/**
 * Configuration for Research Contributions Module
 * Centralized configuration for routes, API endpoints, and section metadata
 */

export const SECTION_ROUTES = {
  patents: "/teacher/research-contributions/patents/add",
  policy: "/teacher/research-contributions/policy/add",
  econtent: "/teacher/research-contributions/econtent/add",
  consultancy: "/teacher/research-contributions/consultancy/add",
  collaborations: "/teacher/research-contributions/collaborations/add",
  visits: "/teacher/research-contributions/visits/add",
  financial: "/teacher/research-contributions/financial/add",
  jrfSrf: "/teacher/research-contributions/jrf-srf/add",
  phd: "/teacher/research-contributions/phd/add",
  copyrights: "/teacher/research-contributions/copyrights/add",
} as const

export const API_ENDPOINTS = {
  patents: "/api/teacher/research-contributions/patents",
  policy: "/api/teacher/research-contributions/policy",
  econtent: "/api/teacher/research-contributions/e-content",
  consultancy: "/api/teacher/research-contributions/consultancy",
  collaborations: "/api/teacher/research-contributions/collaborations",
  visits: "/api/teacher/research-contributions/visits",
  financial: "/api/teacher/research-contributions/financial-support",
  jrfSrf: "/api/teacher/research-contributions/jrf-srf",
  phd: "/api/teacher/research-contributions/phd-guidance",
  copyrights: "/api/teacher/research-contributions/copyrights",
} as const

export const DELETE_CONFIG = {
  patents: { 
    endpoint: API_ENDPOINTS.patents, 
    param: 'patentId', 
    successMessage: 'Patent deleted successfully!' 
  },
  policy: { 
    endpoint: API_ENDPOINTS.policy, 
    param: 'policyId', 
    successMessage: 'Policy document deleted successfully!' 
  },
  econtent: { 
    endpoint: API_ENDPOINTS.econtent, 
    param: 'eContentId', 
    successMessage: 'E-Content deleted successfully!' 
  },
  consultancy: { 
    endpoint: API_ENDPOINTS.consultancy, 
    param: 'consultancyId', 
    successMessage: 'Consultancy record deleted successfully!' 
  },
  collaborations: { 
    endpoint: API_ENDPOINTS.collaborations, 
    param: 'collaborationId', 
    successMessage: 'Collaboration deleted successfully!' 
  },
  visits: { 
    endpoint: API_ENDPOINTS.visits, 
    param: 'visitId', 
    successMessage: 'Academic research visit deleted successfully!' 
  },
  financial: { 
    endpoint: API_ENDPOINTS.financial, 
    param: 'financialSupportId', 
    successMessage: 'Financial support record deleted successfully!' 
  },
  jrfSrf: { 
    endpoint: API_ENDPOINTS.jrfSrf, 
    param: 'jrfSrfId', 
    successMessage: 'JRF/SRF record deleted successfully!' 
  },
  phd: { 
    endpoint: API_ENDPOINTS.phd, 
    param: 'phdStudentId', 
    successMessage: 'PhD student record deleted successfully!' 
  },
  copyrights: { 
    endpoint: API_ENDPOINTS.copyrights, 
    param: 'copyrightId', 
    successMessage: 'Copyright record deleted successfully!' 
  },
} as const

export type SectionId = keyof typeof SECTION_ROUTES

