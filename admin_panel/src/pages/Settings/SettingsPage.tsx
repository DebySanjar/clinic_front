import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { settingsApi } from '@/api'
import { Button, Input, Spinner } from '@/components/ui'
import type { ClinicSettings } from '@/types'

export default function SettingsPage() {
  const qc = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then(r => r.data),
  })

  const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm<ClinicSettings>()

  useEffect(() => {
    if (settings) reset(settings)
  }, [settings, reset])

  const mutation = useMutation({
    mutationFn: (data: Partial<ClinicSettings>) => settingsApi.update(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); toast.success('Sozlamalar saqlandi') },
    onError: () => toast.error('Xato yuz berdi'),
  })

  const onSubmit = (data: ClinicSettings) => mutation.mutate(data)

  if (isLoading) return <Spinner />

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Klinika */}
        <div className="card space-y-4">
          <h2 className="section-title">Klinika ma'lumotlari</h2>
          <Input id="name" label="Klinika nomi" {...register('name')} />
          <Input id="address" label="Manzil" placeholder="Toshkent sh., Chilonzor tumani" {...register('address')} />
          <Input id="phone" label="Telefon" placeholder="+998 71 234 56 78" {...register('phone')} />
        </div>

        {/* Ish vaqti */}
        <div className="card space-y-4">
          <h2 className="section-title">Ish vaqtlari</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input id="work_start" label="Boshlanishi" type="time" {...register('work_start')} />
            <Input id="work_end" label="Tugashi" type="time" {...register('work_end')} />
          </div>
        </div>

        {/* Telegram */}
        <div className="card space-y-4">
          <h2 className="section-title">Telegram Bot</h2>
          <Input
            id="telegram_bot_token"
            label="Bot Token"
            placeholder="123456789:ABCDEFghijklmnop..."
            {...register('telegram_bot_token')}
          />
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded accent-primary-600" {...register('reminder_24h')} />
              <span className="text-sm text-gray-700">24 soat eslatma</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded accent-primary-600" {...register('reminder_1h')} />
              <span className="text-sm text-gray-700">1 soat eslatma</span>
            </label>
          </div>
        </div>

        {/* Reminder shablonlar */}
        <div className="card space-y-4">
          <h2 className="section-title">Eslatma shablonlari</h2>
          <p className="text-xs text-gray-400">
            Mavjud o'zgaruvchilar: {'{date}'}, {'{time}'}, {'{doctor}'}, {'{service}'}, {'{clinic_name}'}, {'{address}'}, {'{phone}'}
          </p>
          <div>
            <label className="label">24 soat oldin</label>
            <textarea
              className="input resize-none"
              rows={4}
              {...register('reminder_24h_template')}
            />
          </div>
          <div>
            <label className="label">1 soat oldin</label>
            <textarea
              className="input resize-none"
              rows={4}
              {...register('reminder_1h_template')}
            />
          </div>
        </div>

        <Button
          type="submit"
          loading={isSubmitting || mutation.isPending}
          disabled={!isDirty}
          className="w-full"
        >
          Sozlamalarni saqlash
        </Button>
      </form>
    </div>
  )
}
