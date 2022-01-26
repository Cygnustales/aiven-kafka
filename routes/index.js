var express = require('express');
var router = express.Router();
var kafka = require('../modules/kafka');

router.post('/topic/data/', kafka.sendDataToTopics);
router.get('/topic/list/', kafka.topicList);
router.post('/topic/message/', kafka.consumer);
router.post('/topic/describe/', kafka.describeTopicConfig);
module.exports = router;