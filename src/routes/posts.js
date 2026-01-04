const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const authenticateToken = require('../middleware/auth');

// Apply authentication to all post routes
router.use(authenticateToken);

// GET /api/posts - Get all posts with pagination and filtering
router.get('/', postsController.getPosts);

// GET /api/posts/stats - Get post statistics
router.get('/stats', postsController.getPostStats);

// POST /api/posts/manual - Create a manual post
router.post('/manual', postsController.createManualPost);

// POST /api/posts/:id/retry - Retry a failed post
router.post('/:id/retry', postsController.retryPost);

// PATCH /api/posts/:id - Update post details
router.patch('/:id', postsController.updatePost);

// GET /api/posts/:id - Get specific post details
router.get('/:id', async (req, res) => {
  try {
    const post = await require('../models/Post').findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/posts/:id - Delete a post (optional feature)
router.delete('/:id', async (req, res) => {
  try {
    const post = await require('../models/Post').findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;