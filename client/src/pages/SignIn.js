import React from 'react'
import { auth } from '../firebase'
import { FcGoogle } from 'react-icons/fc'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const SignIn = () => {

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    if (result.user) {
      saveUserData(result.user)
    }
  }

  const saveUserData = async (user) => {
    const BASE_URL = process.env.REACT_APP_BASE_URL
    const response = await fetch(BASE_URL + 'signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: user.uid,
        email: user.email,
        name: user.displayName
      })
    })
    if (!response.ok) {
      console.error('Failed to save user data')
    }
  }

  return (
    <div className='signin'>
      <div className='signin__container'>
        <button className="signin__btn flex items-center justify-center" onClick={signInWithGoogle}>
          <FcGoogle className='m-2' />
          Sign in with Google
        </button>

        <p className='signin__tos'>Do not violate the community guidelines or you will be banned for life!</p>
      </div>
    </div>
  )
}

export default SignIn