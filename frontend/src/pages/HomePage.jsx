import { UserButton } from '@clerk/clerk-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useStreamChat } from '../hooks/useStreamChat'

export const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeChannel, setActiveChannel] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const {chatClient, tokenLoading, tokenError} = useStreamChat()

  return (
    <div>
        <UserButton />
        Home Page
    </div>
  )
}
