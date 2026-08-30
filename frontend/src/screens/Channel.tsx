import { VideoCard } from "@/components/VideoCard";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

interface channelDetails {
    id: string;
    username: string;
    banner: string | null;
    profilePicture: string | null;
    subscriberCount: number;
}

export function Channel() {
  const { username } = useParams();
  const [uploads, setUploads] = useState([]);
  const [channelDetails, setChannelDetails] = useState<channelDetails | null> (null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8080/channel/" + username).then((response) => {
      const { uploads, channelDetails } = response.data;
      setUploads(uploads);
      setChannelDetails(channelDetails);
      setIsLoading(false);
    });
  }, [username]);

  function subscribe(){
    axios.get("http://localhost:8080/channel/" + username).then((response) => {
      const { uploads, channelDetails } = response.data;
      setUploads(uploads);
      setChannelDetails(channelDetails);
      setIsLoading(false);
    });
  }

  return isLoading ? (
    <h1>Loading</h1>
  ) : (
    <div> 
      <button onClick={subscribe}> Subscribe </button>
    </div>
    <div>
        <img src={channelDetails.banner} />
      {uploads.map((video) => (
        <VideoCard
          href={`/watch/?id=${video.id}`}
          imageURL={video.thumbnail}
          title={video.title}
          channelImage={channelDetails.channelImage}
          channelName={channelDetails.userName}
        />
      ))}
    </div>
  );
}
