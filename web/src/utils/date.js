import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

export const formatDate = (date) => {
  if (!date) return ''
  return format(parseISO(date), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })
}

export const formatDateOnly = (date) => {
  if (!date) return ''
  return format(parseISO(date), 'yyyy년 MM월 dd일', { locale: ko })
}

export const formatTimeOnly = (date) => {
  if (!date) return ''
  return format(parseISO(date), 'HH:mm', { locale: ko })
} 