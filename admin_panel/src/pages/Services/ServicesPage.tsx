import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { servicesApi } from '@/api'
import { Button, Input, Select, Spinner, Modal, Confirm, Badge, EmptyState } from '@/components/ui'
import { SearchInput } from '@/components/ui/SearchInput'
import type { Service, ServiceFormData } from '@/types'
import { formatCurrency } from '@/utils'

const schema = z.object({
  name: z.string().min(1, 'Nomi kiritilmagan'),
  name_ru: z.string().optional().default(''),
  description: z.string().optional().default(''),
  price: z.coerce.number().min(0, 'Narx kiritilmagan'),
  duration: z.coerce.number().min(5).max(360),
  category: z.coerce.number().optional(),
  is_active: z.boolean().default(true),
})

type FormData = z.infer<typeof schema>

export default function ServicesPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editService, setEditService] = useState<Service | null>(null)
  const [deleteService, setDeleteService] = useState<Service | null>(null)
  const [filterCat, setFilterCat] = useState<string>('')
  const [search, setSearch] = useState('')

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list({}).then(r => r.data),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['service-categories'],
    queryFn: () => servicesApi.categories().then(r => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { duration: 30, is_active: true },
  })

  const createMut = useMutation({
    mutationFn: (d: ServiceFormData) => servicesApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); closeModal(); toast.success('Xizmat qo\'shildi') },
    onError: () => toast.error('Xato yuz berdi'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ServiceFormData> }) => servicesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); closeModal(); toast.success('Yangilandi') },
    onError: () => toast.error('Xato yuz berdi'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => servicesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setDeleteService(null); toast.success("O'chirildi") },
    onError: () => toast.error('Xato yuz berdi'),
  })

  const openCreate = () => {
    setEditService(null)
    reset({ duration: 30, is_active: true })
    setModalOpen(true)
  }

  const openEdit = (svc: Service) => {
    setEditService(svc)
    reset({
      name: svc.name, name_ru: svc.name_ru || '',
      description: svc.description || '',
      price: svc.price, duration: svc.duration,
      category: svc.category ?? undefined,
      is_active: svc.is_active,
    })
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditService(null) }

  const onSubmit = (data: FormData) => {
    const payload = { ...data, category: data.category || null } as ServiceFormData
    if (editService) {
      updateMut.mutate({ id: editService.id, data: payload })
    } else {
      createMut.mutate(payload)
    }
  }

  const filtered = useMemo(() => {
    let result = filterCat ? services.filter(s => String(s.category) === filterCat) : services
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.name_ru || '').toLowerCase().includes(q) ||
        (s.category_name || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [services, filterCat, search])

  const catOptions = categories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="min-w-[220px] flex-1 max-w-xs">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Xizmat nomi, kategoriya..."
          />
        </div>
        <div className="flex-1">
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="input w-48 text-sm"
          >
            <option value="">Barcha kategoriyalar</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-500">{filtered.length} ta xizmat</p>
        <Button onClick={openCreate}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Xizmat qo'shish
        </Button>
      </div>

      {/* Table */}
      {isLoading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState message="Xizmat topilmadi" />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Xizmat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategoriya</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Narxi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vaqt</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Holat</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(svc => (
                <tr key={svc.id} className="table-row">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{svc.name}</p>
                    {svc.name_ru && <p className="text-xs text-gray-400">{svc.name_ru}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">
                    {svc.category_name || '—'}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-900">
                    {formatCurrency(svc.price)}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">
                    {svc.duration} daq
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge className={svc.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                      {svc.is_active ? 'Faol' : 'Faol emas'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(svc)}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => setDeleteService(svc)}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editService ? 'Xizmatni tahrirlash' : 'Yangi xizmat'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="name" label="Nomi (UZ) *" placeholder="Plomba (bir tish)" error={errors.name?.message} {...register('name')} />
          <Input id="name_ru" label="Nomi (RU)" placeholder="Пломба (один зуб)" {...register('name_ru')} />
          <div className="grid grid-cols-2 gap-3">
            <Input id="price" label="Narxi (so'm) *" type="number" placeholder="150000" error={errors.price?.message} {...register('price')} />
            <Input id="duration" label="Davomiyligi (daqiqa)" type="number" error={errors.duration?.message} {...register('duration')} />
          </div>
          <Select
            id="category" label="Kategoriya"
            placeholder="Tanlang..."
            options={catOptions}
            {...register('category')}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded accent-primary-600" {...register('is_active')} />
            <span className="text-sm text-gray-700">Faol</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={closeModal} className="flex-1">Bekor qilish</Button>
            <Button type="submit" loading={isSubmitting || createMut.isPending || updateMut.isPending} className="flex-1">
              {editService ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </div>
        </form>
      </Modal>

      <Confirm
        open={!!deleteService}
        title="Xizmatni o'chirish"
        message={`"${deleteService?.name}" xizmatini o'chirishni tasdiqlaysizmi?`}
        onConfirm={() => deleteService && deleteMut.mutate(deleteService.id)}
        onCancel={() => setDeleteService(null)}
        confirmText="O'chirish"
        danger
      />
    </div>
  )
}
