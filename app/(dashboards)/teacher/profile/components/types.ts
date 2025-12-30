
export interface ComponentBaseProps {
  teacherId: number
  onRefresh?: () => Promise<void>
}

export interface ExperienceSectionProps extends ComponentBaseProps {
  experienceForm: any
  experienceFields: any[]
  experienceEditingIds: Set<number>
  isSavingExperience: Record<number, boolean>
  hasAnyEditMode: boolean
  hasAnyRecordEditing?: boolean
  onAddEntry: () => void
  onSaveRow: (index: number, id: number) => Promise<void>
  onCancelRow: (index: number, id: number) => Promise<void>
  onDeleteRow: (index: number, id: number) => Promise<void>
  onToggleEdit: (id: number) => void
}

export interface PhdResearchSectionProps extends ComponentBaseProps {
  postDocForm: any
  postDocFields: any[]
  postDocEditingIds: Set<number>
  isSavingPostDoc: Record<number, boolean>
  phdDocumentUrls: Record<number, string>
  phdDialogOpen: Record<number, boolean>
  phdViewDialogOpen: Record<number, boolean>
  hasAnyEditMode: boolean
  hasAnyRecordEditing?: boolean
  onAddEntry: () => void
  onSaveRow: (index: number, id: number) => Promise<void>
  onCancelRow: (index: number, id: number) => Promise<void>
  onDeleteRow: (index: number, id: number) => Promise<void>
  onToggleEdit: (id: number) => void
  onDocumentUrlChange: (id: number, url: string | null) => void
  onDialogOpenChange: (id: number, open: boolean) => void
  onViewDialogOpenChange: (id: number, open: boolean) => void
  onRefresh?: () => Promise<void>
}

export interface EducationSectionProps extends ComponentBaseProps {
  educationForm: any
  educationFields: any[]
  educationEditingIds: Set<number>
  isSavingEducation: Record<number, boolean>
  educationDocumentUrls: Record<number, string>
  educationDialogOpen: Record<number, boolean>
  educationViewDialogOpen: Record<number, boolean>
  hasAnyEditMode: boolean
  hasAnyRecordEditing?: boolean
  onAddEntry: () => void
  onSaveRow: (index: number, id: number) => Promise<void>
  onCancelRow: (index: number, id: number) => Promise<void>
  onDeleteRow: (index: number, id: number) => Promise<void>
  onToggleEdit: (id: number) => void
  onDocumentUrlChange: (id: number, url: string | null) => void
  onDialogOpenChange: (id: number, open: boolean) => void
  onViewDialogOpenChange: (id: number, open: boolean) => void
  degreeTypeOptions: any[]
}

