"use client"

import React from "react"
import { Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { User, Camera, Save, X, Edit, Upload, Download, Trash2, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { TeacherInfo, Faculty, Department, Designation } from "@/types/interfaces"

interface PersonalInfoSectionProps {
  teacherInfo: TeacherInfo | null
  facultyData: Faculty | null
  departmentData: Department | null
  designationData: Designation | null
  profileImage: string | null
  isEditingPersonal: boolean
  isSavingPersonal: boolean
  isUploadingImage: boolean
  pendingProfileImageFile: File | null
  editingData: any
  facultyOptions: any[]
  departmentOptions: any[]
  permanentDesignationOptions: any[]
  temporaryDesignationOptions: any[]
  selectedFacultyId: number | null
  hasAnyEditMode: boolean
  isPersonalDirty: boolean
  hasAnyRecordEditing?: boolean
  onEditClick: () => void
  onSave: (data: any) => Promise<void>
  onCancel: () => void
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onDownloadImage: () => void
  onRemoveImage: () => void
  onCheckboxChange: (field: string, checked: boolean) => void
  onEditingDataChange?: (field: string, value: string | boolean) => void
  onFacultyChange?: (facultyId: number | null) => void
  onSaveAcademicYears: () => Promise<void>
  isSavingAcademicYears: boolean
  onAcademicYearChange?: (field: string, checked: boolean) => void
  // Form methods from react-hook-form (passed from parent)
  control: any
  register: any
  watch: any
  setValue: any
  errors: any
  touchedFields: any
  handlePersonalSubmit: () => void
  handleCancelPersonal: () => void
  triggerImageUpload: () => void
  setEditingData?: (updater: (prev: any) => any) => void
  setTeacherInfo?: (updater: TeacherInfo | ((prev: TeacherInfo | null) => TeacherInfo | null)) => void
}

export function PersonalInfoSection({
  teacherInfo,
  facultyData,
  departmentData,
  designationData,
  profileImage,
  isEditingPersonal,
  isSavingPersonal,
  isUploadingImage,
  editingData,
  facultyOptions,
  departmentOptions,
  permanentDesignationOptions,
  temporaryDesignationOptions,
  selectedFacultyId,
  hasAnyRecordEditing = false,
  onEditClick,
  onImageUpload,
  onDownloadImage,
  onRemoveImage,
  onCheckboxChange,
  onEditingDataChange,
  onSaveAcademicYears,
  isSavingAcademicYears,
  onAcademicYearChange,
  // Form methods from parent
  control,
  register,
  watch,
  setValue,
  errors,
  touchedFields,
  handlePersonalSubmit,
  handleCancelPersonal,
  triggerImageUpload,
  setEditingData,
  setTeacherInfo,
}: PersonalInfoSectionProps) {


  return (
    <>
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">Your personal and academic details</CardDescription>
            </div>
            {!isEditingPersonal ? (
              <Button 
                onClick={onEditClick} 
                className="flex items-center gap-2 w-full sm:w-auto" 
                size="sm"
                disabled={hasAnyRecordEditing}
                title={hasAnyRecordEditing ? "Please save or cancel the currently editing record first" : "Edit Personal Info"}
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit Personal Info</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={handlePersonalSubmit} disabled={isSavingPersonal} className="flex items-center gap-2 w-full sm:w-auto" size="sm">
                  {isSavingPersonal ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Saving...</span>
                      <span className="sm:hidden">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span className="hidden sm:inline">Save Changes</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelPersonal}
                  disabled={isSavingPersonal}
                  className="flex items-center gap-2 bg-transparent w-full sm:w-auto"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 w-full">
            <div className="space-y-3 sm:space-y-4 w-full">
              {/* Profile Photo Section */}
              <div className="col-span-full flex flex-col items-center space-y-2 sm:space-y-3 w-full">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 sm:border-4 border-white shadow-lg">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement
                          console.error("Profile image load error:", {
                            url: profileImage,
                            src: target?.src,
                            errorMessage: "Image failed to load"
                          })
                          if (!profileImage?.includes('s3.amazonaws.com') && !profileImage?.includes('amazonaws.com')) {
                            // Only clear if not S3 URL
                          }
                        }}
                        onLoad={() => {
                          console.log("Profile image loaded successfully:", profileImage)
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <User className="h-12 w-12 sm:h-16 sm:w-16 text-blue-400" />
                      </div>
                    )}
                  </div>
                  {isEditingPersonal && (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            disabled={isUploadingImage}
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Profile image options"
                          >
                            {isUploadingImage ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 sm:w-56">
                          {teacherInfo?.ProfileImage && (
                            <>
                              <DropdownMenuItem
                                onClick={onDownloadImage}
                                disabled={isUploadingImage}
                                className="cursor-pointer"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                <span className="text-xs sm:text-sm">Download Profile Image</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={triggerImageUpload}
                            disabled={isUploadingImage}
                            className="cursor-pointer"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            <span className="text-xs sm:text-sm">
                              {teacherInfo?.ProfileImage ? "Update Profile Image" : "Upload Profile Image"}
                            </span>
                          </DropdownMenuItem>
                          {teacherInfo?.ProfileImage && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={onRemoveImage}
                                disabled={isUploadingImage}
                                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span className="text-xs sm:text-sm">Remove Profile Image</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <input
                        id="profile-image-input"
                        type="file"
                        accept="image/jpeg,image/jpg"
                        onChange={onImageUpload}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-medium text-xs sm:text-sm">{`${teacherInfo?.Abbri} ${teacherInfo?.fname} ${teacherInfo?.lname}`}</p>
                  <p className="text-xs text-muted-foreground">{designationData?.name}</p>
                  <p className="text-xs text-muted-foreground">{departmentData?.name}</p>
                </div>
                {isEditingPersonal && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">Click the camera icon to upload a profile picture</p>
                    <p className="text-xs text-gray-400">Supported: JPG, JPEG (Max 1MB)</p>
                  </div>
                )}
              </div>

              {/* Basic Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Basic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="salutation" className="text-sm font-medium">
                      Salutation <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="Abbri"
                      rules={{
                        required: isEditingPersonal ? "Salutation is required" : false
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Select
                            value={field.value}
                            onValueChange={(v: string) => field.onChange(v)}
                            disabled={!isEditingPersonal || isSavingPersonal}
                          >
                            <SelectTrigger className={`h-10 text-base ${!isEditingPersonal ? "bg-[#f9fafb] text-foreground cursor-default opacity-100" : ""} ${error ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Select salutation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Dr.">Dr.</SelectItem>
                              <SelectItem value="Prof.">Prof.</SelectItem>
                              <SelectItem value="Mr.">Mr.</SelectItem>
                              <SelectItem value="Ms.">Ms.</SelectItem>
                              <SelectItem value="Mrs.">Mrs.</SelectItem>
                              <SelectItem value="Shri.">Shri.</SelectItem>
                              <SelectItem value="Er.">Er.</SelectItem>
                            </SelectContent>
                          </Select>
                          {error && isEditingPersonal && (
                            <p className="text-xs text-red-500 mt-1">{error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="firstName" 
                      className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${errors.fname ? 'border-red-500' : ''}`}
                      {...register('fname', {
                        required: isEditingPersonal ? "First name is required" : false,
                        minLength: {
                          value: 3,
                          message: "First name must be at least 3 characters"
                        },
                        pattern: {
                          value: /^[A-Za-z\s'-]+$/,
                          message: "First name should only contain letters, spaces, hyphens, or apostrophes"
                        }
                      })} 
                      readOnly={!isEditingPersonal || isSavingPersonal}
                      disabled={isSavingPersonal} 
                    />
                    {errors.fname && isEditingPersonal && touchedFields.fname && (
                      <p className="text-xs text-red-500 mt-1">{errors.fname.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName" className="text-sm font-medium">Middle Name</Label>
                    <Input 
                      id="middleName" 
                      className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${errors.mname ? 'border-red-500' : ''}`}
                      {...register('mname', {
                        validate: (value: string) => {
                          if (!value || value.trim() === '') return true;
                          if (value.length < 3) {
                            return "Middle name must be at least 3 characters if provided";
                          }
                          if (!/^[A-Za-z\s'-]+$/.test(value)) {
                            return "Middle name should only contain letters, spaces, hyphens, or apostrophes";
                          }
                          return true;
                        }
                      })} 
                      readOnly={!isEditingPersonal || isSavingPersonal}
                      disabled={isSavingPersonal} 
                    />
                    {errors.mname && isEditingPersonal && touchedFields.mname && (
                      <p className="text-xs text-red-500 mt-1">{errors.mname.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="lastName" 
                      className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${errors.lname ? 'border-red-500' : ''}`}
                      {...register('lname', {
                        required: isEditingPersonal ? "Last name is required" : false,
                        minLength: {
                          value: 3,
                          message: "Last name must be at least 3 characters"
                        },
                        pattern: {
                          value: /^[A-Za-z\s'-]+$/,
                          message: "Last name should only contain letters, spaces, hyphens, or apostrophes"
                        }
                      })} 
                      readOnly={!isEditingPersonal || isSavingPersonal}
                      disabled={isSavingPersonal} 
                    />
                    {errors.lname && isEditingPersonal && touchedFields.lname && (
                      <p className="text-xs text-red-500 mt-1">{errors.lname.message as string}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      {...register('email_id')} 
                      readOnly 
                      className="h-10 text-base bg-[#f9fafb] text-foreground cursor-default" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="phone_no"
                      rules={{
                        required: isEditingPersonal ? "Phone number is required" : false,
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Phone number must contain exactly 10 digits"
                        },
                        minLength: {
                          value: 10,
                          message: "Phone number must be exactly 10 digits"
                        },
                        maxLength: {
                          value: 10,
                          message: "Phone number must be exactly 10 digits"
                        }
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            id="phone"
                            type="tel"
                            {...field}
                            value={field.value || ''}
                            className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${error ? 'border-red-500' : ''}`}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                              field.onChange(value);
                            }}
                            readOnly={!isEditingPersonal || isSavingPersonal}
                            disabled={isSavingPersonal}
                            placeholder="Enter 10 digit phone number"
                            maxLength={10}
                          />
                          {error && isEditingPersonal && (
                            <p className="text-xs text-red-500 mt-1">{error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Personal Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Additional Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="gender"
                      rules={{
                        required: isEditingPersonal ? "Gender is required" : false
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Select
                            value={field.value || ''}
                            onValueChange={(v: string) => field.onChange(v)}
                            disabled={!isEditingPersonal || isSavingPersonal}
                          >
                            <SelectTrigger className={`h-10 text-base ${!isEditingPersonal ? "bg-[#f9fafb] text-foreground cursor-default opacity-100" : ""} ${error ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {error && isEditingPersonal && (
                            <p className="text-xs text-red-500 mt-1">{error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                      Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="DOB"
                      rules={{
                        required: isEditingPersonal ? "Date of birth is required" : false,
                        validate: (value: string) => {
                          if (!value || (typeof value === 'string' && value.trim() === '')) {
                            if (isEditingPersonal) return "Date of birth is required";
                            return true;
                          }
                          const dob = new Date(value);
                          if (isNaN(dob.getTime())) {
                            if (isEditingPersonal) return "Please enter a valid date";
                            return true;
                          }
                          const today = new Date();
                          const age = today.getFullYear() - dob.getFullYear();
                          const monthDiff = today.getMonth() - dob.getMonth();
                          
                          if (dob > today) {
                            return "Date of birth cannot be in the future";
                          }
                          if (age < 18 || (age === 18 && monthDiff < 0)) {
                            return "Age must be at least 18 years";
                          }
                          if (age > 100) {
                            return "Please enter a valid date of birth";
                          }
                          return true;
                        }
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            {...field}
                            max={new Date().toISOString().split('T')[0]}
                            readOnly={!isEditingPersonal || isSavingPersonal}
                            disabled={isSavingPersonal}
                            className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${error ? 'border-red-500' : ''}`}
                          />
                          {error && isEditingPersonal && (
                            <p className="text-xs text-red-500 mt-1">{error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfJoining" className="text-sm font-medium">
                      Date of Joining <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="recruit_date"
                      rules={{
                        required: isEditingPersonal ? "Date of joining is required" : false,
                        validate: (value: string) => {
                          if (!value || (typeof value === 'string' && value.trim() === '')) {
                            if (isEditingPersonal) return "Date of joining is required";
                            return true;
                          }
                          const joinDate = new Date(value);
                          if (isNaN(joinDate.getTime())) {
                            if (isEditingPersonal) return "Please enter a valid date";
                            return true;
                          }
                          const today = new Date();
                          const dob = watch('DOB') ? new Date(watch('DOB')) : null;
                          
                          if (joinDate > today) {
                            return "Date of joining cannot be in the future";
                          }
                          if (dob && !isNaN(dob.getTime()) && joinDate < dob) {
                            return "Date of joining must be after date of birth";
                          }
                          return true;
                        }
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            id="dateOfJoining"
                            type="date"
                            {...field}
                            max={new Date().toISOString().split('T')[0]}
                            readOnly={!isEditingPersonal || isSavingPersonal}
                            disabled={isSavingPersonal}
                            className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${error ? 'border-red-500' : ''}`}
                          />
                          {error && isEditingPersonal && (
                            <p className="text-xs text-red-500 mt-1">{error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panNo" className="text-sm font-medium">
                      PAN Number <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="PAN_No"
                      rules={{
                        required: isEditingPersonal ? "PAN number is required" : false,
                        validate: (value: string) => {
                          if (!value || (typeof value === 'string' && value.trim() === '')) {
                            if (isEditingPersonal) return "PAN number is required";
                            return true;
                          }
                          const panValue = String(value).trim().toUpperCase();
                          if (panValue.length !== 10) {
                            return "PAN number must be exactly 10 characters";
                          }
                          if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panValue)) {
                            return "PAN must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)";
                          }
                          return true;
                        }
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            id="panNo"
                            {...field}
                            onChange={(e) => {
                              const upperValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
                              field.onChange(upperValue);
                            }}
                            readOnly={!isEditingPersonal || isSavingPersonal}
                            disabled={isSavingPersonal}
                            placeholder="ABCDE1234F"
                            maxLength={10}
                            className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${error ? 'border-red-500' : ''}`}
                          />
                          {error && isEditingPersonal && (
                            <p className="text-xs text-red-500 mt-1">{error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Research Metrics */}
              <div className="space-y-4">
                <h4 className="text-xs sm:text-sm font-medium">Research Metrics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="hIndex" className="text-sm font-medium">H-Index</Label>
                    <Input 
                      id="hIndex" 
                      type="number" 
                      {...register('H_INDEX', {
                        min: { value: 0, message: "H-Index must be a positive number" },
                        max: { value: 200, message: "H-Index value seems too high" },
                        valueAsNumber: true,
                        validate: (value: number | undefined) => {
                          if (value !== undefined && value !== null) {
                            if (!Number.isInteger(Number(value))) {
                              return "H-Index must be a whole number";
                            }
                          }
                          return true;
                        }
                      })} 
                      readOnly={!isEditingPersonal || isSavingPersonal}
                      disabled={isSavingPersonal} 
                      placeholder="Enter H-Index"
                      className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${errors.H_INDEX ? 'border-red-500' : ''}`}
                    />
                    {errors.H_INDEX && isEditingPersonal && touchedFields.H_INDEX && (
                      <p className="text-xs text-red-500 mt-1">{errors.H_INDEX.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="i10Index" className="text-sm font-medium">i10-Index</Label>
                    <Input 
                      id="i10Index" 
                      type="number" 
                      {...register('i10_INDEX', {
                        min: { value: 0, message: "i10-Index must be a positive number" },
                        max: { value: 200, message: "i10-Index value seems too high" },
                        valueAsNumber: true,
                        validate: (value: number | undefined) => {
                          if (value !== undefined && value !== null) {
                            if (!Number.isInteger(Number(value))) {
                              return "i10-Index must be a whole number";
                            }
                          }
                          return true;
                        }
                      })} 
                      readOnly={!isEditingPersonal || isSavingPersonal}
                      disabled={isSavingPersonal} 
                      placeholder="Enter i10-Index"
                      className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${errors.i10_INDEX ? 'border-red-500' : ''}`}
                    />
                    {errors.i10_INDEX && isEditingPersonal && touchedFields.i10_INDEX && (
                      <p className="text-xs text-red-500 mt-1">{errors.i10_INDEX.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="citations" className="text-sm font-medium">Citations</Label>
                    <Input 
                      id="citations" 
                      type="number" 
                      {...register('CITIATIONS', {
                        min: { value: 0, message: "Citations must be a positive number" },
                        max: { value: 1000000, message: "Citations value seems too high" },
                        valueAsNumber: true,
                        validate: (value: number | undefined) => {
                          if (value !== undefined && value !== null) {
                            if (!Number.isInteger(Number(value))) {
                              return "Citations must be a whole number";
                            }
                          }
                          return true;
                        }
                      })} 
                      readOnly={!isEditingPersonal || isSavingPersonal}
                      disabled={isSavingPersonal} 
                      placeholder="Enter total citations"
                      className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${errors.CITIATIONS ? 'border-red-500' : ''}`}
                    />
                    {errors.CITIATIONS && isEditingPersonal && touchedFields.CITIATIONS && (
                      <p className="text-xs text-red-500 mt-1">{errors.CITIATIONS.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orcidId" className="text-sm font-medium">ORCHID ID</Label>
                    <Input 
                      id="orcidId" 
                      {...register('ORCHID_ID', {
                        pattern: {
                          value: /^(\d{4}-){3}\d{3}[\dX]$/,
                          message: "Invalid ORCID ID format (e.g., 0000-0000-0000-0000)"
                        }
                      })} 
                      readOnly={!isEditingPersonal || isSavingPersonal}
                      disabled={isSavingPersonal} 
                      placeholder="0000-0000-0000-0000"
                      maxLength={19}
                      className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${errors.ORCHID_ID ? 'border-red-500' : ''}`}
                    />
                    {errors.ORCHID_ID && isEditingPersonal && touchedFields.ORCHID_ID && (
                      <p className="text-xs text-red-500 mt-1">{errors.ORCHID_ID.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="researcherId" className="text-sm font-medium">Researcher ID</Label>
                    <Input 
                      id="researcherId" 
                      {...register('RESEARCHER_ID', {
                        maxLength: {
                          value: 100,
                          message: "Researcher ID must be less than 100 characters"
                        },
                        validate: (value: string) => {
                          if (!value || value.trim() === '') {
                            return true;
                          }
                          if (value.length < 3) {
                            return "Researcher ID must be at least 3 characters";
                          }
                          if (!/^[A-Za-z0-9._-]+$/.test(value)) {
                            return "Researcher ID can only contain letters, numbers, dots, hyphens, and underscores";
                          }
                          return true;
                        }
                      })} 
                      readOnly={!isEditingPersonal || isSavingPersonal}
                      disabled={isSavingPersonal} 
                      placeholder="Enter Researcher ID"
                      maxLength={100}
                      className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${errors.RESEARCHER_ID ? 'border-red-500' : ''}`}
                    />
                    {errors.RESEARCHER_ID && isEditingPersonal && touchedFields.RESEARCHER_ID && (
                      <p className="text-xs text-red-500 mt-1">{errors.RESEARCHER_ID.message as string}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Teaching Status */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Teaching Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="teachingStatus" className="text-sm font-medium">
                      Teaching Status <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="perma_or_tenure"
                      render={({ field }) => (
                        <Select
                          value={field.value === false ? "Permanent" : "Tenured"}
                          onValueChange={(value: string) => {
                            const isPermanent = value === "Permanent";
                            field.onChange(isPermanent ? false : true);
                          }}
                          disabled={!isEditingPersonal || isSavingPersonal}
                        >
                          <SelectTrigger className={`h-10 text-base ${!isEditingPersonal ? "bg-[#f9fafb] text-foreground cursor-default opacity-100" : ""}`}>
                            <SelectValue placeholder="Select teaching status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tenured">Tenured</SelectItem>
                            <SelectItem value="Permanent">Permanent</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Academic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="designation" className="text-sm font-medium">
                      Designation <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name={watch('perma_or_tenure') === false ? 'desig_perma' : 'desig_tenure'}
                      rules={{
                        required: isEditingPersonal ? "Designation is required" : false
                      }}
                      render={({ field }) => {
                        const designationOptions = watch('perma_or_tenure') === false 
                          ? permanentDesignationOptions 
                          : temporaryDesignationOptions
                        return (
                          <SearchableSelect
                            options={designationOptions.map((desig) => ({
                              value: desig.id,
                              label: desig.name,
                            }))}
                            value={field.value}
                            onValueChange={(v: string | number) => field.onChange(Number(v))}
                            placeholder="Select designation"
                            disabled={!isEditingPersonal || isSavingPersonal}
                            emptyMessage="No designation found."
                            className={`w-full min-w-0 ${!isEditingPersonal ? "bg-[#f9fafb] text-foreground opacity-100" : ""}`}
                          />
                        )
                      }}
                    />
                    {errors.desig_perma && isEditingPersonal && touchedFields.desig_perma && (
                      <p className="text-xs text-red-500 mt-1">{errors.desig_perma.message as string}</p>
                    )}
                    {errors.desig_tenure && isEditingPersonal && touchedFields.desig_tenure && (
                      <p className="text-xs text-red-500 mt-1">{errors.desig_tenure.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faculty" className="text-sm font-medium">
                      Faculty <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="faculty"
                      rules={{
                        required: isEditingPersonal ? "Faculty is required" : false
                      }}
                      render={({ field }) => (
                        <SearchableSelect
                          options={facultyOptions.map((faculty) => ({
                            value: faculty.Fid,
                            label: faculty.Fname,
                          }))}
                          value={field.value ?? selectedFacultyId ?? facultyData?.Fid ?? undefined}
                          onValueChange={() => {
                            // Disabled - no changes allowed
                          }}
                          placeholder="Select faculty"
                          disabled={true}
                          emptyMessage="No faculty found."
                          className="w-full min-w-0 bg-[#f9fafb] text-foreground opacity-100"
                        />
                      )}
                    />
                    {errors.faculty && isEditingPersonal && touchedFields.faculty && (
                      <p className="text-xs text-red-500 mt-1">{errors.faculty.message as string}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium">
                      Department <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="deptid"
                      rules={{
                        required: isEditingPersonal ? "Department is required" : false,
                        validate: (value) => {
                          const facultyValue = watch('faculty');
                          if (isEditingPersonal && !facultyValue) {
                            return "Please select a faculty first";
                          }
                          if (isEditingPersonal && !value) {
                            return "Department is required";
                          }
                          return true;
                        }
                      }}
                      render={({ field }) => {
                        const facultyValue = watch('faculty');
                        return (
                          <SearchableSelect
                            options={departmentOptions.map((dept) => ({
                              value: dept.Deptid,
                              label: dept.name,
                            }))}
                            value={field.value}
                            onValueChange={() => {
                              // Disabled - no changes allowed
                            }}
                            placeholder="Select department"
                            disabled={true}
                            emptyMessage={!facultyValue ? "Please select a faculty first" : "No department found."}
                            className="w-full min-w-0 bg-[#f9fafb] text-foreground opacity-100"
                          />
                        );
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Qualification Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Qualification Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Qualified NET Exam <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={watch('NET') ? "yes" : "no"}
                        onValueChange={(value: string) => setValue('NET', value === 'yes')}
                        className={`flex gap-6 ${!isEditingPersonal || isSavingPersonal ? "pointer-events-none" : ""}`}
                        disabled={isSavingPersonal}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="net-yes" />
                          <Label htmlFor="net-yes" className="text-sm">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="net-no" />
                          <Label htmlFor="net-no" className="text-sm">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    {watch('NET') && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="netYear" className="text-sm font-medium">
                            NET Qualified Year <span className="text-red-500">*</span>
                          </Label>
                          <Controller
                            control={control}
                            name="NET_year"
                            rules={{
                              required: watch('NET') && isEditingPersonal ? "NET qualified year is required" : false,
                              validate: (value) => {
                                if (watch('NET') && isEditingPersonal) {
                                  if (!value || value.toString().trim() === '') {
                                    return "NET qualified year is required";
                                  }
                                  const yearStr = value.toString().trim();
                                  if (yearStr.length !== 4) {
                                    return "Year must be 4 digits";
                                  }
                                  const year = parseInt(yearStr);
                                  const currentYear = new Date().getFullYear();
                                  if (isNaN(year) || year < 1950 || year > currentYear) {
                                    return `Year must be between 1950 and ${currentYear}`;
                                  }
                                }
                                return true;
                              }
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <div>
                                <Input
                                  id="netYear"
                                  {...field}
                                  onChange={(e) => {
                                    const year = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    field.onChange(year);
                                  }}
                                  readOnly={!isEditingPersonal || isSavingPersonal}
                                  disabled={isSavingPersonal}
                                  placeholder="YYYY (e.g., 2018)"
                                  maxLength={4}
                                  className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${error ? 'border-red-500' : ''}`}
                                />
                                {error && isEditingPersonal && (
                                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                                )}
                              </div>
                            )}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Qualified GATE Exam <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={watch('GATE') ? "yes" : "no"}
                        onValueChange={(value: string) => setValue('GATE', value === 'yes')}
                        className={`flex gap-6 ${!isEditingPersonal || isSavingPersonal ? "pointer-events-none" : ""}`}
                        disabled={isSavingPersonal}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="gate-yes" />
                          <Label htmlFor="gate-yes" className="text-sm">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="gate-no" />
                          <Label htmlFor="gate-no" className="text-sm">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    {watch('GATE') && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="gateYear" className="text-sm font-medium">GATE Qualified Year</Label>
                          <Controller
                            control={control}
                            name="GATE_year"
                            rules={{
                              required: watch('GATE') && isEditingPersonal ? "GATE qualified year is required" : false,
                              validate: (value) => {
                                if (watch('GATE') && isEditingPersonal) {
                                  if (!value || value.toString().trim() === '') {
                                    return "GATE qualified year is required";
                                  }
                                  const yearStr = value.toString().trim();
                                  if (yearStr.length !== 4) {
                                    return "Year must be 4 digits";
                                  }
                                  const year = parseInt(yearStr);
                                  const currentYear = new Date().getFullYear();
                                  if (isNaN(year) || year < 1950 || year > currentYear) {
                                    return `Year must be between 1950 and ${currentYear}`;
                                  }
                                }
                                return true;
                              }
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <div>
                                <Input
                                  id="gateYear"
                                  {...field}
                                  onChange={(e) => {
                                    const year = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    field.onChange(year);
                                  }}
                                  readOnly={!isEditingPersonal || isSavingPersonal}
                                  disabled={isSavingPersonal}
                                  placeholder="YYYY (e.g., 2018)"
                                  maxLength={4}
                                  className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${error ? 'border-red-500' : ''}`}
                                />
                                {error && isEditingPersonal && (
                                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                                )}
                              </div>
                            )}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Registration Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Registration Information</h4>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Registered Phd Guide at MSU <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={watch('PHDGuide') ? "yes" : "no"}
                    onValueChange={(value: string) => setValue('PHDGuide', value === 'yes')}
                    className={`flex gap-6 ${!isEditingPersonal ? "pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="guide-yes" />
                      <Label htmlFor="guide-yes" className="text-sm">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="guide-no" />
                      <Label htmlFor="guide-no" className="text-sm">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                {watch('PHDGuide') && (
                  <div className="space-y-2">
                    <Label htmlFor="registrationYear" className="text-sm font-medium">
                      Year of Registration <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="Guide_year"
                      rules={{
                        required: watch('PHDGuide') && isEditingPersonal ? "Year of registration is required" : false,
                        validate: (value) => {
                          if (watch('PHDGuide') && isEditingPersonal) {
                            if (!value || value.toString().trim() === '') {
                              return "Year of registration is required";
                            }
                            const yearStr = value.toString().trim();
                            if (yearStr.length !== 4) {
                              return "Year must be 4 digits";
                            }
                            const year = parseInt(yearStr);
                            const currentYear = new Date().getFullYear();
                            if (isNaN(year) || year < 1950 || year > currentYear) {
                              return `Year must be between 1950 and ${currentYear}`;
                            }
                          }
                          return true;
                        }
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            id="registrationYear"
                            {...field}
                            onChange={(e) => {
                              const year = e.target.value.replace(/\D/g, '').slice(0, 4);
                              field.onChange(year);
                            }}
                            readOnly={!isEditingPersonal || isSavingPersonal}
                            disabled={isSavingPersonal}
                            placeholder="YYYY (e.g., 2015)"
                            maxLength={4}
                            className={`h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${error ? 'border-red-500' : ''}`}
                          />
                          {error && isEditingPersonal && (
                            <p className="text-xs text-red-500 mt-1">{error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* ICT in Teaching */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Use of ICT in Teaching</h4>
                <div className="space-y-4">
                  <Label className="text-[11px] sm:text-xs font-medium">Technologies Used for Teaching (Select all that apply)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 w-full">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="smartBoard"
                        checked={editingData.ictSmartBoard}
                        onChange={(e: any) => onCheckboxChange("ictSmartBoard", e.target.checked)}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!isEditingPersonal || isSavingPersonal ? 'pointer-events-none' : ''}`}
                        disabled={isSavingPersonal}
                      />
                      <Label htmlFor="smartBoard" className="text-sm font-normal">
                        Smart Board
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="powerPoint"
                        checked={editingData.ictPowerPoint}
                        onChange={(e: any) => onCheckboxChange("ictPowerPoint", e.target.checked)}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!isEditingPersonal || isSavingPersonal ? 'pointer-events-none' : ''}`}
                        disabled={isSavingPersonal}
                      />
                      <Label htmlFor="powerPoint" className="text-sm font-normal">
                        PowerPoint Presentation
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="ictTools"
                        checked={editingData.ictTools}
                        onChange={(e: any) => onCheckboxChange("ictTools", e.target.checked)}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!isEditingPersonal || isSavingPersonal ? 'pointer-events-none' : ''}`}
                        disabled={isSavingPersonal}
                      />
                      <Label htmlFor="ictTools" className="text-sm font-normal">
                        ICT Tools
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="eLearningTools"
                        checked={editingData.ictELearningTools}
                        onChange={(e: any) => onCheckboxChange("ictELearningTools", e.target.checked)}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!isEditingPersonal || isSavingPersonal ? 'pointer-events-none' : ''}`}
                        disabled={isSavingPersonal}
                      />
                      <Label htmlFor="eLearningTools" className="text-sm font-normal">
                        E-Learning Tools
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="onlineCourse"
                        checked={editingData.ictOnlineCourse}
                        onChange={(e: any) => onCheckboxChange("ictOnlineCourse", e.target.checked)}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!isEditingPersonal || isSavingPersonal ? 'pointer-events-none' : ''}`}
                        disabled={isSavingPersonal}
                      />
                      <Label htmlFor="onlineCourse" className="text-sm font-normal">
                        Online Course
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="others"
                        checked={editingData.ictOthers}
                        onChange={(e) => onCheckboxChange("ictOthers", e.target.checked)}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!isEditingPersonal || isSavingPersonal ? 'pointer-events-none' : ''}`}
                        disabled={isSavingPersonal}
                      />
                      <Label htmlFor="others" className="text-sm font-normal">
                        Others
                      </Label>
                    </div>
                  </div>
                  {editingData.ictOthers && (
                    <div className="space-y-2">
                      <Label htmlFor="otherIctTools" className="text-sm font-medium">
                        If Others, please specify: <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="ictOthersSpecify"
                        rules={{
                          required: editingData.ictOthers && isEditingPersonal ? "Please specify other ICT tools" : false,
                          minLength: editingData.ictOthers && isEditingPersonal ? {
                            value: 3,
                            message: "Please provide at least 3 characters"
                          } : undefined,
                          maxLength: {
                            value: 200,
                            message: "Specification must be less than 200 characters"
                          }
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <Input
                              id="otherIctTools"
                              value={editingData.ictOthersSpecify}
                              onChange={(e) => {
                                const value = e.target.value.slice(0, 200);
                                if (setEditingData) {
                                  setEditingData(prev => ({ ...prev, ictOthersSpecify: value }));
                                } else if (onEditingDataChange) {
                                  onEditingDataChange("ictOthersSpecify", value);
                                }
                                field.onChange(value);
                              }}
                              placeholder="Please specify other ICT tools used..."
                              readOnly={!isEditingPersonal || isSavingPersonal}
                      disabled={isSavingPersonal}
                              maxLength={200}
                              className={`max-w-md h-10 text-base ${!isEditingPersonal ? 'bg-[#f9fafb] text-foreground cursor-default' : ''} ${error ? 'border-red-500' : ''}`}
                            />
                            {error && isEditingPersonal && (
                              <p className="text-xs text-red-500 mt-1">{error.message}</p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Year Information Availability */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            <div>
              <CardTitle className="text-sm sm:text-base">Academic Year Information Availability</CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Academic Year Information Activity - Please tick if you DON'T have any information to submit in the
                following academic years
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={onSaveAcademicYears}
                size="sm"
                variant="outline"
                disabled={isSavingAcademicYears}
                className="flex items-center gap-2 bg-transparent w-full sm:w-auto"
              >
                {isSavingAcademicYears ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 w-full">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2016-17"
                  checked={teacherInfo?.NILL2016_17 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      if (setTeacherInfo) {
                        setTeacherInfo((prev) => prev ? { ...prev, NILL2016_17: e.target.checked } : null);
                      } else if (onAcademicYearChange) {
                        onAcademicYearChange('NILL2016_17', e.target.checked)
                      }
                    }
                  }}
                  disabled={isSavingAcademicYears}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2016-17" className="text-sm font-normal">
                  A.Y. 2016-17
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2017-18"
                  checked={teacherInfo?.NILL2017_18 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      if (setTeacherInfo) {
                        setTeacherInfo((prev) => prev ? { ...prev, NILL2017_18: e.target.checked } : null);
                      } else if (onAcademicYearChange) {
                        onAcademicYearChange('NILL2017_18', e.target.checked)
                      }
                    }
                  }}
                  disabled={isSavingAcademicYears}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2017-18" className="text-sm font-normal">
                  A.Y. 2017-18
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2018-19"
                  checked={teacherInfo?.NILL2018_19 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      if (setTeacherInfo) {
                        setTeacherInfo((prev) => prev ? { ...prev, NILL2018_19: e.target.checked } : null);
                      } else if (onAcademicYearChange) {
                        onAcademicYearChange('NILL2018_19', e.target.checked)
                      }
                    }
                  }}
                  disabled={isSavingAcademicYears}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2018-19" className="text-sm font-normal">
                  A.Y. 2018-19
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2019-20"
                  checked={teacherInfo?.NILL2019_20 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      if (setTeacherInfo) {
                        setTeacherInfo((prev) => prev ? { ...prev, NILL2019_20: e.target.checked } : null);
                      } else if (onAcademicYearChange) {
                        onAcademicYearChange('NILL2019_20', e.target.checked)
                      }
                    }
                  }}
                  disabled={isSavingAcademicYears}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2019-20" className="text-sm font-normal">
                  A.Y. 2019-20
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2020-21"
                  checked={teacherInfo?.NILL2020_21 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      if (setTeacherInfo) {
                        setTeacherInfo((prev) => prev ? { ...prev, NILL2020_21: e.target.checked } : null);
                      } else if (onAcademicYearChange) {
                        onAcademicYearChange('NILL2020_21', e.target.checked)
                      }
                    }
                  }}
                  disabled={isSavingAcademicYears}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2020-21" className="text-sm font-normal">
                  A.Y. 2020-21
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2021-22"
                  checked={teacherInfo?.NILL2021_22 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      if (setTeacherInfo) {
                        setTeacherInfo((prev) => prev ? { ...prev, NILL2021_22: e.target.checked } : null);
                      } else if (onAcademicYearChange) {
                        onAcademicYearChange('NILL2021_22', e.target.checked)
                      }
                    }
                  }}
                  disabled={isSavingAcademicYears}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2021-22" className="text-sm font-normal">
                  A.Y. 2021-22
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2022-23"
                  checked={teacherInfo?.NILL2022_23 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      if (setTeacherInfo) {
                        setTeacherInfo((prev) => prev ? { ...prev, NILL2022_23: e.target.checked } : null);
                      } else if (onAcademicYearChange) {
                        onAcademicYearChange('NILL2022_23', e.target.checked)
                      }
                    }
                  }}
                  disabled={isSavingAcademicYears}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2022-23" className="text-sm font-normal">
                  A.Y. 2022-23
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2023-24"
                  checked={teacherInfo?.NILL2023_24 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      if (setTeacherInfo) {
                        setTeacherInfo((prev) => prev ? { ...prev, NILL2023_24: e.target.checked } : null);
                      } else if (onAcademicYearChange) {
                        onAcademicYearChange('NILL2023_24', e.target.checked)
                      }
                    }
                  }}
                  disabled={isSavingAcademicYears}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2023-24" className="text-sm font-normal">
                  A.Y. 2023-24
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2024-25"
                  checked={teacherInfo?.NILL2024_25 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      if (setTeacherInfo) {
                        setTeacherInfo((prev) => prev ? { ...prev, NILL2024_25: e.target.checked } : null);
                      } else if (onAcademicYearChange) {
                        onAcademicYearChange('NILL2024_25', e.target.checked)
                      }
                    }
                  }}
                  disabled={isSavingAcademicYears}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2024-25" className="text-sm font-normal">
                  A.Y. 2024-25
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2025-26"
                  checked={teacherInfo?.NILL2025_26 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      if (setTeacherInfo) {
                        setTeacherInfo((prev) => prev ? { ...prev, NILL2025_26: e.target.checked } : null);
                      } else if (onAcademicYearChange) {
                        onAcademicYearChange('NILL2025_26', e.target.checked)
                      }
                    }
                  }}
                  disabled={isSavingAcademicYears}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2025-26" className="text-sm font-normal">
                  A.Y. 2025-26
                </Label>
              </div>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Academic Year Information Activity:</strong> Please check the academic years for which you do
                NOT have any information to submit. This helps in generating accurate reports and understanding your
                research activity across different academic years.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

