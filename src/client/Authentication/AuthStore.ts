import { observable, action, computed } from 'mobx'
import { User } from '../../common/user/User'
import { createContext } from 'react'

// TODO: use lens pattern for UserAuthenticationData

export interface UserAuthenticationData {
  authenticatedUser: User | null
  isUserLoggedIn: boolean
}

const initialAuthState: UserAuthenticationData = {
  authenticatedUser: null,
  isUserLoggedIn: false,
}

class AuthStore {
  @observable authData: UserAuthenticationData = initialAuthState

  @action signIn = (user: User) => {
    this.authData.authenticatedUser = user
    this.authData.isUserLoggedIn = true
  }

  @action signOut = () => {
    this.authData.authenticatedUser = null
    this.authData.isUserLoggedIn = false
  }

  @computed getAuthData = () => this.authData
}

export default createContext(new AuthStore())
