import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { doctorsApi, servicesApi } from '@/api'
import { Button, Input, Select, Modal, Confirm, Spinner, Badge, EmptyState } from '@/components/ui'
import type { Doctor, DoctorFormData } from '@/types'
import { WEEKDAYS_FULL } from '@/utils'

const schema = z.object({
  first_name: z.string().min(1, 'Ism kiritilmagan'),
  last_name: z.string().min(1, 'Familiya kiritilmagan'),
  speciality: z.string().min(1, 'Mutaxassislik kiritilmagan'),
  phone: z.string().optional().default(''),
  telegram_id: z.string().optional(),
  slot_duration: z.coerce.number().min(10).max(120),
  work_start: z.string(),
  work_end: z.string(),
  break_start: z.string().optional().default(''),
  break_end: z.string().optional().default(''),
  is_active: z.boolean().default(true),
})

type FormData = z.infer<typeof schema>

function DoctorCard({ doctor, onEdit, onDelete }: {
  doctor: Doctor
  onEdit: (d: Doctor) => void
  onDelete: (d: Doctor) => void
}) {
  return (
    <div className="card hover:shadow-card-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-primary-700">
            {doctor.first_name.charAt(0)}{doctor.last_name.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">Dr. {doctor.full_name}</h3>
            <Badge className={doctor.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
              {doctor.is_active ? 'Faol' : 'Faol emas'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{doctor.speciality}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
            <span>⏰ {doctor.work_start}–{doctor.work_end}</span>
            <span>🕐 {doctor.slot_duration} daq</span>
            {doctor.phone && <span>📞 {doctor.phone}</span>}
            <span>📋 Bugun: {doctor.today_appointments} qabul</span>
          </div>
          {/* Work days */}
          <div className="flex gap-1 mt-2 flex-wrap">
            {WEEKDAYS_FULL.map((day, i) => (
              <span
                key={i}
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  doctor.work_days.includes(i)
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {day.slice(0, 2)}
              </span>
            ))}
          </div>
          {/* Services */}
          {doctor.services.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {doctor.services.slice(0, 3).map((s) => (
                <span key={s.id} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
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
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onEdit(doctor)}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => onDelete(doctor)}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DoctorsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null)
  const [deleteDoctor, setDeleteDoctor] = useState<Doctor | null>(null)
  const [selectedWorkDays, setSelectedWorkDays] = useState<number[]>([0, 1, 2, 3, 4])
  const [selectedServices, setSelectedServices] = useState<number[]>([])

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorsApi.list({}).then(r => r.data),
  })

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list({}).then(r => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { slot_duration: 30, work_start: '09:00', work_end: '18:00', is_active: true },
  })

  const createMut = useMutation({
    mutationFn: (d: DoctorFormData) => doctorsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['doctors'] }); closeModal(); toast.success('Shifokor qo\'shildi') },
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
    setSelectedWorkDays([0, 1, 2, 3, 4])
    setSelectedServices([])
    reset({ slot_duration: 30, work_start: '09:00', work_end: '18:00', is_active: true })
    setModalOpen(true)
  }

  const openEdit = (doctor: Doctor) => {
    setEditDoctor(doctor)
    setSelectedWorkDays(doctor.work_days)
    setSelectedServices(doctor.services.map(s => s.id))
    reset({
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      speciality: doctor.speciality,
      phone: doctor.phone || '',
      telegram_id: doctor.telegram_id?.toString() || '',
      slot_duration: doctor.slot_duration,
      work_start: doctor.work_start,
      work_end: doctor.work_end,
      break_start: doctor.break_start || '',
      break_end: doctor.break_end || '',
      is_active: doctor.is_active,
    })
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditDoctor(null) }

  const onSubmit = (data: FormData) => {
    const payload: DoctorFormData = {
      ...data,
      telegram_id: data.telegram_id ? Number(data.telegram_id) : null,
      photo: null,
      work_days: selectedWorkDays,
      break_start: data.break_start || null,
      break_end: data.break_end || null,
      service_ids: selectedServices,
    }
    if (editDoctor) {
      updateMut.mutate({ id: editDoctor.id, data: payload })
    } else {
      createMut.mutate(payload)
    }
  }

  const toggleDay = (d: number) => {
    setSelectedWorkDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    )
  }

  const toggleService = (id: number) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{doctors.length} ta shifokor</p>
        <Button onClick={openCreate}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Shifokor qo'shish
        </Button>
      </div>

      {/* List */}
      {isLoading ? <Spinner /> : doctors.length === 0 ? (
        <EmptyState message="Shifokor topilmadi" />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {doctors.map(doc => (
            <DoctorCard key={doc.id} doctor={doc} onEdit={openEdit} onDelete={setDeleteDoctor} />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editDoctor ? 'Shifokorni tahrirlash' : 'Yangi shifokor'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input id="first_name" label="Ism *" placeholder="Alisher" error={errors.first_name?.message} {...register('first_name')} />
            <Input id="last_name" label="Familiya *" placeholder="Karimov" error={errors.last_name?.message} {...register('last_name')} />
          </div>
          <Input id="speciality" label="Mutaxassislik *" placeholder="Terapevt stomatolog" error={errors.speciality?.message} {...register('speciality')} />
          <div className="grid grid-cols-2 gap-3">
            <Input id="phone" label="Telefon" placeholder="+998 90 123 45 67" {...register('phone')} />
            <Input id="telegram_id" label="Telegram ID" placeholder="123456789" {...register('telegram_id')} />
          </div>

          {/* Ish vaqti */}
          <div className="grid grid-cols-3 gap-3">
            <Input id="work_start" label="Ish boshlanishi" type="time" {...register('work_start')} />
            <Input id="work_end" label="Ish tugashi" type="time" {...register('work_end')} />
            <Input id="slot_duration" label="Slot (daqiqa)" type="number" {...register('slot_duration')} error={errors.slot_duration?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input id="break_start" label="Tanaffus boshlanishi" type="time" {...register('break_start')} />
            <Input id="break_end" label="Tanaffus tugashi" type="time" {...register('break_end')} />
          </div>

          {/* Ish kunlari */}
          <div>
            <label className="label">Ish kunlari</label>
            <div className="flex gap-2 flex-wrap">
              {WEEKDAYS_FULL.map((day, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedWorkDays.includes(i)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day.slice(0, 2)}
                </button>
              ))}
            </div>
          </div>

          {/* Xizmatlar */}
          <div>
            <label className="label">Xizmatlar</label>
            <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto p-1">
              {services.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedServices.includes(s.id)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Faol */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded accent-primary-600" {...register('is_active')} />
            <span className="text-sm text-gray-700">Faol holat</span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={closeModal} className="flex-1">Bekor qilish</Button>
            <Button type="submit" loading={isSubmitting || createMut.isPending || updateMut.isPending} className="flex-1">
              {editDoctor ? 'Saqlash' : 'Qo\'shish'}
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
