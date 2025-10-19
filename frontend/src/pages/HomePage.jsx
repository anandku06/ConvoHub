import { UserButton } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useStreamChat } from '../hooks/useStreamChat'
import PageLoader from '../components/PageLoader'

export const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeChannel, setActiveChannel] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const {chatClient, tokenLoading, tokenError} = useStreamChat()

  // set the active channel from the URL param
  useEffect(() => {
    if (chatClient) {
      const channelId = searchParams.get('channel')
      
      if(channelId){
        const channel = chatClient.channel("messaging", channelId)
        setActiveChannel(channel)
      }
    }
  }, [chatClient, searchParams])

  if (tokenError) return <p>Something went wrong!!</p>
  if (tokenLoading || !chatClient) return <PageLoader />

  return (
    <div>
        <UserButton />
        Home Page
    </div>
  )
}
