import { Button } from '@/components/ui/button'
import { LoginLink } from '@kinde-oss/kinde-auth-nextjs/components'
import React from 'react'

const LandingPage = () => {
  return (
    <div>
      <header>
        landing page
        <LoginLink>
          <Button>
            Sign in
          </Button>
        </LoginLink>
      </header>
    </div>
  )
}

export default LandingPage