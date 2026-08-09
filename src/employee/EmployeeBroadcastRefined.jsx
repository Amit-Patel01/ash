'use client'
import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../config/api'
import { useStore } from '../store/StoreContext'
import {
  EmployeeBadge,
  EmployeeEmptyState,
  EmployeePageHeader,
  EmployeeSurface } from './EmployeePanelUI'
import {
  courseBelongsToEmployee,
  enrollmentMatchesCourse,
  getEmployeeKeyList,
  getEmployeeMemberData } from './employeeUtils'

export default function EmployeeBroadcastRefined() {
  const { courses, enrollments, teamMembers } = useStore()
  const { currentUser, userProfile } = useAuth()
  const [form, setForm] = useState({
    courseId: '',
    planId: '',
    subject: '',
    message: '',
    imageUrl: '',
    imageLabel: '',
    attachImage: true })
  const [sending, setSending] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [result, setResult] = useState(null)
  const [imageResult, setImageResult] = useState(null)

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

  const selectedCourse = useMemo(
    () => myCourses.find(course => course.id === form.courseId) || null,
    [myCourses, form.courseId]
  )

  const courseEnrollments = useMemo(() => {
    if (!selectedCourse) return []
    return enrollments.filter(
      enrollment => enrollment.status === 'active' && enrollmentMatchesCourse(enrollment, selectedCourse)
    )
  }, [enrollments, selectedCourse])

  const filteredEnrollments = useMemo(() => {
    if (!form.planId) return courseEnrollments
    return courseEnrollments.filter(enrollment => enrollment.planId === form.planId)
  }, [courseEnrollments, form.planId])

  const uniquePlans = useMemo(() => {
    return [...new Map(
      courseEnrollments
        .map(enrollment => {
          const matchedPlan = selectedCourse?.plans?.find(
            plan => plan.id === enrollment.planId || plan.label === enrollment.planLabel
          )
          const planId = matchedPlan?.id || enrollment.planId || enrollment.planLabel
          const planLabel = matchedPlan?.label || enrollment.planLabel || enrollment.planId || 'Standard'
          return [planId, { id: planId, label: planLabel }]
        })
        .filter(([planId]) => Boolean(planId))
    ).values()]
  }, [courseEnrollments, selectedCourse])

  const reachableStudents = myCourses.reduce((count, course) => {
    return count + enrollments.filter(
      enrollment => enrollment.status === 'active' && enrollmentMatchesCourse(enrollment, course)
    ).length
  }, 0)

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImageResult({ success: false, message: 'Please choose a valid image file.' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageResult({ success: false, message: 'Image size must be 5MB or smaller.' })
      return
    }

    setUploadingImage(true)
    setImageResult(null)

    try {
      const formData = new FormData()
      formData.append('broadcast-image', file)

      const response = await fetch(api.uploadBroadcast, {
        method: 'POST',
        body: formData })

      const data = await response.json()
      if (!response.ok || !data?.url) {
        throw new Error(data.message || 'Image upload failed.')
      }

      setForm(current => ({
        ...current,
        imageUrl: data.url,
        imageLabel: file.name,
        attachImage: true }))
      setImageResult({ success: true, message: 'Image uploaded and ready for email.' })
    } catch (error) {
      setImageResult({ success: false, message: error.message || 'Unable to upload image.' })
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    setForm(current => ({
      ...current,
      imageUrl: '',
      imageLabel: '',
      attachImage: true }))
    setImageResult(null)
  }

  const handleSend = async () => {
    if (!form.courseId) {
      window.alert('Please select a course first.')
      return
    }

    if (!form.subject.trim() || !form.message.trim()) {
      window.alert('Subject and message are required.')
      return
    }

    if (!filteredEnrollments.length) {
      window.alert('There are no students in the selected audience.')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to broadcast this message to ${filteredEnrollments.length} student(s)?`
    )
    if (!confirmed) return

    setSending(true)
    setResult(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Please log in again to continue.')

      const response = await fetch(api.adminBroadcastEmail, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          targetType: 'course',
          courseId: form.courseId,
          planId: form.planId || null,
          subject: form.subject.trim(),
          message: form.message,
          imageUrl: form.imageUrl || null,
          imageLabel: form.imageLabel || null,
          attachImage: Boolean(form.imageUrl && form.attachImage) }) })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to send broadcast')

      setResult({ success: true, message: data.message || 'Broadcast sent successfully.' })
      setForm(current => ({
        ...current,
        subject: '',
        message: '',
        imageUrl: '',
        imageLabel: '',
        attachImage: true }))
      setImageResult(null)
    } catch (error) {
      setResult({ success: false, message: error.message || 'Unable to send broadcast.' })
    } finally {
      setSending(false)
    }
  }

  if (!myCourses.length) {
    return (
      <div className="space-y-6">
        <EmployeePageHeader
          eyebrow="Outreach Center"
          title="Student Broadcasts"
          description="Use this page to send targeted updates to students enrolled in your assigned courses."
        />
        <EmployeeEmptyState
          icon={
            <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
            </svg>
          }
          title="No assigned course audience yet"
          description="Once an administrator assigns courses to you and students enroll, you will be able to send broadcasts from here."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        eyebrow="Outreach Center"
        title="Student Broadcasts"
        description="Select audiences by course or plan to send announcements directly to students. Access is limited to your assigned courses."
        stats={[
          { label: 'Assigned courses', value: myCourses.length },
          { label: 'Reachable students', value: reachableStudents },
          { label: 'Selected audience', value: filteredEnrollments.length },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.25fr_0.8fr]">
        <EmployeeSurface title="Audience Filters" description="Choose a course and plan to define the exact recipient list.">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Assigned Course
              </label>
              <select
                value={form.courseId}
                onChange={(event) => setForm(current => ({ ...current, courseId: event.target.value, planId: '' }))}
                className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-900 focus:border-cyan-400/30 focus:outline-none"
              >
                <option value="" className="bg-slate-950">Choose Course</option>
                {myCourses.map(course => (
                  <option key={course.id} value={course.id} className="bg-slate-950">{course.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Plan Filter
              </label>
              <select
                value={form.planId}
                onChange={(event) => setForm(current => ({ ...current, planId: event.target.value }))}
                disabled={!selectedCourse || !uniquePlans.length}
                className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-900 focus:border-cyan-400/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" className="bg-slate-950">All Plans</option>
                {uniquePlans.map(plan => (
                  <option key={plan.id} value={plan.id} className="bg-slate-950">{plan.label}</option>
                ))}
              </select>
            </div>

            <div className="rounded-[24px] border border-cyan-400/15 bg-cyan-400/[0.07] p-5 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-300">Audience Size</p>
              <p className="mt-3 text-4xl font-black text-slate-900">{filteredEnrollments.length}</p>
              <p className="mt-2 text-sm text-slate-300">
                {selectedCourse ? 'Students currently in this selection' : 'Select a course to view recipients'}
              </p>
            </div>

            {selectedCourse && (
              <div className="rounded-[24px] border border-slate-300 bg-white/[0.03] p-5">
                <p className="text-sm font-black text-slate-900">{selectedCourse.title}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <EmployeeBadge tone="info">{selectedCourse.category || 'General'}</EmployeeBadge>
                  <EmployeeBadge>{selectedCourse.level || 'Open Level'}</EmployeeBadge>
                  <EmployeeBadge tone={selectedCourse.meetingLink ? 'success' : 'warning'}>
                    {selectedCourse.meetingLink ? 'Meeting Ready' : 'Meeting Pending'}
                  </EmployeeBadge>
                </div>
              </div>
            )}
          </div>
        </EmployeeSurface>

        <EmployeeSurface title="Message Composer" description="Enter a subject and message, then send to the selected students.">
          <div className="space-y-4">
            {result && (
              <div className={`rounded-2xl border px-4 py-3 text-sm ${
                result.success
                  ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                  : 'border-rose-400/20 bg-rose-400/10 text-rose-300'
              }`}>
                {result.message}
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Email Subject
              </label>
              <input
                value={form.subject}
                onChange={(event) => setForm(current => ({ ...current, subject: event.target.value }))}
                disabled={!selectedCourse}
                placeholder="Schedule update, material release, live class reminder"
                className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-cyan-400/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Email Body
              </label>
              <textarea
                value={form.message}
                onChange={(event) => setForm(current => ({ ...current, message: event.target.value }))}
                disabled={!selectedCourse}
                rows={12}
                placeholder={`Hello students,\n\nWe have an important update regarding your course...\n\nRegards,\nTeam SolutionHub`}
                className="w-full rounded-[24px] border border-slate-300 bg-slate-100 px-4 py-4 text-sm text-slate-900 placeholder:text-slate-500 focus:border-cyan-400/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="rounded-[24px] border border-slate-300 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Image Attachment</p>
                  <p className="mt-2 text-sm text-slate-400">
                    A preview appears in the email body, and you may also send the image as an attachment.
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageSelect}
                    disabled={!selectedCourse || uploadingImage}
                    className="hidden"
                  />
                  {uploadingImage ? 'Uploading...' : form.imageUrl ? 'Replace Image' : 'Upload Image'}
                </label>
              </div>

              {imageResult && (
                <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                  imageResult.success
                    ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                    : 'border-rose-400/20 bg-rose-400/10 text-rose-300'
                }`}>
                  {imageResult.message}
                </div>
              )}

              {form.imageUrl && (
                <div className="mt-4 rounded-[24px] border border-slate-300 bg-slate-950/60 p-4">
                  <div className="overflow-hidden rounded-[20px] border border-slate-300 bg-white">
                    <img
                      src={form.imageUrl}
                      alt={form.imageLabel || 'Broadcast attachment'}
                      className="h-56 w-full object-contain"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{form.imageLabel || 'Broadcast image'}</p>
                      <p className="mt-1 text-xs text-slate-500">PNG, JPG ya WebP. Max 5MB.</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-400/15"
                    >
                      Remove
                    </button>
                  </div>

                  <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-300 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.attachImage}
                      onChange={(event) => setForm(current => ({ ...current, attachImage: event.target.checked }))}
                      className="h-4 w-4 rounded border-white/20 bg-transparent text-cyan-400 focus:ring-cyan-400"
                    />
                    Attach image as downloadable file also
                  </label>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-white/[0.03] px-4 py-3">
              <p className="text-sm text-slate-400">
                This broadcast will be sent to <span className="font-semibold text-slate-900">{filteredEnrollments.length}</span> student{filteredEnrollments.length !== 1 ? 's' : ''}
                {form.imageUrl ? <span className="text-slate-500"> with image</span> : null}
              </p>
              <button
                onClick={handleSend}
                disabled={sending || uploadingImage || !selectedCourse || !form.subject.trim() || !form.message.trim() || !filteredEnrollments.length}
                className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? 'Broadcasting...' : 'Send Broadcast'}
              </button>
            </div>
          </div>
        </EmployeeSurface>

        <EmployeeSurface title="Selected Students" description="The students listed here match your current filters and will receive this message.">
          {!filteredEnrollments.length ? (
            <EmployeeEmptyState
              icon={
                <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              }
              title="No students selected"
              description="Select a course or reset the plan filter. The audience list will update live here."
              className="py-10"
            />
          ) : (
            <div className="space-y-3">
              {filteredEnrollments.slice(0, 8).map(enrollment => (
                <div key={enrollment.id} className="rounded-2xl border border-slate-300 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{enrollment.userName || enrollment.userEmail}</p>
                      <p className="mt-1 truncate text-xs text-slate-400">{enrollment.userEmail}</p>
                    </div>
                    <EmployeeBadge tone={Number(enrollment.amount || 0) > 0 ? 'success' : 'info'}>
                      {Number(enrollment.amount || 0) > 0 ? `₹${Number(enrollment.amount).toLocaleString('en-IN')}` : 'FREE'}
                    </EmployeeBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {enrollment.planLabel && <EmployeeBadge>{enrollment.planLabel}</EmployeeBadge>}
                    {enrollment.userMobile && <EmployeeBadge tone="info">{enrollment.userMobile}</EmployeeBadge>}
                  </div>
                </div>
              ))}
              {filteredEnrollments.length > 8 && (
                <p className="text-center text-xs text-slate-500">
                  +{filteredEnrollments.length - 8} more students included in this broadcast
                </p>
              )}
            </div>
          )}
        </EmployeeSurface>
      </div>
    </div>
  )
}
