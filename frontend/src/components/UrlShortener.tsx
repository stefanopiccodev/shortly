import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

interface Url {
  id: string;
  original: string;
  shortUrl: string;
  slug: string;
  visits: number;
  createdAt: string;
}

interface UrlShortenerProps {
  onNewUrl: (newUrl: Url) => void;
}

const UrlShortener = ({ onNewUrl }: UrlShortenerProps) => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    toast.error("Authentication context is not available");
    return null; // Render nothing if AuthContext is null
  }
  const { token } = authContext;
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state

  const handleShorten = async () => {
    if (!url.trim()) {
      toast.error("URL cannot be empty"); // Validation for empty URL
      return;
    }

    setLoading(true); // Set loading to true
    try {
      const res = await axios.post(
        "http://localhost:4000/api/url/shorten",
        { url, slug },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShortUrl(res.data.shortUrl);
      toast.success("URL Shortened!");
      onNewUrl(res.data); // Call onNewUrl with the new URL data
    } catch (err) {
      let errorMessage = "Failed to shorten URL"; // Default error message
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMessage = err.response.data.error; // Extract error message from Axios response
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold mb-4">Shorten a URL</h2>
      <input
        type="text"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full p-3 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="Custom Slug (optional)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="w-full p-3 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleShorten}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {loading ? "Shortening..." : "Shorten"}
      </button>
      {shortUrl && (
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">Shortened URL:</p>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
            {shortUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default UrlShortener;
