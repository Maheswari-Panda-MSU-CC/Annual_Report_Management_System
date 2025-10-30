// hooks/useFacultyDepartment.ts
import { DegreeTypeOption, DepartmentOption, DesignationOption, FacultyOption, UserType } from "@/types/interfaces";
import { useEffect, useState } from "react"

export function useDropDowns() {
  
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([])
  const [permanentDesignationOptions, setPermanentDesignationOptions] = useState<DesignationOption[]>([]);
  const [temporaryDesignationOptions, setTemporaryDesignationOptions] = useState<DesignationOption[]>([]);
  const [degreeTypeOptions, setDegreeTypeOptions] = useState<DegreeTypeOption[]>([]);

  const fetchFaculties = async () => {
    try {
      // Fetch faculty options
      const facultyRes = await fetch('/api/shared/dropdown/faculty');
      if (facultyRes.ok) {
        const facultyData = await facultyRes.json();
        setFacultyOptions(facultyData.faculties || []);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      // Set dummy data as fallback
      setFacultyOptions([]);
    }
      
  }

  const fetchDepartments = async (fid: number) => {
    try {
      const res = await fetch(`/api/shared/dropdown/department?fid=${fid}`);
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartmentOptions(data.departments || []);
    } catch (error) {
      console.error('Error fetching departments by faculty:', error);
      // Fallback dummy departments
      setDepartmentOptions([]);
    }
  }

  const fetchUserTypes = async () => {
    try {
      const res = await fetch('/api/admin/user-types')
      if (!res.ok) throw new Error('Failed to fetch user types')

      const data = await res.json()
      setUserTypes(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchDegreeTypes = async () =>{
    try{
      const degreeTypeRes = await fetch('/api/shared/dropdown/degreeType');
      if (degreeTypeRes.ok) {
        const degreeTypeData = await degreeTypeRes.json();
        setDegreeTypeOptions(degreeTypeData.degreeTypes || []);
      }
    }
    catch(error){
      console.error(error);
    }
  }


  const fetchParmanentDesignations = async () =>{
    try{
      const permDesigRes = await fetch('/api/shared/dropdown/designation?type=permanent');
      if (permDesigRes.ok) {
        const permDesigData = await permDesigRes.json();
        setPermanentDesignationOptions(permDesigData.designations || []);
      }
    }
    catch(error){
      console.error(error);
    }
  }

  const fetchTemporaryDesignations = async () =>{
    try{
      const tempDesigRes = await fetch('/api/shared/dropdown/designation?type=temporary');
      if (tempDesigRes.ok) {
        const tempDesigData = await tempDesigRes.json();
        setTemporaryDesignationOptions(tempDesigData.designations || []);
      }
    }
    catch(error){
      console.error(error);
    }
  }

  useEffect(() => { fetchFaculties() }, [])

  return { facultyOptions, departmentOptions,userTypes,degreeTypeOptions,permanentDesignationOptions,temporaryDesignationOptions,fetchFaculties, fetchDepartments,fetchUserTypes,fetchDegreeTypes,fetchParmanentDesignations,fetchTemporaryDesignations }
}
