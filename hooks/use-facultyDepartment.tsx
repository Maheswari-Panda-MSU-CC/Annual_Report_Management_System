// hooks/useFacultyDepartment.ts
import { useEffect, useState } from "react"

export function useFacultyDepartment() {
  const [faculties, setFaculties] = useState<{ Fid: number; Fname: string, email:string }[]>([])
  const [departments, setDepartments] = useState<{ Deptid: number; name: string }[]>([])

  const fetchFaculties = async () => {
    const res = await fetch("/api/faculty")
    setFaculties(await res.json())
  }

  const fetchDepartments = async (facultyId: string) => {
    const res = await fetch(`/api/department?facultyId=${facultyId}`)
    setDepartments(await res.json())
  }

  useEffect(() => { fetchFaculties() }, [])

  return { faculties, departments,fetchFaculties, fetchDepartments }
}
