import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { doctorsApi, servicesApi } from '@/api'
import { Button, Input, Modal, Confirm, Spinner, EmptyState } from '@/components/ui'
import { SearchInput } from '@/components/ui/SearchInput'
import { TimePickerDrum } from '@/components/ui/DrumPicker'
import type { Doctor, DoctorFormData } from '@/types'
import { WEEKDAYS_FULL, cn } from '@/utils'

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  first_name:    z.string().min(1, 'Ism kiritilmagan'),
  last_name:     z.string().min(1, 'Familiya kiritilmagan'),
  gender:        z.enum(['male', 'female']).default('male'),
  speciality:    z.string().min(1, 'Mutaxassislik kiritilmagan'),
  phone:         z.string().optional().default('+998'),
  slot_duration: z.coerce.number().min(10).max(120),
  is_active:     z.boolean().default(true),
})
type FormData = z.infer<typeof schema>

const SPECIALITIES = [
  'Terapevt stomatolog', 'Xirurg stomatolog', 'Ortodont',
  'Ortoped stomatolog',  'Parodontolog',      'Endodont',
  'Pediatrik stomatolog',
]

// ─── DoctorCard ──────────────────────────────────────────────────────────────

function DoctorCard({ doctor, onEdit, onDelete }: {
  doctor: Doctor
  onEdit: (d: Doctor) => void
  onDelete: (d: Doctor) => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md
                    transition-all duration-200 overflow-hidden group">
      <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 to-purple-500" />
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-purple-600
                            flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-base font-bold text-white">
                {doctor.first_name.charAt(0)}{doctor.last_name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Dr. {doctor.full_name}</p>
              <p className="text-xs text-primary-600 font-medium mt-0.5">{doctor.speciality}</p>
            </div>
          </div>
          <span className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0',
            doctor.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          )}>
            {doctor.is_active ? '● Faol' : '○ Faol emas'}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-1.5 mb-3">
          {doctor.phone && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              {doctor.phone}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {doctor.work_start} – {doctor.work_end} · {doctor.slot_duration} daqiqa
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            Bugun: <span className="font-semibold text-primary-600 ml-1">{doctor.today_appointments} qabul</span>
          </div>
        </div>

        {/* Work days */}
        <div className="flex gap-1 mb-3">
          {WEEKDAYS_FULL.map((day, i) => (
            <span key={i} className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-md font-semibold',
              doctor.work_days.includes(i) ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-300'
            )}>
              {day.slice(0, 2)}
            </span>
          ))}
        </div>

        {/* Services */}
        {doctor.services.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {doctor.services.slice(0, 3).map(s => (
              <span key={s.id} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                {s.name}
              </span>
            ))}
            {doctor.services.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                +{doctor.services.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-50">
          <button onClick={() => onEdit(doctor)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl
                       text-xs font-semibold text-primary-600 hover:bg-primary-50 transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Tahrirlash
          </button>
          <button onClick={() => onDelete(doctor)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl
                       text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            O'chirish
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DoctorsPage ──────────────────────────────────────────────────────────────

export default function DoctorsPage() {
  const qc = useQueryClient()

  const [modalOpen,   setModalOpen]   = useState(false)
  const [editDoctor,  setEditDoctor]  = useState<Doctor | null>(null)
  const [deleteDoctor, setDeleteDoctor] = useState<Doctor | null>(null)
  const [selectedWorkDays, setSelectedWorkDays] = useState<number[]>([0,1,2,3,4])
  const [selectedServices, setSelectedServices] = useState<number[]>([])
  const [workStart,  setWorkStart]  = useState('09:00')
  const [workEnd,    setWorkEnd]    = useState('18:00')
  const [breakStart, setBreakStart] = useState('')
  const [breakEnd,   setBreakEnd]   = useState('')
  const [showBreak,  setShowBreak]  = useState(false)
  const [search,       setSearch]       = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterSpec,   setFilterSpec]   = useState('')

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorsApi.list({}).then(r => r.data),
  })
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list({}).then(r => r.data),
  })

  const filtered = useMemo(() => doctors.filter(d => {
    const q = search.toLowerCase()
    const matchName   = !q || d.full_name.toLowerCase().includes(q) || d.speciality.toLowerCase().includes(q) || (d.phone || '').includes(q)
    const matchActive = filterActive === 'all' ? true : filterActive === 'active' ? d.is_active : !d.is_active
    const matchSpec   = !filterSpec || d.speciality === filterSpec
    return matchName && matchActive && matchSpec
  }), [doctors, search, filterActive, filterSpec])

  const specialities = useMemo(() =>
    [...new Set(doctors.map(d => d.speciality))].filter(Boolean), [doctors])

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { slot_duration: 30, is_active: true, phone: '+998', gender: 'male' as const },
  })

  const createMut = useMutation({
    mutationFn: (d: DoctorFormData) => doctorsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['doctors'] }); closeModal(); toast.success("Shifokor qo'shildi") },
    onError: () => toast.error('Xato yuz berdi'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DoctorFormData> }) => doctorsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['doctors'] }); closeModal(); toast.success('Yangilandi') },
    onError: () => toast.error('Xato yuz berdi'),
  })
  const deleteMut = useMutation({
    mutationFn: (id: number) => doctorsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['doctors'] }); setDeleteDoctor(null); toast.success("O'chirildi") },
    onError: () => toast.error('Xato yuz berdi'),
  })

  const openCreate = () => {
    setEditDoctor(null)
    setSelectedWorkDays([0,1,2,3,4]); setSelectedServices([])
    setWorkStart('09:00'); setWorkEnd('18:00')
    setBreakStart(''); setBreakEnd(''); setShowBreak(false)
    reset({ slot_duration: 30, is_active: true, phone: '+998', gender: 'male' })
    setModalOpen(true)
  }

  const openEdit = (d: Doctor) => {
    setEditDoctor(d)
    setSelectedWorkDays(d.work_days)
    setSelectedServices(d.services.map(s => s.id))
    setWorkStart(d.work_start || '09:00'); setWorkEnd(d.work_end || '18:00')
    setBreakStart(d.break_start || ''); setBreakEnd(d.break_end || '')
    setShowBreak(!!(d.break_start))
    reset({
      first_name: d.first_name, last_name: d.last_name,
      gender: d.gender || 'male', speciality: d.speciality,
      phone: d.phone || '+998', slot_duration: d.slot_duration, is_active: d.is_active,
    })
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditDoctor(null) }

  const onSubmit = (data: FormData) => {
    const payload: DoctorFormData = {
      ...data,
      telegram_id: null, photo: null,
      work_days:   selectedWorkDays,
      work_start:  workStart, work_end: workEnd,
      break_start: showBreak && breakStart ? breakStart : null,
      break_end:   showBreak && breakEnd   ? breakEnd   : null,
      service_ids: selectedServices,
    }
    editDoctor
      ? updateMut.mutate({ id: editDoctor.id, data: payload })
      : createMut.mutate(payload)
  }

  const toggleDay     = (d: number) => setSelectedWorkDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])
  const toggleService = (id: number) => setSelectedServices(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="flex gap-2 items-center justify-between flex-wrap">
        <div className="flex gap-2 items-center flex-1 flex-wrap">
          <div className="min-w-[200px] max-w-xs flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Ism, mutaxassislik, telefon..." />
          </div>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-semibold flex-shrink-0">
            {(['all','active','inactive'] as const).map(v => (
              <button key={v} onClick={() => setFilterActive(v)}
                className={cn('px-3 py-2 transition-colors whitespace-nowrap',
                  filterActive === v ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50')}>
                {v === 'all' ? 'Barchasi' : v === 'active' ? '● Faol' : '○ Faol emas'}
              </button>
            ))}
          </div>
          <select value={filterSpec} onChange={e => setFilterSpec(e.target.value)}
            className="input text-sm h-9 pr-8 w-auto flex-shrink-0" style={{ minWidth: 0 }}>
            <option value="">Barcha mutaxassisliklar</option>
            {specialities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{filtered.length} / {doctors.length} ta</span>
          <Button onClick={openCreate}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Shifokor qo'shish
          </Button>
        </div>
      </div>

      {/* Cards */}
      {isLoading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState message="Shifokor topilmadi" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <DoctorCard key={doc.id} doctor={doc} onEdit={openEdit} onDelete={setDeleteDoctor} />
          ))}
        </div>
      )}

      {/* Form Modal — xl size, 2 column, no scroll needed */}
      <Modal open={modalOpen} onClose={closeModal}
        title={editDoctor ? 'Shifokorni tahrirlash' : 'Yangi shifokor'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-x-6 gap-y-4">

          {/* LEFT */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input id="first_name" label="Ism *" placeholder="Alisher"
                error={errors.first_name?.message} {...register('first_name')} />
              <Input id="last_name" label="Familiya *" placeholder="Karimov"
                error={errors.last_name?.message} {...register('last_name')} />
            </div>

            {/* Gender */}
            <div>
              <label className="label">Jins</label>
              <div className="flex gap-3">
                {([['male', '👨 Erkak'], ['female', '👩 Ayol']] as const).map(([val, lbl]) => (
                  <label key={val} className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold',
                    String(watch('gender')) === val
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  )}>
                    <input type="radio" value={val} {...register('gender')} className="sr-only" />
                    {lbl}
                  </label>
                ))}
              </div>
            </div>

            {/* Speciality */}
            <div>
              <label className="label">Mutaxassislik *</label>
              <input id="speciality" list="spec-list" placeholder="Terapevt stomatolog"
                className={cn('input', errors.speciality && 'border-red-400')} {...register('speciality')} />
              <datalist id="spec-list">{SPECIALITIES.map(s => <option key={s} value={s} />)}</datalist>
              {errors.speciality && <p className="text-xs text-red-500 mt-1">{errors.speciality.message}</p>}
            </div>

            {/* Phone + Slot */}
            <div className="grid grid-cols-2 gap-3">
              <Input id="phone" label="Telefon" placeholder="+998901234567" {...register('phone')} />
              <Input id="slot_duration" label="Slot (daqiqa)" type="number"
                error={errors.slot_duration?.message} {...register('slot_duration')} />
            </div>

            {/* Work days */}
            <div>
              <label className="label">Ish kunlari</label>
              <div className="flex gap-1.5 flex-wrap">
                {WEEKDAYS_FULL.map((day, i) => (
                  <button key={i} type="button" onClick={() => toggleDay(i)}
                    className={cn('px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      selectedWorkDays.includes(i) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                    {day.slice(0, 2)}
                  </button>
                ))}
              </div>
            </div>

            {/* Active */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded accent-primary-600" {...register('is_active')} />
              <span className="text-sm text-gray-700 font-medium">Faol holat</span>
            </label>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            {/* Work time */}
            <div>
              <label className="label">Ish vaqti</label>
              <div className="flex gap-4">
                <TimePickerDrum value={workStart} onChange={setWorkStart} label="Boshlanishi" />
                <TimePickerDrum value={workEnd}   onChange={setWorkEnd}   label="Tugashi" />
              </div>
            </div>

            {/* Break */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" checked={showBreak} onChange={e => setShowBreak(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary-600" />
                <span className="text-sm font-medium text-gray-700">Tanaffus vaqti</span>
              </label>
              {showBreak && (
                <div className="flex gap-4 pl-2 border-l-2 border-primary-200">
                  <TimePickerDrum value={breakStart || '13:00'} onChange={setBreakStart} label="Boshi" />
                  <TimePickerDrum value={breakEnd   || '14:00'} onChange={setBreakEnd}   label="Oxiri" />
                </div>
              )}
            </div>

            {/* Services */}
            <div>
              <label className="label">Xizmatlar</label>
              <div className="flex gap-1.5 flex-wrap max-h-36 overflow-y-auto p-1 -m-1">
                {services.map(s => (
                  <button key={s.id} type="button" onClick={() => toggleService(s.id)}
                    className={cn('px-2.5 py-1 rounded-full text-xs font-semibold transition-all',
                      selectedServices.includes(s.id) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer — full width */}
          <div className="col-span-2 flex gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={closeModal} className="flex-1">
              Bekor qilish
            </Button>
            <Button type="submit" loading={isSubmitting || createMut.isPending || updateMut.isPending} className="flex-1">
              {editDoctor ? 'Saqlash' : "Qo'shish"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Confirm
        open={!!deleteDoctor}
        title="Shifokorni o'chirish"
        message={`Dr. ${deleteDoctor?.full_name}ni o'chirishni tasdiqlaysizmi?`}
        onConfirm={() => deleteDoctor && deleteMut.mutate(deleteDoctor.id)}
        onCancel={() => setDeleteDoctor(null)}
        confirmText="O'chirish"
        danger
      />
    </div>
  )
}
