import { VideoCard } from "@/components/VideoCard";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

export function Videopage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [videoDetails, setVideoDetails] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedVideos, setRecommendedVideos] = useState([]);

  const id = searchParams.get("id");

  useEffect(() => {
    axios.get("http://localhost:8080/api/videos/" + id).then((response) => {
      setVideoDetails(response.data);
      setIsLoading(false);
    });
  }, [id]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/videos").then((response) => {
      const data = response.data;
      setRecommendedVideos(data);
    });
  }, []);

  return
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      {isLoading && <div> loading </div> }
      {!isLoading && <div>
        <video src={videoDetails.videoUrl} />
        <br />
        <div>{videoDetails.title}</div>
        <div>{videoDetails.user.channelName}</div>
        <div>{videoDetails.user.profilePicture}</div>
      </div>}
      <div>
        {recommendedVideos.map((video) => (
          <VideoCard
            href={`watch/?id=${video.id}`}
            imageURL={video.thumbnail}
            title={video.title}
            channelImage={video.user.channelImage}
            channelName={video.user.channelName}
          />
        ))}
      </div>
    </div>
  );
}
