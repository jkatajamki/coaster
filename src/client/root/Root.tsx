import React, { FunctionComponent, useState, useEffect } from 'react'
import * as E from 'fp-ts/lib/Either'
import LoginForm from '../authentication/LoginForm'
import pingApi from '../networking/ping'
import { pipe } from 'fp-ts/lib/pipeable'

const Root: FunctionComponent = () => {
  const [apiStatus, setApiStatus] = useState({})

  useEffect(() => {
    pingApi()().then(either => pipe(either, E.fold(
      (error) => {
        console.error('Error pinging API:', error)
      },
      apiStatus => setApiStatus(apiStatus)
    )))
  }, [])

  console.log('apiStatus', apiStatus)

  return (
    <>
      <main>
        <h1>Coaster</h1>

        <LoginForm />
      </main>
    </>
  )
}

export default Root
