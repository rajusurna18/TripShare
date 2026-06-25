import Blog from "./blog.model.js";
import BlogLike from "./blogLike.model.js";
import BlogComment from "./blogComment.model.js";
import BlogView from "./blogView.model.js";
import BlogShare from "./blogShare.model.js";
import User from "../auth/auth.model.js";
import { createNotificationService } from "../notification/notification.service.js";
import { logActivityService } from "../activity/activity.service.js";

// Helper to calculate read time (200 words per minute average)
const calculateReadTime = (title, contentJsonString) => {
  let wordCount = title ? title.split(/\s+/).length : 0;
  try {
    const blocks = JSON.parse(contentJsonString);
    if (Array.isArray(blocks)) {
      blocks.forEach((block) => {
        if (block.data && block.data.text) {
          wordCount += block.data.text.replace(/<[^>]*>/g, "").split(/\s+/).length;
        }
        if (block.data && block.data.items && Array.isArray(block.data.items)) {
          block.data.items.forEach((item) => {
            if (typeof item === "string") {
              wordCount += item.split(/\s+/).length;
            } else if (item && item.content) {
              wordCount += item.content.split(/\s+/).length;
            }
          });
        }
      });
    } else if (blocks && typeof blocks === "object" && Array.isArray(blocks.blocks)) {
      // Editor.js full output schema
      blocks.blocks.forEach((block) => {
        if (block.data && block.data.text) {
          wordCount += block.data.text.replace(/<[^>]*>/g, "").split(/\s+/).length;
        }
        if (block.data && block.data.items && Array.isArray(block.data.items)) {
          block.data.items.forEach((item) => {
            if (typeof item === "string") {
              wordCount += item.split(/\s+/).length;
            } else if (item && item.content) {
              wordCount += item.content.split(/\s+/).length;
            }
          });
        }
      });
    }
  } catch (e) {
    // Fallback on error (interpret payload as raw text)
    wordCount += contentJsonString ? contentJsonString.split(/\s+/).length : 0;
  }
  return Math.max(1, Math.ceil(wordCount / 200));
};

// Helper to extract clean excerpt text
const getExcerpt = (contentJsonString) => {
  try {
    const blocks = JSON.parse(contentJsonString);
    let blocksArray = [];
    if (Array.isArray(blocks)) {
      blocksArray = blocks;
    } else if (blocks && typeof blocks === "object" && Array.isArray(blocks.blocks)) {
      blocksArray = blocks.blocks;
    }
    const paragraphBlock = blocksArray.find((b) => b.type === "paragraph");
    if (paragraphBlock && paragraphBlock.data && paragraphBlock.data.text) {
      const cleanText = paragraphBlock.data.text.replace(/<[^>]*>/g, "");
      return cleanText.substring(0, 120) + (cleanText.length > 120 ? "..." : "");
    }
  } catch (e) {
    // ignore
  }
  const clean = contentJsonString ? contentJsonString.replace(/<[^>]*>/g, "") : "";
  return clean.substring(0, 120) + (clean.length > 120 ? "..." : "");
};

// CREATE BLOG
export const createBlogService = async (userId, data) => {
  const readTime = calculateReadTime(data.title, data.content);
  const blog = await Blog.create({
    ...data,
    author: userId,
    readTime,
  });

  const populatedBlog = await Blog.findById(blog._id).populate("author", "name profileImage");

  // Send activity and notifications if public or followers only
  if (blog.visibility !== "private") {
    try {
      const visibility = blog.visibility === "followers_only" ? "FRIENDS_ONLY" : "PUBLIC";
      await logActivityService(
        userId,
        "BLOG_POSTED",
        blog._id,
        "Blog",
        null,
        {
          title: blog.title,
          excerpt: getExcerpt(blog.content),
          coverImage: blog.coverImage,
        },
        visibility
      );

      // Find author followers and send notifications
      const author = await User.findById(userId).select("followers name");
      if (author && author.followers && author.followers.length > 0) {
        await Promise.all(
          author.followers.map((followerId) =>
            createNotificationService(
              followerId,
              `${author.name} published a new travel story: "${blog.title}" ✈️`,
              "BLOG_PUBLISHED",
              `/blog/${blog._id}`,
              userId
            )
          )
        );
      }
    } catch (err) {
      console.error("Failed to log blog activity or send notifications:", err.message);
    }
  }

  return populatedBlog;
};

