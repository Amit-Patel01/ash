import { useCallback, useEffect, useMemo, useState } from 'react'
import { auth } from '../config/firebase'
import { api, readApiJson } from '../config/api'
import { useStore } from '../store/StoreContext'

const buildPlanKey = (courseId, planId) => `${String(courseId || '').trim()}::${String(planId ?? '').trim()}`

const toDateInputValue = (value) => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

const createBlankForm = () => ({
  code: '',
  discountType: 'percentage',
  discountValue: '10',
  isActive: true,
  validFrom: '',
  validUntil: '',
  usageLimit: '',
  courseScopes: [],
})

const formatDiscount = (coupon) =>
  coupon.discountType === 'percentage'
    ? `${Number(coupon.discountValue || 0)}% OFF`
    : `₹${Number(coupon.discountValue || 0).toLocaleString('en-IN')} OFF`

const formatDate = (value) => {
  if (!value) return 'No expiry'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Invalid date'
  return parsed.toLocaleDateString('en-IN', { dateStyle: 'medium' })
}

export default function AdminCoupons() {
  const { courses } = useStore()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [form, setForm] = useState(createBlankForm)
  const [status, setStatus] = useState({ type: '', message: '' })

  const paidCourses = useMemo(
    () =>
      courses.filter((course) => {
        const price = Number(course.price || 0)
        const hasPaidPlans = Array.isArray(course.plans) && course.plans.some((plan) => Number(plan?.price || 0) > 0)
        return price > 0 || hasPaidPlans
      }),
    [courses]
  )

  const getAuthHeaders = useCallback(async () => {
    const token = await auth.currentUser?.getIdToken()
    if (!token) throw new Error('Please sign in again to continue.')
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }, [])

  const loadCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(api.adminCoupons, { headers })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load coupons.')
      setCoupons(data.coupons || [])
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to load coupons.' })
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    loadCoupons()
  }, [loadCoupons])

  const resetForm = () => {
    setEditingCoupon(null)
    setForm(createBlankForm())
    setStatus({ type: '', message: '' })
  }

  const openEdit = (coupon) => {
    setEditingCoupon(coupon)
    setForm({
      code: coupon.code || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: String(coupon.discountValue ?? ''),
      isActive: coupon.isActive !== false,
      validFrom: toDateInputValue(coupon.validFrom),
      validUntil: toDateInputValue(coupon.validUntil),
      usageLimit: coupon.usageLimit === null || coupon.usageLimit === undefined ? '' : String(coupon.usageLimit),
      courseScopes: Array.isArray(coupon.courseScopes)
        ? coupon.courseScopes.map((scope) => ({
            courseId: scope.courseId,
            courseTitle: scope.courseTitle || '',
            plans: Array.isArray(scope.plans) ? scope.plans.map((plan) => ({ key: plan.key, label: plan.label || '' })) : [],
          }))
        : [],
    })
    setStatus({ type: '', message: '' })
  }

  const scopeForCourse = (courseId) => form.courseScopes.find((scope) => scope.courseId === courseId) || null

  const toggleCourseScope = (course, checked) => {
    setForm((current) => {
      const nextScopes = checked
        ? [...current.courseScopes, { courseId: course.id, courseTitle: course.title, plans: [] }]
        : current.courseScopes.filter((scope) => scope.courseId !== course.id)

      return { ...current, courseScopes: nextScopes }
    })
  }

  const togglePlanScope = (course, plan, checked, index) => {
    const planKey = buildPlanKey(course.id, plan.id || index)
    const planLabel = plan.label || `Plan ${index + 1}`

    setForm((current) => {
      const existingScope = current.courseScopes.find((scope) => scope.courseId === course.id)
      const baseScope = existingScope || { courseId: course.id, courseTitle: course.title, plans: [] }
      const nextPlans = checked
        ? [...baseScope.plans, { key: planKey, label: planLabel }]
        : baseScope.plans.filter((item) => item.key !== planKey)

      const nextScope = {
        ...baseScope,
        plans: nextPlans.filter((item, itemIndex, all) => all.findIndex((candidate) => candidate.key === item.key) === itemIndex),
      }

      const scopesWithoutCourse = current.courseScopes.filter((scope) => scope.courseId !== course.id)
      return { ...current, courseScopes: [...scopesWithoutCourse, nextScope] }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setStatus({ type: '', message: '' })

    try {
      const headers = await getAuthHeaders()
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue || 0),
        isActive: form.isActive,
        validFrom: form.validFrom,
        validUntil: form.validUntil,
        usageLimit: form.usageLimit,
        courseScopes: form.courseScopes.map((scope) => ({
          courseId: scope.courseId,
          courseTitle: scope.courseTitle,
          plans: Array.isArray(scope.plans) ? scope.plans.map((plan) => ({ key: plan.key, label: plan.label })) : [],
        })),
      }

      const targetUrl = editingCoupon ? api.adminCoupon(editingCoupon.id) : api.adminCoupons
      const response = await fetch(targetUrl, {
        method: editingCoupon ? 'PATCH' : 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to save coupon.')

      await loadCoupons()
      resetForm()
      setStatus({ type: 'success', message: editingCoupon ? 'Coupon updated successfully.' : 'Coupon created successfully.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to save coupon.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (couponId) => {
    if (!window.confirm('Delete this coupon? This cannot be undone.')) return

    setDeletingId(couponId)
    setStatus({ type: '', message: '' })
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(api.adminCoupon(couponId), {
        method: 'DELETE',
        headers,
      })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to delete coupon.')
      await loadCoupons()
      if (editingCoupon?.id === couponId) resetForm()
      setStatus({ type: 'success', message: 'Coupon deleted successfully.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to delete coupon.' })
    } finally {
      setDeletingId('')
    }
  }

  const activeCoupons = coupons.filter((coupon) => coupon.isActive)
  const expiredCoupons = coupons.filter((coupon) => coupon.validUntil && new Date(coupon.validUntil).getTime() < Date.now())

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <p className="mt-1 text-sm text-gray-400">
            Create coupon codes, assign them to selected courses or plans, and manage usage from one place.
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          New Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-gray-900/50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">Total Codes</p>
          <p className="mt-3 text-3xl font-black text-white">{coupons.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300/70">Active Codes</p>
          <p className="mt-3 text-3xl font-black text-emerald-300">{activeCoupons.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300/70">Expired Codes</p>
          <p className="mt-3 text-3xl font-black text-amber-300">{expiredCoupons.length}</p>
        </div>
      </div>

      {status.message && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${
          status.type === 'error'
            ? 'border-red-500/20 bg-red-500/10 text-red-200'
            : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
        }`}>
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-white/5 bg-gray-900/50 p-10 text-center text-sm text-gray-400">
              Loading coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-gray-900/50 p-10 text-center text-sm text-gray-400">
              No coupons created yet.
            </div>
          ) : (
            coupons.map((coupon) => {
              const scopeCount = Array.isArray(coupon.courseScopes) ? coupon.courseScopes.length : 0
              return (
                <div key={coupon.id} className="rounded-2xl border border-white/5 bg-gray-900/50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-black tracking-[0.2em] text-blue-200">
                          {coupon.code}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          coupon.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-500/15 text-slate-300'
                        }`}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="mt-3 text-2xl font-black text-white">{formatDiscount(coupon)}</p>
                      <p className="mt-2 text-sm text-gray-400">
                        {scopeCount === 0
                          ? 'Applies to all paid courses'
                          : `${scopeCount} course scope${scopeCount === 1 ? '' : 's'} assigned`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(coupon)}
                        className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/5"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(coupon.id)}
                        disabled={deletingId === coupon.id}
                        className="rounded-xl border border-red-500/20 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deletingId === coupon.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Validity</p>
                      <p className="mt-2 text-sm text-white">
                        {coupon.validFrom ? formatDate(coupon.validFrom) : 'Immediate'} to {formatDate(coupon.validUntil)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Usage</p>
                      <p className="mt-2 text-sm text-white">
                        {Number(coupon.usedCount || 0)} used
                        {coupon.usageLimit !== null && coupon.usageLimit !== undefined ? ` / ${coupon.usageLimit}` : ' / Unlimited'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Updated By</p>
                      <p className="mt-2 truncate text-sm text-white">{coupon.updatedByEmail || coupon.createdByEmail || 'Admin'}</p>
                    </div>
                  </div>

                  {scopeCount > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {coupon.courseScopes.map((scope) => (
                        <span key={scope.courseId} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-200">
                          {scope.courseTitle || scope.courseId}
                          {Array.isArray(scope.plans) && scope.plans.length > 0 ? ` · ${scope.plans.length} plan${scope.plans.length === 1 ? '' : 's'}` : ' · All plans'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/5 bg-gray-900/60 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <p className="mt-1 text-sm text-gray-400">
                No course selected means the coupon works across all paid courses. No plan selected means all plans in that course.
              </p>
            </div>
            {editingCoupon && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/5"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-gray-500">Coupon Code</label>
              <input
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
                placeholder="SUMMER100"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/40"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-gray-500">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(event) => setForm((current) => ({ ...current, discountType: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/40"
              >
                <option value="percentage" className="bg-slate-900">Percentage</option>
                <option value="flat" className="bg-slate-900">Flat Amount</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-gray-500">
                {form.discountType === 'percentage' ? 'Discount (%)' : 'Discount Amount'}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.discountValue}
                onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/40"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-gray-500">Usage Limit</label>
              <input
                type="number"
                min="0"
                value={form.usageLimit}
                onChange={(event) => setForm((current) => ({ ...current, usageLimit: event.target.value }))}
                placeholder="Leave blank for unlimited"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/40"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-gray-500">Valid From</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(event) => setForm((current) => ({ ...current, validFrom: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/40"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-gray-500">Valid Until</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(event) => setForm((current) => ({ ...current, validUntil: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/40"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-white">Coupon Active</p>
              <p className="mt-1 text-xs text-gray-400">Inactive coupons stay saved but cannot be applied at checkout.</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, isActive: !current.isActive }))}
              className={`relative h-6 w-11 rounded-full transition-all ${form.isActive ? 'bg-blue-500' : 'bg-slate-700'}`}
              aria-pressed={form.isActive}
            >
              <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${form.isActive ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="mt-6">
            <div className="mb-3">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-gray-500">Course Assignment</p>
              <p className="mt-2 text-sm text-gray-400">Choose specific courses and optional plan-level targeting.</p>
            </div>

            <div className="max-h-[26rem] space-y-3 overflow-y-auto pr-1">
              {paidCourses.map((course) => {
                const activeScope = scopeForCourse(course.id)
                const plans = Array.isArray(course.plans) ? course.plans : []

                return (
                  <div key={course.id} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(activeScope)}
                        onChange={(event) => toggleCourseScope(course, event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{course.title}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {plans.length > 0
                            ? `${plans.length} plan${plans.length === 1 ? '' : 's'} available`
                            : Number(course.price || 0) > 0
                              ? `Single price: ₹${Number(course.price || 0).toLocaleString('en-IN')}`
                              : 'No paid plan found'}
                        </p>
                      </div>
                    </label>

                    {activeScope && plans.length > 0 && (
                      <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Specific Plans</p>
                        <p className="mt-1 text-xs text-gray-400">Leave all unchecked to allow every plan in this course.</p>
                        <div className="mt-3 space-y-2">
                          {plans.map((plan, index) => {
                            const planKey = buildPlanKey(course.id, plan.id || index)
                            const checked = activeScope.plans.some((item) => item.key === planKey)
                            return (
                              <label key={planKey} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(event) => togglePlanScope(course, plan, event.target.checked, index)}
                                  className="h-4 w-4 rounded border-white/20 bg-transparent text-blue-500"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white">{plan.label || `Plan ${index + 1}`}</p>
                                  <p className="text-xs text-gray-400">
                                    {plan.isFree || Number(plan.price || 0) === 0
                                      ? 'Free'
                                      : `₹${Number(plan.price || 0).toLocaleString('en-IN')}`}
                                  </p>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving Coupon...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </form>
      </div>
    </div>
  )
}
