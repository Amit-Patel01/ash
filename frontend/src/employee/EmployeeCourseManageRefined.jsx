import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import { EmployeePageHeader } from './EmployeePanelUI'
import EmployeeCourseManage from './EmployeeCourseManage'
import {
  courseBelongsToEmployee,
  enrollmentMatchesCourse,
  getEmployeeKeyList,
  getEmployeeMemberData,
} from './employeeUtils'

export default function EmployeeCourseManageRefined() {
  const { currentUser, userProfile } = useAuth()
  const { courses, enrollments, teamMembers, certificates } = useStore()

  const memberData = useMemo(
    () => getEmployeeMemberData(teamMembers, currentUser, userProfile),
    [teamMembers, currentUser, userProfile]
  )

  const employeeKeys = useMemo(
    () => getEmployeeKeyList(currentUser, userProfile, memberData),
    [currentUser, userProfile, memberData]
  )

  const myCourses = useMemo(
    () => courses.filter(course => courseBelongsToEmployee(course, employeeKeys)),
    [courses, employeeKeys]
  )

  const activeStudents = myCourses.reduce((count, course) => {
    return count + enrollments.filter(
      enrollment => enrollment.status === 'active' && enrollmentMatchesCourse(enrollment, course)
    ).length
  }, 0)

  const activeCertificates = certificates.filter(certificate =>
    certificate.status === 'approved' &&
    myCourses.some(course => certificate.courseId === course.id || certificate.courseName === course.title)
  ).length

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        eyebrow="Course Delivery"
        title="Manage Assigned Courses"
        description="Plans, materials, meeting links, enrolled students aur certificate actions sab ek hi workspace se manage karo."
        stats={[
          { label: 'Assigned courses', value: myCourses.length },
          { label: 'Active students', value: activeStudents },
          { label: 'Issued certificates', value: activeCertificates },
        ]}
      />
      <div className="[&_>h1]:hidden">
        <EmployeeCourseManage />
      </div>
    </div>
  )
}