// UPDATE BLOG
export const updateBlogService = async (blogId, userId, data) => {
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new Error("Blog not found");
  }

  if (blog.author.toString() !== userId.toString()) {
    throw new Error("Not authorized to edit this blog");
  }

  const wasPrivate = blog.visibility === "private";

  if (data.title !== undefined || data.content !== undefined) {
    const title = data.title !== undefined ? data.title : blog.title;
    const content = data.content !== undefined ? data.content : blog.content;
    data.readTime = calculateReadTime(title, content);
  }

  const updatedBlog = await Blog.findByIdAndUpdate(blogId, { $set: data }, { new: true }).populate(
    "author",
    "name profileImage"
  );

  // If transitioned from private to visible, create activity log
  if (wasPrivate && updatedBlog.visibility !== "private") {
    try {
      const visibility = updatedBlog.visibility === "followers_only" ? "FRIENDS_ONLY" : "PUBLIC";
      await logActivityService(
        userId,
        "BLOG_POSTED",
        updatedBlog._id,
        "Blog",
        null,
        {
          title: updatedBlog.title,
          excerpt: getExcerpt(updatedBlog.content),
          coverImage: updatedBlog.coverImage,
        },
        visibility
      );

      // Find followers and notify
      const author = await User.findById(userId).select("followers name");
      if (author && author.followers && author.followers.length > 0) {
        await Promise.all(
          author.followers.map((followerId) =>
            createNotificationService(
              followerId,
              `${author.name} published a new travel story: "${updatedBlog.title}" ✈️`,
              "BLOG_PUBLISHED",
              `/blog/${updatedBlog._id}`,
              userId
            )
          )
        );
      }
    } catch (err) {
      console.error("Failed to log activity for updated blog:", err.message);
    }
  }

  return updatedBlog;
};

// DELETE BLOG
export const deleteBlogService = async (blogId, userId) => {
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new Error("Blog not found");
  }

  if (blog.author.toString() !== userId.toString()) {
    throw new Error("Not authorized to delete this blog");
  }

  // Delete all linked documents
  await Promise.all([
    Blog.deleteOne({ _id: blogId }),
    BlogComment.deleteMany({ blog: blogId }),
    BlogLike.deleteMany({ blog: blogId }),
    BlogView.deleteMany({ blog: blogId }),
    BlogShare.deleteMany({ blog: blogId }),
  ]);

  return { success: true };
};

// GET ONE BLOG (with view increment)
export const getBlogByIdService = async (blogId, identifier, userId = null) => {
  const blog = await Blog.findById(blogId).populate("author", "name profileImage travelStyle isVerified bio");
  if (!blog) {
    throw new Error("Blog not found");
  }

  // Record unique view
  if (identifier) {
    try {
      await BlogView.create({ blog: blogId, identifier });
      // View was unique, increment counter
      await Blog.findByIdAndUpdate(blogId, { $inc: { viewsCount: 1 } });
      blog.viewsCount += 1;
    } catch (err) {
      // Duplicate view key violation (E11000) expected for repeat views. Ignore it.
    }
  }

  let hasLiked = false;
  if (userId) {
    const likeExists = await BlogLike.exists({ blog: blogId, user: userId });
    hasLiked = !!likeExists;
  }

  return { blog, hasLiked };
};

