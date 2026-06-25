import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [existingCoverUrl, setExistingCoverUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Notion-style JSON Blocks state
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setFetching(true);
      const res = await API.get(`/blogs/${id}`);
      if (res.data.success) {
        const { blog } = res.data;
        setTitle(blog.title);
        setDestination(blog.destination);
        setTags(blog.tags || []);
        setVisibility(blog.visibility);
        setExistingCoverUrl(blog.coverImage);
        
        // Parse blocks content
        try {
          const parsed = JSON.parse(blog.content);
          if (Array.isArray(parsed)) {
            setBlocks(parsed);
          } else if (parsed && typeof parsed === "object" && Array.isArray(parsed.blocks)) {
            setBlocks(parsed.blocks);
          } else {
            setBlocks([{ id: "b1", type: "paragraph", data: { text: parsed } }]);
          }
        } catch (e) {
          // Fallback if plain text content
          setBlocks([{ id: "b1", type: "paragraph", data: { text: blog.content } }]);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load blog post");
      navigate("/blogs");
    } finally {
      setFetching(false);
    }
  };

  const handleAddBlock = (type) => {
    const newId = `b_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    let initialData = { text: "" };
    
    if (type === "header") {
      initialData = { text: "", level: 2 };
    } else if (type === "list") {
      initialData = { items: [""], style: "unordered" };
    } else if (type === "quote") {
      initialData = { text: "", caption: "" };
    } else if (type === "code") {
      initialData = { text: "", language: "javascript" };
    } else if (type === "image") {
      initialData = { url: "", file: null, preview: "", caption: "" };
    }

    setBlocks([...blocks, { id: newId, type, data: initialData }]);
  };

  const handleUpdateBlock = (blockId, updatedData) => {
    setBlocks(
      blocks.map((block) =>
        block.id === blockId ? { ...block, data: { ...block.data, ...updatedData } } : block
      )
    );
  };

  const handleRemoveBlock = (blockId) => {
    if (blocks.length === 1) {
      toast.error("An article must contain at least one content block.");
      return;
    }
    setBlocks(blocks.filter((b) => b.id !== blockId));
  };

  const handleMoveBlock = (index, direction) => {
    const newBlocks = [...blocks];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    
    // Swap blocks
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setBlocks(newBlocks);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().toLowerCase();
    if (tags.includes(cleanTag)) {
      toast.error("Tag already added");
      return;
    }
    setTags([...tags, cleanTag]);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim()) {
      toast.error("Title and destination are required.");
      return;
    }

    // Check if blocks have content
    const emptyBlocks = blocks.filter(b => {
      if (b.type === "paragraph" || b.type === "header" || b.type === "quote" || b.type === "code") {
        return !b.data.text.trim();
      }
      if (b.type === "list") {
        return b.data.items.every(item => !item.trim());
      }
      if (b.type === "image") {
        return !b.data.url && !b.data.file;
      }
      return false;
    });

    if (emptyBlocks.length === blocks.length) {
      toast.error("Please add content to your article blocks.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("destination", destination);
      formData.append("tags", JSON.stringify(tags));
      formData.append("visibility", visibility);
      
      // Clean up blocks preview URLs before sending
      const cleanedBlocks = blocks.map(block => {
        if (block.type === "image") {
          const { file, preview, ...rest } = block.data;
          return { ...block, data: rest };
        }
        return block;
      });
      formData.append("content", JSON.stringify(cleanedBlocks));

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      // If blocks have new image files, attach them
      blocks.forEach((block) => {
        if (block.type === "image" && block.data.file) {
          formData.append(`block_image_${block.id}`, block.data.file);
        }
      });

      const res = await API.put(`/blogs/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data.success) {
        toast.success("Blog updated successfully! 🚀");
        navigate(`/blog/${id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container py-5 mt-5 text-center text-warning">
        <span className="spinner-border spinner-border-lg" role="status"></span>
        <p className="mt-3">Loading travel story details...</p>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-4" style={{ maxWidth: "800px" }}>
      <h2 className="text-warning fw-bold mb-4">Edit Travel Story ✏️</h2>

      <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
        
        {/* Cover Image Upload */}
        <div className="glass-card p-4">
          <label className="form-label text-white-50 fw-semibold">Cover Image</label>
          <div 
            className="border border-secondary border-dashed rounded p-3 text-center position-relative cursor-pointer hover-lift bg-dark bg-opacity-20"
            style={{ minHeight: "150px", borderStyle: "dashed" }}
          >
            {coverPreview || existingCoverUrl ? (
              <div className="position-relative">
                <img 
                  src={coverPreview || existingCoverUrl} 
                  alt="Cover Preview" 
                  className="img-fluid rounded" 
                  style={{ maxHeight: "200px", objectFit: "cover", width: "100%" }} 
                />
                <button 
                  type="button" 
                  className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setCoverImage(null); 
                    setCoverPreview(""); 
                    setExistingCoverUrl(""); 
                  }}
                >
                  Remove ✕
                </button>
              </div>
            ) : (
              <div className="py-4">
                <p className="mb-2 text-secondary">Click to upload or drag cover image</p>
                <small className="text-muted d-block">Recommended format: JPG/PNG, Max 5MB</small>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer" 
                  onChange={handleCoverChange} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Basic Fields */}
        <div className="glass-card p-4 d-flex flex-column gap-3">
          <div>
            <label className="form-label text-white-50 fw-semibold">Blog Title</label>
            <input
              type="text"
              className="form-control bg-dark border-secondary text-light py-2.5 fw-bold"
              style={{ fontSize: "1.2rem" }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <label className="form-label text-white-50 fw-semibold">Destination</label>
              <input
                type="text"
                className="form-control bg-dark border-secondary text-light py-2"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label text-white-50 fw-semibold">Visibility</label>
              <select
                className="form-select bg-dark border-secondary text-light py-2"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="public">🌍 Public (Everyone)</option>
                <option value="followers_only">👥 Followers Only</option>
                <option value="private">🔒 Private (Draft)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Blocks Editor */}
        <div className="glass-card p-4 d-flex flex-column gap-3.5">
          <label className="form-label text-white-50 fw-semibold d-flex justify-content-between">
            <span>Story Content Blocks</span>
            <small className="text-secondary">Notion-style interactive rich text</small>
          </label>

          <div className="d-flex flex-column gap-3">
            {blocks.map((block, index) => (
              <div 
                key={block.id} 
                className="d-flex gap-2.5 align-items-start p-2.5 rounded bg-dark bg-opacity-25 border border-secondary border-opacity-10 position-relative"
              >
                {/* Control Handles */}
                <div className="d-flex flex-column gap-1">
                  <button 
                    type="button" 
                    className="btn btn-link text-white-50 p-0 text-decoration-none border-0" 
                    onClick={() => handleMoveBlock(index, -1)}
                    disabled={index === 0}
                  >
                    🔺
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-link text-white-50 p-0 text-decoration-none border-0" 
                    onClick={() => handleMoveBlock(index, 1)}
                    disabled={index === blocks.length - 1}
                  >
                    🔻
                  </button>
                </div>

                {/* Block Inputs */}
                <div className="flex-grow-1">
                  {block.type === "paragraph" && (
                    <textarea
                      rows="3"
                      className="form-control bg-dark border-secondary border-opacity-40 text-light"
                      value={block.data.text}
                      onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                    />
                  )}

                  {block.type === "header" && (
                    <div className="d-flex gap-2 align-items-center">
                      <select
                        className="form-select bg-dark border-secondary border-opacity-40 text-light w-auto"
                        value={block.data.level || 2}
                        onChange={(e) => handleUpdateBlock(block.id, { level: parseInt(e.target.value) })}
                      >
                        <option value={2}>Heading 2</option>
                        <option value={3}>Heading 3</option>
                        <option value={4}>Heading 4</option>
                      </select>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary border-opacity-40 text-light fw-bold"
                        value={block.data.text}
                        onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                      />
                    </div>
                  )}

                  {block.type === "quote" && (
                    <div className="d-flex flex-column gap-2 border-start border-warning ps-3">
                      <textarea
                        rows="2"
                        className="form-control bg-dark border-secondary border-opacity-40 text-light italic"
                        value={block.data.text}
                        onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                      />
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary border-opacity-40 text-white-50 small w-50"
                        placeholder="Citation (Author name)..."
                        value={block.data.caption || ""}
                        onChange={(e) => handleUpdateBlock(block.id, { caption: e.target.value })}
                      />
                    </div>
                  )}

                  {block.type === "code" && (
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-secondary">Code Snippet</small>
                        <input
                          type="text"
                          className="form-control bg-dark border-secondary border-opacity-40 text-white-50 small py-0.5 px-2 w-auto"
                          value={block.data.language || "javascript"}
                          onChange={(e) => handleUpdateBlock(block.id, { language: e.target.value })}
                        />
                      </div>
                      <textarea
                        rows="4"
                        className="form-control bg-dark border-secondary border-opacity-40 text-warning font-monospace"
                        value={block.data.text}
                        onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                      />
                    </div>
                  )}

                  {block.type === "list" && (
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex gap-2 align-items-center">
                        <span className="text-white-50 small">Style:</span>
                        <button
                          type="button"
                          className={`btn btn-sm ${block.data.style === "unordered" ? "btn-warning" : "btn-outline-warning"}`}
                          onClick={() => handleUpdateBlock(block.id, { style: "unordered" })}
                        >
                          Unordered (•)
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${block.data.style === "ordered" ? "btn-warning" : "btn-outline-warning"}`}
                          onClick={() => handleUpdateBlock(block.id, { style: "ordered" })}
                        >
                          Ordered (1.)
                        </button>
                      </div>
                      {block.data.items?.map((item, itemIdx) => (
                        <div key={itemIdx} className="d-flex gap-2 align-items-center">
                          <span className="text-secondary small">{block.data.style === "unordered" ? "•" : `${itemIdx + 1}.`}</span>
                          <input
                            type="text"
                            className="form-control bg-dark border-secondary border-opacity-40 text-light"
                            value={item}
                            onChange={(e) => {
                              const newItems = [...block.data.items];
                              newItems[itemIdx] = e.target.value;
                              handleUpdateBlock(block.id, { items: newItems });
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              if (block.data.items.length === 1) return;
                              const newItems = block.data.items.filter((_, idx) => idx !== itemIdx);
                              handleUpdateBlock(block.id, { items: newItems });
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-warning text-decoration-none text-start p-0 small mt-1"
                        onClick={() => handleUpdateBlock(block.id, { items: [...block.data.items, ""] })}
                      >
                        + Add Bullet Point
                      </button>
                    </div>
                  )}

                  {block.type === "image" && (
                    <div className="d-flex flex-column gap-2">
                      <div className="row g-2 align-items-center">
                        <div className="col-12 col-md-5">
                          <input
                            type="text"
                            className="form-control bg-dark border-secondary border-opacity-40 text-light"
                            placeholder="Or paste direct image URL..."
                            value={block.data.url || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { url: e.target.value })}
                          />
                        </div>
                        <div className="col-auto text-muted">OR</div>
                        <div className="col-auto position-relative">
                          <button type="button" className="btn btn-sm btn-outline-secondary">Choose Image File</button>
                          <input
                            type="file"
                            accept="image/*"
                            className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleUpdateBlock(block.id, {
                                  file,
                                  preview: URL.createObjectURL(file)
                                });
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Preview Image */}
                      {(block.data.preview || block.data.url) && (
                        <div className="mt-2 text-center bg-black bg-opacity-20 rounded p-2">
                          <img
                            src={block.data.preview || block.data.url}
                            alt="block layout"
                            className="img-fluid rounded"
                            style={{ maxHeight: "150px", objectFit: "cover" }}
                          />
                        </div>
                      )}

                      <input
                        type="text"
                        className="form-control bg-dark border-secondary border-opacity-40 text-white-50 small mt-1"
                        placeholder="Image caption/description..."
                        value={block.data.caption || ""}
                        onChange={(e) => handleUpdateBlock(block.id, { caption: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Delete Block */}
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm border-0 rounded-circle"
                  onClick={() => handleRemoveBlock(block.id)}
                  title="Remove Block"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add Block Toolbar */}
          <div className="d-flex flex-wrap gap-2 justify-content-center border-top border-secondary border-opacity-20 pt-3.5 mt-3">
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleAddBlock("paragraph")}>
              ＋ Text Block 📝
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleAddBlock("header")}>
              ＋ Heading 🏷️
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleAddBlock("list")}>
              ＋ Bullet List 📋
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleAddBlock("image")}>
              ＋ Image 📸
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleAddBlock("quote")}>
              ＋ Quote 💬
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleAddBlock("code")}>
              ＋ Code 💻
            </button>
          </div>
        </div>

        {/* Tags Builder */}
        <div className="glass-card p-4">
          <label className="form-label text-white-50 fw-semibold">Travel Tags</label>
          
          <div className="d-flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span 
                key={tag} 
                className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 d-flex align-items-center gap-1.5"
                style={{ borderRadius: "20px" }}
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="btn-close btn-close-white p-0"
                  style={{ width: "8px", height: "8px", fontSize: "0.6rem" }}
                ></button>
              </span>
            ))}
          </div>

          <div className="input-group" style={{ maxWidth: "300px" }}>
            <input
              type="text"
              className="form-control bg-dark border-secondary text-light small py-1.5"
              placeholder="e.g. food, solo, budget"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag(e);
                }
              }}
            />
            <button className="btn btn-warning" type="button" onClick={handleAddTag}>
              Add
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-3 justify-content-end mb-5">
          <button
            type="button"
            className="btn btn-outline-secondary px-4 py-2"
            disabled={loading}
            onClick={() => navigate(`/blog/${id}`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-warning px-5 py-2 fw-bold d-flex align-items-center gap-2"
            disabled={loading}
          >
            {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
            Save Changes 💾
          </button>
        </div>

      </form>
    </div>
  );
}

export default EditBlog;
