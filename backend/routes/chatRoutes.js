const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const checkAuth = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.post('/send', checkAuth, upload.single('imagem'), chatController.sendMessage);
router.get('/conversations', checkAuth, chatController.getConversations);
router.get('/messages/:anuncioId/:otherUserId', checkAuth, chatController.getMessages);

module.exports = router;
