import axios from "axios";

export function Upload() {
  async function upload() {
    await axios.post(
      "http://localhost:8080/api/videos",
      {
        videoUrl: document.getElementById("videoUrl")!.value,
        thumbnail: document.getElementById("thumbnail")!.value,
        title: document.getElementById("title")!.value,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
  }

  return (
    <div>
      <input
        type="file"
        onChange={async (e, files) => {
          const file = e.target.files[0];

          const response = await axios.get(
            "http://localhost:8080/api/getPresignedUrl",
          );

          const { putUrl, finalVideoUrl } = response.data;
          console.log(putUrl)

          const options = {
            method: "PUT",
            url: putUrl ,
            headers: {
              "Content-Type": file.type
            },
            data: file  
        };

          await axios.request(options)

          await axios.post("http://localhost:8080/api/video", {
            videoUrl: finalVideoUrl
          })

          setVideoUrl(finalVideoUrl)
          alert("video upload completed")
        }}
      />
      <input id="thumbnail" type="text" placeholder="thumbnail"></input>
      <input id="title" type="text" placeholder="title"></input>
      <button onClick={upload}>Comlete Upload</button>
      Upload Page
    </div>
  );
}
