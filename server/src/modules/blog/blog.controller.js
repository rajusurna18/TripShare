import {
  createBlogService,
  updateBlogService,
  deleteBlogService,
  getBlogByIdService,
  getBlogsService,
  likeBlogService,
  createBlogCommentService,
  createBlogReplyService,
  getBlogCommentsService,
  deleteBlogCommentService,
  shareBlogService,
  getTrendingBlogsService,
} from "./blog.service.js";

// CREATE BLOG
export const createBlog = async (req, res) => {
  try {
    const { title, content, destination } = req.body;
    if (!title || !content || !destination) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and destination are required.",
      });
    }

    let contentBlocks = [];
    if (content) {
      try {
        contentBlocks = typeof content === "string" ? JSON.parse(content) : content;
      } catch (err) {
        // ignore
      }
    }

    if (req.files && req.files.length > 0) {
      const coverFile = req.files.find((f) => f.fieldname === "coverImage");
      if (coverFile) {
        req.body.coverImage = coverFile.path;
      }

      if (contentBlocks && contentBlocks.length > 0) {
        contentBlocks = contentBlocks.map((block) => {
          if (block.type === "image") {
            const blockFile = req.files.find((f) => f.fieldname === `block_image_${block.id}`);
            if (blockFile) {
              block.data.url = blockFile.path; // Cloudinary URL
            }
          }
          return block;
        });
      }
    }
    req.body.content = JSON.stringify(contentBlocks);

    // Safely parse tags if sent as stringified array (e.g. from FormData)
    if (req.body.tags && typeof req.body.tags === "string") {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch (err) {
        req.body.tags = req.body.tags.split(",").map((t) => t.trim());
      }
    }

    const blog = await createBlogService(req.user.id, req.body);
    res.status(201).json({
      success: true,
      blog,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// UPDATE BLOG
export const updateBlog = async (req, res) => {
  try {
    let contentBlocks = [];
    if (req.body.content) {
      try {
        contentBlocks = typeof req.body.content === "string" ? JSON.parse(req.body.content) : req.body.content;
      } catch (err) {
        // ignore
      }
    }

    if (req.files && req.files.length > 0) {
      const coverFile = req.files.find((f) => f.fieldname === "coverImage");
      if (coverFile) {
        req.body.coverImage = coverFile.path;
      }

      if (contentBlocks && contentBlocks.length > 0) {
        contentBlocks = contentBlocks.map((block) => {
          if (block.type === "image") {
            const blockFile = req.files.find((f) => f.fieldname === `block_image_${block.id}`);
            if (blockFile) {
              block.data.url = blockFile.path; // Cloudinary URL
            }
          }
          return block;
        });
      }
    }
    
    if (req.body.content) {
      req.body.content = JSON.stringify(contentBlocks);
    }

    if (req.body.tags && typeof req.body.tags === "string") {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch (err) {
        req.body.tags = req.body.tags.split(",").map((t) => t.trim());
      }
    }

    const blog = await updateBlogService(req.params.id, req.user.id, req.body);
    res.json({
      success: true,
      blog,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE BLOG
export const deleteBlog = async (req, res) => {
  try {
    await deleteBlogService(req.params.id, req.user.id);
    res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// GET ONE BLOG (Detail + record unique view)
export const getBlogById = async (req, res) => {
  try {
    // Generate view identifier (UserId if logged in, IP hash otherwise)
    const identifier = req.user ? req.user.id : req.ip;
    const userId = req.user ? req.user.id : null;

    const { blog, hasLiked } = await getBlogByIdService(req.params.id, identifier, userId);
    res.json({
      success: true,
      blog,
      hasLiked,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

// GET ALL BLOGS
export const getBlogs = async (req, res) => {
  try {
    const { page, limit, search, tag, destination, authorId } = req.query;
    const userId = req.user ? req.user.id : null;

    const options = { page, limit, search, tag, destination, authorId };
    const result = await getBlogsService(options, userId);

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// TOGGLE LIKE BLOG
export const likeBlog = async (req, res) => {
  try {
    const result = await likeBlogService(req.params.id, req.user.id);
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// CREATE COMMENT
export const createBlogComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required.",
      });
    }

    const comment = await createBlogCommentService(req.params.id, req.user.id, text);
    res.status(201).json({
      success: true,
      comment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// CREATE REPLY
export const createBlogReply = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Reply text is required.",
      });
    }

    const reply = await createBlogReplyService(req.params.id, req.user.id, req.params.commentId, text);
    res.status(201).json({
      success: true,
      reply,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// GET BLOG COMMENTS (PAGINATED WITH INDENTED LEVEL-1 REPLIES)
export const getBlogComments = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await getBlogCommentsService(req.params.id, page, limit);
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE COMMENT (Root or reply)
export const deleteBlogComment = async (req, res) => {
  try {
    const result = await deleteBlogCommentService(req.params.commentId, req.user.id);
    res.json({
      success: true,
      ...result,
      message: "Comment deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// LOG SHARE ACTION
export const shareBlog = async (req, res) => {
  try {
    const { platform } = req.body;
    if (!platform) {
      return res.status(400).json({
        success: false,
        message: "Platform is required.",
      });
    }

    const userId = req.user ? req.user.id : null;
    const result = await shareBlogService(req.params.id, userId, platform);

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// GET TRENDING
export const getTrendingBlogs = async (req, res) => {
  try {
    const { limit } = req.query;
    const blogs = await getTrendingBlogsService(limit);
    res.json({
      success: true,
      blogs,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
