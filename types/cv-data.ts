// CV Data Types - Centralized type definitions for CV generation

export interface PersonalInfo {
  name: string
  designation: string
  department: string
  institution: string
  email: string
  phone: string
  dateOfBirth: string
  orcid: string
  profileImage?: string | null
  googleScholar?: string
  researchGate?: string,
  faculty:string
}

export interface CVData {
  personal: PersonalInfo | null
  education: any[]
  postdoc: any[]
  experience: any[]
  research: any[]
  patents: any[]
  econtent: any[]
  consultancy: any[]
  collaborations: any[]
  phdguidance: any[]
  books: any[]
  papers: any[]
  articles: any[]
  awards: any[]
  talks: any[]
  academic_contribution: any[]
  academic_participation: any[]
  committees: any[]
  performance: any[]
  extension: any[]
  orientation: any[]
}

