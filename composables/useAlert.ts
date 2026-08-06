import Swal from 'sweetalert2'

export function useAlert() {
  const isDark = () => document.documentElement.classList.contains('dark')

  const baseOptions = () => ({
    background: isDark() ? '#1f2937' : '#ffffff',
    color: isDark() ? '#f3f4f6' : '#1f2937',
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#6b7280',
    customClass: {
      popup: 'rounded-xl shadow-2xl',
    },
  })

  function success(title: string, text?: string) {
    return Swal.fire({
      ...baseOptions(),
      icon: 'success',
      title,
      text,
      timer: 3000,
      showConfirmButton: false,
    })
  }

  function error(title: string, text?: string) {
    return Swal.fire({
      ...baseOptions(),
      icon: 'error',
      title,
      text,
    })
  }

  function warning(title: string, text?: string) {
    return Swal.fire({
      ...baseOptions(),
      icon: 'warning',
      title,
      text,
      timer: 3000,
      showConfirmButton: false,
    })
  }

  function info(title: string, text?: string) {
    return Swal.fire({
      ...baseOptions(),
      icon: 'info',
      title,
      text,
      timer: 4000,
      showConfirmButton: false,
    })
  }

  function confirm(title: string, text: string) {
    return Swal.fire({
      ...baseOptions(),
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'Sim, confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
  }

  return { success, error, warning, info, confirm }
}
