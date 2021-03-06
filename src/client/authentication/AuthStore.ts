import { observable, action, computed } from 'mobx'
import { createContext } from 'react'
import { User } from '../../common/user/User'
import { StoreState } from '../types/store'

// TODO: use lens pattern for UserAuthenticationData

export interface UserAuthenticationData {
  authenticatedUser: User | null
}

const initialAuthState: UserAuthenticationData = {
  authenticatedUser: null,
}

class AuthStore {
  @observable authData: UserAuthenticationData = initialAuthState

  @observable authStoreState: StoreState = 'pristine'

  @action signIn = (user: User): void => {
    this.authData.authenticatedUser = user
  }

  @action signOut = (): void => {
    this.authData.authenticatedUser = null
  }

  @computed getAuthData = (): UserAuthenticationData => this.authData
}

export default createContext(new AuthStore())
