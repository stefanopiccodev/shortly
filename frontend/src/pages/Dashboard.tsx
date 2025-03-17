import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import UrlShortener from "../components/UrlShortener";

type Url = {
  id: string;
  original: string;
  shortUrl: string;
  slug: string;
  visits: number;
  createdAt: string;
};

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    toast.error("Authentication context is not available");
    return null;
  }
  const { token, logout } = authContext;
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/url/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUrls(res.data);
      } catch (err) {
        let errorMessage = "Failed to fetch URLs";
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchUrls();
  }, [token]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:4000/api/url/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUrls(urls.filter((url) => url.id !== id));
      toast.success("URL deleted successfully");
    } catch (error) {
      toast.error("Failed to delete URL");
    }
  };

  const addNewUrl = (newUrl: Url) => {
    setUrls((prevUrls) => [newUrl, ...prevUrls]);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Your Shortened URLs</h2>
        <button
          onClick={logout}
          className="mb-6 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Logout
        </button>

      <div className="w-full max-w-2xl mb-8">
        <UrlShortener onNewUrl={addNewUrl} />
      </div>
      {urls.length === 0 ? (
        <p className="text-gray-600">No URLs found. Start shortening some!</p>
      ) : (
        <div className="w-full max-w-3xl space-y-4">
          {urls.map((url) => (
            <div key={url.id} className="bg-white p-4 rounded-lg shadow-md ">
              <div className="flex flex-row items-center justify-between space-x-4">
                <h3 className="font-semibold text-lg truncate w-1/3">{url.original}</h3>
                <a
                  href={url.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 w-1/3"
                >
                  {url.shortUrl}
                </a>
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full w-1/6">
                  {url.visits} visits
                </span>
                <div className="text-sm text-gray-500 w-1/6">
                  Created: {new Date(url.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <button
                  onClick={() => handleDelete(url.id)}
                  className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
