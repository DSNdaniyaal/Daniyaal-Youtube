export function Appbar() {
    return <div style={{"display": "flex", "justifyContent": "space-between"}}>
        Youtube
        <div>
            <button onClick={() => window.location = "/upload"}>
                Upload
            </button>
        </div>
    </div>
}