// GET MULTIPLE BLOGS (paginated & filtered)
export const getBlogsService = async (options = {}, currentUserId = null) => {
  const { page = 1, limit = 10, search, tag, destination, authorId } = options;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skipNum = (pageNum - 1) * limitNum;

  const query = {};

  // Visibility Filter logic:
  // - public: visible to all
  // - followers_only: visible only if currentUserId is following author OR currentUserId === author
  // - private: visible only if currentUserId === author
  if (authorId) {
    // Fetching user's own profile page or specific user page
    if (currentUserId && currentUserId.toString() === authorId.toString()) {
      query.author = authorId;
      // Sees everything
    } else {
      query.author = authorId;
      // Check follow relationship
      let isFollowing = false;
      if (currentUserId) {
        const authorUser = await User.findById(authorId).select("followers");
        isFollowing = authorUser?.followers?.some((id) => id.toString() === currentUserId.toString()) || false;
      }

      if (isFollowing) {
        query.visibility = { $in: ["public", "followers_only"] };
      } else {
        query.visibility = "public";
      }
    }
  } else {
    // Global feed browsing
    if (currentUserId) {
      const user = await User.findById(currentUserId).select("following");
      const followingIds = user?.following || [];

      query.$or = [
        { visibility: "public" },
        { author: currentUserId }, // own private or followers_only blogs
        { author: { $in: followingIds }, visibility: "followers_only" }, // followed followers_only
      ];
    } else {
      // Guests see public blogs only
      query.visibility = "public";
    }
  }

  // Tags filter
  if (tag) {
    query.tags = tag.toLowerCase().trim();
  }

  // Destination filter
  if (destination) {
    query.destination = new RegExp(destination.trim(), "i");
  }

  // Search filter (handles both partial text queries and full text index searches)
  if (search) {
    query.$text = { $search: search };
  }

  const totalResults = await Blog.countDocuments(query);
  const totalPages = Math.ceil(totalResults / limitNum);

  let sort = { createdAt: -1 };
  let projection = {};

  if (search) {
    sort = { score: { $meta: "textScore" } };
    projection = { score: { $meta: "textScore" } };
  }

  const blogs = await Blog.find(query, projection)
    .populate("author", "name profileImage travelStyle isVerified")
    .sort(sort)
    .skip(skipNum)
    .limit(limitNum);

  return {
    blogs,
    page: pageNum,
    limit: limitNum,
    totalPages,
    totalResults,
    hasNextPage: pageNum < totalPages,
    hasPreviousPage: pageNum > 1,
  };
};

// TOGGLE LIKE
export const likeBlogService = async (blogId, userId) => {
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new Error("Blog not found");
  }

  const existingLike = await BlogLike.findOne({ blog: blogId, user: userId });
  let liked = false;

  if (existingLike) {
    await BlogLike.deleteOne({ _id: existingLike._id });
    await Blog.findByIdAndUpdate(blogId, { $inc: { likesCount: -1 } });
    liked = false;
  } else {
    await BlogLike.create({ blog: blogId, user: userId });
    await Blog.findByIdAndUpdate(blogId, { $inc: { likesCount: 1 } });
    liked = true;

    // Send BLOG_LIKED notification
    if (blog.author.toString() !== userId.toString()) {
      try {
        const user = await User.findById(userId).select("name");
        await createNotificationService(
          blog.author,
          `${user.name} liked your travel blog post: "${blog.title}" ❤️`,
          "BLOG_LIKED",
          `/blog/${blogId}`,
          userId
        );
      } catch (err) {
        console.error("Failed to send blog like notification:", err.message);
      }
    }
  }

  const updatedBlog = await Blog.findById(blogId).select("likesCount");
  return { liked, likesCount: updatedBlog.likesCount };
};

// CREATE COMMENT
export const createBlogCommentService = async (blogId, userId, text) => {
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new Error("Blog not found");
  }

  const comment = await BlogComment.create({
    blog: blogId,
    user: userId,
    text,
    parentComment: null,
  });

  await comment.populate("user", "name profileImage");

  // Increment commentsCount cache
  await Blog.findByIdAndUpdate(blogId, { $inc: { commentsCount: 1 } });

  // Send BLOG_COMMENTED notification
  if (blog.author.toString() !== userId.toString()) {
    try {
      const commenter = await User.findById(userId).select("name");
      await createNotificationService(
        blog.author,
        `${commenter.name} commented on your blog post: "${text.substring(0, 30)}${text.length > 30 ? "..." : ""}" 📝`,
        "BLOG_COMMENTED",
        `/blog/${blogId}`,
        userId
      );
    } catch (err) {
      console.error("Failed to send blog comment notification:", err.message);
    }
  }

  return comment;
};

