import { ref } from 'vue'
import { authService } from '../../utils/auth'
import type { User } from '../../types'

const currentUser = ref<User | null>(null)

export async function fetchCurrentUser() {
  currentUser.value = await authService.getCurrentUser()
  return currentUser.value
}

export function useCurrentUser() {
  return currentUser
}
