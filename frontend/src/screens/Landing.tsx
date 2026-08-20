import { VideoCard } from '@/components/VideoCard'
import axios from 'axios'
import { useEffect, useState } from 'react'

export function Landing() {
    const [videos, settVideos] = useState([])

    useEffect(() => {
        axios.get("http://localhost:8080/api/videos")
            .then(response => {
                const data = response.data
                settVideos(data)
            })
    },[])
  return (
    <div>
       <div style={{display: 'flex', padding: 50}}>
      {videos.map(video => <VideoCard 
      href={`watch/?id=${video.id}`}
      imageURL={video.thumbnail}
      title={video.title}
      channelImage={video.user.channelImage}
      channelName={video.user.channelName}
      />)}
    </div>
     </div>
  );
}