// CREATE REPLY
export const createBlogReplyService = async (blogId, userId, commentId, text) => {
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new Error("Blog not found");
  }

  const parentComment = await BlogComment.findById(commentId);
  if (!parentComment) {
    throw new Error("Parent comment not found");
  }

  // Check nesting limit: max reply depth = 1 (cannot reply to a reply)
  if (parentComment.parentComment) {
    throw new Error("Reply depth limit is 1. Cannot reply to a reply.");
  }

  const reply = await BlogComment.create({
    blog: blogId,
    user: userId,
    text,
    parentComment: commentId,
  });

  await reply.populate("user", "name profileImage");

  // Increment commentsCount cache
  await Blog.findByIdAndUpdate(blogId, { $inc: { commentsCount: 1 } });

  // Send BLOG_REPLIED notification to the parent commenter
  if (parentComment.user.toString() !== userId.toString()) {
    try {
      const replier = await User.findById(userId).select("name");
      await createNotificationService(
        parentComment.user,
        `${replier.name} replied to your comment: "${text.substring(0, 30)}${text.length > 30 ? "..." : ""}" 💬`,
        "BLOG_REPLIED",
        `/blog/${blogId}`,
        userId
      );
    } catch (err) {
      console.error("Failed to send reply notification:", err.message);
    }
  }

  return reply;
};

// GET BLOG COMMENTS (PAGINATED WITH LEVEL-1 REPLIES)
export const getBlogCommentsService = async (blogId, page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skipNum = (pageNum - 1) * limitNum;

  const totalResults = await BlogComment.countDocuments({
    blog: blogId,
    parentComment: null,
  });

  const comments = await BlogComment.find({
    blog: blogId,
    parentComment: null,
  })
    .populate("user", "name profileImage")
    .sort({ createdAt: -1 })
    .skip(skipNum)
    .limit(limitNum);

  // Fetch replies for these root comments
  const commentIds = comments.map((c) => c._id);
  const replies = await BlogComment.find({
    blog: blogId,
    parentComment: { $in: commentIds },
  })
    .populate("user", "name profileImage")
    .sort({ createdAt: 1 });

  // Group replies by parentComment
  const repliesMap = {};
  replies.forEach((reply) => {
    const parentId = reply.parentComment.toString();
    if (!repliesMap[parentId]) {
      repliesMap[parentId] = [];
    }
    repliesMap[parentId].push(reply);
  });

  // Attach replies
  const commentsWithReplies = comments.map((c) => {
    const commentObj = c.toObject();
    commentObj.replies = repliesMap[c._id.toString()] || [];
    return commentObj;
  });

  return {
    comments: commentsWithReplies,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(totalResults / limitNum),
    totalResults,
  };
};

// DELETE COMMENT (WITH CASCADE CLEANUP)
export const deleteBlogCommentService = async (commentId, userId) => {
  const comment = await BlogComment.findById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  const blog = await Blog.findById(comment.blog);
  const isAuthor = comment.user.toString() === userId.toString();
  const isBlogOwner = blog && blog.author.toString() === userId.toString();

  if (!isAuthor && !isBlogOwner) {
    throw new Error("Not authorized to delete this comment");
  }

  let deletedCount = 0;

  if (!comment.parentComment) {
    // Delete root comment and all its replies
    const deleteResult = await BlogComment.deleteMany({
      $or: [{ _id: commentId }, { parentComment: commentId }],
    });
    deletedCount = deleteResult.deletedCount || 1;
  } else {
    // Delete single reply comment
    await BlogComment.deleteOne({ _id: commentId });
    deletedCount = 1;
  }

  // Update cached commentsCount in Blog document
  if (blog) {
    const updatedBlog = await Blog.findByIdAndUpdate(
      comment.blog,
      { $inc: { commentsCount: -deletedCount } },
      { new: true }
    );
    if (updatedBlog && updatedBlog.commentsCount < 0) {
      updatedBlog.commentsCount = 0;
      await updatedBlog.save();
    }
  }

  return { deletedCount };
};

// TRACK SHARE
export const shareBlogService = async (blogId, userId, platform) => {
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new Error("Blog not found");
  }

  await BlogShare.create({
    blog: blogId,
    user: userId || null,
    platform,
  });

  await Blog.findByIdAndUpdate(blogId, { $inc: { shareCount: 1 } });
  const updatedBlog = await Blog.findById(blogId).select("shareCount");

  return { shareCount: updatedBlog.shareCount };
};

// GET TRENDING BLOGS
export const getTrendingBlogsService = async (limit = 5) => {
  const limitNum = parseInt(limit, 10) || 5;

  // Aggregate standard popularity rating: (viewsCount + likesCount * 5 + commentsCount * 10)
  // For high performance, we sort by likesCount and viewsCount descending
  return await Blog.find({ visibility: "public" })
    .populate("author", "name profileImage travelStyle isVerified")
    .sort({ likesCount: -1, viewsCount: -1, createdAt: -1 })
    .limit(limitNum);
};
