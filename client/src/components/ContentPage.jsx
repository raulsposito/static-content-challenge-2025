import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ContentPage = () => {
  const { "*": slug } = useParams(); // Capture dynamic route
  const [content, setContent] = useState('<p>Loading...</p>');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/${slug || ""}`);

        if (!response.ok) {
          throw new Error("Content not found");
        }

        const data = await response.json();
        console.log("🚀 ~ fetchContent ~ data:", data)
        setContent(data.html || '<p>Page not found</p>');
      } catch (err) {
        setError(err.message);
        setContent('<p>Error loading content</p>');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug]);

  if (loading) return <div>Loading...</div>;

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  );
};

export default ContentPage;
