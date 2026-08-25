import { useNavigate } from "react-router";

interface IVideoCard {
    imageURL: string;
    title: string;
    channelImage: string;
    channelName: string;
    href: string;
}

export function VideoCard({imageURL, title, channelImage, channelName, href}: IVideoCard) {
    const navigate = useNavigate()
    return <div style = {{borderRadius: 30, margin: 20}} onClick={() => navigate(href)}>
        <img src={imageURL} style = {{display:'block' ,width: '100%', borderRadius: 30}}></img>
        <div> {title} </div>
        <div>
            <img src={channelImage} style={{ width: 30, borderRadius: '50%'}}></img>
            {channelName}
        </div>
    </div>
}