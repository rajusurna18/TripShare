import { useEffect } from "react";
import API from "../services/api";

function Home() {

  useEffect(() => {
    API.get("/")
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h1>TripShare 🌍</h1>
    </div>
  );
}

export default Home;